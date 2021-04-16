require("dotenv").config();
const log = require("skog");

log.init.pino({
  app: "scanned-exams",
});

process.on("uncaughtException", (err) => {
  log.fatal(err, `Reject: ${err}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  log.fatal(reason, `Reject: ${reason}`);
  process.exit(1);
});

require("@kth/reqvars").check();

const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");
const apiRouter = require("./api/router");
const authRouter = require("./auth/router");
const monitor = require("./monitor");
const fs = require("fs/promises");

const PORT = 4000;
const server = express();

server.set("trust proxy", 1);
server.use(
  session({
    cookie: {
      domain: "kth.se",
      maxAge: 3600 * 1000 /* 1 hour */,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    },
    secret: process.env.SESSION_SECRET,
  })
);

server.use(log.middleware);
server.use((req, res, next) => {
  log.child(
    {
      session_id: req.session.id.slice(0, 6),
    },
    next
  );
});
server.use(express.urlencoded());
server.use(cookieParser());

// Routes:
// - /           The welcome page
// - /api        API routes (only for authorized people)
// - /app        The React application (including all frontend artifacts
//               like CSS files)
// - /auth       routes for the authorization process
// - /_monitor   just the monitor page
server.post("/scanned-exams", async (req, res) => {
  req.session.courseId = 30247;
  req.session.examination = {
    courseCode: "XY0101",
    examCode: "ZZZ1",
    examDate: "2100-01-01",
  };
  req.session.state = "idle";

  log.info("Enter /");
  const html = await fs.readFile("index.html", { encoding: "utf-8" });

  // TODO: if a session exists, redirect the user to "/app"
  // TODO: if domain is kth.test.instructure.com > Redirect to the app in referens
  // TODO: if domain is kth.instructure.com > Show a message encouraging people to use "canvas.kth.se"
  // TODO: set a cookie to check from client-side JS that the cookie is set correctly

  res
    .status(200)
    .send(
      html
        .replace("{{COURSE_ID}}", req.body.custom_courseid)
        .replace("{{DOMAIN}}", req.body.custom_domain)
    );
});
server.use("/scanned-exams/auth", authRouter);
server.use("/scanned-exams/api", apiRouter);
server.use(
  "/scanned-exams/app",
  express.static(path.join(__dirname, "..", "frontend", "build"))
);
server.get("/scanned-exams/_monitor", monitor);
module.exports = server;

server.listen(PORT, () => {
  log.info(`App listening on port ${PORT}`);
});

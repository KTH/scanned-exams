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
const canvasApi = require("./api/canvasApiClient");
const tentaApi = require("./api/tentaApiClient");

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
      sameSite: process.env.CANVAS_API_URL.endsWith("kth.se")
        ? "strict"
        : "none",
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
  try {
    if (req.session.userId) {
      log.info("POST /scanned-exams: user has a session. Redirecting to /app");
      return res.redirect("/scanned-exams/app");
    }

    const domain = req.body.custom_domain;
    const courseId = req.body.custom_courseid;

    log.info(
      `POST /scanned-exams: user has launched the app from course ${courseId}`
    );

    if (!process.env.CANVAS_API_URL.startsWith(`https://${domain}`)) {
      log.warn(
        `This app is configured for ${process.env.CANVAS_API_URL} but you are running it from ${domain}`
      );

      return res
        .status(400)
        .send(
          `This app is configured for ${process.env.CANVAS_API_URL} but you are running it from ${domain}`
        );
    }

    const ladokId = await canvasApi.getExaminationLadokId(courseId);
    req.session.courseId = courseId;
    req.session.ladokId = ladokId;
    req.session.state = "idle";
    req.session.userId = null;

    const html = await fs.readFile("index.html", { encoding: "utf-8" });

    // TODO: if domain is kth.test.instructure.com > Redirect to the app in referens
    // TODO: if domain is kth.instructure.com > Show a message encouraging people to use "canvas.kth.se"
    // TODO: set a cookie to check from client-side JS that the cookie is set correctly

    res
      .status(200)
      .send(
        html.replace("{{COURSE_ID}}", courseId).replace("{{DOMAIN}}", domain)
      );
  } catch (err) {
    log.error({ err });
    res.status(500).send("Unknown error. Please contact IT support");
  }
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

require("dotenv").config();
require("@kth/reqvars").check();

import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import fs from "fs";
import connectMongodbSession from "connect-mongodb-session";

import apiRouter from "./api/router";
import authRouter from "./auth/router";
import monitor from "./monitor";
import log from "skog";

const MongoDBStore = connectMongodbSession(session);

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

const server = express();

const COOKIE_MAX_AGE_SECONDS = 3600;
const store = new MongoDBStore({
  uri: process.env.MONGODB_CONNECTION_STRING,
  collection: "sessions",

  // Session expiration time
  expires: COOKIE_MAX_AGE_SECONDS * 1000,

  // These two lines are required when using CosmosDB
  // See https://github.com/mongodb-js/connect-mongodb-session#azure-cosmos-mongodb-support
  expiresKey: `_ts`,
  expiresAfterSeconds: COOKIE_MAX_AGE_SECONDS,
});

server.set("trust proxy", 1);
server.use(
  session({
    name: "scanned-exams.sid",
    cookie: {
      domain: "kth.se",
      maxAge: COOKIE_MAX_AGE_SECONDS * 1000,
      httpOnly: true,
      secure: true,
      sameSite: process.env.CANVAS_API_URL.endsWith("kth.se")
        ? "strict"
        : "none",
    },
    // MongoDB does not update TTL when reading but when writing
    resave: true,

    // Avoid saving anonymous sessions (non logged-in users)
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    store,
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
server.use(express.urlencoded({ extended: true }));
server.use(express.json());
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
    const domain = req.body.custom_domain;
    const courseId = req.body.custom_courseid;

    // TODO: if domain is kth.test.instructure.com > Redirect to the app in referens
    // TODO: if domain is kth.instructure.com > Show a message encouraging people to use "canvas.kth.se"
    // TODO: set a cookie to check from client-side JS that the cookie is set correctly

    if (req.session.userId) {
      log.debug("POST /scanned-exams: user has a session. Redirecting to /app");
      return res.redirect(`/scanned-exams/app?courseId=${courseId}`);
    }

    log.debug(
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

    req.session.userId = null;

    return res.redirect(`/scanned-exams/app?courseId=${courseId}`);
  } catch (err) {
    log.error({ err });
    return res.status(500).send("Unknown error. Please contact IT support");
  }
});
server.use("/scanned-exams/auth", authRouter);
server.use("/scanned-exams/api", apiRouter);
server.get("/scanned-exams/app", async (req, res) => {
  try {
    const html = await fs.promises.readFile(
      path.join(__dirname, "..", "..", "frontend", "build", "index.html"),
      { encoding: "utf-8" }
    );

    return res.send(html);
  } catch (err) {
    log.error(err);
    return res.status(500).send("Unknown error. Please contact IT support");
  }
});
server.use(
  "/scanned-exams/app/static",
  express.static(path.join(__dirname, "..", "..", "frontend", "build", "static"))
);

server.get("/scanned-exams/_monitor", monitor);

export default server;

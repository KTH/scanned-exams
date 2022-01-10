import log from "skog";

require("dotenv").config();
require("@kth/reqvars").check();

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

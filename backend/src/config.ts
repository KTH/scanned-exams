import log from "skog";
import pino from "pino";

require("dotenv").config();
require("@kth/reqvars").check();

log.init.pino(
  {
    app: "scanned-exams",
  },
  {
    timestamp: pino.stdTimeFunctions.isoTime,
  }
);

process.on("uncaughtException", (err) => {
  log.fatal(err, `Reject: ${err}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  log.fatal(reason, `Reject: ${reason}`);
  process.exit(1);
});

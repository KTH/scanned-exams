import log from "skog";
import appInsights from "applicationinsights";

require("dotenv").config();

log.init.pino({
  app: "scanned-exams",
});

process.on("uncaughtException", (err) => {
  log.fatal(err, `Uncaught exception: ${err.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  log.fatal(reason, `Unhandled promise rejection: ${reason}`);
  process.exit(1);
});

require("@kth/reqvars").check();
appInsights.setup();

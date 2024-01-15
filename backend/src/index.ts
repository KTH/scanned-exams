import "./config";
import log from "skog";
import server from "./server";
import { startBackgroundImport } from "./importWorker";

const PORT = process.env.PORT || 3000;

startBackgroundImport();
server.listen(PORT, () => {
  log.info(`App listening on port ${PORT}`);
});

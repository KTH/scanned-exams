import log from "skog";
import * as tentaApi from "./api/externalApis/tentaApiClient";

async function checkTentaApi() {
  try {
    const body = await tentaApi.getVersion();
    return {
      status: "OK",
      data: body,
    };
  } catch (err) {
    if (err.response?.statusCode === 403) {
      return {
        status: "ERROR",
        data: "403: Forbidden.",
      };
    }

    // TODO: enhance this error
    const error = new Error(err.message) as any;
    error.name = "MonitorError";
    error.response = {
      url: err.response?.url,
      statusCode: err.response?.statusCode,
    };

    log.error(error, error.message);

    return {
      status: "ERROR",
      data: error.message,
    };
  }
}

export default async function monitor(req, res) {
  const tentaApiCheck = await checkTentaApi();
  res.setHeader("Content-Type", "text/plain");
  res.send(`APPLICATION_STATUS: OK - Note: this "OK" value is hardcoded

TentaAPI: ${tentaApiCheck.status}
- ${tentaApiCheck.data}
`);
}

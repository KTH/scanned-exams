const log = require("skog").default;
const tentaApiClient = require("./api/tentaApiClient");

async function tentaApi() {
  try {
    const body = await tentaApiClient.getVersion();
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
    const error = new Error(err.message);
    error.name = "MonitorError";
    error.response = {
      url: err.response?.url,
      statusCode: err.response?.statusCode,
    };

    error.response = {
      url: err.response.url,
    };

    log.error(error, error.message);

    return {
      status: "ERROR",
      data: error.message,
    };
  }
}

module.exports = async function monitor(req, res) {
  const tentaApiCheck = await tentaApi();
  res.setHeader("Content-Type", "text/plain");
  res.send(`APPLICATION_STATUS: OK - Note: this "OK" value is hardcoded

TentaAPI: ${tentaApiCheck.status}
- ${tentaApiCheck.data}
`);
};

const log = require("skog");
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
    log.error({ err }, "Error");
    return {
      status: "ERROR",
      data: "See the logs for further information",
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

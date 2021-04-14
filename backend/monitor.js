const got = require("got");
const log = require("skog");

async function getPublicIp() {
  const { body } = await got("https://api.ipify.org?format=json", {
    responseType: "json",
  });

  return body.ip;
}

async function tentaApi() {
  try {
    const { body } = await got("https://tentaapi.ug.kth.se/api/v2.0/Version");
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
    } else {
      log.error({ err }, "Error");
      return {
        status: "ERROR",
        data: "See monitor page",
      };
    }
  }
}

module.exports = async function monitor(req, res) {
  const ip = await getPublicIp();
  const tentaApiCheck = await tentaApi();
  res.setHeader("Content-Type", "text/plain");
  res.send(`APPLICATION_STATUS: OK - Note: this "OK" value is hardcoded
IP address: ${ip}

TentaAPI: ${tentaApiCheck.status}
- ${tentaApiCheck.data}
`);
};

const inquirer = require("inquirer");
const got = require("got");
const fs  = require("fs");

const TENTA_API_URL = "https://integral-api.sys.kth.se/tenta-api/api/v2.0";

async function start() {
  console.log(
    'Download an exam for troubleshooting.'
  );

  const { tentaApiToken } = await inquirer.prompt({
    name: "tentaApiToken",
    message: `Paste the Tenta API token here`,
    type: "password",
  });

  const { fileId } = await inquirer.prompt({
    name: "fileId",
    message: "Enter the Windream file id",
  });

  const client = got.extend({
    prefixUrl: TENTA_API_URL,
    headers: {
      "Ocp-Apim-Subscription-Key": tentaApiToken,
    },
  });

  const { body } = await client(`windream/file/${fileId}/true`, {
    responseType: "json",
  });

  const download = Buffer.from(body.wdFile.fileAsBase64.toString('utf-8'), 'base64')
  fs.writeFileSync(`./${body.wdFile.fileName}`, download)
}

start();

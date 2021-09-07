const fs = require("fs");
const got = require("got");
const log = require("skog");

const client = got.extend({
  prefixUrl: process.env.TENTA_API_URL,
  headers: {
    "Ocp-Apim-Subscription-Key": process.env.TENTA_API_SUBSCRIPTION_KEY,
  },
});

async function getVersion() {
  const { body } = await client("Version");

  return body;
}

/** Get a list of all exam files for a given exam */
async function examList({ courseCode, examDate, examCode }) {
  log.info(`Getting exams for ${courseCode} ${examDate} ${examCode}`);
  const { body } = await client("windream/search/documents/false", {
    method: "POST",
    json: {
      searchIndiceses: [
        {
          index: "c_code",
          value: courseCode,
          useWildcard: false,
        },
        {
          index: "e_code",
          value: examCode,
          useWildcard: false,
        },
        {
          index: "e_date",
          value: examDate,
          useWildcard: false,
        },
      ],
      includeDocumentIndicesesInResponse: true,
      includeSystemIndicesesInResponse: false,
      useDatesInSearch: false,
    },
    responseType: "json",
  });

  if (!body.documentSearchResults) {
    log.info(`No exams found for ${courseCode} ${examDate} ${examCode}`);
    return [];
  }

  const list = [];

  for (const result of body.documentSearchResults) {
    // Helper function to get the value of the attribute called "index"
    // we have written it because they are in an array instead of an object
    const getValue = (index) =>
      result.documentIndiceses.find((di) => di.index === index)?.value;

    list.push({
      fileId: result.fileId,
      student: {
        id: getValue("s_uid"),
        firstName: getValue("s_firstname"),
        lastName: getValue("s_lastname"),
      },
    });
  }

  return list;
}

/** Download the exam with ID "fileId" to the given "filePath" */
async function downloadExam(fileId, filePath) {
  log.info(`Downloading file ${fileId}...`);
  const { body } = await client(`windream/file/${fileId}/true`, {
    responseType: "json",
  });

  const download = Buffer.from(
    body.wdFile.fileAsBase64.toString("utf-8"),
    "base64"
  );
  await fs.promises.writeFile(filePath, download);
}

module.exports = {
  examList,
  downloadExam,
  getVersion,
};

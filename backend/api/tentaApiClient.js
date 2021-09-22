const got = require("got");
const log = require("skog");
const { Readable } = require("stream");

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
  log.debug(`Getting exams for ${courseCode} ${examDate} ${examCode}`);
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
    log.debug(`No exams found for ${courseCode} ${examDate} ${examCode}`);
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

/** Download the exam with ID "fileId". Returns its content as a ReadableStream */
async function downloadExam(fileId) {
  log.info(`Downloading file ${fileId}...`);
  const { body } = await client(`windream/file/${fileId}/true`, {
    responseType: "json",
  });

  const getValue = (index) =>
    body.wdFile.objectIndiceses.find((di) => di.index === index)?.value;

  const examDateTime = getValue("e_date");
  const examDate = examDateTime.split("T")[0];

  return {
    content: Readable.from(
      Buffer.from(body.wdFile.fileAsBase64.toString("utf-8"), "base64")
    ),
    studentKthId: getValue("s_uid"),
    examDate,
  };
}

module.exports = {
  examList,
  downloadExam,
  getVersion,
};

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

/**
 * Given a list of [index, value] and an "index", returns the value associated
 * with such index
 */
function getValueFromList(list, key) {
  return list.find((di) => di.index === key)?.value;
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
    list.push({
      fileId: result.fileId,
      student: {
        id: getValueFromList(result.documentIndiceses, "s_uid"),
        firstName: getValueFromList(result.documentIndiceses, "s_firstname"),
        lastName: getValueFromList(result.documentIndiceses, "s_lastname"),
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

  const examDateTime = getValueFromList(body.wdFile.objectIndiceses, "e_date");
  const examDate = examDateTime.split("T")[0];

  return {
    content: Readable.from(
      Buffer.from(body.wdFile.fileAsBase64.toString("utf-8"), "base64")
    ),
    studentKthId: getValueFromList(body.wdFile.objectIndiceses, "s_uid"),
    examDate,
  };
}

module.exports = {
  examList,
  downloadExam,
  getVersion,
};

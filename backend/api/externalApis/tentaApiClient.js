const got = require("got");
const log = require("skog");
const { Readable } = require("stream");

const { tentaApiGenericErrorHandler } = require("../error");

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

async function examListByLadokId(ladokId) {
  log.debug(`Getting exams for Ladok ID ${ladokId}`);

  const { body } = await client("windream/search/documents/false", {
    method: "POST",
    // json: {
    //   searchIndiceses: [
    //     {
    //       index: "e_ladokid",
    //       value: ladokId,
    //       useWildcard: false,
    //     },
    //   ],
    //   includeDocumentIndicesesInResponse: true,
    //   includeSystemIndicesesInResponse: false,
    //   useDatesInSearch: false,
    // },
    responseType: "json",
  }).catch(tentaApiGenericErrorHandler);

  if (!body.documentSearchResults) {
    log.debug(`No exams found with the "new format" e_ladokid=${ladokId}`);
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

  const { fileName } = body.wdFile;
  const examDateTime = getValue("e_date");
  const examDate = examDateTime.split("T")[0];
  const studentKthId = getValue("s_uid");
  const studentPersNr = getValue("s_pnr");

  // Accepting all exams we get from Windreams to allow errors to
  // be presented to the end user.

  return {
    content: Readable.from(
      Buffer.from(body.wdFile.fileAsBase64.toString("utf-8"), "base64")
    ),
    fileName,
    studentKthId,
    studentPersNr,
    examDate,
  };
}

module.exports = {
  examListByLadokId,
  downloadExam,
  getVersion,
};

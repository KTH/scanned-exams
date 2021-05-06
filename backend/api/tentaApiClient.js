const fs = require("fs");
const got = require("got");
const log = require("skog");

const client = got.extend({
  prefixUrl: process.env.TENTA_API_URL,
});

/** Get the examDate and codes (examCode-courseCode) given the Ladok UID */
async function getAktivitetstillfalle(ladokId) {
  log.info(`Getting information for aktivitetstillfälle ${ladokId}`);
  const { body } = await client(`Ladok/activity/${ladokId}`, {
    responseType: "json",
  });

  log.info(JSON.stringify(body.kopplingar));
  log.info(JSON.stringify(body));

  return {
    activities: body.kopplingar.map((k) => ({
      examCode: k.aktivitet.utbildningskod,
      courseCode: k.kursinstans.utbildningskod,
    })),
    examDate: body.datumperiod.startdatum,
  };
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

  const list = [];

  log.info('body.documentSearchResults:')
  log.info(body.documentSearchResults)
  for (const result of body.documentSearchResults) {
    const keyValue = result.documentIndiceses.find(
      (di) => di.index === "s_uid"
    );

    if (keyValue && keyValue.value) {
      list.push({
        fileId: result.fileId,
        userId: keyValue.value,
      });
    }
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
  fs.writeFileSync(filePath, download);
}

module.exports = {
  examList,
  downloadExam,
  getAktivitetstillfalle,
};

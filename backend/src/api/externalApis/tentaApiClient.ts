import got from "got";
import log from "skog";
import { Readable } from "stream";

import { tentaApiGenericErrorHandler } from "../error";

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

interface WindreamsScannedExam {
  createDate: string;
  fileId: number;
  student: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

async function examListByLadokId(ladokId): Promise<WindreamsScannedExam[]> {
  const outp = <WindreamsScannedExam[]>[];

  log.info(`Getting exams for Ladok ID ${ladokId}`);

  const { body } = (await client("windream/search/documents/false", {
    method: "POST",
    json: {
      searchIndiceses: [
        {
          index: "e_ladokid",
          value: ladokId,
          useWildcard: false,
        },
      ],
      includeDocumentIndicesesInResponse: true,
      includeSystemIndicesesInResponse: false,
      useDatesInSearch: false,
    },
    responseType: "json",
  }).catch(tentaApiGenericErrorHandler)) as any;

  if (!body.documentSearchResults) {
    log.debug(`No exams found with the "new format" e_ladokid=${ladokId}`);
    return [];
  }

  for (const result of body.documentSearchResults) {
    // Helper function to get the value of the attribute called "index"
    // we have written it because they are in an array instead of an object
    const getValue = (index) =>
      result.documentIndiceses.find((di) => di.index === index)?.value;

    outp.push({
      createDate: result.createDate,
      fileId: result.fileId,
      student: {
        id: getValue("s_uid"),
        firstName: getValue("s_firstname"),
        lastName: getValue("s_lastname"),
      },
    });
  }

  if (!body.documentSearchResults) {
    log.debug(`No exams found with the "new format" e_ladokid=${ladokId}`);
    return [];
  }

  return outp;
}

/** Download the exam with ID "fileId". Returns its content as a ReadableStream */
async function downloadExam(fileId) {
  /* 
    IMPORTANT! This log messages is used to get stats on downloads, do not change it https://confluence.sys.kth.se/confluence/x/_KZFCg */
  log.info(`Downloading file ${fileId}...`);
  const { body } = (await client(`windream/file/${fileId}/true`, {
    responseType: "json",
  })) as any;

  const getValue = (index) =>
    body.wdFile.objectIndiceses.find((di) => di.index === index)?.value;

  const { fileName } = body.wdFile;
  const examDateTime = getValue("e_date");
  const examDate = examDateTime.split("T")[0];
  const student = {
    kthId: getValue("s_uid"),
    personNumber: getValue("s_pnr"),
    firstName: getValue("s_firstname"),
    lastName: getValue("s_lastname"),
  };

  if (!student.kthId)
    throw new Error(
      `Could not get KTH ID (s_uid) from TentaAPI (windream) for file id "${fileId}".`
    );

  return {
    content: Readable.from(
      Buffer.from(body.wdFile.fileAsBase64.toString("utf-8"), "base64")
    ),
    fileName,
    student,
    examDate,
  };
}

export { examListByLadokId, downloadExam, getVersion };

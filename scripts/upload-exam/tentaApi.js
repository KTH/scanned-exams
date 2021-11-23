const got = require("got");
const log = require("skog");
const { Readable } = require("stream");

module.exports = class TentaApi {
  constructor(tentaApiToken) {
    this.client = got.extend({
      prefixUrl: "https://integral-api.sys.kth.se/tenta-api/api/v2.0",
      headers: {
        "Ocp-Apim-Subscription-Key": tentaApiToken,
      },
    });
  }

  async examListByLadokId(ladokId) {
    const { body } = await this.client("windream/search/documents/false", {
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
    });

    if (!body.documentSearchResults) {
      return [];
    }

    const list = [];

    for (const result of body.documentSearchResults) {
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

    if (!body.documentSearchResults) {
      return [];
    }

    return list;
  }

  /** Download the exam with ID "fileId". Returns its content as a ReadableStream */
  async downloadExam(fileId) {
    log.info(`Downloading file ${fileId}...`);
    const { body } = await this.client(`windream/file/${fileId}/true`, {
      responseType: "json",
    });

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
};

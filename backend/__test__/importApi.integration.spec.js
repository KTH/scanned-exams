// We need some env-vars for canvasApiClient.js to import
require("dotenv").config();

const { expect } = require("@jest/globals");
const { setupRecorder } = require("nock-record");
const { MongoClient } = require("mongodb");
const processQueueEntry = require("../api/processQueueEntry");
const { getEntryFromQueue } = require("../api/importQueue");

/**
 *
 * NOTE! These tests are mostly stubbed until we can mock
 * calls to Canvas and LADOK
 *
 */

// Nock HTTP-Call Recording
// Changin mode affects the mode used for nock
// record = record and store fixtures for all calls
// dryrun = use existing fixtures and do real calls when they are missing
const record = setupRecorder({
  mode: process.env.NOCK_RECORD === "TRUE" ? "record" : "dryrun",
});

const { MONGODB_CONNECTION_STRING } = process.env;
// TODO: Consider using env-var (sync with importQueue.js)
const DB_QUEUE_NAME = "import_queue";

const dbClient = new MongoClient(MONGODB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function handleImportStart({ courseId, fileId }) {
  // stubbed import handler
  let ok = courseId !== undefined;
  ok = ok && fileId !== undefined;
  return ok;
}

describe("Import endpoint", () => {
  afterAll(async () => {
    // Teardown
    // Empty queue in MongoDB
    const connection = await dbClient.connect();
    const db = await connection.db();
    await db.collection(DB_QUEUE_NAME).deleteMany({});
    await dbClient.close();
    // TODO: Remove exams imported to Canvas
  });

  it("should import single exam", async () => {
    const { completeRecording, assertScopesFinished } = await record(
      "importSingleExam"
    );

    // 1. call import endpoint handler with fileId
    // courseId: 30872
    // fileId: 1140871
    const params = {
      courseId: 30872,
      fileId: 1140871,
    };

    const res = await handleImportStart(params);
    // - did we get an okay response?
    expect(res).toBe(true);
    // - do we have an entry in import queue?
    const entryNew = await getEntryFromQueue(params.fileId);
    expect(entryNew).toBe(null); // <---- temporary until we implement the import handler
    // TODO:
    // expect(entryNew.status).toBe("new");

    // 2. call import worker handler
    await processQueueEntry();
    // - did it change the queue?
    const entryImported = await getEntryFromQueue(params.fileId);
    expect(entryImported).toBe(null); // <---- temporary until we mock Canvas API calls
    // TODO:
    // expect(entryImported.status).toBe("imported");

    // Complete recording
    completeRecording();
    assertScopesFinished();

    expect(true).toBe(true);
  });
});

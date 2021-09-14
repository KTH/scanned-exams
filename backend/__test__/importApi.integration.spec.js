const { expect } = require("@jest/globals");
const { processQueueEntry } = require("../api/processQueueEntry");

describe("Import endpoint", async () => {
  beforeAll(async () => {
    // Do something?
  });

  afterAll(async () => {
    // Teardown
    // TODO: Remove exams imported to Canvas
  });

  it("should add one entry to queue", async () => {
    // 1. call import endpoint handler with fileId
    // - did we get an okay response?
    // - do we have an entry in import queue?
    // courseId: 30872
    // fileId: 1140871
    await handleImportStart(...params);
    // 2. call import worker handler
    // - did it change the queue?
    // - did we get a new file in Canvas?
    await processQueueEntry();
    // 3. (teardown) remove file from canvas
    expect(true).toBe(true);
  });
});

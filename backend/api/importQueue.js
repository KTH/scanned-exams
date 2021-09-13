const { MongoClient } = require("mongodb");
const log = require("skog");

const { MONGODB_CONNECTION_STRING } = process.env;
const DB_QUEUE_NAME = "import_queue";

const dbClient = new MongoClient(MONGODB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

/* eslint max-classes-per-file: off */

class QueueEntry {
  constructor({
    fileId,
    courseId,
    userKthId,
    status = "new",
    createdAt,
    importStartedAt,
    importSuccessAt,
    lastErrorAt,
    error,
  }) {
    this.fileId = fileId;
    this.courseId = courseId;
    this.userKthId = userKthId;
    this.status = status;
    this.createdAt = createdAt || new Date();
    this.importStartedAt = importStartedAt;
    this.importSuccessAt = importSuccessAt;
    this.lastErrorAt = lastErrorAt;
    this.error = error;
  }

  toJSON() {
    return {
      fileId: this.fileId,
      courseId: this.courseId,
      userKthId: this.userKthId,
      status: this.status,
      createdAt: this.createdAt,
      importStartedAt: this.importStartedAt || null,
      importSuccessAt: this.importSuccessAt || null,
      lastErrorAt: this.lastErrorAt || null,
      error: this.error || null,
    };
  }
}

class QueueStatus {
  /**
   * Status of import queue
   * @param {String} param0.status idle|working
   * @param {int} param0.total total number being processed
   * @param {int} param0.progress total number pending import
   */
  constructor({ status, total, progress }) {
    this.status = status;
    if (total !== undefined) {
      this.working = {
        progress: progress || 0,
        total,
      };
    }
  }

  toJSON() {
    if (this.working !== undefined) {
      return {
        status: this.status,
        working: {
          progress: this.working.progress,
          total: this.working.total,
        },
      };
    }

    return { status: this.status };
  }
}

/**
 * Get list of exams in import queue for given course
 * @param {String} courseId
 * @returns Mongodb cursor with results
 */
async function getEntriesFromQueue(courseId) {
  try {
    // Open collection
    const conn = await dbClient.connect();
    const db = conn.db();
    const collImportQueue = db.collection(DB_QUEUE_NAME);

    const cursor = collImportQueue.find({ courseId });

    return await cursor.toArray();
  } catch (err) {
    // TODO: Handle errors
    log.error({ err });
  } finally {
    await dbClient.close();
  }
  return null;
}

async function getEntryFromQueue(fileId) {
  try {
    // Open collection
    const conn = await dbClient.connect();
    const db = conn.db();
    const collImportQueue = db.collection(DB_QUEUE_NAME);

    const doc = await collImportQueue.findOne({ fileId });

    return new QueueEntry(doc);
  } catch (err) {
    // TODO: Handle errors
    log.error({ err });
  } finally {
    await dbClient.close();
  }
  return null;
}

async function addEntryToQueue(entry) {
  try {
    // Open collection
    const conn = await dbClient.connect();
    const db = conn.db();
    const collImportQueue = db.collection(DB_QUEUE_NAME);

    // Add entry
    const res = await collImportQueue.insertOne({
      _id: entry.fileId,
      ...(entry.toJSON ? entry.toJSON() : entry),
    });

    if (res.acknowledged) {
      // Return typed object
      return entry instanceof QueueEntry ? entry : new QueueEntry(entry);
    }
    // TODO: Should we check reason?
    throw Error("Could not insert entry into queue");
  } catch (err) {
    // TODO: Handle errors
    log.error({ err });
  } finally {
    await dbClient.close();
  }
  return null;
}

async function getStatusFromQueue(courseId) {
  try {
    // Open collection
    const conn = await dbClient.connect();
    const db = conn.db();
    const collImportQueue = db.collection(DB_QUEUE_NAME);

    const cursor = collImportQueue.find({ courseId });

    // Calculate status
    // TODO: This should be done by aggregation and setting indexes
    let pending = 0;
    let total = 0;
    let status = "idle";
    await cursor.forEach((doc) => {
      switch (doc.status) {
        case "pending":
          total++;
          pending++;
          status = "working";
          break;
        case "imported":
          total++;
          break;
        default: // noop
      }
    });
    const progress = total - pending;
    const statusObj = new QueueStatus({ status, total, progress });

    // Return a typed status object
    return statusObj;
  } catch (err) {
    // TODO: Handle errors
    log.error({ err });
  } finally {
    await dbClient.close();
  }
  return null;
}

async function updateStatusOfEntryInQueue(entry, status, errorDetails) {
  try {
    // Open collection
    const conn = await dbClient.connect();
    const db = conn.db();
    const collImportQueue = db.collection(DB_QUEUE_NAME);

    // Perform update
    const tmpOld = await collImportQueue.findOne({ fileId: entry.fileId });
    if (tmpOld) {
      const entryObj = new QueueEntry(tmpOld);
      entryObj.status = status;
      switch (status) {
        case "pending":
          entryObj.importStartedAt = new Date();
          entryObj.error = null;
          break;
        case "imported":
          entryObj.importSuccessAt = new Date();
          entryObj.error = null;
          break;
        case "error":
          entryObj.lastErrorAt = new Date();
          entryObj.error = errorDetails || {
            type: "error",
            message: "An error occured but no details were provided.",
          };
          break;
        default: // noop
      }

      const res = await collImportQueue.replaceOne(
        { fileId: entryObj.fileId },
        entryObj
      );
      if (!res.acknowledged) {
        throw Error(`Update import queue didn't get acknowledge from Mongodb.`);
      }

      if (res.matchedCount < 1) {
        throw Error(`Entry ${entry.fileId} in import queue not found.`);
      }

      // Return updated object
      return new QueueEntry(entryObj);
    }

    return null;
  } catch (err) {
    // TODO: Handle errors
    log.error({ err });
  } finally {
    await dbClient.close();
  }
  return null;
}

module.exports = {
  QueueEntry,
  QueueStatus,
  getEntryFromQueue,
  getEntriesFromQueue,
  addEntryToQueue,
  updateStatusOfEntryInQueue,
  getStatusFromQueue,
};

const { MongoClient } = require("mongodb");
const log = require("skog");
const { ImportError } = require("../error");

const { MONGODB_CONNECTION_STRING } = process.env;
const DB_QUEUE_NAME = "import_queue";

const databaseClient = new MongoClient(MONGODB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 5,
  minPoolSize: 1,
});

let databaseConnection;
function connectToDatabase() {
  databaseConnection = databaseConnection || databaseClient.connect();
  return databaseConnection;
}

/**
 * Return the Import Queue collection.
 *
 * It also connects to the database if it's not already connected
 */
async function getImportQueueCollection() {
  // Note: `databaseConnection` is a promise and must be awaited to be used
  // Instansiate once, but not before it is used the first time
  await connectToDatabase();

  return databaseClient.db().collection(DB_QUEUE_NAME);
}

/**
 * For runtime input param testing
 * @param {bool|function} test Test case that should return true
 * @param {string} msg Error message
 */
function assert(test, msg) {
  if ((typeof test === "function" && !test()) || !test) {
    throw Error(msg);
  }
}

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
   * @param {int} param0.error total number of errors
   */
  constructor({ status, total, progress = 0, error = 0 }) {
    this.status = status;
    if (total !== undefined) {
      this.working = {
        error,
        progress,
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
          error: this.working.error,
        },
      };
    }

    return { status: this.status };
  }
}

/**
 * Get list of exams in import queue for given course
 * @param {String} courseId
 * @returns an array of QueueEntry objects
 */
async function getEntriesFromQueue(courseId) {
  try {
    // Open collection
    const collImportQueue = await getImportQueueCollection();
    const cursor = collImportQueue.find({ courseId });

    const entries = await cursor.toArray();

    return entries.map((entry) => new QueueEntry(entry));
  } catch (err) {
    // TODO: Handle errors
    log.error({ err });
    throw ImportError({
      err,
    });
  }
}

async function getEntryFromQueue(fileId) {
  try {
    // Open collection
    const collImportQueue = await getImportQueueCollection();
    const doc = await collImportQueue.findOne({ fileId });

    return new QueueEntry(doc);
  } catch (err) {
    // TODO: Handle errors
    log.error({ err });
    throw err;
  }
}

/**
 * Remove entries with status "imported" and set those with status
 * "error" to "pending" so they can be re-imported.
 * @param {String} courseId
 */
async function resetQueueForImport(courseId) {
  try {
    const collImportQueue = await getImportQueueCollection();
    await collImportQueue.deleteMany({
      courseId,
      status: {
        $in: ["imported", "error"],
      },
    });
  } catch (err) {
    log.error({ err });
    throw new ImportError({
      type: "delete_error",
      statusCode: 420,
      message: "Error removing finished entries",
    });
  }
}

/**
 * Add an entry to the import queue
 * If an entry exists with given fileId, an error will be thrown.
 * @param {Object} entry This is a QueueEntry like object
 * @returns QueueEntry
 */
async function addEntryToQueue(entry) {
  assert(entry.fileId !== undefined, "Param entry is missing fileId");
  assert(entry.courseId !== undefined, "Param entry is missing courseId");

  // Type object to get defaults
  const typedEntry =
    entry instanceof QueueEntry ? entry : new QueueEntry(entry);

  try {
    const collImportQueue = await getImportQueueCollection();

    // Add entry
    const res = await collImportQueue.insertOne({
      _id: typedEntry.fileId,
      ...typedEntry.toJSON(),
    });

    if (res.acknowledged) {
      // Return typed object
      return typedEntry;
    }
    // TODO: Should we check reason?
    throw ImportError({
      type: "insert_error",
      statusCode: 420,
      message: "Could not insert entry into queue",
    });
  } catch (err) {
    throw new ImportError({
      type: "entry_exists",
      statusCode: 409,
      message: `Add to queue failed because entry exist for this fileId '${typedEntry.fileId}'`,
      err,
    });
  }
}

async function getStatusFromQueue(courseId) {
  try {
    const collImportQueue = await getImportQueueCollection();
    const cursor = collImportQueue.find({ courseId });

    let pending = 0;
    let error = 0;
    let imported = 0;

    await cursor.forEach((doc) => {
      switch (doc.status) {
        case "pending":
          pending++;
          break;
        case "error":
          error++;
          break;
        case "imported":
          imported++;
          break;
        default: // noop
      }
    });

    const status = pending === 0 ? "idle" : "working";
    const total = pending + error + imported;
    const progress = error + imported;

    return new QueueStatus({ status, total, progress, error });
  } catch (err) {
    // TODO: Handle errors
    log.error({ err });
    throw err;
  }
}

async function updateStatusOfEntryInQueue(entry, status, errorDetails) {
  try {
    const collImportQueue = await getImportQueueCollection();

    // Perform update
    const tmpOld = await collImportQueue.findOne({ fileId: entry.fileId });
    if (tmpOld) {
      const typedEntry = new QueueEntry(tmpOld);
      typedEntry.status = status;
      switch (status) {
        case "pending":
          typedEntry.importStartedAt = new Date();
          typedEntry.error = null;
          break;
        case "imported":
          typedEntry.importSuccessAt = new Date();
          typedEntry.error = null;
          break;
        case "error":
          typedEntry.lastErrorAt = new Date();
          typedEntry.error = errorDetails || {
            type: "error",
            message: "An error occured but no details were provided.",
          };
          break;
        default: // noop
      }

      const res = await collImportQueue.replaceOne(
        { fileId: typedEntry.fileId },
        typedEntry
      );
      if (!res.acknowledged) {
        throw new ImportError({
          type: "update_error",
          statusCode: 420,
          message: `Update import queue didn't get acknowledge from Mongodb.`,
        });
      }

      if (res.matchedCount < 1) {
        throw new ImportError({
          type: "not_found",
          statusCode: 404,
          message: `Entry ${entry.fileId} in import queue not found.`,
        });
      }

      // Return updated object
      return new QueueEntry(typedEntry);
    }

    return null;
  } catch (err) {
    // TODO: Handle errors
    log.error({ err });
    throw err;
  }
}

async function getFirstPendingFromQueue() {
  try {
    const collImportQueue = await getImportQueueCollection();
    const doc = await collImportQueue.findOne({ status: "pending" });

    if (!doc) {
      return null;
    }

    return new QueueEntry(doc);
  } catch (err) {
    // TODO: Handle errors
    log.error({ err });
    throw err;
  }
}

module.exports = {
  QueueEntry,
  QueueStatus,
  getEntryFromQueue,
  getEntriesFromQueue,
  addEntryToQueue,
  updateStatusOfEntryInQueue,
  getStatusFromQueue,
  getFirstPendingFromQueue,
  resetQueueForImport,
  getImportQueueCollection,
  databaseClient,
};

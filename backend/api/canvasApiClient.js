const Canvas = require("@kth/canvas-api");
const FormData = require("formdata-node").default;
const fs = require("fs");
const got = require("got");
const log = require("skog");
const { getAktivitetstillfalle } = require("./tentaApiClient");

const canvas = new Canvas(
  process.env.CANVAS_API_URL,
  process.env.CANVAS_API_ADMIN_TOKEN
);

/** Get the Ladok UID of the examination linked with a canvas course */
async function getExaminationLadokId(courseId) {
  const sections = await canvas.list(`courses/${courseId}/sections`).toArray();

  // For SIS IDs with format "AKT.<ladok id>.<suffix>", take the "<ladok id>"
  const REGEX = /^AKT\.([\w-]+)/;
  const sisIds = sections
    .map((section) => section.sis_section_id?.match(REGEX)?.[1])
    .filter((sisId) => sisId /* Filter out null and undefined */);

  // Deduplicate IDs (there are usually one "funka" and one "non-funka" with
  // the same Ladok ID)
  const uniqueIds = Array.from(new Set(sisIds));

  // Right now we are not supporting rooms with more than one examination
  if (uniqueIds.length !== 1) {
    throw new Error(
      `Course ${courseId} not supported: it is connected to ${uniqueIds.length} different Ladok Ids`
    );
  } else {
    return uniqueIds[0];
  }
}

async function getValidAssignment(courseId, ladokId) {
  const assignments = await canvas
    .list(`courses/${courseId}/assignments`)
    .toArray();

  // TODO: Filter more strictly?
  return (
    assignments.find((a) => a.integration_data?.ladokId === ladokId) ?? null
  );
}

async function createAssignment(courseId, ladokId) {
  const examination = await getAktivitetstillfalle(ladokId);

  return canvas
    .requestUrl(`courses/${courseId}/assignments`, "POST", {
      assignment: {
        name: "Scanned exams",
        description:
          "This canvas assignment is meant to be used for scanned exams",
        submission_types: ["online_upload"],
        allowed_extensions: ["pdf"],
        // TODO: save only the "Ladok UID" because `examination.courseCode` and
        //       `examination.examCode` can be more than one
        // TODO: add more data to be able to filter out better?
        integration_data: {
          ladokId,
        },
        published: false,
        grading_type: "letter_grade",
        notify_of_update: false,
        lock_at: new Date().toISOString(),
        // IMPORTANT: do NOT pass a time zone in the "due_at" field
        due_at: `${examination.examDate}T23:59:59`,
        // TODO: take the grading standard from TentaAPI
        //       grading_standard_id: 1,
      },
    })
    .then((r) => r.body);
}

async function unlockAssignment(courseId, assignmentId) {
  const TOMORROW = new Date();
  TOMORROW.setDate(TOMORROW.getDate() + 1);

  return canvas.requestUrl(
    `courses/${courseId}/assignments/${assignmentId}`,
    "PUT",
    {
      assignment: {
        lock_at: TOMORROW.toISOString(),
        published: true,
      },
    }
  );
}

async function lockAssignment(courseId, assignmentId) {
  const YESTERDAY = new Date();
  YESTERDAY.setDate(YESTERDAY.getDate() - 1);

  return canvas.requestUrl(
    `courses/${courseId}/assignments/${assignmentId}`,
    "PUT",
    {
      assignment: {
        lock_at: YESTERDAY.toISOString(),
      },
    }
  );
}

async function sendFile({ upload_url, upload_params }, filePath) {
  const form = new FormData();

  for (const key in upload_params) {
    if (upload_params[key]) {
      form.append(key, upload_params[key]);
    }
  }

  form.append("attachment", fs.createReadStream(filePath));

  return got.post({
    url: upload_url,
    body: form.stream,
    headers: form.headers,
    responseType: "json",
  });
}

// TODO: Refactor this function and uploadExam to avoid requesting the endpoint
//       "GET users/sis_user_id:${userId}" twice
async function hasSubmission({ courseId, assignmentId, userId }) {
  try {
    const { body: user } = await canvas.get(`users/sis_user_id:${userId}`);
    const { body: assignment } = await canvas.get(
      `courses/${courseId}/assignments/${assignmentId}/submissions/${user.id}`
    );

    return assignment.workflow_state === "submitted";
  } catch (err) {
    if (err.response?.statusCode === 404) {
      return false;
    } else {
      throw err;
    }
  }
}

async function uploadExam(
  filePath,
  { courseId, assignmentId, userId, examDate }
) {
  try {
    const { body: user } = await canvas.get(`users/sis_user_id:${userId}`);

    // TODO: will return a 400 if the course is unpublished
    const { body: slot } = await canvas.requestUrl(
      `courses/${courseId}/assignments/${assignmentId}/submissions/${user.id}/files`,
      "POST",
      {
        name: `${userId}.pdf`,
      }
    );

    const { body: uploadedFile } = await sendFile(slot, filePath);

    await canvas.requestUrl(
      `courses/${courseId}/assignments/${assignmentId}/submissions/`,
      "POST",
      {
        submission: {
          submission_type: "online_upload",
          user_id: user.id,
          file_ids: [uploadedFile.id],
          // IMPORTANT: do not pass the timezone in the "submitted_at" field
          submitted_at: `${examDate}T08:00:00`,
        },
      }
    );
  } catch (err) {
    if (err.response?.statusCode === 404) {
      log.warn(`User ${userId} is missing in Canvas course ${courseId}`);
    } else {
      throw err;
    }
  }
}

/** Return the roles of a user in a course */
async function getRoles(courseId, userId) {
  const enrollments = await canvas
    .list(`courses/${courseId}/enrollments`, { user_id: userId })
    .toArray();

  return enrollments.map((enr) => enr.role_id);
}

module.exports = {
  getExaminationLadokId,
  getValidAssignment,
  getRoles,
  createAssignment,
  unlockAssignment,
  lockAssignment,
  hasSubmission,
  uploadExam,
};

const Canvas = require("@kth/canvas-api");
const FormData = require("formdata-node").default;
const fs = require("fs");
const got = require("got");

const canvas = new Canvas(
  process.env.CANVAS_API_URL,
  process.env.CANVAS_API_ADMIN_TOKEN
);

async function getValidAssignment(courseId) {
  const assignments = await canvas
    .list(`courses/${courseId}/assignments`)
    .toArray();

  // TODO: Filter more strictly?
  return assignments.find((a) => a.integration_data.courseCode) ?? null;
}

async function createAssignment(courseId, examination) {
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
        integration_data: examination,
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

async function uploadExam(
  filePath,
  { courseId, assignmentId, userId, examDate }
) {
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
}

module.exports = {
  getValidAssignment,
  createAssignment,
  unlockAssignment,
  lockAssignment,
  uploadExam,
};

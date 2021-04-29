const Canvas = require("@kth/canvas-api");
const FormData = require("formdata-node").default;
const fs = require("fs");
const got = require("got");

const canvas = new Canvas(
  process.env.CANVAS_API_URL,
  process.env.CANVAS_API_ADMIN_TOKEN
);

/** Get the Ladok UID of the examination linked with a canvas course */
async function getExaminationLadokId(courseId) {
  const sections = await canvas.list(`courses/${courseId}/sections`).toArray();

  // For SIS IDs with format "AKT.<ladok id>.<suffix>", take the "<ladok id>"
  const REGEX = /^AKT\.([\w-]+)/;
  const sisIds = sections.map(
    (section) => section.sis_section_id.match(REGEX)?.[1]
  );

  // Deduplicate IDs (there are usually one "funka" and one "non-funka" with
  // the same Ladok ID)
  const uniqueIds = Array.from(new Set(sisIds));

  // Right now we are not supporting rooms with more than one examination
  if (uniqueIds.length > 1) {
    console.log("NOT SUPPORTED!!!");
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
  return canvas
    .requestUrl(`courses/${courseId}/assignments`, "POST", {
      assignment: {
        name: "Scanned exams",
        description:
          "This canvas assignment is meant to be used for scanned exams",
        submission_types: ["online_upload"],
        allowed_extensions: ["pdf"],
        // TODO: add more data to be able to filter out better?
        integration_data: {
          ladokId,
        },
        published: false,
        grading_type: "letter_grade",
        // TODO: grading_standard_id: 1,
      },
    })
    .then((r) => r.body);
}

async function publishAssignment(courseId, assignmentId) {
  return canvas.requestUrl(
    `courses/${courseId}/assignments/${assignmentId}`,
    "PUT",
    {
      assignment: {
        published: true,
      },
    }
  );
}

async function unPublishAssignment(courseId, assignmentId) {
  return canvas.requestUrl(
    `courses/${courseId}/assignments/${assignmentId}`,
    "PUT",
    {
      assignment: {
        published: false,
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

async function uploadExam(filePath, courseId, assignmentId, userId) {
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
      },
    }
  );
}

module.exports = {
  getExaminationLadokId,
  getValidAssignment,
  createAssignment,
  publishAssignment,
  unPublishAssignment,
  uploadExam,
};

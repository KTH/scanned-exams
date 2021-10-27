const Canvas = require("@kth/canvas-api");
const FormData = require("formdata-node").default;
const got = require("got");
const log = require("skog");
const { getAktivitetstillfalle } = require("./ladokApiClient");
const { EndpointError, ImportError } = require("./error");

const canvas = new Canvas(
  process.env.CANVAS_API_URL,
  process.env.CANVAS_API_ADMIN_TOKEN
);

/**
 * These endpoints have the content used as a template when creating the
 * homepage and assignment.
 */
const TEMPLATES = {
  assignment: {
    en: "courses/33450/assignments/178066",
    sv: "courses/33450/assignments/178752",
  },
  homepage: {
    en: "courses/33450/pages/151311",
    sv: "courses/33450/pages/151959",
  },
};

/** Get data from one canvas course */
async function getCourse(courseId) {
  const { body } = await canvas.get(`courses/${courseId}`);

  return body;
}

/** Creates a "good-looking" homepage in Canvas */
async function createHomepage(courseId, language = "en") {
  const { body: template } = await canvas.get(TEMPLATES.homepage[language]);

  await canvas.requestUrl(`courses/${courseId}/front_page`, "PUT", {
    wiki_page: {
      // To make this page, use the Rich Content Editor in Canvas (https://kth.test.instructure.com/courses/30347/pages/welcome-to-the-exam/edit)
      body: template.body,
      title: template.title,
    },
  });
  return canvas.requestUrl(`courses/${courseId}`, "PUT", {
    course: {
      default_view: "wiki",
    },
  });
}

/** Publish a course */
async function publishCourse(courseId) {
  return canvas.requestUrl(`courses/${courseId}`, "PUT", {
    course: {
      event: "offer",
    },
  });
}

/** Get the Ladok UID of the examination linked with a canvas course */
async function getAktivitetstillfalleUIDs(courseId) {
  const sections = await canvas.list(`courses/${courseId}/sections`).toArray();

  // For SIS IDs with format "AKT.<ladok id>.<suffix>", take the "<ladok id>"
  const REGEX = /^AKT\.([\w-]+)/;
  const sisIds = sections
    .map((section) => section.sis_section_id?.match(REGEX)?.[1])
    .filter((sisId) => sisId /* Filter out null and undefined */);

  // Deduplicate IDs (there are usually one "funka" and one "non-funka" with
  // the same Ladok ID)
  const uniqueIds = Array.from(new Set(sisIds));

  return uniqueIds;
}

// TODO: this function is kept only for backwards-compatibility reasons
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

async function getAssignmentSubmissions(courseId, assignmentId) {
  // API docs https://canvas.instructure.com/doc/api/submissions.html
  // GET /api/v1/courses/:course_id/assignments/:assignment_id/submissions
  // ?include=user (to get user obj wth kth id)
  return canvas
    .list(
      `courses/${courseId}/assignments/${assignmentId}/submissions`,
      { include: "user" } // include user obj with kth id
    )
    .toArray();
}

async function createAssignment(courseId, ladokId, language = "en") {
  const examination = await getAktivitetstillfalle(ladokId);
  const { body: template } = await canvas.get(TEMPLATES.assignment[language]);

  const examinationDate = new Date(`${examination.examDate}T00:00:00`);

  if (examinationDate > new Date()) {
    throw new EndpointError({
      type: "future_exam",
      statusCode: 400,
      message: `You can not create the assignment now. Please run the app again after the exam date, i.e. on ${examination.examDate} or later`,
    });
  }

  return canvas
    .requestUrl(`courses/${courseId}/assignments`, "POST", {
      assignment: {
        name: template.name,
        description: template.description,
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
        // NOTES:
        // 1. We don't pass "Z" because we want the due date to be 00:00 local time.
        // 2. Canvas converts "00:00:00" times to "23:59:59". Because of that, we need to pass "00:01:00".
        due_at: `${examination.examDate}T00:01:00`,
        // TODO: take the grading standard from TentaAPI
        //       grading_standard_id: 1,
      },
    })
    .then((r) => r.body);
}

/** Publish an assignment */
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
  const NOW = new Date();

  return canvas.requestUrl(
    `courses/${courseId}/assignments/${assignmentId}`,
    "PUT",
    {
      assignment: {
        lock_at: NOW.toISOString(),
      },
    }
  );
}

// eslint-disable-next-line camelcase
async function sendFile({ upload_url, upload_params }, content) {
  const form = new FormData();

  // eslint-disable-next-line camelcase
  for (const key in upload_params) {
    if (upload_params[key]) {
      form.append(key, upload_params[key]);
    }
  }

  form.append("attachment", content, upload_params.filename);

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
    const { body: submission } = await canvas.get(
      `courses/${courseId}/assignments/${assignmentId}/submissions/${user.id}`
    );

    return !submission.missing;
  } catch (err) {
    if (err.response?.statusCode === 404) {
      return false;
    }
    throw err;
  }
}

async function uploadExam(
  content,
  { courseId, studentKthId, examDate, fileId }
) {
  try {
    const { body: user } = await canvas.get(
      `users/sis_user_id:${studentKthId}`
    );

    const ladokId = await getExaminationLadokId(courseId);
    const assignment = await getValidAssignment(courseId, ladokId);
    log.debug(
      `Upload Exam: unlocking assignment ${assignment.id} in course ${courseId}`
    );
    await unlockAssignment(courseId, assignment.id);

    const reqTokenStart = Date.now();
    // TODO: will return a 400 if the course is unpublished
    const { body: slot } = await canvas
      .requestUrl(
        `courses/${courseId}/assignments/${assignment.id}/submissions/${user.id}/files`,
        "POST",
        {
          name: `${studentKthId}.pdf`,
        }
      )
      .catch((err) => {
        if (err.response?.statusCode === 404) {
          // Student is missing in Canvas, we can fix this
          throw new ImportError({
            type: "missing_student",
            message: "Student is missing in examroom",
            details: {
              kthId: studentKthId,
            },
          });
        } else {
          // Other errors from Canvas API that we don't know how to fix
          throw new ImportError({
            type: "import_error",
            message: `Canvas returned an error when importing this exam (windream fileId: ${fileId})`,
            details: {
              kthId: studentKthId,
              fileId,
            },
          });
        }
      });

    log.debug(
      "Time to generate upload token: " + (Date.now() - reqTokenStart) + "ms"
    );

    const uploadFileStart = Date.now();
    const { body: uploadedFile } = await sendFile(slot, content);

    log.debug("Time to upload file: " + (Date.now() - uploadFileStart) + "ms");

    await canvas.requestUrl(
      `courses/${courseId}/assignments/${assignment.id}/submissions/`,
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

    await lockAssignment(courseId, assignment.id);
  } catch (err) {
    if (err.type === "missing_student") {
      log.warn(`User ${studentKthId} is missing in Canvas course ${courseId}`);
    } else {
      log.error(
        { err },
        `Error when uploading an exam ${studentKthId} / course ${courseId}`
      );
    }
    throw err;
  }
}

async function getRoles(courseId, userId) {
  if (!courseId) {
    throw new EndpointError({
      type: "missing_argument",
      statusCode: 400,
      message: "Missing argument [courseId]",
    });
  }

  if (!userId) {
    throw new EndpointError({
      type: "missing_argument",
      statusCode: 400,
      message: "Missing argument [userId]",
    });
  }

  // TODO: error handling for non-existent courseId or userId
  const enrollments = await canvas
    .list(`courses/${courseId}/enrollments`, { user_id: userId })
    .toArray();

  return enrollments.map((enr) => enr.role_id);
}

async function enrollStudent(courseId, userId) {
  return canvas.requestUrl(`courses/${courseId}/enrollments`, "POST", {
    enrollment: {
      user_id: `sis_user_id:${userId}`,
      role_id: 3,
      enrollment_state: "active",
      notify: false,
    },
  });
}

module.exports = {
  getCourse,
  publishCourse,
  createHomepage,
  getAktivitetstillfalleUIDs,
  getValidAssignment,
  getAssignmentSubmissions,
  createAssignment,
  publishAssignment,
  unlockAssignment,
  lockAssignment,
  hasSubmission,
  uploadExam,
  getRoles,
  enrollStudent,
};

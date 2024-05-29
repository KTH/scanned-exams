import CanvasApi from "@kth/canvas-api";
import FormData from "formdata-node";
import got from "got";
import log from "skog";
import { getAktivitetstillfalle } from "./ladokApiClient";
import {
  EndpointError,
  FileUploadError,
  ImportError,
  canvasApiGenericErrorHandler,
} from "../error";
import {
  propertiesToCreateLockedAssignment,
  propertiesToUnlockAssignment,
  propertiesToLockAssignment,
  propertiesToCreateSubmission,
} from "../assignmentLock";

let canvas: CanvasApi;
if (process.env.NODE_ENV === "test") {
  log.info("NOTE: Not instantiating canvas api since this is a test!");
} else {
  canvas = new CanvasApi(
    process.env.CANVAS_API_URL,
    process.env.CANVAS_API_ADMIN_TOKEN
  );
}

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
  const { body } = await canvas
    .get<any>(`courses/${courseId}`)
    .catch(canvasApiGenericErrorHandler);

  return body;
}

/** Creates a "good-looking" homepage in Canvas */
async function createHomepage(courseId, language = "en") {
  const { body: template } = await canvas
    .get<any>(TEMPLATES.homepage[language])
    .catch(canvasApiGenericErrorHandler);

  await canvas
    .request(`courses/${courseId}/front_page`, "PUT", {
      wiki_page: {
        // To make this page, use the Rich Content Editor in Canvas (https://kth.test.instructure.com/courses/30347/pages/welcome-to-the-exam/edit)
        body: template.body,
        title: template.title,
      },
    })
    .catch(canvasApiGenericErrorHandler);
  return canvas
    .request(`courses/${courseId}`, "PUT", {
      course: {
        default_view: "wiki",
      },
    })
    .catch(canvasApiGenericErrorHandler);
}

/** Publish a course */
async function publishCourse(courseId) {
  return canvas
    .request(`courses/${courseId}`, "PUT", {
      course: {
        event: "offer",
      },
    })
    .catch(canvasApiGenericErrorHandler);
}

/** Get the Ladok UID of the examination linked with a canvas course */
async function getAktivitetstillfalleUIDs(courseId) {
  const sections = await canvas
    .listItems<any>(`courses/${courseId}/sections`)
    .toArray()
    .catch(canvasApiGenericErrorHandler);

  // For SIS IDs with format "AKT.<ladok id>.<suffix>", take the "<ladok id>"
  const REGEX = /^AKT\.([\w-]+)/;
  const sisIds = sections
    .map((section) => section.sis_section_id?.match(REGEX)?.[1])
    .filter((sisId) => sisId /* Filter out null and undefined */);

  // Deduplicate IDs (there are usually one "funka" and one "non-funka" with
  // the same Ladok ID)
  const uniqueIds = Array.from(new Set(sisIds));

  return uniqueIds as string[];
}

// TODO: this function is kept only for backwards-compatibility reasons
async function getExaminationLadokId(courseId) {
  const sections = await canvas
    .listItems<any>(`courses/${courseId}/sections`)
    .toArray()
    .catch(canvasApiGenericErrorHandler);

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
    return uniqueIds[0] as string;
  }
}

async function getValidAssignment(courseId, ladokId) {
  const assignments = await canvas
    .listItems<any>(`courses/${courseId}/assignments`)
    .toArray()
    .catch(canvasApiGenericErrorHandler);

  // TODO: Filter more strictly?
  return (
    assignments.find((a) => a.integration_data?.ladokId === ladokId) ?? null
  );
}

type TSubmissionWithHistory = {
  submission_history: {
    attachments: {
      filename: string;
    }[];
  }[];
  user: {
    sis_user_id: string;
  };
};

async function getAssignmentSubmissions(courseId, assignmentId) {
  // API docs https://canvas.instructure.com/doc/api/submissions.html
  // GET /api/v1/courses/:course_id/assignments/:assignment_id/submissions
  // ?include=user (to get user obj wth kth id)
  return canvas
    .listItems<TSubmissionWithHistory>(
      `courses/${courseId}/assignments/${assignmentId}/submissions`,
      { include: ["user", "submission_history"] } // include user obj with kth id
    )
    .toArray()
    .catch(canvasApiGenericErrorHandler);
}

async function createAssignment(courseId, ladokId, language = "en") {
  const examination = await getAktivitetstillfalle(ladokId);
  const { body: template } = await canvas
    .get<any>(TEMPLATES.assignment[language])
    .catch(canvasApiGenericErrorHandler);

  return canvas
    .request(`courses/${courseId}/assignments`, "POST", {
      assignment: {
        ...propertiesToCreateLockedAssignment(examination.examDate),
        name: template.name,
        description: template.description,
        integration_data: {
          ladokId,
        },
        anonymous_grading: !!examination.anonymous,
        published: false,
        grading_type: "letter_grade",
        notify_of_update: false,
        // TODO: take the grading standard from TentaAPI
        //       grading_standard_id: 1,
      },
    })
    .then((r) => r.body as any)
    .catch(canvasApiGenericErrorHandler);
}

/** Publish an assignment */
async function publishAssignment(courseId, assignmentId) {
  return canvas
    .request(`courses/${courseId}/assignments/${assignmentId}`, "PUT", {
      assignment: {
        published: true,
      },
    })
    .catch(canvasApiGenericErrorHandler);
}

/**
 * Allows the app to upload exams.
 */
async function unlockAssignment(courseId, assignmentId) {
  return canvas
    .request(`courses/${courseId}/assignments/${assignmentId}`, "PUT", {
      assignment: {
        ...propertiesToUnlockAssignment(),
        published: true,
      },
    })
    .catch(canvasApiGenericErrorHandler);
}

/**
 * Prevents students to upload things by accident.
 */
async function lockAssignment(courseId, assignmentId) {
  return canvas
    .request(`courses/${courseId}/assignments/${assignmentId}`, "PUT", {
      assignment: {
        ...propertiesToLockAssignment(),
      },
    })
    .catch(canvasApiGenericErrorHandler);
}

function uploadFileErrorHandler(err): never {
  Error.captureStackTrace(err, uploadFileErrorHandler);

  throw new FileUploadError({
    type: "unhandled_error",
    message: "Error uploading file to storage",
    err,
  });
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

  return got
    .post<any>({
      url: upload_url,
      body: form.stream,
      headers: form.headers,
      responseType: "json",
    })
    .catch(uploadFileErrorHandler);
}

// TODO: Refactor this function and uploadExam to avoid requesting the endpoint
//       "GET users/sis_user_id:${userId}" twice
async function hasSubmission({ courseId, assignmentId, userId }) {
  try {
    const { body: user } = await canvas
      .get<any>(`users/sis_user_id:${userId}`)
      .catch(canvasApiGenericErrorHandler);
    const { body: submission } = await canvas
      .get<any>(
        `courses/${courseId}/assignments/${assignmentId}/submissions/${user.id}`
      )
      .catch(canvasApiGenericErrorHandler);

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
    const { body: user } = await canvas
      .get<any>(`users/sis_user_id:${studentKthId}`)
      .catch(canvasApiGenericErrorHandler);

    const ladokId = await getExaminationLadokId(courseId);
    const assignment = await getValidAssignment(courseId, ladokId);
    log.debug(
      `Upload Exam: unlocking assignment ${assignment.id} in course ${courseId}`
    );

    const reqTokenStart = Date.now();
    // TODO: will return a 400 if the course is unpublished
    const { body: slot } = await canvas
      .request<any>(
        `courses/${courseId}/assignments/${assignment.id}/submissions/${user.id}/files`,
        "POST",
        {
          name: `${fileId}.pdf`,
        }
      )
      .catch((err): never => {
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

    // TODO: move the following statement outside of this function
    // Reason: this module (canvasApiClient) should not contain "business rules"
    await unlockAssignment(courseId, assignment.id);

    // Get existing submission history for this student and assignment to figure out
    // timestamp offset. If we submit on the same timestamp (submitted_at), the old
    // submission gets overwritten.
    const { body: submission } = await getAssignmentSubmissionForStudent({
      courseId,
      assignmentId: assignment.id,
      userId: user.id,
    });

    // There is always a submission to start with in the history with status "unsubmitted"
    // so we need to filter that out when getting nrof actual submissions
    const nrofSubmissions =
      submission.submission_history?.filter(
        (s) => s.workflow_state !== "unsubmitted"
      ).length ?? 0;
    const submissionProps = propertiesToCreateSubmission(
      examDate,
      nrofSubmissions
    );
    const { submitted_at } = submissionProps;

    await canvas
      .request(
        `courses/${courseId}/assignments/${assignment.id}/submissions/`,
        "POST",
        {
          submission: {
            ...submissionProps,
            submission_type: "online_upload",
            user_id: user.id,
            file_ids: [uploadedFile.id],
          },
        }
      )
      .catch(canvasApiGenericErrorHandler);

    return submitted_at;
  } catch (err) {
    if (err.type === "missing_student") {
      log.warn(`User ${studentKthId} is missing in Canvas course ${courseId}`);
    } else if (!studentKthId) {
      log.warn(
        `User is missing KTH ID, needs du be manually graded: Windream fileid ${fileId} / course ${courseId}`
      );
    } else {
      log.error(
        { err },
        `Error when uploading exam: KTH ID ${studentKthId} / course ${courseId}`
      );
    }
    throw err;
  }
}

// TOOD: This function can take very long to run. Consider changing it somehow
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
    .listItems<any>(`courses/${courseId}/enrollments`, { per_page: 100 })
    .toArray()
    .catch(canvasApiGenericErrorHandler);

  return enrollments
    .filter((enr) => enr.user_id === userId)
    .map((enr) => enr.role_id);
}

async function getAssignmentSubmissionForStudent({
  courseId,
  assignmentId,
  userId,
}) {
  return canvas
    .get<{ submission_history: { workflow_state: string }[] }>(
      `courses/${courseId}/assignments/${assignmentId}/submissions/${userId}`,
      { include: ["submission_history"] }
    )
    .catch(canvasApiGenericErrorHandler);
}

async function enrollStudent(courseId, userId) {
  return canvas
    .request(`courses/${courseId}/enrollments`, "POST", {
      enrollment: {
        user_id: `sis_user_id:${userId}`,
        role_id: 3,
        enrollment_state: "active",
        notify: false,
      },
    })
    .catch(canvasApiGenericErrorHandler);
}

export {
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

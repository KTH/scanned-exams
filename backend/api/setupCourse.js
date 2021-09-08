/**
 * Functions to setup a canvas Course
 */
const Canvas = require("@kth/canvas-api");
const { getAktivitetstillfalle } = require("./ladokApiClient");

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

/** Get the setup status of a given course */
async function getSetupStatus(courseId) {
  const course = await canvas.getCourse(courseId);
  const assignment = await canvas.getValidAssignment(courseId);

  return {
    coursePublished: course.workflow_state === "available",
    assignmentCreated: assignment != null,
    assignmentPublished: assignment?.published || false,
  };
}
/** Creates a "good-looking" homepage in Canvas */
async function createHomepage(courseId) {
  await canvas.requestUrl(`courses/${courseId}/front_page`, "PUT", {
    wiki_page: {
      // To make this page, use the Rich Content Editor in Canvas (https://kth.test.instructure.com/courses/30347/pages/welcome-to-the-exam/edit)
      // Then copy the HTML code:
      body: `<p>Welcome to the Canvas page for the exam results</p>
      <p>This course will be used to grade your exams digitally. This means that, after your exams are scanned, they will be uploaded in this Canvas course</p>
      <p>&nbsp;</p>
      <p>Once your exam has been graded, you will be able to see the grades and teachers feedback under "Grades".</p>`,
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

/** Creates the special assignment */
async function createAssignment(courseId) {
  const ladokId = await getExaminationLadokId(courseId);
  const examination = await getAktivitetstillfalle(ladokId);
  const existingAssignment = await canvas.getValidAssignment(courseId);

  if (existingAssignment) {
    throw new Error(/* ??? */);
  }

  return canvas
    .requestUrl(`courses/${courseId}/assignments`, "POST", {
      assignment: {
        name: "Scanned exams",
        description:
          'This is an assignment created automatically by importing scanned exams to Canvas. The grade posting policy is set to "Manual" which makes it possible to grade all submissions before publishing the student feedback for all students at once.',
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

/** Publish an assignment */
async function publishAssignment(courseId) {
  const assignment = await canvas.getValidAssignment(courseId);

  if (!assignment) {
    throw new Error(/* ??? */);
  }

  return canvas.requestUrl(
    `courses/${courseId}/assignments/${assignment.id}`,
    "PUT",
    {
      assignment: {
        published: true,
      },
    }
  );
}

module.exports = {
  createAssignment,
  createHomepage,
  getSetupStatus,
  publishAssignment,
  publishCourse,
};

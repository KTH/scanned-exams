/**
 * Non-instantiable Canvas API Client
 *
 * This client is built with a fixed API Token which means that all endpoints
 * are performed with admin permissions
 *
 * It also defines Types for the responses from Canvas so they can be
 * more predictable
 */
import Canvas from "@kth/canvas-api";
const canvas = new Canvas(
  process.env.CANVAS_API_URL,
  process.env.CANVAS_API_ADMIN_TOKEN
);

export interface Course {
  workflow_state: string;
}

export interface Section {
  sis_section_id?: string;
}

export interface Assignment {
  id: number;
  integration_data?: {
    ladokId?: string;
  };
  published: boolean;
}

export interface Submission {}

interface ModifyAssignmentOptions {}

/** Get a single course in Canvas */
export async function getCourse(courseId: number) {
  return canvas
    .get<Course>(`courses/${courseId}`)
    .then((response) => response.body);
}

/** Modify the "front_page" of a course with a given title and content */
export async function setCourseFrontPage(
  courseId: number,
  { body, title }: { body: string; title: string }
) {
  return canvas.request<{}>(`courses/${courseId}/front_page`, "PUT", {
    wiki_page: {
      body,
      title,
    },
  });
}

/** Changes the default view of a course */
export async function setDefaultView(courseId: number, defaultView: "wiki") {
  return canvas.request<{}>(`courses/${courseId}`, "PUT", {
    course: {
      default_view: defaultView,
    },
  });
}

/** Publish a course */
export async function publishCourse(courseId) {
  return canvas.request<{}>(`courses/${courseId}`, "PUT", {
    course: {
      event: "offer",
    },
  });
}

export async function getSections(courseId: number) {
  return canvas.listItems<Section>(`courses/${courseId}/sections`).toArray();
}

export async function getAssignments(courseId: number) {
  return canvas
    .listItems<Assignment>(`courses/${courseId}/assignments`)
    .toArray();
}

export async function getSubmissions(courseId: number, assignmentId: number) {
  return canvas.listItems<Submission>(
    `courses/${courseId}/assignments/${assignmentId}/submissions`,
    { include: ["user", "submission_history"] } // include user obj with kth id
  );
}

export async function createAssignment(courseId: number, assignment: {}) {
  return canvas.request(`courses/${courseId}/assignments`, "POST", {
    assignment,
  });
}

export async function publishAssignment(courseId, assignmentId) {
  return canvas.request(
    `courses/${courseId}/assignments/${assignmentId}`,
    "PUT",
    {
      assignment: {
        published: true,
      },
    }
  );
}

export async function editAssignment(courseId, assignmentId, assignment) {
  return canvas.request(
    `courses/${courseId}/assignments/${assignmentId}`,
    "PUT",
    { assignment }
  );
}

/*
export async function sendFile({ upload_url, upload_params }, content) {
  const form = new FormData();

  // eslint-disable-next-line camelcase
  for (const key in upload_params) {
    if (upload_params[key]) {
      form.append(key, upload_params[key]);
    }
  }

  form.append("attachment", content, upload_params.filename);

  return got
    .post({
      url: upload_url,
      body: form.stream,
      headers: form.headers,
      responseType: "json",
    })
    .catch(uploadFileErrorHandler);
}
*/

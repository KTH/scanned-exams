const Canvas = require("@kth/canvas-api");
const got = require("got");
const FormData = require("formdata-node").default;

module.exports = class CanvasApi {
  constructor(canvasRoot, canvasApiToken) {
    this.client = new Canvas(canvasRoot, canvasApiToken);
  }

  async sendFile({ upload_url, upload_params }, content) {
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

  async uploadExam(
    content,
    { studentKthId, courseId, assignmentId, examDate }
  ) {
    const { body: user } = await this.client.get(
      `users/sis_user_id:${studentKthId}`
    );

    const { body: slot } = await this.client.requestUrl(
      `courses/${courseId}/assignments/${assignmentId}/submissions/${user.id}/files`,
      "POST",
      {
        name: `${studentKthId}.pdf`,
      }
    );

    const { body: uploadedFile } = await this.sendFile(slot, content);

    await this.client.requestUrl(
      `courses/${courseId}/assignments/${assignment.id}/submissions/`,
      "POST",
      {
        submission: {
          submitted_at: `${examDate}T00:00:00`,
          submission_type: "online_upload",
          user_id: user.id,
          file_ids: [uploadedFile.id],
        },
      }
    );
  }

  async getAssignments(courseId) {
    return this.client
      .get(`courses/${courseId}/assignments?per_page=100`)
      .then((r) => r.body);
  }
};

import "./src/config";
import Canvas from "@kth/canvas-api";
import got from "got";
import FormData from "formdata-node";
import { createReadStream } from "fs";

const canvas = new Canvas(
  process.env.CANVAS_API_URL,
  process.env.CANVAS_API_ADMIN_TOKEN
);

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
    .post<{ id: string }>({
      url: upload_url,
      body: form.stream,
      headers: form.headers,
      responseType: "json",
    })
    .then((r) => r.body.id);
}

async function uploadFile(r: string) {
  const courseId = "30328";
  const assignmentId = "193287";
  const userId = "4";
  const file = "./src/api/example.input.test.pdf";
  const content = createReadStream(file);

  const { body: slot } = await canvas.request<any>(
    `courses/${courseId}/assignments/${assignmentId}/submissions/${userId}/files`,
    "POST",
    {
      name: `samefilename.pdf`,
    }
  );

  const uploadedFile = await sendFile(slot, content);

  await canvas.request(
    `courses/${courseId}/assignments/${assignmentId}/submissions/`,
    "POST",
    {
      submission: {
        submitted_at: `2021-12-31T${r}`,
        submission_type: "online_upload",
        user_id: userId,
        file_ids: [uploadedFile],
      },
    }
  );
}

async function start() {
  await uploadFile("00:01:00");
  await uploadFile("00:02:00");
}

start();

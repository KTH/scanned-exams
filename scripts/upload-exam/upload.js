const inquirer = require("inquirer");
const CanvasApi = require("./canvasApi");
const TentaApi = require("./tentaApi");

async function start() {
  const { canvasRoot } = await inquirer.prompt({
    type: "list",
    name: "canvasRoot",
    message: "Select a Canvas instance",
    choices: [
      {
        name: "Canvas test (kth.test.instructure.com)",
        value: "https://kth.test.instructure.com/",
        short: "test",
      },
      {
        name: "Canvas beta (kth.beta.instructure.com)",
        value: "https://kth.beta.instructure.com/",
        short: "beta",
      },
      {
        name: "Canvas production (canvas.kth.se)",
        value: "https://canvas.kth.se/",
        short: "production",
      },
    ],
  });

  console.log();
  console.log(`Go to ${canvasRoot}profile/settings to get a Canvas API token.`);

  const { canvasApiToken } = await inquirer.prompt({
    name: "canvasApiToken",
    message: `Paste the API token here`,
    type: "password",
  });

  const { tentaApiToken } = await inquirer.prompt({
    name: "tentaApiToken",
    message: `Paste the Tenta API token here`,
    type: "password",
  });

  const { courseId } = await inquirer.prompt({
    name: "courseId",
    message: "Enter the Canvas course id",
  });

  const canvas = new CanvasApi(`${canvasRoot}api/v1`, canvasApiToken);
  const assignments = await canvas.getAssignments(courseId);

  const { assignmentId } = await inquirer.prompt({
    type: "list",
    name: "assignmentId",
    message: "Choose an assignment",
    choices: assignments.map((assignment) => ({
      name: assignment.name,
      value: assignment.id,
    })),
  });

  const { ladokId } = await inquirer.prompt({
    name: "ladokId",
    type: "input",
    message: "Enter the Ladok Aktivitetstillfîlle ID",
  });

  const tentaApi = new TentaApi(tentaApiToken);

  const exams = await tentaApi.examListByLadokId(ladokId);
  console.log(`Found ${exams.length} exams`);
  console.log("Fetching exams...");

  for (const exam of exams) {
    console.log(`${exam.fileId}. Student: ${exam.student.id}`);
  }

  const { confirm } = await inquirer.prompt({
    type: "confirm",
    name: "confirm",
    message:
      "The exams above will be uploaded. Are you sure you want to continue?",
  });

  if (!confirm) {
    return;
  }

  for (const exam of exams) {
    const { content, examDate, student } = await tentaApi.downloadExam(
      exam.fileId
    );
    console.log(`Uploading file ${exam.fileId} for ${student.kthId}`);
    await canvas.uploadExam(content, {
      studentKthId: student.kthId,
      courseId,
      assignmentId,
      examDate,
    });
  }
}
start();

const inquirer = require("inquirer");
const Canvas = require("@kth/canvas-api");
require("dotenv").config({});

async function start() {
  try {
    console.log(
      'This is the "course.js" script.\n\n' +
        "Here you will create or edit a button for the Scanned Exams app\n" +
        "as course-level button. It means that the button is visible\n" +
        "for only one course in Canvas\n\n" +
        'Use "create-button/account.js" for creating or editing course-level buttons'
    );

    const { answer } = await inquirer.prompt({
      type: "confirm",
      message: "Do you want to continue?",
      name: "answer",
    });

    if (!answer) return;

    const canvasRoot = process.env.CANVAS_ROOT;

    const canvasApiToken = process.env.CANVAS_API_TOKEN;

    const { courseId } = await inquirer.prompt({
      name: "courseId",
      message: "Enter the Canvas course id",
    });

    const canvas = new Canvas(`${canvasRoot}api/v1`, canvasApiToken);
    const tools = (
      await canvas.get(`courses/${courseId}/external_tools?per_page=100`)
    ).body.map((tool) => ({
      short: tool.id,
      name: `Edit the button "${tool.name}" (${tool.url})`,
      value: tool.id,
    }));

    tools.unshift(new inquirer.Separator());
    tools.unshift({
      short: "new",
      name: "Create a new button",
      value: "new",
    });

    const { buttonId } = await inquirer.prompt({
      type: "list",
      name: "buttonId",
      message: "Choose a button to edit or create a new one",
      choices: tools,
    });
    let url = process.env.STAGE;

    if (!url) {
      const { buttonUrl } = await inquirer.prompt({
        type: "list",
        name: "buttonUrl",
        message: "What application do you want to open with the button?",
        choices: [
          {
            name: "localdev.kth.se",
            value: "https://localdev.kth.se:4443/scanned-exams",
          },
          {
            name: "stage (referens)",
            value: "https://app-r.referens.sys.kth.se/scanned-exams",
          },
          {
            name: "production (app.kth.se)",
            value: "https://app.kth.se/scanned-exams",
          },
        ],
      });
      url = buttonUrl;
    }

    let defaultName = "KTH Import exams";

    if (url === "https://localdev.kth.se:4443/scanned-exams") {
      defaultName = "Scanned Exams - localdev.kth.se";
    } else if (url === "https://api-r.referens.sys.kth.se/scanned-exams") {
      defaultName = "Scanned exams - referens";
    }

    const { buttonName } = await inquirer.prompt({
      name: "buttonName",
      message: "Write a name for the button",
      default: defaultName,
    });

    const body = {
      name: buttonName,
      consumer_key: "not_used",
      shared_secret: "not_used",
      url,
      privacy_level: "public",
      course_navigation: {
        enabled: true,
        text: buttonName,
        visibility: "admins",
        windowTarget: "_self",
      },
      custom_fields: {
        domain: "$Canvas.api.domain",
        courseId: "$Canvas.course.id",
      },
    };

    if (buttonId === "new") {
      console.log();
      console.log(JSON.stringify(body, null, 2));
      console.log();
      console.log("You are going to make a POST request");
      console.log(`to ${canvasRoot}api/v1/courses/${courseId}/external_tools`);
      console.log("with the body printed above");
      const { proceed } = await inquirer.prompt({
        type: "confirm",
        name: "proceed",
        message: `Is it correct?`,
      });

      if (!proceed) return;

      await canvas.requestUrl(
        `courses/${courseId}/external_tools`,
        "POST",
        body
      );

      console.log(
        `New button created. You can see it in ${canvasRoot}courses/${courseId}`
      );
    } else {
      console.log();
      console.log(JSON.stringify(body, null, 2));
      console.log();
      console.log("You are going to make a PUT request");
      console.log(
        `to ${canvasRoot}api/v1/courses/${courseId}/external_tools/${buttonId}`
      );
      console.log("with the body printed above");
      const { proceed } = await inquirer.prompt({
        type: "confirm",
        name: "proceed",
        message: `Is it correct?`,
      });

      if (!proceed) return;

      await canvas.requestUrl(
        `courses/${courseId}/external_tools/${buttonId}`,
        "PUT",
        body
      );

      console.log(
        `Button edited. You can see it in ${canvasRoot}courses/${courseId}`
      );
    }
  } catch (err) {
    console.log(err);
  }
}

start();

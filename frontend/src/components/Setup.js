import React from "react";
import Stepper from "./Stepper";
import CreateHomePage from "./steps/CreateHomePage";
import PublishCourse from "./steps/PublishCourse";

export default function Setup({
  coursePublished,
  assignmentCreated,
  assignmentPublished,
}) {
  const [homepageCreated, setHomepageCreated] = React.useState(coursePublished);

  const currentStep = [
    coursePublished,
    homepageCreated,
    assignmentCreated,
    assignmentPublished,
  ].findIndex((s) => !s);

  return (
    <div className="container mx-auto">
      <div className="text-gray-500 mt-8 mb-6 pb-2 flex">
        <div className="flex-1">Scanned Exams / Setting up the examroom</div>
        <div className="flex-none">Carlos Saito | Logout</div>
      </div>
      <div className="flex">
        <div className="w-64 flex-none mr-16">
          <Stepper
            currentStep={currentStep}
            steps={[
              {
                title: "Create an examroom homepage",
                done: homepageCreated,
              },
              {
                title: "Publish the examroom",
                done: coursePublished,
              },
              {
                title: "Create a special assignment",
                done: assignmentCreated,
              },
              {
                title: "Publish the special assignment",
                done: assignmentPublished,
              },
            ]}
          />
        </div>
        {currentStep === 0 && <CreateHomePage />}
        {currentStep === 1 && <PublishCourse />}
      </div>
    </div>
  );
}

import React from "react";
import { Step, StepList } from "./StepList";
import CreateHomePage from "./steps/CreateHomePage";
import PublishCourse from "./steps/PublishCourse";

function StepText({ long, short }) {
  return (
    <span>
      <span className="md:hidden">{short}</span>
      <span className="hidden md:inline">{long}</span>
    </span>
  );
}

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
    <div className="container mx-auto my-8">
      <div className="">
        <div className="mb-4">
          <StepList currentStep={currentStep}>
            <Step index={0} done={homepageCreated}>
              <StepText short="Step 1" long="1. Create an examroom homepage" />
            </Step>
            <Step index={1} done={coursePublished}>
              <StepText short="Step 2" long="2. Publish examroom" />
            </Step>
            <Step index={2} done={assignmentCreated}>
              <StepText short="Step 3" long="3. Create a special assignment" />
            </Step>
            <Step index={3} done={assignmentPublished}>
              <StepText short="Step 4" long="4. Publish assignment" />
            </Step>
          </StepList>
        </div>
        <div className="text-sm text-gray-700 mt-8">
          Step {currentStep + 1} of 4
        </div>
        {currentStep === 0 && <CreateHomePage />}
        {currentStep === 1 && <PublishCourse />}
      </div>
    </div>
  );
}

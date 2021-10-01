import React from "react";
import { Step, StepList } from "../StepList";
import PublishExamroom from "./steps/PublishExamroom";
import SetupExamroom from "./steps/SetupExamroom";

function StepText({ long, short }) {
  return (
    <span>
      <span className="md:hidden">{short}</span>
      <span className="hidden md:inline">{long}</span>
    </span>
  );
}

export default function SetupScreen({ assignmentCreated, courseId }) {
  const currentStep = !assignmentCreated ? 0 : 1;

  return (
    <div className="container mx-auto my-8">
      <div className="">
        <div className="mb-8">
          <StepList currentStep={currentStep}>
            <Step index={0} done={assignmentCreated}>
              <StepText short="Step 1" long="1. Setup course" />
            </Step>
            <Step index={1}>
              <StepText short="Step 2" long="2. Publish examroom" />
            </Step>
          </StepList>
        </div>
        {currentStep === 0 && <SetupExamroom courseId={courseId} />}
        {currentStep === 1 && <PublishExamroom courseId={courseId} />}
      </div>
    </div>
  );
}

import React from "react";
import { Step, StepList } from "./StepList";
import CreateHomePage from "./steps/CreateHomePage";
import PublishCourse from "./steps/PublishCourse";
import CreateAssignment from "./steps/CreateAssignment";
import PublishAssignment from "./steps/PublishAssignment";

function StepText({ long, short }) {
  return (
    <span>
      <span className="md:hidden">{short}</span>
      <span className="hidden md:inline">{long}</span>
    </span>
  );
}

/**
 * Return index of first item that is false
 * @param {Bool} homepageCreated
 * @param {Bool} coursePublished
 * @param {Bool} assignmentCreated
 * @param {Bool} assignmentPublished
 * @returns
 */
function getCurrentStepIndex(
  homepageCreated,
  coursePublished,
  assignmentCreated,
  assignmentPublished
) {
  return [
    homepageCreated, // 0
    coursePublished, // 1
    assignmentCreated, // 2
    assignmentPublished, // 3
  ].findIndex((s) => !s);
}

export default function SetupScreen({
  coursePublished,
  assignmentCreated,
  assignmentPublished,
  courseId,
}) {
  const [homepageCreated, setHomepageCreated] = React.useState(coursePublished);

  // The
  const currentStep = getCurrentStepIndex(
    homepageCreated,
    coursePublished,
    assignmentCreated,
    assignmentPublished
  );

  return (
    <div className="container mx-auto my-8">
      <div className="">
        <div className="mb-8">
          <StepList currentStep={currentStep}>
            <Step index={0} done={homepageCreated}>
              <StepText short="Step 1" long="1. Prepare the homepage" />
            </Step>
            <Step index={1} done={coursePublished}>
              <StepText short="Step 2" long="2. Publish examroom" />
            </Step>
            <Step index={2} done={assignmentCreated}>
              <StepText short="Step 3" long="3. Prepare the assignment" />
            </Step>
            <Step index={3} done={assignmentPublished}>
              <StepText short="Step 4" long="4. Publish assignment" />
            </Step>
          </StepList>
        </div>
        {currentStep === 0 && (
          <CreateHomePage
            courseId={courseId}
            onCreate={() => setHomepageCreated(true)}
          />
        )}
        {currentStep === 1 && <PublishCourse courseId={courseId} />}
        {currentStep === 2 && <CreateAssignment courseId={courseId} />}
        {currentStep === 3 && <PublishAssignment courseId={courseId} />}
      </div>
    </div>
  );
}

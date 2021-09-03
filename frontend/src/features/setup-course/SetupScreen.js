import React from "react";
import { Step, StepList } from "./StepList";
import CreateHomePage from "./steps/CreateHomePage";
import PublishCourse from "./steps/PublishCourse";
import CreateAssignment from "./steps/CreateAssignment";
import PublishAssignment from "./steps/PublishAssignment";
import SuccessPage from "./steps/SuccessPage";

function StepText({ long, short }) {
  return (
    <span>
      <span className="md:hidden">{short}</span>
      <span className="hidden md:inline">{long}</span>
    </span>
  );
}

export default function SetupScreen({
  coursePublished,
  assignmentCreated,
  assignmentPublished,
  courseId,
}) {
  const [homepageCreated, setHomepageCreated] = React.useState(coursePublished);

  const currentStep = [
    homepageCreated,
    coursePublished,
    assignmentCreated,
    assignmentPublished,
  ].findIndex((s) => !s);

  const [fakeStep, setFakeStep] = React.useState(0);

  return (
    <div className="container mx-auto my-8">
      <div className="">
        <div className="mb-8">
          <StepList currentStep={fakeStep || currentStep}>
            <Step index={0} done={homepageCreated}>
              <StepText short="Step 1" long="1. Prepare the homepage" />
            </Step>
            <Step index={1} done={coursePublished || fakeStep > 1}>
              <StepText short="Step 2" long="2. Publish examroom" />
            </Step>
            <Step index={2} done={assignmentCreated || fakeStep > 2}>
              <StepText short="Step 3" long="3. Prepare the assignment" />
            </Step>
            <Step index={3} done={assignmentPublished || fakeStep > 3}>
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
        {fakeStep === 0 && currentStep === 1 && (
          <PublishCourse courseId={courseId} onNext={() => setFakeStep(2)} />
        )}
        {fakeStep === 2 && (
          <CreateAssignment courseId={courseId} onNext={() => setFakeStep(3)} />
        )}
        {fakeStep === 3 && (
          <PublishAssignment
            courseId={courseId}
            onNext={() => setFakeStep(4)}
          />
        )}
        {fakeStep === 4 && <SuccessPage courseId={courseId} />}
      </div>
    </div>
  );
}

import React from "react";
import { Step, StepList } from "../StepList";
import { H2, PrimaryButton, SecondaryButton, P } from "../widgets";

function StepText({ long, short }) {
  return (
    <span>
      <span className="md:hidden">{short}</span>
      <span className="hidden md:inline">{long}</span>
    </span>
  );
}

/**
 * Return index of first item that evaluates to false
 * @param {Array} arr List of truthy expressions/variables
 * @returns
 */
function getIndexOfFirstFalse(arr) {
  return arr.findIndex((s) => !s);
}

export default function SetupScreen({
  coursePublished,
  assignmentCreated,
  assignmentPublished,
  courseId,
}) {
  const [homepageCreated, setHomepageCreated] = React.useState(coursePublished);

  const [fakeStep, setFakeStep] = React.useState(0);

  // The
  const currentStep = getIndexOfFirstFalse([
    homepageCreated, //     0
    coursePublished, //     1
    assignmentCreated, //   2
    assignmentPublished, // 3
  ]);

  return (
    <div className="container mx-auto my-8">
      <div className="">
        <div className="mb-8">
          <StepList currentStep={fakeStep}>
            <Step index={0} done={fakeStep > 0 || homepageCreated}>
              <StepText short="Step 1" long="1. Import" />
            </Step>
            <Step index={1} done={fakeStep > 1 || coursePublished}>
              <StepText short="Step 2" long="2. Resolve Issues" />
            </Step>
            <Step index={2} done={fakeStep > 2 || assignmentCreated}>
              <StepText short="Step 3" long="3. Verify Result" />
            </Step>
          </StepList>
        </div>
        {fakeStep === 0 && (
          <DummyPage title="Import" onNext={() => setFakeStep(fakeStep + 1)} />
        )}
        {fakeStep === 1 && (
          <DummyPage
            title="Resolve Issues"
            onNext={() => setFakeStep(fakeStep + 1)}
            onPrev={() => setFakeStep(fakeStep - 1)}
          />
        )}
        {fakeStep === 2 && (
          <DummyPage
            title="Verify Result"
            onPrev={() => setFakeStep(fakeStep - 1)}
          />
        )}
      </div>
    </div>
  );
}

function DummyPage({ title, onPrev, onNext }) {
  return (
    <div>
      <H2>{title}</H2>
      <P>This is a placeholder page.</P>
      <P>
        {onPrev && (
          <SecondaryButton className="sm:w-auto" onClick={onPrev}>
            Prev
          </SecondaryButton>
        )}
        {onNext && (
          <PrimaryButton className="sm:w-96" onClick={onNext}>
            Next
          </PrimaryButton>
        )}
      </P>
    </div>
  );
}

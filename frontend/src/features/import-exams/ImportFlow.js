import React from "react";
import { useCourseImportProgress } from "../../common/api";
import { Step, StepList } from "../StepList";
import { H2, PrimaryButton, SecondaryButton, P } from "../widgets";
import PrepareImport from "./steps/PrepareImport";
import ResolveIIssues from "./steps/ResolveIssues";
import VerifyResults from "./steps/VerifyResults";

function StepText({ long, short }) {
  return (
    <span>
      <span className="md:hidden">{short}</span>
      <span className="hidden md:inline">{long}</span>
    </span>
  );
}

export default function ImportScreen({ courseId }) {
  const importStatusQuery = useCourseImportProgress(courseId);

  if (importStatusQuery.isLoading) {
    return "Loading...";
  }
  const { data: importStatus } = importStatusQuery;
  let fakeStep = 0;

  if (importStatus.status === "working") {
    fakeStep = 0;
  } else if (importStatus.working.error > 0) {
    fakeStep = 1;
  } else if (importStatus.working.total > 0) {
    fakeStep = 2;
  }

  return (
    <div className="container mx-auto my-8">
      <div className="">
        <div className="mb-8">
          <StepList currentStep={fakeStep}>
            <Step index={0} done={fakeStep > 0}>
              <StepText short="Step 1" long="1. Import" />
            </Step>
            <Step index={1} done={fakeStep > 1}>
              <StepText short="Step 2" long="2. Resolve Issues" />
            </Step>
            <Step index={2} done={fakeStep > 2}>
              <StepText short="Step 3" long="3. Verify Result" />
            </Step>
          </StepList>
        </div>
        {fakeStep === 0 && <PrepareImport courseId={courseId} />}
        {fakeStep === 1 && <ResolveIIssues courseId={courseId} />}
        {fakeStep === 2 && <VerifyResults courseId={courseId} />}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useCourseImportProgress } from "../../common/api";
import { Step, StepList } from "../StepList";
import InProgress from "./steps/InProgress";
import PrepareImport from "./steps/PrepareImport";
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

  // When the importStatus is "idle", it can mean "not started" or "finished"
  // We use the following boolean to guess it
  const [finished, setFinished] = useState(false);

  if (importStatusQuery.isLoading) {
    return "Loading...";
  }
  const { data: importStatus } = importStatusQuery;
  let fakeStep = 0;

  if (importStatus.status === "working") {
    fakeStep = 0;
  } else if (importStatus.working.total > 0) {
    fakeStep = 2;
  } else if (finished) {
    fakeStep = 3;
  }

  return (
    <div className="container mx-auto my-8">
      <div className="">
        <div className="mb-8">
          <StepList currentStep={fakeStep}>
            <Step index={0} done={fakeStep > 0}>
              <StepText short="Step 1" long="1. Import" />
            </Step>
            <Step index={2} done={fakeStep > 2}>
              <StepText short="Step 2" long="2. Summary" />
            </Step>
          </StepList>
        </div>
        {fakeStep === 0 && importStatus.status === "idle" && (
          <PrepareImport courseId={courseId} />
        )}
        {fakeStep === 0 && importStatus.status === "working" && (
          <InProgress status={importStatus} />
        )}
        {fakeStep === 2 && (
          <VerifyResults
            courseId={courseId}
            onFinish={() => setFinished(true)}
          />
        )}
        {fakeStep === 3 && <div>Thanks for using this app!</div>}
      </div>
    </div>
  );
}

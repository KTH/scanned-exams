import React from "react";
import { Step, StepList } from "../StepList";
import { LoadingPage } from "../widgets";
import { useCourseImportStatus } from "../../common/api";
import PrepareImport from "./steps/PrepareImport";
import ResolveIIssues from "./steps/ResolveIssues";
import VerifyResults from "./steps/VerifyResults";
import ImportInProgress from "./steps/ImportInProgress";

function StepText({ long, short }) {
  return (
    <span>
      <span className="md:hidden">{short}</span>
      <span className="hidden md:inline">{long}</span>
    </span>
  );
}

const stepIndex = {
  import: 0,
  working: 0,
  issues: 1,
  result: 2,
};

function getImportQueueStep(data) {
  if (!data) {
    return undefined;
  }

  const { status, total, error } = data;

  if (status === "working") {
    return "working";
  } else if (error > 0) {
    return "error";
  } else if (total > 0) {
    return "result";
  } else {
    return "import";
  }
}

export default function ImportScreen({ courseId }) {
  const { data, isLoading: statusLoading } = useCourseImportStatus(courseId);

  // Determine current active step
  const showStep = statusLoading ? undefined : getImportQueueStep(data);
  const showStepIndex = stepIndex[showStep];

  // Determine if steps are done
  const importDone = showStepIndex > 0;
  const issuesDone = showStepIndex > 1;
  const verifyDone = showStepIndex > 2;

  return (
    <div className="container mx-auto my-8">
      <div className="">
        <div className="mb-8">
          <StepList currentStep={showStepIndex}>
            <Step index={0} done={importDone}>
              <StepText short="Step 1" long="1. Import" />
            </Step>
            <Step index={1} done={issuesDone}>
              <StepText short="Step 2" long="2. Resolve Issues" />
            </Step>
            <Step index={2} done={verifyDone}>
              <StepText short="Step 3" long="3. Verify Result" />
            </Step>
          </StepList>
        </div>
        {_renderContent({
          courseId,
          showStep,
          progress: data?.progress ?? 0,
          total: data?.progress ?? 0,
        })}
      </div>
    </div>
  );
}

function _renderContent({ courseId, showStep, total, progress }) {
  switch (showStep) {
    case "import":
      return <PrepareImport courseId={courseId} />;
    case "working":
      return <ImportInProgress progress={progress} total={total} />;
    case "issues":
      return <ResolveIIssues courseId={courseId} />;
    case "results":
      return <VerifyResults courseId={courseId} />;
    default:
      return <LoadingPage>Loading...</LoadingPage>;
  }
}

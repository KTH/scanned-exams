import React from "react";
import { Step, StepList } from "../StepList";
import { LoadingPage } from "../widgets";
import { useCourseExams, useCourseImportStatus } from "../../common/api";
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

const stepIndex = {
  import: 0,
  issues: 1,
  result: 2,
};
export default function ImportScreen({ courseId }) {
  const [forceStep, setForceStep] = React.useState(undefined);

  // Get exams available to import so it loads in parallell with
  // status check
  const queryExams = useCourseExams(courseId);

  const { data = {}, isLoading: statusLoading } = useCourseImportStatus(
    courseId,
    { runOnce: true }
  );
  const { stats = {} } = data;
  const {
    total: totalExams = 0,
    new: newExams = 0,
    pending: pendingExams = 0,
    imported: importedExams = 0,
    error: errorExams = 0,
  } = stats;

  let currStep = "import";
  if (pendingExams > 0 || newExams > 0 || totalExams === 0) {
    currStep = "import";
  } else if (errorExams > 0) {
    currStep = "issues";
  } else if (totalExams === importedExams) {
    currStep = "result";
  }

  let showStepIndex;
  if (forceStep === undefined && !statusLoading) {
    showStepIndex = stepIndex[currStep];
  } else {
    // Allow us to take manual steps
    showStepIndex = forceStep;
  }

  return (
    <div className="container mx-auto my-8">
      <div className="">
        <div className="mb-8">
          <StepList currentStep={showStepIndex}>
            <Step index={0} done={showStepIndex > 0}>
              <StepText short="Step 1" long="1. Import" />
            </Step>
            <Step index={1} done={showStepIndex > 1}>
              <StepText short="Step 2" long="2. Resolve Issues" />
            </Step>
            <Step index={2} done={totalExams === importedExams}>
              <StepText short="Step 3" long="3. Verify Result" />
            </Step>
          </StepList>
        </div>
        {statusLoading && forceStep === undefined
          ? _renderLoader()
          : _renderContent({
              courseId,
              showStepIndex,
              setForceStep,
              queryExams,
            })}
      </div>
    </div>
  );
}

function _renderLoader() {
  return <LoadingPage>Loading...</LoadingPage>;
}

function _renderContent({ courseId, showStepIndex, setForceStep, queryExams }) {
  switch (showStepIndex) {
    case 0:
      return (
        <PrepareImport
          courseId={courseId}
          queryExams={queryExams}
          onGoTo={(stepName) => setForceStep(stepIndex[stepName])}
        />
      );
    case 1:
      return (
        <ResolveIIssues
          courseId={courseId}
          queryExams={queryExams}
          onGoTo={(stepName) => setForceStep(stepIndex[stepName])}
        />
      );
    case 2:
      return (
        <VerifyResults
          courseId={courseId}
          onGoTo={(stepName) => setForceStep(stepIndex[stepName])}
        />
      );
    default:
      return <LoadingPage>Loading...</LoadingPage>;
  }
}

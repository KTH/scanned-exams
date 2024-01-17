import React from "react";
import { Step, StepList } from "../StepList";
import { LoadingPage } from "../widgets";
import { useCourseImportStatus } from "../../common/api";
import PrepareImport from "./steps/PrepareImport";
import ResolveIssues from "./steps/ResolveIssues";
import VerifyResults from "./steps/VerifyResults";
import ImportInProgress from "./steps/ImportInProgress";

function StepText({ long, short }: any) {
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

function getImportQueueStep(data: any) {
  if (!data) {
    return undefined;
  }

  const { status, working } = data;

  if (status === "working") {
    return "working";
  } else if (working.error > 0) {
    return "issues";
  } else if (working.total > 0) {
    return "result";
  } else {
    return "import";
  }
}

export default function ImportScreen({ courseId }: any) {
  const { data, isLoading: statusLoading } = useCourseImportStatus(courseId);
  const { working } = data || {};

  // Determine current active step
  const showStep = statusLoading ? undefined : getImportQueueStep(data);

  return (
    <div>
      <div>
        {_renderContent({
          courseId,
          showStep,
          progress: working?.progress ?? 0,
          total: working?.total ?? 0,
          ignored: working?.ignored ?? 0,
          imported: working?.imported ?? 0,
        })}
      </div>
    </div>
  );
}

function _renderContent({
  courseId,
  showStep,
  total,
  imported,
  ignored,
  progress,
}: any) {
  switch (showStep) {
    case "import":
      return <PrepareImport courseId={courseId} />;
    case "working":
      return <ImportInProgress progress={progress} total={total} />;
    case "issues":
      return <ResolveIssues courseId={courseId} />;
    case "result":
      return (
        <VerifyResults
          courseId={courseId}
          imported={imported}
          ignored={ignored}
        />
      );
    default:
      return <LoadingPage>Loading...</LoadingPage>;
  }
}

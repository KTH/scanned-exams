import React from "react";
import { useQueryClient } from "react-query";
import {
  useCourseImportStatus,
  useCourseExams,
  useMutateImportStart,
} from "../../../common/api";
import {
  H2,
  LoadingPage,
  PrimaryButton,
  P,
  cssInfoBox,
  ImportQueueProgressBar,
} from "../../widgets";

export default function PrepareImport({ onGoTo, courseId }) {
  const [queueStatus, setQueueStatus] = React.useState("idle");

  const client = useQueryClient();

  // Get status of import worker
  useCourseImportStatus(courseId, {
    onSuccess(status) {
      setQueueStatus(status);
    },
  });
  // TODO: Handle errors?

  // Get exams available to import
  const queryExams = useCourseExams(courseId);
  const { data = {}, isFetching: examsLoading } = queryExams;
  const { result: exams = [] } = data;

  const examsToImport = exams.filter((exam) => exam.status === "new") || [];
  const examsWithError = exams.filter((exam) => exam.status === "error") || [];

  const allExamsToImportOnNextTry = [...examsToImport, ...examsWithError];

  // Hoook to start import
  const startImportMutation = useMutateImportStart(
    courseId,
    allExamsToImportOnNextTry,
    {
      onSuccess({ status }) {
        // status lets us know if the queue is working or still idle
        setQueueStatus(status);
      },
    }
  );
  const { mutate: doStartImport, isLoading: startImportLoading } =
    startImportMutation;
  // TODO: Handle error queue is busy

  // Show error page if we don't have new exams to import but
  // have errors
  if (examsToImport.length === 0) {
    if (examsWithError.length > 0) {
      onGoTo("issues");
    } else if (exams.length > 0) {
      // We have done a successful import but nothing new waiting
      onGoTo("result");
    }
  }

  if (examsLoading) {
    return <LoadingPage>Loading...</LoadingPage>;
  }

  const nrofExamsWithErrors = examsWithError?.length;
  const nrofExamsToImport = (examsToImport?.length || 0) + nrofExamsWithErrors;

  if (queueStatus === "working") {
    return (
      <div className="max-w-2xl">
        <H2>Import in progress...</H2>
        <div className="mt-8">
          <ImportQueueProgressBar
            courseId={courseId}
            defaultTotal={nrofExamsToImport}
            onDone={() => {
              // Clear the query cache to avoid synching issues
              client.removeQueries(["course", courseId]);
              onGoTo("issues");
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <H2>Prepare Import</H2>
      <P>
        There are <b>{nrofExamsToImport} exams</b> available to import.{" "}
        {nrofExamsWithErrors > 0 &&
          `Note: ${nrofExamsWithErrors} of these are exams that previously failed to be imported. They are listed in "Resolve Issues", click button "Next" to see them.`}
      </P>
      <div className="mt-8">
        {nrofExamsToImport > 0 && (
          <PrimaryButton
            className="sm:w-96"
            waiting={startImportLoading}
            onClick={doStartImport}
          >
            Start import!
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}

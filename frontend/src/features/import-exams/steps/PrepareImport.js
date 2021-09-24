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
  SecondaryButton,
  P,
  cssInfoBox,
  ImportQueueProgressBar,
} from "../../widgets";

export default function PrepareImport({ onNext, courseId }) {
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
  const {
    data: dataExams,
    isLoading: examsLoading,
    isError: examsError,
  } = queryExams;
  const examsToImport =
    dataExams?.result.filter((exam) => exam.status === "new") || [];
  const examsWithError =
    dataExams?.result.filter((exam) => exam.status === "error") || [];

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
  const {
    mutate: doStartImport,
    isLoading: startImportLoading,
    isError: startImportError,
  } = startImportMutation;
  // TODO: Handle error queue is busy

  if (examsLoading) {
    return <LoadingPage>Loading...</LoadingPage>;
  }

  const nrofExamsWithErrors = examsWithError?.length;
  const nrofExamsToImport = examsToImport?.length + nrofExamsWithErrors;

  if (queueStatus === "working") {
    return (
      <div className="max-w-2xl">
        <H2>Import in progress...</H2>
        <div className={cssInfoBox}>
          <p>
            <b>Surprised?</b> The import can be started by another tab or
            another teacher for this course.
          </p>
        </div>
        <div className="mt-8">
          <SummaryTable />
        </div>
        <div className="mt-8">
          <ImportQueueProgressBar
            courseId={courseId}
            defaultTotal={nrofExamsToImport}
            onDone={() => {
              // Clear the query cache to avoid synching issues
              client.removeQueries(["course", courseId]);
              onNext();
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
      <div className={cssInfoBox}>
        <p>
          Before exams are ready to be imported to Canvas they need to be
          scanned and verified. You may need to perform further imports when
          more exams are available.
        </p>
        <P>
          <b>Scanning</b> is an automated process that happens a few days after
          the exam date.
        </P>
        <P>
          <b>Verification</b> is a manual process that can take several days to
          complete.
        </P>
        <P>
          When an exam fails to import it is marked with an error. Any exam
          marked with an error will be re-processed for each subsequent import
          until success.
        </P>
      </div>
      <div className="mt-8">
        <SummaryTable summary={{ availableRecords: nrofExamsToImport }} />
      </div>
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
        <SecondaryButton className="sm:w-auto" onClick={onNext}>
          Next
        </SecondaryButton>
      </div>
    </div>
  );
}

function SummaryTable({ summary }) {
  return (
    <table className="table-auto">
      <tbody>
        {summary && (
          <tr>
            <td className="p-1 pl-0">Records to import:</td>
            <td className="p-1 pl-2">{summary.availableRecords}</td>
          </tr>
        )}
        <tr>
          <td className="p-1 pl-0">Type:</td>
          <td className="p-1 pl-2">Scanned exams</td>
        </tr>
        <tr>
          <td className="p-1 pl-0">Source:</td>
          <td className="p-1 pl-2">Tenta API</td>
        </tr>
      </tbody>
    </table>
  );
}

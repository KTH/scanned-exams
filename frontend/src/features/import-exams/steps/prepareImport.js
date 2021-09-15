import React from "react";
import {
  apiClient,
  useCourseImportStatus,
  useCourseExams,
} from "../../../common/api";
import { useInterval } from "../../../common/useHooks";
import {
  H2,
  LoadingPage,
  PrimaryButton,
  SecondaryButton,
  P,
} from "../../widgets";

const PROGRESS_REFRESH_INTERVAL = 1000;
const cssInfoBox =
  "bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mt-6";

export default function PrepareImport({ onNext, courseId }) {
  const [fakeStatus, setFakeStatus] = React.useState("idle");

  // Get status of import worker
  const queryStatus = useCourseImportStatus(courseId);
  const { data: dataStatus, isError: statusError } = queryStatus;

  const queryExams = useCourseExams(courseId);
  const { data: dataExams, isLoading, isError } = queryExams;
  const examsToImport = dataExams?.result.filter(
    (exam) => exam.status === "new"
  );

  if (isLoading) {
    return <LoadingPage>Loading...</LoadingPage>;
  }

  const nrofExamsToImport = examsToImport?.length || 0;

  if (/* dataStatus?.status */ fakeStatus === "working") {
    return (
      <div className="max-w-2xl">
        <H2>Import in progress...</H2>
        <P>
          Importing <b>{nrofExamsToImport} exams</b>.
        </P>
        <div className="mt-8">
          <SummaryTable summary={{ availableRecords: nrofExamsToImport }} />
        </div>
        <div className="mt-8">
          <ProgressBar
            courseId={courseId}
            defaultTotal={nrofExamsToImport}
            onDone={() => {setFakeStatus("idle")}}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <H2>Prepare Import</H2>
      <P>
        There are <b>{nrofExamsToImport} exams</b> available to import.
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
      </div>
      <div className="mt-8">
        <SummaryTable summary={{ availableRecords: nrofExamsToImport }} />
      </div>
      <div className="mt-8">
        <PrimaryButton
          className="sm:w-96"
          onClick={() => setFakeStatus("working")}
        >
          Start import!
        </PrimaryButton>
      </div>
    </div>
  );
}

function ProgressBar({ courseId, defaultTotal, onDone }) {
  const [total, setTotal] = React.useState(defaultTotal);
  const [progress, setProgress] = React.useState(0);

  // Ping backend to get
  useInterval(async () => {
    const { working } = await apiClient(`courses/${courseId}/import/status`);
    // setTotal(working.total);
    // setProgress(working.progress);
    setProgress(progress + 1);

    // We are done, inform the parent
    if (progress >= total) onDone();
  }, PROGRESS_REFRESH_INTERVAL);

  const perc = Math.round((progress / total) * 100);
  return (
    <div className="mt-8 mb-8">
      <div className="relative pt-1 mb-1">
        <div className="overflow-hidden h-4 text-xs flex rounded bg-blue-200">
          <div
            style={{ width: `${perc}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
          />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <span>{`${progress} of ${total}`}</span>
      </div>
    </div>
  );
}

function SummaryTable({ summary }) {
  return (
    <table className="table-auto">
      <tbody>
        <tr>
          <td className="p-1 pl-0">Records to import:</td>
          <td className="p-1 pl-2">{summary.availableRecords}</td>
        </tr>
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

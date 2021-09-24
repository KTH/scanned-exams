import React from "react";
import { useCourseExams, useMutateImportStart } from "../../../common/api";
import { H2, LoadingPage, PrimaryButton, P, cssInfoBox } from "../../widgets";

export default function PrepareImport({ onNext, courseId }) {
  // Get exams available to import
  const queryExams = useCourseExams(courseId);
  const {
    data: dataExams,
    isFetching: examsLoading,
    isError: examsError,
  } = queryExams;
  const examsToImport =
    dataExams?.result.filter((exam) => exam.status === "new") || [];
  const examsWithError =
    dataExams?.result.filter((exam) => exam.status === "error") || [];

  const startImportMutation = useMutateImportStart(courseId, examsToImport);
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

import React from "react";
import { useCourseImportStatus, useCourseExams } from "../../../common/api";
import {
  H2,
  LoadingPage,
  PrimaryButton,
  SecondaryButton,
  P,
  cssInfoBox,
  cssSuccessBox,
} from "../../widgets";

export default function VerifyResults({ onNext, onPrev, courseId }) {
  // Get exams available to import
  const queryExams = useCourseExams(courseId);
  const {
    data: dataExams,
    isLoading: examsLoading,
    isError: examsError,
  } = queryExams;

  const examsWithErrors =
    dataExams?.result.filter((exam) => exam.status === "error") || [];
  const importedExams =
    dataExams?.result.filter((exam) => exam.status === "imported") || [];

  if (examsLoading) {
    return <LoadingPage>Loading...</LoadingPage>;
  }

  const errors = examsWithErrors?.length || 0;
  const imported = importedExams?.length || 0;

  return (
    <div className="max-w-2xl">
      <H2>Verify Results</H2>
      <P>This is a summary of the status of all the processed exams.</P>
      {errors === 0 ? renderDone() : renderHelp()}
      <div className="mt-8">
        <SummaryTable summary={{ errors, imported }} />
      </div>
      <div className="mt-8">
        {errors > 0 && (
          <SecondaryButton className="sm:w-auto" onClick={onPrev}>
            Show Errors
          </SecondaryButton>
        )}
      </div>
    </div>
  );
}

function renderHelp() {
  return (
    <div className={cssInfoBox}>
      <p>
        <b>Succesfully imported</b> these exams have been added to Canvas.
      </p>
      <P>
        <b>Unresolved errors</b> these exams could not be added to Canvas.
      </P>
    </div>
  );
}

function renderDone() {
  return (
    <div className={cssSuccessBox}>
      <h2 className="font-semibold text-lg">You Are Done!</h2>
      <P>
        All available exams were imported to Canvas and there are no errors. You
        can safely leave this page and return at another time to check if more
        exams have been scanned and verified.
      </P>
      <P>Good luck with your grading!</P>
    </div>
  );
}

function SummaryTable({ summary }) {
  const { errors, imported } = summary;
  return (
    <table className="table-auto">
      <tbody>
        <tr>
          <td className="p-1 pl-0">Succesfully imported:</td>
          <td className="p-1 pl-2">{imported}</td>
        </tr>
        <tr>
          <td className="p-1 pl-0">Unresolved errors:</td>
          <td className="p-1 pl-2">{errors}</td>
        </tr>
      </tbody>
    </table>
  );
}

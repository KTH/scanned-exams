import React from "react";
import { useCourseImportStatus, useCourseExams } from "../../../common/api";
import {
  H2,
  LoadingPage,
  PrimaryButton,
  SecondaryButton,
  P,
  cssInfoBox,
} from "../../widgets";

export default function PrepareImport({ onNext, onPrev, courseId }) {
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
  const total = dataExams?.result?.length || 0;
  const waiting = 0;

  return (
    <div className="max-w-2xl">
      <H2>Verify Results</H2>
      <P>This is a summary of the status of all the processed exams.</P>
      <div className={cssInfoBox}>
        <p>
          <b>Total exams submitted</b> bla bla bla.
        </p>
        <P>
          <b>Succesfully imported</b> bla bla bla.
        </P>
        <P>
          <b>Unresolved errors</b> bla bla bla.
        </P>
        <P>
          <b>Not available yet</b> bla bla bla.
        </P>
      </div>
      <div className="mt-8">
        <SummaryTable summary={{ errors, imported, total, waiting }} />
      </div>
      <div className="mt-8">
        <SecondaryButton className="sm:w-auto" onClick={onPrev}>
          Prev
        </SecondaryButton>
      </div>
    </div>
  );
}

function SummaryTable({ summary }) {
  const { errors, imported, total, waiting } = summary;
  return (
    <table className="table-auto">
      <tbody>
        <tr>
          <td className="p-1 pl-0">Total exams submitted:</td>
          <td className="p-1 pl-2">{total}</td>
        </tr>
        <tr>
          <td className="p-1 pl-0">Succesfully imported:</td>
          <td className="p-1 pl-2">{imported}</td>
        </tr>
        <tr>
          <td className="p-1 pl-0">Unresolved errors:</td>
          <td className="p-1 pl-2">{errors}</td>
        </tr>
        <tr>
          <td className="p-1 pl-0">Not available yet:</td>
          <td className="p-1 pl-2">{waiting}</td>
        </tr>
      </tbody>
    </table>
  );
}

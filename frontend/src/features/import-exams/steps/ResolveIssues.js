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

  if (examsLoading) {
    return <LoadingPage>Loading...</LoadingPage>;
  }

  const nrofExamsToResolve = examsWithErrors?.length || 0;

  return (
    <div className="max-w-2xl">
      <H2>Resolve Issues</H2>
      <P>
        There are <b>{nrofExamsToResolve} exams</b> that encountered issues
        during import.
      </P>
      {nrofExamsToResolve === 0 && (
        <P>You can safely proceed to verify the status of all your imports.</P>
      )}
      {nrofExamsToResolve > 0 && (
        <>
          <div className={cssInfoBox}>
            <p>Information about resolving errors.</p>
          </div>
          <div className="mt-8">
            {examsWithErrors.map((exam, index) => (
              <ExamErrorRow exam={exam} rowNr={index + 1} />
            ))}
          </div>
        </>
      )}
      <div className="mt-8">
        <SecondaryButton className="sm:w-auto" onClick={onPrev}>
          Prev
        </SecondaryButton>
        <PrimaryButton className="sm:w-96" onClick={onNext}>
          Next
        </PrimaryButton>
      </div>
    </div>
  );
}

function ExamErrorRow({ exam, rowNr }) {
  return (
    <div className="flex flex-row mt-1">
      <div className="p-2 w-8">{rowNr}</div>
      <div className="p-2 flex-shrink-0 flex-grow-0" style={{ width: "6rem" }}>
        {exam.student.id}
      </div>
      <div className="p-2 flex-shrink-0">
        {`${exam.student.firstName} ${exam.student.lastName}`}
      </div>
      <div className="p-2 flex-grow flex-shrink-0 text-gray-400">
        {exam.error?.message}
      </div>
    </div>
  );
}

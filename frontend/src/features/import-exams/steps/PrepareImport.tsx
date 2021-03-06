import React from "react";
import { useCourseExams, useMutateImportStart } from "../../../common/api";
import { H2, LoadingPage, PrimaryButton, P } from "../../widgets";

export default function PrepareImport({ courseId }: any) {
  // Get exams available to import
  const { data = {}, isFetching: examsLoading, error: examsError } = useCourseExams(courseId);
  const { result: exams = [] } = data;

  const examsToImport = exams.filter((exam: any) => exam.status === "new") || [];
  const numberOfExamsToImport = examsToImport.length;

  // Hoook to start import
  // Side effect: this causes `ImportFlow` to show a progress bar
  const {
    mutate: doStartImport,
    isLoading: startImportLoading,
    isSuccess: startImportSuccess,
  } = useMutateImportStart(courseId, examsToImport);

  if (examsError) {
    throw new Error(
      (examsError as Error).message
    );
  }

  if (examsLoading) {
    return <LoadingPage>Loading...</LoadingPage>;
  }

  return (
    <div className="max-w-2xl">
      <H2>Prepare Import</H2>
      <P>
        There are <b>{numberOfExamsToImport} exams</b> available to import.{" "}
      </P>
      <div className="mt-8">
        {numberOfExamsToImport > 0 && (
          <PrimaryButton
            className="sm:w-96"
            waiting={startImportLoading}
            success={startImportSuccess}
            onClick={doStartImport}
          >
            Start import!
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}

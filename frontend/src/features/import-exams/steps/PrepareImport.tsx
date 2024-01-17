import React from "react";
import { useCourseExams, useMutateImportStart } from "../../../common/api";
import { LoadingPage, PrimaryButton2 } from "../../widgets";

export default function PrepareImport({ courseId }: any) {
  // Get exams available to import
  const {
    data = {},
    isFetching: examsLoading,
    error: examsError,
  } = useCourseExams(courseId);
  const { result: exams = [] } = data;

  const examsToImport =
    exams.filter((exam: any) => exam.status === "new") || [];
  const numberOfExamsToImport = examsToImport.length;

  // Hoook to start import
  // Side effect: this causes `ImportFlow` to show a progress bar
  const {
    mutate: doStartImport,
    isLoading: startImportLoading,
    isSuccess: startImportSuccess,
  } = useMutateImportStart(courseId, examsToImport);

  if (examsError) {
    throw new Error((examsError as Error).message);
  }

  if (examsLoading) {
    return <LoadingPage>Loading...</LoadingPage>;
  }

  return (
    <main>
      <h2>Prepare Import</h2>
      <p>
        There are <b>{numberOfExamsToImport} exams</b> available to import.{" "}
      </p>
      <div className="button-bar">
        {numberOfExamsToImport > 0 && (
          <PrimaryButton2
            width="10rem"
            waiting={startImportSuccess || startImportLoading}
            onClick={doStartImport}
          >
            Start import
          </PrimaryButton2>
        )}
      </div>
    </main>
  );
}

import React from "react";
import { useCourseExams, useMutateImportStart } from "../../../common/api";
import { H2, LoadingPage, PrimaryButton, P } from "../../widgets";

export default function PrepareImport({ courseId }) {
  // Get exams available to import
  const { data = {}, isFetching: examsLoading } = useCourseExams(courseId);
  const { result: exams = [] } = data;

  const examsToImport = exams.filter((exam) => exam.status === "new") || [];
  const numberOfExamsToImport = examsToImport.length;

  // Hoook to start import
  const { mutate: doStartImport, isLoading: startImportLoading } =
    useMutateImportStart(courseId, examsToImport);

  if (queueStatus === undefined || examsLoading || statusLoading) {
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
            onClick={doStartImport}
          >
            Start import!
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}

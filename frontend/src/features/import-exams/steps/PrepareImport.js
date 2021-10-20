import React from "react";
import { useMutateImportStart } from "../../../common/api";
import { H2, LoadingPage, PrimaryButton, P } from "../../widgets";

export default function PrepareImport({ courseId, queryExams }) {
  // Get exams available to import
  const { data = {}, isFetching: examsLoading } = queryExams;
  const { result: exams = [] } = data;

  const examsToImport = exams.filter((exam) => exam.status === "new") || [];
  const examsWithError = exams.filter((exam) => exam.status === "error") || [];

  const allExamsToImportOnNextTry = [...examsToImport, ...examsWithError];

  // Hoook to start import
  const { mutate: doStartImport, isLoading: startImportLoading } =
    useMutateImportStart(courseId, allExamsToImportOnNextTry);

  if (examsLoading) {
    return <LoadingPage>Loading...</LoadingPage>;
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

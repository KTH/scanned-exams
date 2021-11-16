import React from "react";
import {
  useImportQueueErrors,
  useMutateResetImportQueue,
} from "../../../common/api";
import { ExamErrorTable, H2, SecondaryButton } from "../../widgets";

// TODO: do something with `ignored` (errors that are not fixed)
export default function VerifyResults({ courseId, imported, ignored }) {
  const {
    mutate: doResetImportQueue,
    isLoading: resettingQueue,
    isSuccess: queueResetted,
  } = useMutateResetImportQueue(courseId);
  const { data: exams = [] } = useImportQueueErrors(courseId);

  const ignoredExams = exams.filter((exam) => exam.status === "ignored");

  return (
    <div className="max-w-2xl">
      <H2>Verify Results</H2>
      <div className="mt-8">{imported} exams have been imported to Canvas</div>
      <details className="mt-8">
        <summary>{ignoredExams.length} exams could not be imported</summary>
        <ExamErrorTable exams={ignoredExams} />
      </details>
      <div className="mt-8">
        <SecondaryButton
          className="sm:w-auto"
          waiting={resettingQueue}
          success={queueResetted}
          onClick={() => doResetImportQueue()}
        >
          Import more...
        </SecondaryButton>
        {/* <PrimaryButton className="sm:w-auto">Log out</PrimaryButton> */}
      </div>
    </div>
  );
}

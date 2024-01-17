import React from "react";
import {
  useImportQueueErrors,
  useMutateResetImportQueue,
} from "../../../common/api";
import { ExamErrorTable, SecondaryButton } from "../../widgets";

// TODO: do something with `ignored` (errors that are not fixed)
export default function VerifyResults({ courseId, imported, ignored }: any) {
  const {
    mutate: doResetImportQueue,
    isLoading: resettingQueue,
    isSuccess: queueResetted,
  } = useMutateResetImportQueue(courseId);
  const { data: exams = [] } = useImportQueueErrors(courseId);

  const ignoredExams = exams.filter((exam: any) => exam.status === "ignored");

  return (
    <main>
      <h2>Verify Results</h2>
      <p>{imported} exams have been imported to Canvas</p>
      <details className="kth-details">
        <summary>{ignoredExams.length} exams could not be imported</summary>
        <ExamErrorTable exams={ignoredExams} />
      </details>
      <div className="button-bar">
        <SecondaryButton
          waiting={resettingQueue || queueResetted}
          onClick={() => doResetImportQueue()}
        >
          Import more
        </SecondaryButton>
      </div>
    </main>
  );
}

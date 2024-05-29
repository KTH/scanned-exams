import React from "react";
import {
  useImportQueueErrors,
  useMutateFixImportQueueErrors,
  useMutateIgnoreImportQueueErrors,
} from "../../../common/api";
import {
  LoadingPage,
  ExamErrorTable,
  PrimaryButton,
  SecondaryButton,
} from "../../widgets";

export default function ResolveIssues({ courseId }: any) {
  const { data: exams = [], isFetching } = useImportQueueErrors(courseId);
  const examsWithMissingStudentError = exams
    .filter((exam: any) => exam.status === "error")
    .filter((exam: any) => exam.error?.type === "missing_student");
  const examsWithOtherErrors = exams
    .filter((exam: any) => exam.status === "error")
    .filter((exam: any) => exam.error?.type !== "missing_student");

  if (isFetching) {
    return <LoadingPage>Loading...</LoadingPage>;
  }

  if (examsWithMissingStudentError.length > 0) {
    return (
      <MissingStudents
        courseId={courseId}
        exams={examsWithMissingStudentError}
      />
    );
  } else if (examsWithOtherErrors.length > 0) {
    return <OtherErrors courseId={courseId} exams={examsWithOtherErrors} />;
  }

  // If render reaches this point, it probably means that there are no errors
  // in the import queue but the parent container still thinks that there are
  // errors

  // We don't need to throw any error or show any spinner since it should be
  // fixed automatically in one second or less

  return <div></div>;
}

function MissingStudents({ courseId, exams }: any) {
  const {
    mutate: doFixMissingStudents,
    isLoading: addingMissingStudents,
    isSuccess: missingStudentsAdded,
  } = useMutateFixImportQueueErrors(courseId, exams);
  const {
    mutate: doIgnoreMissingStudents,
    isLoading: ignoringMissingStudents,
    isSuccess: missingStudentsIgnored,
  } = useMutateIgnoreImportQueueErrors(courseId, exams);

  return (
    <main>
      <h2>Missing students</h2>
      <p>
        There are {exams.length} exams where the student hasn&apos;t yet been
        added to your exam room. They are probably drop in students (people who
        are not registered to the exam but have written it)
      </p>
      <div>
        <ExamErrorTable exams={exams} />
      </div>
      <div className="button-bar">
        <PrimaryButton
          working={addingMissingStudents || missingStudentsAdded}
          onClick={() => doFixMissingStudents()}
        >
          Add students and import exams
        </PrimaryButton>
        <SecondaryButton
          working={ignoringMissingStudents || missingStudentsIgnored}
          onClick={() => doIgnoreMissingStudents()}
        >
          Do not add students
        </SecondaryButton>
      </div>
    </main>
  );
}

function OtherErrors({ courseId, exams }: any) {
  const {
    mutate: doIgnoreOtherErrors,
    isLoading: ignoringOtherErrors,
    isSuccess: otherErrorsIgnored,
  } = useMutateIgnoreImportQueueErrors(courseId, exams);

  return (
    <main>
      <h2>Other errors</h2>
      <p>
        <b>
          There are {exams.length} exams that can&apos;t be imported at this
          time.
        </b>{" "}
        This is due to issues we can&apos;t automatically solve. Once the issues
        with these exams have been solved click &quot;Try to import again&quot;
        to retry importing these exams.
      </p>
      <p>
        <b>If you don&apos;t know how to resolve these issues:</b> please
        contact your local exam administrator with the information below, and
        ask them to verify that the s_uid for the problematic exams are correct
        in Windream.{" "}
      </p>
      <div>
        <ExamErrorTable exams={exams} />
      </div>
      <div className="button-bar">
        <PrimaryButton
          waiting={ignoringOtherErrors || otherErrorsIgnored}
          onClick={() => doIgnoreOtherErrors()}
        >
          Try to import again
        </PrimaryButton>
      </div>
    </main>
  );
}

import React from "react";
import {
  useImportQueueErrors,
  useMutateFixImportQueueErrors,
  useMutateIgnoreImportQueueErrors,
} from "../../../common/api";
import {
  H2,
  LoadingPage,
  PrimaryButton,
  SecondaryButton,
  P,
  ExamErrorTable,
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
    <div className="max-w-2xl">
      <h3 className="font-semibold text-lg">Missing students</h3>
      <P>
        There are {exams.length} exams where the student hasn&apos;t yet been
        added to your exam room. They are probably drop in students (people who
        are not registered to the exam but have written it)
      </P>
      <div className="mt-8">
        <ExamErrorTable exams={exams} />
      </div>
      <div className="mt-8">
        <PrimaryButton
          className="sm:w-auto"
          working={addingMissingStudents}
          success={missingStudentsAdded}
          onClick={() => doFixMissingStudents()}
        >
          Add students and import exams
        </PrimaryButton>
        <SecondaryButton
          className="sm:w-auto"
          working={ignoringMissingStudents}
          success={missingStudentsIgnored}
          onClick={() => doIgnoreMissingStudents()}
        >
          Do not add students
        </SecondaryButton>
      </div>
    </div>
  );
}

function OtherErrors({ courseId, exams }: any) {
  const {
    mutate: doFixOtherErrors,
    isLoading: fixingOtherErrors,
    isSuccess: otherErrorsFixed,
  } = useMutateFixImportQueueErrors(courseId, exams);
  const {
    mutate: doIgnoreOtherErrors,
    isLoading: ignoringOtherErrors,
    isSuccess: otherErrorsIgnored,
  } = useMutateIgnoreImportQueueErrors(courseId, exams);

  return (
    <div className="max-w-2xl">
      <h3 className="font-semibold text-lg">Other errors</h3>
      <P>
        <b>
          There are {exams.length} exams that can&apos;t be imported at this
          time.
        </b>{" "}
        This is due to issues we can&apos;t automatically solve. Once the issues
        with these exams have been solved click &quot;Try to import again&quot;
        to retry importing these exams.
      </P>
      <P>
        <b>If you don&apos;t know how to resolvera these issues:</b> please contact your
        local exam administrator with the information below. The local exam administrator
        in turn needs to contact it-support@kth.se since they sit on information that is
        important to the troubleshooting process.
      </P>
      <div className="mt-8">
        <ExamErrorTable exams={exams} />
      </div>
      <div className="mt-8">
        <PrimaryButton
          className="sm:w-auto"
          waiting={fixingOtherErrors}
          success={otherErrorsFixed}
          onClick={() => doFixOtherErrors()}
        >
          Try to import again
        </PrimaryButton>
        <SecondaryButton
          className="sm:w-auto"
          waiting={ignoringOtherErrors}
          success={otherErrorsIgnored}
          onClick={() => doIgnoreOtherErrors()}
        >
          I have contacted IT support
        </SecondaryButton>
      </div>
    </div>
  );
}

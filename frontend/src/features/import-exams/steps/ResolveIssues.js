import React from "react";
import { useQueryClient } from "react-query";
import {
  useCourseExams,
  useMutateImportStart,
  useMutateAddStudents,
} from "../../../common/api";
import {
  H2,
  LoadingPage,
  PrimaryButton,
  SecondaryButton,
  P,
  cssInfoBox,
  ImportQueueProgressBar,
} from "../../widgets";

export default function ResolveIssues({ onNext, onPrev, courseId }) {
  const client = useQueryClient();

  const [queueStatus, setQueueStatus] = React.useState("idle");

  // Get exams available to import
  const queryExams = useCourseExams(courseId);
  const {
    data: dataExams,
    isLoading: examsLoading,
    isError: examsError,
  } = queryExams;

  const examsWithErrors =
    dataExams?.result.filter((exam) => exam.status === "error") || [];

  const missingStudentIds =
    dataExams?.result
      .filter(
        (exam) =>
          exam.status === "error" && exam.error.type === "missing_student"
      )
      .map((exam) => exam.error.details.kthId) || [];

  // Hook to add students
  const addStudentsMutation = useMutateAddStudents(courseId, missingStudentIds);

  const {
    mutate: doAddStudents,
    isLoading: addStudentsLoading,
    isError: addStudentsError,
  } = addStudentsMutation;

  // Hoook to start import
  const startImportMutation = useMutateImportStart(courseId, examsWithErrors, {
    onSuccess({ status }) {
      // status lets us know if the queue is working or still idle
      setQueueStatus(status);
    },
  });

  const {
    mutate: doStartImport,
    isLoading: startImportLoading,
    isError: startImportError,
  } = startImportMutation;

  if (examsLoading) {
    return <LoadingPage>Loading...</LoadingPage>;
  }

  const nrofExamsToResolve = examsWithErrors?.length || 0;

  if (queueStatus === "working") {
    return (
      <div className="max-w-2xl">
        <H2>Resolve in progress...</H2>
        <p>Fixing issues with your latest import.</p>
        <div className="mt-8">
          <ImportQueueProgressBar
            courseId={courseId}
            defaultTotal={nrofExamsToResolve}
            onDone={() => {
              // Clear the query cache to avoid synching issues
              client.removeQueries(["course", courseId]);
              onNext();
            }}
          />
        </div>
      </div>
    );
  }

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
        </> /**/
      )}
      <div className="mt-8">
        <SecondaryButton className="sm:w-auto" onClick={onPrev}>
          Prev
        </SecondaryButton>
        {nrofExamsToResolve > 0 && (
          <PrimaryButton
            className="sm:w-auto"
            waiting={startImportLoading}
            onClick={async () => {
              await doAddStudents();
              doStartImport();
            }}
          >
            Fix Errors!
          </PrimaryButton>
        )}
        <PrimaryButton className="sm:w-56" onClick={onNext}>
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

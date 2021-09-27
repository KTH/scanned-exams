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

export default function ResolveIssues({ onGoTo, courseId }) {
  const client = useQueryClient();

  const [queueStatus, setQueueStatus] = React.useState("idle");

  // Get exams available to import
  const queryExams = useCourseExams(courseId);
  const {
    data: dataExams,
    isLoading: examsLoading,
    isError: examsError,
  } = queryExams;

  const examsWithMissingStudentError =
    dataExams?.result.filter(
      (exam) => exam.status === "error" && exam.error.type === "missing_student"
    ) || [];
  const examsWithOtherErrors =
    dataExams?.result.filter(
      (exam) => exam.status === "error" && exam.error.type !== "missing_student"
    ) || [];

  const missingStudentIds =
    examsWithMissingStudentError.map((exam) => exam.error.details.kthId) || [];

  // Hook to add students
  const addStudentsMutation = useMutateAddStudents(courseId, missingStudentIds);

  const {
    mutate: doAddStudents,
    isLoading: addStudentsLoading,
    isError: addStudentsError,
  } = addStudentsMutation;

  // Hoook to start import
  const startImportMutation = useMutateImportStart(
    courseId,
    // Fix missing student errors during import, this will also
    // attempt to import exams with other errors in case they
    // can be fixed too by reimporting.
    [...examsWithMissingStudentError, ...examsWithOtherErrors],
    {
      onSuccess({ status }) {
        // status lets us know if the queue is working or still idle
        setQueueStatus(status);
      },
    }
  );

  const {
    mutate: doStartImport,
    isLoading: startImportLoading,
    isError: startImportError,
  } = startImportMutation;

  if (examsLoading) {
    return <LoadingPage>Loading...</LoadingPage>;
  }

  const nrofExamsToResolve =
    examsWithOtherErrors.length + examsWithMissingStudentError.length;

  if (queueStatus === "working") {
    return (
      <div className="max-w-2xl">
        <H2>Resolve in progress...</H2>
        <p>
          Fixing issues with your latest import. This adds missing students and
          also attempts to fix other import errors.
        </p>
        <div className="mt-8">
          <ImportQueueProgressBar
            courseId={courseId}
            defaultTotal={nrofExamsToResolve}
            onDone={() => {
              // Clear the query cache to avoid synching issues
              client.resetQueries(["course", courseId]);
              onGoTo("result");
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
          {/* Render missing students */}
          {examsWithMissingStudentError.length > 0 &&
            renderMissingStudents({
              exams: examsWithMissingStudentError,
              isLoading: startImportLoading,
              onFix: async () => {
                await doAddStudents();
                doStartImport();
              },
            })}
          {/* Render other import errors */}
          <div className="mt-8">
            {examsWithOtherErrors.map((exam, index) => (
              <ExamErrorRow exam={exam} rowNr={index + 1} />
            ))}
          </div>
        </> /**/
      )}
      <div className="mt-8">
        <PrimaryButton className="sm:w-96" onClick={() => onGoTo("result")}>
          Show Summary
        </PrimaryButton>
      </div>
    </div>
  );
}

function renderMissingStudents({ exams, isLoading, onFix }) {
  return (
    <>
      <div className="mt-8">
        {exams.map((exam, index) => (
          <ExamErrorRow exam={exam} rowNr={index + 1} />
        ))}
      </div>
      <div className="mt-8">
        <PrimaryButton
          className="sm:w-auto"
          waiting={isLoading}
          onClick={onFix}
        >
          Fix Missing Students!
        </PrimaryButton>
      </div>
    </> /**/
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
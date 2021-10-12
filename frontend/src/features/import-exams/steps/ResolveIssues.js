import React from "react";
import { useQueryClient } from "react-query";
import {
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

export default function ResolveIssues({ onGoTo, courseId, queryExams }) {
  const client = useQueryClient();

  const [queueStatus, setQueueStatus] = React.useState("idle");

  // Get exams available to import
  const { data = {}, isFetching: examsLoading } = queryExams;
  const { result: exams = [] } = data;

  const examsSuccessfullyImported =
    exams.filter((exam) => exam.status === "imported") || [];
  const examsWithMissingStudentError =
    exams.filter(
      (exam) => exam.status === "error" && exam.error.type === "missing_student"
    ) || [];
  const examsWithOtherErrors =
    exams.filter(
      (exam) => exam.status === "error" && exam.error.type !== "missing_student"
    ) || [];

  const missingStudentIds =
    examsWithMissingStudentError.map((exam) => exam.error.details.kthId) || [];

  // Hook to add students
  const { mutate: doAddStudents } = useMutateAddStudents(
    courseId,
    missingStudentIds
  );

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

  const { mutate: doStartImport, isLoading: startImportLoading } =
    startImportMutation;

  if (examsLoading) {
    return <LoadingPage>Loading...</LoadingPage>;
  }

  const nrofMissingStudents = examsWithMissingStudentError.length;
  const nrofOtherErrors = examsWithOtherErrors.length;
  const nrofImported = examsSuccessfullyImported.length;
  const nrofExamsToResolve = nrofMissingStudents + nrofOtherErrors;

  if (queueStatus === "working") {
    return (
      <div className="max-w-2xl">
        <H2>Resolve in progress...</H2>
        <p>
          Re-importing exams with issues. Please stay on this page during this
          process.
        </p>
        <div className="mt-8">
          <ImportQueueProgressBar
            courseId={courseId}
            defaultTotal={nrofExamsToResolve}
            onDone={() => {
              // Clear the query cache to avoid synching issues
              client.resetQueries(["course", courseId]);
              // Return flow control to ImportFlow.js
              onGoTo(undefined);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <H2>Resolve Issues</H2>
      <div className={cssInfoBox}>
        <h2 className="font-semibold text-lg">
          We encountered errors during the import.
        </h2>
        {nrofImported > 0 && (
          <P>
            <b>You successfully imported {nrofImported} exams.</b> These are now
            available for grading in Canvas along with any previously imported
            exams.
          </P>
        )}
        {nrofMissingStudents > 0 && (
          <P>
            <b>
              You have {nrofMissingStudents} exams where the student hasn&apos;t
              yet been added to your course.
            </b>{" "}
            These are marked &quot;missing student&quot; and since they have a
            user in Canvas this issue can be fixed by{" "}
            <b>clicking &quot;Fix missing students!&quot;</b>.
          </P>
        )}
        {nrofOtherErrors > 0 && (
          <P>
            <b>
              You have {nrofOtherErrors} exams that can&apos;t be imported at
              this time.
            </b>{" "}
            This is due to issues we can&apos;t automatically solve and they are
            marked with &quot;Unhandled error&quot;. Once the issues with these
            exams have been solved click &quot;Re-import rows...&quot; to retry
            importing these exams. Contact IT-support if you don&apos;t know how
            to resolve these issues.
          </P>
        )}
      </div>
      {/* Render missing students */}
      {examsWithMissingStudentError.length > 0 &&
        renderMissingStudents({
          exams: examsWithMissingStudentError,
          isLoading: startImportLoading,
          onFix: async () => {
            // Lock flow control to this page (returns on progress done)
            onGoTo("issues");
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
      <div className="mt-8">
        {examsWithOtherErrors.length > 0 && (
          <SecondaryButton
            className="sm:w-auto"
            waiting={startImportLoading}
            onClick={() => {
              // Lock flow control to this page (returns on progress done)
              onGoTo("issues");
              doStartImport();
            }}
          >
            Re-import rows with errors
          </SecondaryButton>
        )}
        <PrimaryButton className="sm:w-56" onClick={() => onGoTo("result")}>
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
          <ExamErrorRow key={exam.id} exam={exam} rowNr={index + 1} />
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

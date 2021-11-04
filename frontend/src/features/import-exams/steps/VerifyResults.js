import React from "react";
import { useCourseImportStatus } from "../../../common/api";
import {
  H2,
  LoadingPage,
  SecondaryButton,
  P,
  cssInfoBox,
  cssSuccessBox,
} from "../../widgets";

export default function VerifyResults({ onForceShowStep, courseId }) {
  // Get exams available to import
  const { data = {}, isLoading: examsLoading } = useCourseImportStatus(
    courseId,
    { repeatAtInterval: true }
  );
  const { stats = {} } = data;
  const { error, imported } = stats;

  if (examsLoading) {
    return <LoadingPage>Loading...</LoadingPage>;
  }

  return (
    <div className="max-w-2xl">
      <H2>Verify Results</H2>
      <P>This is a summary of the status of all the processed exams.</P>
      {error ? renderHelp() : renderDone()}
      <div className="mt-8">
        <SummaryTable summary={{ error, imported }} />
      </div>
      <div className="mt-8">
        {error > 0 && (
          <SecondaryButton
            className="sm:w-auto"
            onClick={() => onForceShowStep("issues")}
          >
            Show Errors
          </SecondaryButton>
        )}
      </div>
    </div>
  );
}

function renderHelp() {
  return (
    <div className={cssInfoBox}>
      <p>
        You have some unresolved issues encountered during the import. Click
        &quot;Show Errors&quot; to get a list of exams that couldn&apos;t be
        imported to Canvas.
      </p>
    </div>
  );
}

function renderDone() {
  return (
    <div className={cssSuccessBox}>
      <h2 className="font-semibold text-lg">You Are Done!</h2>
      <P>
        All available exams were imported to Canvas and there are no errors. You
        can safely leave this page and return at another time to check if more
        exams have been scanned and verified.
      </P>
      <P>Good luck with your grading!</P>
    </div>
  );
}

function SummaryTable({ summary }) {
  const { error, imported } = summary;
  return (
    <table className="table-auto">
      <tbody>
        <tr>
          <td className="p-1 pl-0">Exams succesfully imported to Canvas:</td>
          <td className="p-1 pl-2">{imported !== undefined ? imported : ""}</td>
        </tr>
        <tr>
          <td className="p-1 pl-0">Exams with unresolved errors:</td>
          <td className="p-1 pl-2">{error !== undefined ? error : ""}</td>
        </tr>
      </tbody>
    </table>
  );
}

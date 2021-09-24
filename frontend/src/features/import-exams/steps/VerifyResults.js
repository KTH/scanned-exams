import React, { useState } from "react";
import { useCourseExams, useMutateImportReset } from "../../../common/api";
import {
  H2,
  LoadingPage,
  SecondaryButton,
  P,
  PrimaryButton,
} from "../../widgets";
import DetailedErrors from "./DetailedErrors";

export default function VerifyResults({ onFinish, onStartOver, courseId }) {
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  const resetImportMutation1 = useMutateImportReset(courseId, {
    onSuccess() {
      onFinish();
    },
  });
  const resetImportMutation2 = useMutateImportReset(courseId, {
    onSuccess() {
      onStartOver();
    },
  });

  const isResetting =
    resetImportMutation1.isLoading || resetImportMutation2.isLoading;

  // Get exams available to import
  const queryExams = useCourseExams(courseId);
  const {
    data: dataExams,
    isFetching: examsFetching,
    isError: examsError,
  } = queryExams;

  const examsWithErrors =
    dataExams?.result.filter((exam) => exam.status === "error") || [];
  const importedExams =
    dataExams?.result.filter((exam) => exam.status === "imported") || [];

  if (examsFetching) {
    return (
      <div className="max-w-2xl">
        <H2>Import finished</H2>
        <LoadingPage>Loading...</LoadingPage>
      </div>
    );
  }

  const errors = examsWithErrors?.length || 0;
  const imported = importedExams?.length || 0;
  const total = dataExams?.result?.length || 0;

  if (showErrorDetails) {
    return (
      <DetailedErrors
        exams={dataExams}
        onClose={() => setShowErrorDetails(false)}
      />
    );
  }

  return (
    <div className="max-w-2xl">
      <H2>Import finished</H2>
      <div className="mt-8">
        <table className="table-auto">
          <tbody>
            <tr>
              <td className="p-1 pl-0">Total exams processed:</td>
              <td className="p-1 pl-2">{total}</td>
            </tr>
            <tr>
              <td className="p-1 pl-0">Succesfully imported:</td>
              <td className="p-1 pl-2">{imported}</td>
            </tr>
            <tr>
              <td className="p-1 pl-0">Failed:</td>
              <td className="p-1 pl-2">{errors}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-8">
        <SecondaryButton
          className="sm:w-auto"
          onClick={() => setShowErrorDetails(true)}
        >
          Show error details
        </SecondaryButton>
        <PrimaryButton
          className="sm:w-auto"
          disabled={isResetting}
          onClick={() => {
            resetImportMutation2.mutate();
          }}
        >
          Import more exams
        </PrimaryButton>
        <PrimaryButton
          className="sm:w-auto"
          disabled={isResetting}
          onClick={() => {
            resetImportMutation1.mutate();
          }}
        >
          Quit
        </PrimaryButton>
      </div>
    </div>
  );
}

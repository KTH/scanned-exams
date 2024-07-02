/* eslint-disable react/jsx-props-no-spreading */
import React from "react";
import classes from "./widgets.module.scss";

export const PrimaryButton = ({ width, waiting, children, onClick }: any) => (
  <button
    className={["kth-button", "primary", waiting && "waiting"].join(" ")}
    style={{ width }}
    onClick={(e) => {
      if (!waiting) {
        onClick(e);
      }
    }}
  >
    {children}
  </button>
);

export const SecondaryButton = ({ width, waiting, children, onClick }: any) => (
  <button
    className={["kth-button", "secondary", waiting && "waiting"].join(" ")}
    style={{ width }}
    onClick={(e) => {
      if (!waiting) {
        onClick(e);
      }
    }}
  >
    {children}
  </button>
);

export const LoadingPage = ({ className, children, ...props }: any) => (
  <main className={classes.LoadingPage}>
    <div className={classes.WithSpinner}>{children}</div>
  </main>
);

export const ExamErrorTable = ({ exams }: any) => (
  <table className="w-full mt-6">
    <thead>
      <tr>
        <th className="text-left p-2">Exam ID</th>
        <th className="text-left p-2">Exam Filename</th>
        <th className="text-left p-2">Exam Batch Number</th>
        <th className="text-left p-2">Student</th>
        <th className="text-left p-2">Error</th>
      </tr>
    </thead>
    <tbody>
      {exams.map((exam: any) => (
        <tr key={exam.fileId}>
          <td className="text-left p-2">{exam.fileId}</td>
          <td className="text-left p-2">{exam.fileName}</td>
          <td className="text-left p-2">{exam.batchNo}</td>
          <td className="text-left p-2">
            {`${exam.student.lastName}, ${exam.student.firstName} (kth id:${exam.student.kthId})`}
          </td>
          <td className="text-left p-2">{exam.error?.message}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

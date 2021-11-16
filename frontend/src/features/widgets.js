/* eslint-disable react/jsx-props-no-spreading */
import React from "react";
import { Check, Spinner } from "./icons";

export const cssInfoBox =
  "bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mt-6";

export const cssSuccessBox =
  "bg-green-50 border-l-4 border-green-600 text-green-800 p-4 mt-6";

export function P(props) {
  return <p className="mt-6" {...props} />;
}

export function H2(props) {
  // eslint-disable-next-line jsx-a11y/heading-has-content
  return <h2 className="font-semibold mt-4 mb-8 text-2xl" {...props} />;
}

export function BaseButton({ className, ...props }) {
  return (
    <button
      type="button"
      className={`${className} flex w-full sm:inline-flex justify-center items-center rounded-md font-semibold py-2 text-base px-6 transition-colors`}
      {...props}
    />
  );
}

export const BaseActionButton = ({
  className,
  disabled,
  waiting,
  success,
  children,
  onClick,
}) => {
  // Don't allow clicks when any of these states are true
  const _blockClick = !!(disabled || waiting || success);

  return (
    <BaseButton
      className={[
        className,
        disabled && "opacity-75",
        !disabled && "hover:bg-blue-700",
        "border border-transparent text-white bg-blue-500  mr-8",
      ].join(" ")}
      disabled={disabled}
      onClick={(e) => !_blockClick && onClick(e)}
    >
      {children}
      {waiting && <Spinner className="h-5 w-5 animate-spin ml-3" />}
      {!waiting && success && <Check className="h-5 w-5 ml-3" />}
    </BaseButton>
  );
};

export const PrimaryButton = ({ className, disabled, ...props }) => (
  <BaseActionButton
    className={[
      className,
      !disabled && "hover:bg-blue-700",
      "border border-transparent text-white bg-blue-500  mr-8",
    ].join(" ")}
    disabled={disabled}
    {...props}
  />
);

export const SecondaryButton = ({ className, ...props }) => (
  <BaseButton
    className={`${className} mt-2 sm:mt-0 text-black border border-black hover:bg-gray-200  mr-8`}
    {...props}
  />
);

export const LoadingPage = ({ className, children, ...props }) => (
  <div
    className={[
      className,
      "flex flex-col flex-auto justify-center items-center h-72",
    ].join(" ")}
    {...props}
  >
    <Spinner className="w-8 h-8 animate-spin m-8" />
    {children}
  </div>
);

export const ExamErrorTable = ({ exams }) => (
  <table className="w-full mt-6">
    <thead>
      <tr>
        <th className="text-left p-2">Exam ID</th>
        <th className="text-left p-2">Student</th>
        <th className="text-left p-2">Error</th>
      </tr>
    </thead>
    <tbody>
      {exams.map((exam) => (
        <tr key={exam.fileId}>
          <td className="text-left p-2">{exam.fileId}</td>
          {/* TODO: file name */}
          <td className="text-left p-2">
            {`${exam.student.lastName}, ${exam.student.firstName} (${exam.student.kthId})`}
          </td>
          <td className="text-left p-2">{exam.error?.message}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

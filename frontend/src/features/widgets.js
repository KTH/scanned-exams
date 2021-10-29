/* eslint-disable react/jsx-props-no-spreading */
import React from "react";
import { Check, Spinner } from "./icons";
import { useCourseImportProgress } from "../common/api";

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

export function ImportQueueProgressBar({ courseId, defaultTotal, onDone }) {
  const [cancel, setCancel] = React.useState(false);

  // Ping backend to get status of current import
  const { data } = useCourseImportProgress(courseId, {
    onDone: () => {
      // We are done, inform the parent
      setCancel(true);
      onDone();
    },
    cancel,
  });

  const {
    stats: { total = 0, imported = 0, error = 0 },
  } = data || {};
  const progress = imported + error;

  const perc = Math.round((progress / total) * 100);
  return (
    <div className="mt-8 mb-8">
      <div className="relative pt-1 mb-1">
        <div className="overflow-hidden h-4 text-xs flex rounded bg-blue-200">
          <div
            style={{ width: `${perc}%`, transition: "width 3s" }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
          />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <span>{`${progress} of ${total}`}</span>
      </div>
    </div>
  );
}

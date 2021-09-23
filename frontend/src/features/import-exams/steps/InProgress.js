import React from "react";
import { H2, cssInfoBox } from "../../widgets";

function ProgressBar({ progress, total }) {
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

export default function InProgress({ status }) {
  return (
    <div className="max-w-2xl">
      <H2>Import in progress...</H2>
      <div className={cssInfoBox}>
        <p>
          <b>Surprised?</b> The import can be started by another tab or another
          teacher for this course.
        </p>
      </div>
      <div className="mt-8">
        <div>Summary</div>
      </div>
      <div className="mt-8">
        <ProgressBar
          progress={status.working.progress}
          total={status.working.total}
        />
      </div>
    </div>
  );
}

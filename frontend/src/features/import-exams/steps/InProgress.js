import React from "react";
import { H2, cssInfoBox } from "../../widgets";

export default function InProgress() {
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
        <div>Progress bar</div>
      </div>
    </div>
  );
}

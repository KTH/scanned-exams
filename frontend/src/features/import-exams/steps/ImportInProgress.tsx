import React from "react";
import classes from "./ImportInProgress.module.scss";

export default function ImportInProgress({ progress, total }: any) {
  const perc = Math.round((progress / total) * 100);

  return (
    <main>
      <h2>Import in progress</h2>
      <div>
        <div className={classes.ProgressBar}>
          <div className={classes.Bar} style={{ width: `${perc}%` }}></div>
        </div>
        <div className="flex flex-col items-center">
          <span>{`Imported ${progress} of ${total}`}</span>
        </div>
      </div>
    </main>
  );
}

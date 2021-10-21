import React from "react";
import { useMutateResetImportQueue } from "../../../common/api";
import { H2, SecondaryButton } from "../../widgets";

// TODO: do something with `ignored` (errors that are not fixed)
export default function VerifyResults({ courseId, imported, ignored }) {
  const { mutate: doResetImportQueue } = useMutateResetImportQueue(courseId);

  return (
    <div className="max-w-2xl">
      <H2>Verify Results</H2>
      <div className="mt-8">{imported} exams have been imported to Canvas</div>
      <div className="mt-8">
        <SecondaryButton
          className="sm:w-auto"
          onClick={() => doResetImportQueue()}
        >
          Import more
        </SecondaryButton>
        {/* <PrimaryButton className="sm:w-auto">Log out</PrimaryButton> */}
      </div>
    </div>
  );
}

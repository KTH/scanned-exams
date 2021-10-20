import React from "react";
import { H2, SecondaryButton, P, PrimaryButton } from "../../widgets";

export default function VerifyResults({ courseId, total }) {
  return (
    <div className="max-w-2xl">
      <H2>Verify Results</H2>
      <div className="mt-8">{total} exams have been imported to Canvas</div>
      <div className="mt-8">
        <SecondaryButton className="sm:w-auto">Import more</SecondaryButton>
        <PrimaryButton className="sm:w-auto">Log out</PrimaryButton>
      </div>
    </div>
  );
}

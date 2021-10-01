/* eslint-disable react/jsx-boolean-value */
/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import { useMutateExamroomSetup } from "../../../common/api";
import { P, H2, PrimaryButton } from "../../widgets";
import { RadioGroup, RadioInput } from "../../RadioGroup";

function BlockRadio({ children, value, id }) {
  return (
    <label htmlFor={id} className="flex m-2 py-1">
      <RadioInput value={value} id={id} className="my-1 mr-2" />
      <div>{children}</div>
    </label>
  );
}

export default function SetupExamroom({ courseId }) {
  const {
    mutate: setupExamroom,
    isLoading,
    isSuccess,
    isError,
    ...mutation
  } = useMutateExamroomSetup(courseId);
  const [recommendedHomepage, setRecommendedHomepage] = useState();

  if (isError) {
    throw mutation.error;
  }

  return (
    <div className="max-w-2xl">
      <H2>Prepare examroom</H2>
      <P>Exam language</P>
      <RadioGroup name="language" value="english">
        <label className="block m-2">
          <RadioInput className="mr-2" value="english" /> English
        </label>
        <label className="block m-2 text-gray-500">
          <RadioInput className="mr-2" value="swedish" disabled /> Swedish
        </label>
      </RadioGroup>
      <p className="mt-12 mb-4">Which setup do you want to use?</p>
      <div className="mb-8">
        <RadioGroup
          name="create-homepage"
          value={recommendedHomepage}
          onChange={(v) => setRecommendedHomepage(v)}
        >
          <BlockRadio value={true} id="create-homepage-yes">
            <div>Recommended setup</div>
            <div className="my-2 text-sm">
              Create a special assignment called "Scanned Exams" and replace the
              existing homepage with our recommendation
            </div>
          </BlockRadio>
          <BlockRadio value={false} id="create-homepage-no">
            <div>Minimal setup</div>
            <div className="my-2 text-sm">
              Only create a special assignment called "Scanned Exams". Leave
              everything else untouched
            </div>
          </BlockRadio>
        </RadioGroup>
      </div>
      <P>
        Note: neither the examroom or assignment will be published in this step
      </P>
      <PrimaryButton
        className="my-8 sm:w-72"
        onClick={() => setupExamroom(recommendedHomepage)}
        waiting={isLoading}
        success={isSuccess}
      >
        Apply changes
      </PrimaryButton>
    </div>
  );
}

import React from "react";
import { cssWarningBox, P, H2, PrimaryButton } from "../../widgets";
import { useMutatePublishAll } from "../../../common/api";

export default function PublishExamroom({ courseId }) {
  const mutation = useMutatePublishAll(courseId);

  const { mutate, isLoading, isSuccess, isError } = mutation;

  if (isError) {
    throw mutation.error;
  }

  return (
    <div className="max-w-2xl">
      <H2>Publish the exam room and assignment</H2>
      <P>
        It is required to publish the exam room and the assignment before
        starting to import exams
      </P>
      <p className={cssWarningBox}>
        By clicking the button below, the exam room and assignment will be
        published and students will be able to see it
      </p>
      {/* TODO: add links to "preview" the assignment and homepage or something */}
      <P>
        <PrimaryButton
          className="sm:w-96"
          onClick={mutate}
          waiting={isLoading}
          success={isSuccess}
        >
          Publish exam room and assignment
        </PrimaryButton>
      </P>
    </div>
  );
}

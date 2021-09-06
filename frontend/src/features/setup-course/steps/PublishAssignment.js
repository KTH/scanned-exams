import React from "react";
import { H2, PrimaryButton, P } from "../../widgets";
import { useMutateCourseSetup } from "../../../common/api";

export default function CreateAssignment({ onNext, courseId }) {
  const mutation = useMutateCourseSetup(courseId, "publish-assignment", {
    onSuccess() {
      setTimeout(onNext, 500);
    },
  });

  const { mutate, isLoading, isSuccess, isError } = mutation;

  if (isError) {
    throw mutation.error;
  }

  return (
    <div>
      <H2>Publish Assignment</H2>
      <P>Now its time to publish the examroom</P>
      <P>
        <PrimaryButton
          className="sm:w-96"
          onClick={mutate}
          disabled={isLoading || isSuccess}
          waiting={isLoading}
          success={isSuccess}
        >
          Publish Assignment
        </PrimaryButton>
      </P>
    </div>
  );
}

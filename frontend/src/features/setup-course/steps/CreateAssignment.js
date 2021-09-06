import React from "react";
import { H2, PrimaryButton, P } from "../../widgets";
import { useMutateCourseSetup } from "../../../common/api";

export default function CreateAssignment({ onNext, courseId }) {
  const mutation = useMutateCourseSetup(courseId, "create-assignment", {
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
      <H2>Create Assignment</H2>
      <P>At this step the actual assignment is created.</P>
      <P>
        <PrimaryButton
          className="sm:w-96"
          onClick={mutate}
          disabled={isLoading || isSuccess}
          waiting={isLoading}
          success={isSuccess}
        >
          Create Assignment
        </PrimaryButton>
      </P>
    </div>
  );
}

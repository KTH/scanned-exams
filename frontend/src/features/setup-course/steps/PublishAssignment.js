import React from "react";
import { H2, PrimaryButton, SecondaryButton, P } from "../../widgets";
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
      <P>
        You have created the assignment. You can edit the assignment and return
        to the setup process later to publish the assignment or you can now
        publish it now.
      </P>
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
        <SecondaryButton
          className="sm:w-auto"
          onClick={() => alert("TODO: open preview")}
        >
          Show preview
        </SecondaryButton>
      </P>
    </div>
  );
}

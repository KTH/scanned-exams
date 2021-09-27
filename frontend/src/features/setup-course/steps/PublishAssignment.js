import React from "react";
import { H2, PrimaryButton, P } from "../../widgets";
import { useMutateCourseSetup } from "../../../common/api";

export default function CreateAssignment({ courseId }) {
  const mutation = useMutateCourseSetup(courseId, "publish-assignment");

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
          waiting={isLoading}
          success={isSuccess}
        >
          Publish Assignment
        </PrimaryButton>
      </P>
    </div>
  );
}

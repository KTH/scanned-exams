import React from "react";
import { PrimaryButton } from "../../widgets";
import { useMutateCourseSetup } from "../../../common/api";

export default function PublishAssignment({ courseId }: any) {
  const mutation = useMutateCourseSetup(courseId, "publish-assignment");

  const { mutate, isLoading, isSuccess, isError } = mutation;

  if (isError) {
    throw mutation.error;
  }

  return (
    <main>
      <h2>Publish Assignment</h2>
      <p>
        You have created the assignment. You can edit the assignment and return
        to the setup process later to publish the assignment or you can now
        publish it now.
      </p>
      <div className="button-bar">
        <PrimaryButton
          width="16rem"
          onClick={mutate}
          waiting={isLoading || isSuccess}
        >
          Publish Assignment
        </PrimaryButton>
      </div>
    </main>
  );
}

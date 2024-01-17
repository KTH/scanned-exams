import React from "react";
import { PrimaryButton2 } from "../../widgets";
import { useMutateCourseSetup } from "../../../common/api";

export default function CreateAssignment({ courseId }: any) {
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
        <PrimaryButton2
          width="16rem"
          onClick={mutate}
          waiting={isLoading || isSuccess}
        >
          Publish Assignment
        </PrimaryButton2>
      </div>
    </main>
  );
}

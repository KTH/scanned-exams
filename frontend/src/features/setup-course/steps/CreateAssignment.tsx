import React from "react";
import { PrimaryButton2 } from "../../widgets";
import { useMutateCourseSetup } from "../../../common/api";

export default function CreateAssignment({ courseId }: any) {
  const mutation = useMutateCourseSetup(courseId, "create-assignment");

  const { mutate, isLoading, isSuccess, isError } = mutation;

  if (isError) {
    throw mutation.error;
  }

  return (
    <main>
      <h2>Create Assignment</h2>
      <p>
        We need to create an assignment. This is where the scanned exams will be
        imported as submissions. You can leave the setup and edit the assignment
        once it has been created.
      </p>
      <div className="button-bar">
        <PrimaryButton2
          width="14rem"
          onClick={mutate}
          waiting={isLoading || isSuccess}
        >
          Create Assignment
        </PrimaryButton2>
      </div>
    </main>
  );
}

import React from "react";
import { PrimaryButton } from "../../widgets";
import { useMutateCourseSetup } from "../../../common/api";

export default function CreateAssignment({ courseId, anonymouslyGraded }: any) {
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
        imported as submissions.
      </p>
      {anonymouslyGraded && (
        <p>
          Since the examination is conducted anonymously, the assignment will be
          created with anonymous grading.
        </p>
      )}
      <p>
        You can leave the setup and edit the assignment once it has been
        created.
      </p>
      <div className="button-bar">
        <PrimaryButton
          width="14rem"
          onClick={mutate}
          waiting={isLoading || isSuccess}
        >
          Create Assignment
        </PrimaryButton>
      </div>
    </main>
  );
}

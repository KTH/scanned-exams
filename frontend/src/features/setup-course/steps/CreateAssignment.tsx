import React from "react";
import { H2, PrimaryButton, P } from "../../widgets";
import { useMutateCourseSetup } from "../../../common/api";

export default function CreateAssignment({ courseId }: any) {
  const mutation = useMutateCourseSetup(courseId, "create-assignment");

  const { mutate, isLoading, isSuccess, isError } = mutation;

  if (isError) {
    throw mutation.error;
  }

  return (
    <main>
      <H2>Create Assignment</H2>
      <P>
        We need to create an assignment. This is where the scanned exams will be
        imported as submissions. You can leave the setup and edit the assignment
        once it has been created.
      </P>
      <P>
        <PrimaryButton
          className="sm:w-96"
          onClick={mutate}
          waiting={isLoading}
          success={isSuccess}
        >
          Create Assignment
        </PrimaryButton>
      </P>
    </main>
  );
}

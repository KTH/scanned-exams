import React from "react";
import { H2, PrimaryButton, P } from "../../widgets";
import { useMutateCourseSetup } from "../../../common/api";

export default function PublishCourse({ courseId }: any) {
  const mutation = useMutateCourseSetup(courseId, "publish-course");

  const { mutate, isLoading, isSuccess, isError } = mutation;

  if (isError) {
    throw mutation.error;
  }

  return (
    <main>
      <H2>Publish the exam room</H2>
      <P>Now the exam room is ready to be published.</P>
      <P>
        <PrimaryButton
          className="sm:w-96"
          onClick={mutate}
          waiting={isLoading}
          success={isSuccess}
        >
          Publish exam room
        </PrimaryButton>
      </P>
    </main>
  );
}

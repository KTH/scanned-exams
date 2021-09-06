import React from "react";
import { H2, PrimaryButton, P } from "../../widgets";
import { useMutateCourseSetup } from "../../../common/api";

export default function PublishCourse({ onNext, courseId }) {
  const mutation = useMutateCourseSetup(courseId, "publish-course", {
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
      <H2>Publish the examroom</H2>
      <P>
        You are about to publish this course. This step is required for you to
        create an assignment.
      </P>
      <P>
        <PrimaryButton
          className="sm:w-96"
          onClick={mutate}
          disabled={isLoading || isSuccess}
          waiting={isLoading}
          success={isSuccess}
        >
          Publish examroom
        </PrimaryButton>
      </P>
    </div>
  );
}

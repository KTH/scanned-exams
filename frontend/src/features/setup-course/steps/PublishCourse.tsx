import React from "react";
import { PrimaryButton2 } from "../../widgets";
import { useMutateCourseSetup } from "../../../common/api";

export default function PublishCourse({ courseId }: any) {
  const mutation = useMutateCourseSetup(courseId, "publish-course");

  const { mutate, isLoading, isSuccess, isError } = mutation;

  if (isError) {
    throw mutation.error;
  }

  return (
    <main>
      <h2>Publish the exam room</h2>
      <p>Now the exam room is ready to be published.</p>
      <div className="button-bar">
        <PrimaryButton2
          width="14rem"
          onClick={mutate}
          waiting={isLoading || isSuccess}
        >
          Publish exam room
        </PrimaryButton2>
      </div>
    </main>
  );
}

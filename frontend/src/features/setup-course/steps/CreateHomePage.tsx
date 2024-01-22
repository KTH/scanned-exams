import React from "react";
import { PrimaryButton, SecondaryButton } from "../../widgets";
import { useMutateCourseSetup } from "../../../common/api";

export default function CreateHomePage({ onDone, courseId }: any) {
  const mutation = useMutateCourseSetup(courseId, "create-homepage", {
    onSuccess() {
      setTimeout(onDone, 500);
    },
  });

  const { mutate, isLoading, isSuccess, isError } = mutation;

  if (isError) {
    throw mutation.error;
  }

  return (
    <main>
      <h2>Prepare the homepage</h2>
      <p>
        The exam room will be visible for your students, it is important that
        they can see its purpose from the homepage. You can use our recommended
        homepage or setup the exam room by yourself
      </p>
      <em>The examroom will not be published yet</em>
      <div className="button-bar">
        <PrimaryButton
          onClick={mutate}
          waiting={isLoading || isSuccess}
          width="20rem"
        >
          Use the recommended homepage
        </PrimaryButton>
        <SecondaryButton onClick={onDone}>Skip this step</SecondaryButton>
      </div>
    </main>
  );
}

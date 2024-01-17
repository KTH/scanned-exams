import React from "react";
import { H2, PrimaryButton, SecondaryButton, P } from "../../widgets";
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
      <div className="mt-8">
        <PrimaryButton
          className="sm:w-96"
          onClick={mutate}
          waiting={isLoading}
          success={isSuccess}
        >
          Use the recommended homepage
        </PrimaryButton>
        <SecondaryButton className="sm:w-auto" onClick={onDone}>
          Skip this step
        </SecondaryButton>
      </div>
    </main>
  );
}

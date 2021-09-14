import React from "react";
import { H2, PrimaryButton, SecondaryButton, P } from "../../widgets";
import { useMutateCourseSetup } from "../../../common/api";

export default function CreateHomePage({ onCreate, skip, courseId }) {
  const mutation = useMutateCourseSetup(courseId, "create-homepage", {
    onSuccess() {
      setTimeout(onCreate, 500);
    },
  });

  const { mutate, isLoading, isSuccess, isError } = mutation;

  if (isError) {
    throw mutation.error;
  }

  return (
    <div className="max-w-2xl">
      <H2>Prepare the homepage</H2>
      <P>
        The exam room will be visible for your students, it is important that
        they can see its purpose from the homepage. You can use our recommended
        homepage or setup the courseroom by yourself
      </P>
      <P>
        <em>The examroom will not be published yet</em>
      </P>
      <div className="mt-8">
        <PrimaryButton
          className="sm:w-96"
          onClick={mutate}
          waiting={isLoading}
          success={isSuccess}
        >
          Use the recommended homepage
        </PrimaryButton>
        <SecondaryButton className="sm:w-auto" onClick={skip}>
          Skip this step
        </SecondaryButton>
      </div>
    </div>
  );
}

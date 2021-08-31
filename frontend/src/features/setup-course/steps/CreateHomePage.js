import React from "react";
import { H2, PrimaryButton, SecondaryButton, P } from "./util";
import { useMutateCourseSetup } from "../../../common/api";
import { Check, Spinner } from "../icons";

export default function CreateHomePage({ onCreate, skip, courseId }) {
  const mutation = useMutateCourseSetup(courseId, "create-homepage", {
    onSuccess() {
      setTimeout(onCreate, 500);
    },
  });

  if (mutation.isError) {
    throw mutation.error;
  }

  return (
    <div className="max-w-2xl">
      <H2>Prepare the homepage</H2>
      <P>
        Since this examroom will be visible for your students, it is important
        that they can see its purpose from the homepage. You can use our
        recommended homepage or setup the courseroom by yourself
      </P>
      <P>
        <em>The examroom will not be published yet</em>
      </P>
      <div className="mt-8">
        <PrimaryButton
          className="sm:w-96"
          onClick={mutation.mutate}
          disabled={mutation.isLoading || mutation.isSuccess}
        >
          Use the recommended homepage
          {mutation.isLoading && (
            <Spinner className="h-5 w-5 animate-spin ml-3" />
          )}
          {mutation.isSuccess && <Check className="h-5 w-5 ml-3" />}
        </PrimaryButton>
        <SecondaryButton className="sm:w-auto" onClick={skip}>
          Skip this step
        </SecondaryButton>
      </div>
    </div>
  );
}

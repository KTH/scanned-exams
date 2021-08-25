import React from "react";
import { H2, PrimaryButton, SecondaryButton, P } from "./util";
import { useMutateCourseSetup } from "../../hooks/course";
import { Spinner } from "../icons";

export default function CreateHomePage({ onCreate, skip, courseId }) {
  const mutation = useMutateCourseSetup(courseId, "create-homepage", {
    onSuccess() {
      onCreate();
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
          onClick={() => {
            mutation.mutate();
          }}
        >
          Use the recommended homepage
          {mutation.isLoading && (
            <Spinner className="h-5 w-5 animate-spin ml-3" />
          )}
        </PrimaryButton>
        <SecondaryButton className="sm:w-auto" onClick={skip}>
          Skip this step
        </SecondaryButton>
      </div>
    </div>
  );
}

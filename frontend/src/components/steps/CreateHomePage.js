import React from "react";
import { H2, PrimaryButton, SecondaryButton, P } from "./util";
import { useMutateCourseSetup } from "../../hooks/course";

export default function CreateHomePage({ onCreate, skip, courseId }) {
  const mutation = useMutateCourseSetup(courseId, "create-homepage", {
    onSuccess() {
      onCreate();
    },
  });

  return (
    <div>
      <H2>Prepare the homepage</H2>
      <P>
        Since this examroom will be visible for your students, it is important
        that they can see its purpose from the homepage.
      </P>
      <P>
        You can use our recommended homepage or setup the courseroom by yourself
      </P>
      <P>
        <em>The examroom will not be published yet</em>
      </P>
      <P>
        <PrimaryButton
          onClick={() => {
            mutation.mutate();
          }}
        >
          {mutation.isLoading ? "Creating..." : "Use the recommended homepage"}
        </PrimaryButton>
        <SecondaryButton onClick={skip}>Skip this step</SecondaryButton>
        <P>{mutation.isError && "An error ocurred. Try again."}</P>
      </P>
    </div>
  );
}

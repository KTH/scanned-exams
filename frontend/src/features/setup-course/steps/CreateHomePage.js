import React from "react";
import { H2, PrimaryButton, SecondaryButton, P } from "../../widgets";
import { useMutateCourseSetup } from "../../../common/api";

export default function CreateHomePage({ onCreate, skip, courseId }) {
  const mutation = useMutateCourseSetup(courseId, "create-homepage", {
    onSuccess() {
      setTimeout(onCreate, 500);
    },
  });

  const { mutate, isLoading, isSuccess, isError, error } = mutation;

  return (
    <div className="max-w-2xl">
      <H2>Prepare the homepage</H2>
      {!isError &&
        renderContent({
          isLoading,
          isSuccess,
          onAction: () => mutate(),
          onSkip: () => skip(),
        })}
      {isError &&
        renderError({
          message: error.message,
          onReset: () => mutation.reset(),
        })}
    </div>
  );
}

function renderContent({ isLoading, isSuccess, onAction, onSkip }) {
  return (
    <>
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
          onClick={onAction}
          waiting={isLoading}
          success={isSuccess}
        >
          Use the recommended homepage
        </PrimaryButton>
        <SecondaryButton className="sm:w-auto" onClick={onSkip}>
          Skip this step
        </SecondaryButton>
      </div>
    </> /* end frag */
  );
}

function renderError({ message, onReset }) {
  return (
    <>
      <P>{message}</P>
      <div className="mt-8">
        <SecondaryButton className="sm:w-auto" onClick={onReset}>
          Try Again!
        </SecondaryButton>
      </div>
    </> /* end frag */
  );
}

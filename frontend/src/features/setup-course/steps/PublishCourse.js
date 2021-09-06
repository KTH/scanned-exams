import React from "react";
import { H2, PrimaryButton, P } from "../../widgets";

export default function PublishCourse({ onNext, courseId }) {
  const [stateLoading, setLoading] = React.useState(false);
  const [stateSucess, setSuccess] = React.useState(false);

  const didClick = () => {
    setLoading(true);
    setTimeout(() => {
      setSuccess(true);
      setTimeout(onNext, 500);
    }, 1000);
  };

  return (
    <div>
      <H2>Publish the examroom</H2>
      <P>Now its time to publish the examroom</P>
      <P>
        <PrimaryButton
          className="sm:w-96"
          onClick={didClick}
          waiting={stateLoading}
          success={stateSucess}
        >
          Publish examroom
        </PrimaryButton>
      </P>
    </div>
  );
}

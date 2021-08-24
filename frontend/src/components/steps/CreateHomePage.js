import React from "react";
import { H2, PrimaryButton, SecondaryButton, P } from "./util";

export default function CreateHomePage() {
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
        <PrimaryButton>Use the recommended homepage</PrimaryButton>
        <SecondaryButton>Skip this step</SecondaryButton>
      </P>
    </div>
  );
}

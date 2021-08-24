import React from "react";
import { H2, ButtonBar, PrimaryButton, LinkButton, P } from "./util";

export default function CreateHomePage() {
  return (
    <div>
      <H2>Create an examroom homepage</H2>
      <P>
        The examroom will be visible for your students. Therefore, it is
        important that they can see the purpose of the examroom from its home
        page.
      </P>
      <P>
        You can use the recommended homepage or skip this step if you have
        created it by yourself
      </P>
      <ButtonBar>
        <PrimaryButton>Add the recommended homepage</PrimaryButton>
        <LinkButton>Skip this step</LinkButton>
      </ButtonBar>
    </div>
  );
}

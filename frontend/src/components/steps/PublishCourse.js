import React from "react";
import { H2, ButtonBar, PrimaryButton, P } from "./util";

export default function PublishCourse() {
  return (
    <div>
      <H2>Publish the examroom</H2>
      <P>The examroom needs to be published in order to import exams to it</P>
      <P>Once it is published, the registred students will have access</P>

      <ButtonBar>
        <PrimaryButton type="button">Publish examroom</PrimaryButton>
      </ButtonBar>
    </div>
  );
}

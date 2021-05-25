import React from "react";
import { Container, CTAButton } from "./styled";

function CreateAssignment({ onCreate }) {
  return (
    <Container>
      <h2>Create assignment</h2>
      <p>
        By pushing this button, an assigment will be created and connected to
        the scanned exam system Windream by an unique identifier for the exam.
        When an assignment has been created, this step will disappear from the
        process and you will see the upload window instead.
      </p>
      <p>
        If you have any questions, or any problem arises, please contact{" "}
        <a href="mailto:it-support@kth.se">it-support@kth.se</a>!
      </p>
      <CTAButton next onClick={onCreate} type="submit">
        Create
      </CTAButton>
    </Container>
  );
}

export default CreateAssignment;

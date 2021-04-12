import React from "react";
import { Container, CTAButton } from "./styled";

function CreateAssignment({ onCreate }) {
  return (
    <Container>
      <h2>Create assignment</h2>
      <CTAButton next onClick={onCreate} type="submit">
        Create
      </CTAButton>
    </Container>
  );
}

export default CreateAssignment;

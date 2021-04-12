import React from "react";
import { Container, CTAButton } from "./styled";

function UploadScannedExams() {
  const onUpload = () => {};
  return (
    <Container>
      <h2>Upload scanned exams</h2>
      <CTAButton onClick={onUpload} type="submit">
        Upload
      </CTAButton>
    </Container>
  );
}

export default UploadScannedExams;

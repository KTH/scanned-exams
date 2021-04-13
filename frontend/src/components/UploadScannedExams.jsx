import React from "react";
import { Container, CTAButton } from "./styled";

function UploadScannedExams() {
  const onUpload = (e) => {};
  return (
    <Container>
      <h2>Upload scanned exams</h2>

      <CTAButton type="submit">
        <input type="file" onChange={onUpload} />
        Upload
      </CTAButton>
    </Container>
  );
}

export default UploadScannedExams;

import React from "react";
import { Container, CTAButton } from "./styled";

function UploadScannedExams({ onUpload }) {
  return (
    <Container>
      <h2>Upload scanned exams</h2>

      <CTAButton type="submit">
        <input type="file" onChange={onUpload} multiple />
        Upload
      </CTAButton>
    </Container>
  );
}

export default UploadScannedExams;

import React from "react";
import { Container, CTAButton } from "./styled";

function UploadScannedExams({ onUpload }) {
  return (
    <Container>
      <h2>Upload scanned exams</h2>
      <p>
        By pushing this button, every student in this course room that has a
        scanned exam in Windream will get the exam uploaded into the assignment
        created by the app. If the student is missing in Canvas, due to not
        being registered on the exam, the exam in Windream will not uploaded.
        Please note that registering for the course offering in Ladok is
        different from the exam which is called ”aktivitetstillfälle”. If the
        exam is missing in Windream, either by that the student didn’t write the
        exam or it hasn’t been scanned yet, nothing will be uploaded. If more
        exams are scanned into Windream after running the app for the first
        time, please run it again to import the newly scanned exams to the
        assigment.
      </p>
      <p>
        The assignment will also be published, which is needed by the app to be
        able to upload the files, but since the grade posting policy is set to
        ”Manual” the feedback won’t be visible to the student until you choose
        to post the grades. Please make sure that you have set the correct
        grading scheme since it’s not possible to change a grading scheme
        without having to re-grade all assignments. More info on grading schemes
        can be found{" "}
        <a
          rel="noreferrer"
          target="_blank"
          href="https://intra.kth.se/en/utbildning/e-larande/canvas/guider/omdomen/bedomningsoversikten-i-canvas-1.1035776"
        >
          here
        </a>
        . If a different grading scheme is used in Canvas compared to the one in
        Ladok, the grades won’t be transferable from Canvas with the app
        Transfer2Ladok.
      </p>
      <p>
        If you have any questions, or any problem arises, please contact
        <a href="mailto:it-support@kth.se">it-support@kth.se</a>!
      </p>
      <CTAButton onClick={onUpload} type="submit">
        Upload
      </CTAButton>
    </Container>
  );
}

export default UploadScannedExams;

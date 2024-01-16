import React from "react";
import "./UnauthenticatedApp.scss";

export default function UnauthenticatedApp({ courseId }: any) {
  return (
    <div className="container">
      <h1>KTH Import Exams</h1>
      <p>
        If you have conducted a written exam on paper and want to use
        SpeedGrader for the assessment, you can import the scanned exams to
        Canvas by using this app. Read more about{" "}
        <a
          target="_blank"
          className=""
          href="https://intra.kth.se/en/utbildning/examination/salskrivning/skannade/tentor-till-canvas-1.1085000"
        >
          KTH Import Exams on the KTH Intranet.
        </a>
      </p>
      <p>
        This app requires you to have a <b>teacher role</b> in this exam room.
      </p>
      <p>
        Please make sure that the exam administration is made aware well in
        advance of the exams being assessed in Canvas and not on paper, since
        this impacts the administrative process. If you have any questions,
        please contact <a href="mailto:it-support@kth.se">it-support@kth.se</a>!
      </p>
      <div className="">
        <form method="post" action="/scanned-exams/auth">
          <input name="courseId" type="hidden" value={courseId} />
          <button type="submit" className="kth-button primary">
            Launch app
          </button>
        </form>
      </div>
    </div>
  );
}

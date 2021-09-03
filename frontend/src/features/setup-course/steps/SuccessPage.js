import React from "react";
import { H2, P } from "./util";

export default function SuccessPage({ courseId }) {
  return (
    <div>
      <H2>Well played!</H2>
      <P>
        You have successfully created an exam room and published an assignment.
      </P>
    </div>
  );
}

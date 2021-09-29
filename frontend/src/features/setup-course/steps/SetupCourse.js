/* eslint-disable prettier/prettier */
import React from "react";
import { useMutateCourseSetup } from "../../../common/api";
import { P, H2, PrimaryButton } from "../../widgets";

export default function SetupCourse({ courseId }) {
  const createAssignmentMutation = useMutateCourseSetup(
    courseId,
    "create-assignment"
  );
  const setHomepageMutation = useMutateCourseSetup(courseId, "create-homepage");

  return (
    <div>
      <H2>Setup course</H2>
      <P>
        This examroom will be published and therefore visible for students. Do
        you want us to set a homepage for you or do you want to change it
        yourself?
      </P>
      <P>
        <input type="radio" name="create-homepage" value="yes" />
        <span>Use recommended homepage</span>

        <input type="radio" name="create-homepage" value="no" />
        <span>No</span>
      </P>

      <P>When you click the button below:</P>
      <ul>
        <li>Homepage will be replaced with the recommended page</li>
        <li>A special assignment called &quot;Scanned exams&quot; will be created</li>
      </ul>
      <P>Neither the examroom or assignment will be published in this step</P>
      <PrimaryButton>Setup courseroom</PrimaryButton>
    </div>
  );
}

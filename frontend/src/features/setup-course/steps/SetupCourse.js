/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import { useMutateCourseSetup } from "../../../common/api";
import { P, H2, PrimaryButton } from "../../widgets";

export default function SetupCourse({ courseId }) {
  const createAssignmentMutation = useMutateCourseSetup(
    courseId,
    "create-assignment"
  );
  const setHomepageMutation = useMutateCourseSetup(courseId, "create-homepage");

  const [recommendedHomepage, setRecommendedHomepage] = useState(true);

  return (
    <div className="max-w-2xl">
      <H2>Setup examroom</H2>
      <P>Choose one option to setup your examroom</P>
      <div className="my-8">
        <label
          htmlFor="create-homepage-yes"
          className="flex border rounded px-6 py-4 my-4 border-blue-500"
        >
          <input
            type="radio"
            id="create-homepage-yes"
            className="my-1 mr-2"
            checked
          />
          <div className="">
            <h3 className="font-semibold">Recommended setup</h3>
            <ul className="list-disc my-2 ml-6">
              <li className="p-1">Create a special assignment called "Scanned Exams"</li>
              <li className="p-1">Replace the existing homepage with a template</li>
            </ul>
          </div>
        </label>

        <label
          htmlFor="create-homepage-yes"
          className="flex border rounded px-6 py-4 my-4 border-gray-200"
        >
          <input type="radio" id="create-homepage-no" className="my-1 mr-2" />
          <div className="">
            <h3 className="font-semibold">Minimal setup</h3>
            <ul className="list-disc my-2 ml-6">
              <li className="p-1">Only create a special assignment called "Scanned Exams"</li>
            </ul>
          </div>
        </label>
      </div>
      <P>
        Note: neither the examroom or assignment will be published in this step
      </P>
      <PrimaryButton>Setup examroom</PrimaryButton>
    </div>
  );
}

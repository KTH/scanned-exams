import React from "react";
import { useQuery } from "react-query";
import { getCourse } from "../utils/apiClient";

function CallToAction({ courseId, onLaunch }) {
  const query = useQuery(["course", courseId], getCourse);

  const className = [
    "bg-blue-100 w-96 py-6 px-12 my-12 transition-opacity",
    query.isLoading && "opacity-0",
  ].join(" ");

  return (
    <div className={className}>
      <div className="text-2xl mb-2">
        {query.data?.courseCode} {query.data?.examCode}
      </div>
      <div>Exam date: {query.data?.examDate}</div>
      <div className="mt-8 mb-2">
        <strong>{query.data?.students}</strong> registered students
      </div>
      <button
        type="button"
        onClick={onLaunch}
        className="bg-blue-500 text-white rounded-md font-semibold w-full py-2 mt-3 mb-2 hover:bg-blue-700 transition-colors"
      >
        Launch app
      </button>
    </div>
  );
}

export default function Welcome({ courseId, onLaunch }) {
  return (
    <div className="max-w-screen-lg">
      <div className="text-4xl font-semibold mt-8 mb-4 tracking-tight">
        What is &quot;Import Scanned Exams&quot;?
      </div>
      <div className="my-6 text-2xl">
        Scanned exams, is an app made by e-learning team at KTH that lets you
        bring your scanned paper exams to Canvas. Then, you would be able to
        correct them using SpeedGrader
      </div>
      <CallToAction courseId={courseId} onLaunch={onLaunch} />
    </div>
  );
}

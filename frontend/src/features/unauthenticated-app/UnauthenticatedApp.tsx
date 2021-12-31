import React from "react";

export default function UnauthenticatedApp({ courseId }: any) {
  return (
    <div className="max-w-screen-lg">
      <div className="text-4xl font-semibold mt-8 mb-4 tracking-tight">
        Scanned Exams
      </div>
      <p className="my-6 text-xl">
        <b>Scanned Exams</b> imports scanned paper exams to Canvas allowing you
        to grade them using SpeedGrader. The app is maintained by the E-learning
        team at KTH.
      </p>
      <p className="my-6">
        This app requires you to have a <b>teacher role</b> in this exam room.
      </p>
      <div className="bg-blue-100 p-6 my-12 flex flex-row items-center justify-center">
        <form method="post" action="/scanned-exams/auth">
          <input name="courseId" type="hidden" value={courseId} />
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-md font-semibold w-56 py-2 hover:bg-blue-700 transition-colors"
          >
            Launch app
          </button>
        </form>
      </div>
    </div>
  );
}

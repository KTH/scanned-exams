import React from "react";

export default function CreateHomePage() {
  return (
    <div>
      <h2 className="font-semibold mt-4 mb-8 text-2xl">
        Create an examroom homepage
      </h2>
      <p className="mt-6">
        The examroom will be visible for your students. Therefore, it is
        important that they can see the purpose of the examroom from its home
        page.
      </p>
      <p className="mt-6">
        You can use the recommended homepage or skip this step if you have
        created it by yourself
      </p>
      <div className="mt-10">
        <button
          type="button"
          className="bg-blue-500 text-white rounded-md font-semibold py-2 px-6 mt-4 mb-2 hover:bg-blue-700 transition-colors mr-4"
        >
          Add the recommended homepage
        </button>

        <button
          type="button"
          className="text-blue-500 rounded-md font-semibold py-2 px-6 mt-4 mb-2 hover:text-blue-700 transition-colors ml-4"
        >
          Skip this step
        </button>
      </div>
    </div>
  );
}

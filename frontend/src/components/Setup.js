import React from "react";
import { Check } from "./icons";

export default function Setup({ courseId }) {
  return (
    <div className="container mx-auto">
      <div className="text-gray-500 mt-8 mb-6 pb-2 flex">
        <div className="flex-1">Scanned Exams / Setting up the examroom</div>
        <div className="flex-none">Carlos Saito | Logout</div>
      </div>
      <div className="flex">
        <div className="w-64 flex-none mr-16">
          <div className="mt-3">
            <div className="flex mb-6">
              <div className="flex-none mr-4 w-6 h-6 text-green-700">
                <Check />
              </div>
              <div>Create an examroom homepage</div>
            </div>
            <div className="flex mb-6 font-semibold">
              <div className="flex-none mr-4 w-6 h-6" />
              <div>Publish the examroom</div>
            </div>
            <div className="flex mb-6">
              <div className="flex-none mr-4 w-6 h-6" />
              <div>Create a special assignment</div>
            </div>
            <div className="flex">
              <div className="flex-none mr-4 w-6 h-6" />
              <div>Publish the special assignment</div>
            </div>
          </div>
        </div>
        <div>
          <h2 className="font-semibold mt-4 mb-8 text-2xl">
            Create an examroom homepage
          </h2>
          <p className="mt-6">
            The examroom will be visible for your students. Therefore, it is
            important that they can see the purpose of the examroom from its
            home page.
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
      </div>
    </div>
  );
}

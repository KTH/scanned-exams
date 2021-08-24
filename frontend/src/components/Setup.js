import React from "react";
import { Check } from "./icons";
import CreateHomePage from "./steps/CreateHomePage";

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
        <CreateHomePage />
      </div>
    </div>
  );
}

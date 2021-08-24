import React from "react";
import Stepper from "./Stepper";
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
          <Stepper
            steps={[
              {
                title: "Create an examroom homepage",
                done: true,
                current: false,
              },
              {
                title: "Publish the examroom",
                done: false,
                current: true,
              },
              {
                title: "Create a special assignment",
                done: false,
                current: false,
              },
              {
                title: "Publish the special assignment",
                done: false,
                current: false,
              },
            ]}
          />
        </div>
        <CreateHomePage />
      </div>
    </div>
  );
}

import React from "react";
import { Check } from "./icons";

export default function Stepper({ steps }) {
  return (
    <div className="mt-3">
      {steps.map((step) => (
        <div className={`flex mb-6 ${step.current && "font-semibold"}`}>
          <div className="flex-none mr-4 w-6 h-6 text-green-700">
            {step.done && <Check />}
          </div>
          <div>{step.title}</div>
        </div>
      ))}
    </div>
  );
}

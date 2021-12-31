import React from "react";
import { Check } from "./icons";

const ListContext = React.createContext(0);

export function StepList({ children, currentStep }: any) {
  return (
    <ListContext.Provider value={currentStep}>
      <ul className="flex w-full">{children}</ul>
    </ListContext.Provider>
  );
}

export function Step({ children, index, done }: any) {
  const currentStep = React.useContext(ListContext);

  return (
    <li
      className={`flex-1 flex text-sm py-3 border-b-2 ${
        currentStep === index && "border-blue-500"
      }`}
    >
      {done && (
        <div className="flex-none w-5 h-5">
          <Check />
        </div>
      )}
      <div className="flex-1 px-1 pr-3">{children}</div>
    </li>
  );
}

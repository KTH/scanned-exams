import React from "react";
import CreateHomePage from "./components/steps/CreateHomePage";
import PublishCourse from "./components/steps/PublishCourse";
import { Transition, TransitionElement } from "./components/Transition";

export default function App2() {
  const [currentStep, setCurrentStep] = React.useState(0);

  return (
    <div className="container mx-auto my-8">
      <div className="mb-8">
        <button type="button" onClick={() => setCurrentStep(0)}>
          1. Prepare the homepage
        </button>
        <button type="button" onClick={() => setCurrentStep(1)}>
          2. Publish examroom
        </button>
      </div>
      <Transition currentIndex={currentStep}>
        <TransitionElement index={0}>
          <CreateHomePage />
        </TransitionElement>
        <TransitionElement index={1}>
          <PublishCourse />
        </TransitionElement>
      </Transition>
    </div>
  );
}

import React from "react";
import CreateHomePage from "./components/steps/CreateHomePage";
import PublishCourse from "./components/steps/PublishCourse";

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
      {currentStep === 0 && <CreateHomePage />}
      {currentStep === 1 && <PublishCourse />}
    </div>
  );
}

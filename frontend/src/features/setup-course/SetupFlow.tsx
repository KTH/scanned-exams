import React from "react";
import CreateHomePage from "./steps/CreateHomePage";
import PublishCourse from "./steps/PublishCourse";
import CreateAssignment from "./steps/CreateAssignment";
import PublishAssignment from "./steps/PublishAssignment";
import classes from "./SetupFlow.module.scss";

/**
 * Return index of first item that evaluates to false
 * @param {Array} arr List of truthy expressions/variables
 * @returns
 */
function getIndexOfFirstFalse(arr: any) {
  return arr.findIndex((s: any) => !s);
}

export default function SetupScreen({
  coursePublished,
  assignmentCreated,
  assignmentPublished,
  courseId,
  anonymouslyGraded,
}: any) {
  const [homepageCreated, setHomepageCreated] = React.useState(coursePublished);

  // The
  const currentStep = getIndexOfFirstFalse([
    homepageCreated, //     0
    coursePublished, //     1
    assignmentCreated, //   2
    assignmentPublished, // 3
  ]);

  return (
    <div className="container mx-auto my-8">
      <ol className={classes.Stepper}>
        <li aria-current={currentStep === 0}>Prepare homepage</li>
        <li aria-current={currentStep === 1}>Publish examroom</li>
        <li aria-current={currentStep === 2}>Create assignment</li>
        <li aria-current={currentStep === 3}>Publish assignment</li>
      </ol>
      {currentStep === 0 && (
        <CreateHomePage
          courseId={courseId}
          onDone={() => setHomepageCreated(true)}
        />
      )}
      {currentStep === 1 && <PublishCourse courseId={courseId} />}
      {currentStep === 2 && (
        <CreateAssignment
          courseId={courseId}
          anonymouslyGraded={anonymouslyGraded}
        />
      )}
      {currentStep === 3 && <PublishAssignment courseId={courseId} />}
    </div>
  );
}

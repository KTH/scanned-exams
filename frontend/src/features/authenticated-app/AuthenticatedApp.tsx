import React from "react";
import { useCourseSetup } from "../../common/api";
import SetupFlow from "../setup-course/SetupFlow";
import ImportFlow from "../import-exams/ImportFlow";
import { LoadingPage } from "../widgets";

function isSetupRequired(courseSetup: any) {
  return !(
    courseSetup.coursePublished &&
    courseSetup.assignmentCreated &&
    courseSetup.assignmentPublished
  );
}

export default function AuthenticatedApp({ courseId }: any) {
  const query = useCourseSetup(courseId);

  const { isLoading, isError } = query;

  if (isLoading) {
    return <LoadingPage>Loading...</LoadingPage>;
  }

  if (isError) {
    throw query.error;
  }

  if (isSetupRequired(query.data)) {
    return (
      <SetupFlow
        courseId={courseId}
        coursePublished={query.data.coursePublished}
        assignmentCreated={query.data.assignmentCreated}
        assignmentPublished={query.data.assignmentPublished}
      />
    );
  }
  // When setup is complete we show the assignment import view
  return <ImportFlow courseId={courseId} />;
}

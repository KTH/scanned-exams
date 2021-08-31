import React from "react";
import { useCourseSetup } from "../../common/api";
import SetupScreen from "../setup-course/SetupScreen";

export default function AuthenticatedApp({ courseId }) {
  const query = useCourseSetup(courseId);

  if (query.isLoading) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    throw query.error;
  }

  return (
    <SetupScreen
      courseId={courseId}
      coursePublished={query.data.coursePublished}
      assignmentCreated={query.data.assignmentCreated}
      assignmentPublished={query.data.assignmentPublished}
    />
  );
}

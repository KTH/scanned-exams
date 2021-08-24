import React from "react";
import { useCourseSetup } from "../hooks/course";
import Setup from "../components/Setup";

export default function AuthenticatedApp({ courseId }) {
  const query = useCourseSetup(courseId);

  if (query.isLoading) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    throw query.error;
  }

  return (
    <Setup
      coursePublished={query.data.coursePublished}
      assignmentCreated={query.data.assignmentCreated}
      assignmentPublished={query.data.assignmentPublished}
    />
  );
}

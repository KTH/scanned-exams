import React from "react";
import { useCourseSetup } from "../../common/api";
import SetupScreen from "../setup-course/SetupScreen";
import UploadScreen from "../upload-exams/UploadScreen";
import { LoadingPage } from "../widgets";

export default function AuthenticatedApp({ courseId }) {
  const query = useCourseSetup(courseId);

  if (query.isLoading) {
    return <div>Loading...</div>;
    return <LoadingPage>Loading...</LoadingPage>;
  }

  if (query.isError) {
    throw query.error;
  }

  if (
    query.data.coursePublished &&
    query.data.assignmentCreated &&
    query.data.assignmentCreated
  ) {
    return <UploadScreen />;
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

import React from "react";
import { useCourseSetup } from "../hooks/course";

export default function AuthenticatedApp({ courseId }) {
  const query = useCourseSetup(courseId);

  if (query.isLoading) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    throw query.error;
  }

  return <div>You are logged in</div>;
}

import React from "react";
import { useUser } from "./hooks/user";
import Welcome from "./screens/Welcome";
import AuthenticatedApp from "./screens/AuthenticatedApp";

function getCourseId() {
  const urlParams = new URLSearchParams(window.location.search);

  return urlParams.get("courseId");
}

export default function App() {
  const query = useUser();
  const courseId = getCourseId();

  if (query.isLoading) {
    return <div />;
  }

  if (query.data) {
    return <AuthenticatedApp courseId={courseId} />;
  }

  return <Welcome courseId={courseId} />;
}

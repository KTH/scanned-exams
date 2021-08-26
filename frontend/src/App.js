import React from "react";
import { useUser } from "./hooks/api";
import Welcome from "./screens/Welcome";
import AuthenticatedApp from "./screens/AuthenticatedApp";

function getCourseId() {
  const urlParams = new URLSearchParams(window.location.search);

  if (!urlParams.has("courseId")) {
    throw new Error(
      "Missing URL parameter 'courseId'. This app should be launched from Canvas"
    );
  }

  return urlParams.get("courseId");
}

export default function App() {
  const { isLoading, data } = useUser();
  const courseId = getCourseId();

  if (isLoading) {
    return <div />;
  }

  if (data) {
    return <AuthenticatedApp courseId={courseId} />;
  }

  return <Welcome courseId={courseId} />;
}

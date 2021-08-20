import React from "react";
import { useQuery } from "react-query";
import { getUserData } from "./utils/apiClient";
import Welcome from "./screens/Welcome";

/*
function getCourseId() {
  const urlParams = new URLSearchParams(window.location.search);

  return urlParams.get("courseId");
}
*/

export default function App() {
  const query = useQuery("user", getUserData);
  // const courseId = getCourseId();

  if (query.isLoading) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    throw query.error;
  }

  if (query.data) {
    return <div>You are logged in</div>;
  }

  return <Welcome />;
}

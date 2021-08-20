import React from "react";
import { useQuery } from "react-query";
import { getUserData } from "./utils/apiClient";
import Welcome from "./screens/Welcome";

export default function App() {
  const query = useQuery("user", getUserData);

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

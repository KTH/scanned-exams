/* eslint-disable import/prefer-default-export */
import { useQuery } from "react-query";

async function fetchUser() {
  const response = await window.fetch("/scanned-exams/api/me");

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return response.json();
}

export function useUser() {
  const query = useQuery("user", fetchUser);

  if (query.isError) {
    throw query.error;
  }

  return query;
}

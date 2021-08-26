/* eslint-disable import/prefer-default-export */
import { useQuery } from "react-query";

async function fetchUser() {
  const response = await window.fetch("/scanned-exams/api/me");

  if (response.status === 404) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data.message);
    err.status = response.status;
    throw err;
  }

  return data;
}

export function useUser() {
  const query = useQuery("user", fetchUser);

  if (query.isError) {
    throw query.error;
  }

  return query;
}

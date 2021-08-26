import { useMutation, useQuery } from "react-query";

async function apiClient(
  endpoint,
  { method, ignoreNotFound, ...customConfig }
) {
  const config = {
    method: method || "GET",
    ...customConfig,
  };
  const response = await window.fetch(`/scanned-exams/api/${endpoint}`, config);
  const data = await response.json();

  if (ignoreNotFound && response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const err = new Error(data.message);
    err.status = response.status;
    throw err;
  }

  return data;
}

export function useCourseSetup(courseId) {
  return useQuery(["course", courseId, "setup"], () =>
    apiClient(`courses/${courseId}/setup`)
  );
}

export function useCourseExams(courseId) {
  return useQuery(["course", courseId, "exams"], () =>
    apiClient(`courses/${courseId}/exams`)
  );
}

export function useMutateCourseSetup(courseId, action, options = {}) {
  return useMutation(
    () =>
      apiClient(`courses/${courseId}/setup/${action}`, {
        method: "POST",
      }),
    options
  );
}

export function useUser() {
  const query = useQuery("user", apiClient(`me`, { ignoreNotFound: true }));

  if (query.isError) {
    throw query.error;
  }

  return query;
}

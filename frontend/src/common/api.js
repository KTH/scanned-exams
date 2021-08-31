import { useMutation, useQuery } from "react-query";

async function apiClient(
  endpoint,
  { method, ignoreNotFound, ...customConfig } = {}
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

/** Fetches the API to get information about the setup of a given course */
export function useCourseSetup(courseId) {
  return useQuery(["course", courseId, "setup"], () =>
    apiClient(`courses/${courseId}/setup`)
  );
}

/** Fetches the API to get information about the exams of a given course */
export function useCourseExams(courseId) {
  return useQuery(["course", courseId, "exams"], () =>
    apiClient(`courses/${courseId}/exams`)
  );
}

/** Performs one action to change the setup of a course */
export function useMutateCourseSetup(courseId, action, options = {}) {
  return useMutation(
    () =>
      apiClient(`courses/${courseId}/setup/${action}`, {
        method: "POST",
      }),
    options
  );
}

/**
 * Fetches the API to get information about the current user.
 *
 * If the user is logged out, field "data" will be null
 */
export function useUser() {
  return useQuery("user", () => apiClient(`me`, { ignoreNotFound: true }));
}

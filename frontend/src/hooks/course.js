import { useMutation, useQuery } from "react-query";

async function fetchCourse(courseId, endpoint) {
  const response = await window.fetch(
    `/scanned-exams/api/courses/${courseId}/${endpoint}`
  );

  if (response.status === 401) {
    throw new Error("You must be teacher or examiner to use this app");
  }

  if (!response.ok) {
    throw new Error("Something wrong happened");
  }

  return response.json();
}

async function changeCourseSetup(courseId, action) {
  const response = await window.fetch(
    `/scanned-exams/api/courses/${courseId}/setup/${action}`,
    {
      method: "post",
    }
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data);
  }

  return data;
}

export function useCourseSetup(courseId) {
  return useQuery(
    ["course", courseId, "setup"],
    () => fetchCourse(courseId, "setup"),
    {
      retry: false,
    }
  );
}

export function useCourseExams(courseId) {
  return useQuery(["course", courseId, "exams"], () =>
    fetchCourse(courseId, "exams")
  );
}

export function useMutateCourseSetup(courseId, action, options = {}) {
  return useMutation(() => changeCourseSetup(courseId, action), options);
}

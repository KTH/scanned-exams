import { useQuery } from "react-query";

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

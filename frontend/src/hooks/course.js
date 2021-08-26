import { useMutation, useQuery } from "react-query";

async function fetchCourse(courseId, endpoint) {
  const response = await window.fetch(
    `/scanned-exams/api/courses/${courseId}/${endpoint}`
  );

  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data);
    err.status = response.status;
    throw err;
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
    const err = new Error(data);
    err.status = response.status;
    throw err;
  }

  return data;
}

export function useCourseSetup(courseId) {
  return useQuery(["course", courseId, "setup"], () =>
    fetchCourse(courseId, "setup")
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

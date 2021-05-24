const courseId = window.COURSE_ID

export const getAssignment = async () =>
  await fetch(`/scanned-exams/api/assignment?courseId=${courseId}`, {
    headers: {
      Authorization: `Bearer ${process.env.REACT_APP_CANVAS_API_ADMIN_TOKEN}`,
    },
  });

export const createAssignment = async () =>
  await fetch(`/scanned-exams/api/assignment`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REACT_APP_CANVAS_API_ADMIN_TOKEN}`,
    },
    body: {
      courseId,
    },
  });

export const sendExam = async () =>
  await fetch(`/scanned-exams/api/exams`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REACT_APP_CANVAS_API_ADMIN_TOKEN}`,
    },
    body: {
      courseId,
    }
  });

export const uploadStatus = async () =>
  await fetch(`/scanned-exams/api/exams?courseId=${courseId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.REACT_APP_CANVAS_API_ADMIN_TOKEN}`,
    },
  });

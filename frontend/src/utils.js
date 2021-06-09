const courseId = window.COURSE_ID;

export const getAssignment = async () =>
  await fetch(`/scanned-exams/api/assignment?courseId=${courseId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.REACT_APP_CANVAS_API_ADMIN_TOKEN}`,
    },
  });

export const createAssignment = async () =>
  await fetch(`/scanned-exams/api/assignment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.REACT_APP_CANVAS_API_ADMIN_TOKEN}`,
    },
    body: JSON.stringify({
      courseId,
    }),
  });

export const sendExam = async () =>
  await fetch(`/scanned-exams/api/exams`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.REACT_APP_CANVAS_API_ADMIN_TOKEN}`,
    },
    body: JSON.stringify({
      courseId,
    }),
  });

export const uploadStatus = async () =>
  await fetch(`/scanned-exams/api/exams?courseId=${courseId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.REACT_APP_CANVAS_API_ADMIN_TOKEN}`,
    },
  });

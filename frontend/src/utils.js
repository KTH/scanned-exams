export const getAssignment = () => fetch("/scanned-exams/api/assignment", {
  headers: {
    "Authorization": `Bearer ${process.env.REACT_APP_CANVAS_API_ADMIN_TOKEN}`,
  }
});

export const createAssignment = () => fetch("/scanned-exams/api/assignment", {
    method: "POST",
    headers: {
        "Authorization": `Bearer ${process.env.REACT_APP_CANVAS_API_ADMIN_TOKEN}`,
    }
});

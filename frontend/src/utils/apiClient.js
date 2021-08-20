/* eslint-disable import/prefer-default-export */
export async function getUserData() {
  const response = await window.fetch("/scanned-exams/api/me");

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return response.json();
}

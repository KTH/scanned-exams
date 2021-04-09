/**
 * Store sessions data
 * - The "key" for each session is a canvas Token
 * - The "value" for each session is course data, uploading status, etc.
 */

const sessions = new Map();

// In development mode, we create a special session that is mapped with a test
// course

if (process.env.NODE_ENV === "development") {
  sessions.set(process.env.CANVAS_API_ADMIN_TOKEN, {
    courseId: 30247,
    examination: {
      courseCode: "XY0101",
      examCode: "ZZZ1",
      examDate: "2100-01-01",
    },
    state: "idle",
    error: null,
  });
}

/**
 * Returns the session information for a given request.
 *
 * If there is no session stored, this function returns null and prepares
 * the response with a 401 Unauthorized.
 */
function getSession(req, res) {
  const auth = req.get("authorization");
  if (auth && auth.startsWith("Bearer")) {
    const token = auth.slice(6).trim();
    const session = sessions.get(token);

    if (session) {
      return session;
    }
  }

  res.status(401).send({ message: "Unauthorized" });

  return null;
}

module.exports = {
  getSession,
};

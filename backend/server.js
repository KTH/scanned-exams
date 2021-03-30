const express = require("express");
const path = require("path");
const apiRouter = require("./api/router")

const PORT = 4000;
const server = express();

// Routes:
// - /           The welcome page
// - /api        API routes (only for authorized people)
// - /app        The React application (including all frontend artifacts
//               like CSS files)
// - /auth       routes for the authorization process
// - /_monitor   just the monitor page
server.get("/", (req, res) => {
  res.status(200).send("Yay");
});
server.get("/api", apiRouter)
server.use(
  "/app",
  express.static(path.join(__dirname, "..", "frontend", "build"))
);
server.get("/_monitor", (req, res) => {
  res.send("APPLICATION_STATUS: OK")
})

server.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

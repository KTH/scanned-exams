const express = require("express");
const { Issuer, generators } = require("openid-client");
const router = express.Router();
const { URL } = require("url");
const canvas = require("../api/canvasApiClient");

const OAUTH_REDIRECT_URI = new URL(
  "/scanned-exams/auth/callback",
  process.env.SERVER_HOST_URL
);

const issuer = new Issuer({
  authorization_endpoint: new URL(
    "/login/oauth2/auth",
    process.env.CANVAS_API_URL
  ).toString(),
  token_endpoint: new URL(
    "/login/oauth2/token",
    process.env.CANVAS_API_URL
  ).toString(),
});
const client = new issuer.Client({
  client_id: process.env.CANVAS_DEVELOPER_KEY_ID,
  client_secret: process.env.CANVAS_DEVELOPER_KEY_SECRET,
  redirect_uris: [OAUTH_REDIRECT_URI],
});

router.post("/", (req, res) => {
  const state = generators.state();
  const url = client.authorizationUrl({
    state,
  });
  req.session.temporalState = state;

  res.redirect(url);
});

router.get("/callback", async (req, res) => {
  const tokenSet = await client.oauthCallback(OAUTH_REDIRECT_URI, req.query, {
    state: req.session.temporalState,
  });

  req.session.temporalState = undefined;

  // TODO: Verify if user is "acting as"
  // TODO: What happens if there is no "tokenSet"?
  const roles = await canvas.getRoles(req.session.courseId, tokenSet.user.id);

  // 4 = teacher, 10 = examiner
  if (roles.includes(4) || roles.includes(10)) {
    req.session.userId = tokenSet.user.id;
    return res.redirect("/scanned-exams/app");
  }

  // TODO: Create a better "unauthorized" page
  res.status(403).send("You should be a teacher or examiner to use this app");
});

module.exports = router;

const express = require("express");
const { Issuer, generators } = require("openid-client");
const router = express.Router();
const { URL } = require("url");

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
    courseId: req.body.courseId,
    state,
  });

  res.cookie("scanned_exams_state", state).redirect(url);
});

router.get("/callback", async (req, res) => {
  const tokenSet = await client.oauthCallback(OAUTH_REDIRECT_URI, req.query, {
    state: req.cookies["scanned_exams_state"],
  });

  // At this point we have the users' access token.
  // console.log(tokenSet.access_token);
  // TODO: verify user identity and permissions based on req.query.courseId and tokenSet.user

  res.redirect("/scanned-exams/app");
});

module.exports = router;

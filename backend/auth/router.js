const express = require("express");
const { Issuer, generators } = require("openid-client");

const router = express.Router();
const { URL } = require("url");
const log = require("skog");

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

  req.session.temporalCourseId = req.body.courseId;
  req.session.temporalState = state;

  res.redirect(url);
});

router.get("/callback", async (req, res) => {
  try {
    const tokenSet = await client.oauthCallback(OAUTH_REDIRECT_URI, req.query, {
      state: req.session.temporalState,
    });

    // TODO: What happens if there is no "tokenSet"?
    // TODO: What happens if the user clicks "not authorize"?
    // TODO: Verify if user is "acting as"

    req.session.temporalState = undefined;
    req.session.userId = tokenSet.user.id;

    const courseId = req.session.temporalCourseId;
    req.session.temporalCourseId = undefined;

    res.redirect(`/scanned-exams/app?courseId=${courseId}`);
  } catch (err) {
    log.error({ err });
    res
      .status(500)
      .send(
        "Unknown error when accessing /auth/callback. Please contact IT support"
      );
  }
});

module.exports = router;

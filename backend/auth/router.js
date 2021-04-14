const express = require("express");
const { Issuer } = require("openid-client");
const router = express.Router();

const issuer = new Issuer({
  authorization_endpoint: "https://canvas.kth.se/oauth2",
});
const client = new issuer.Client({
  client_id: "999",
  client_secret: "XXX",
});
console.log(client.authorizationUrl({ nonce: "X" }));

router.post("/", (req, res) => {
  const value = req.cookies["scanned-exams-example"];
  res.send(`Hello from /auth/: ${value}`);
});

router.get("/callback", (req, res) => {
  //
});

module.exports = router;

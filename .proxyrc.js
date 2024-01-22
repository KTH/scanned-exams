/**
 * This file tells Parcel which requests should be proxied to the backend
 */

const { createProxyMiddleware } = require("http-proxy-middleware");

/** Returns true if a request should be proxied */
function filter(pathname, req) {
  return (
    pathname.startsWith("/scanned-exams/_") ||
    pathname.startsWith("/scanned-exams/api") ||
    pathname.startsWith("/scanned-exams/auth") ||
    req.method !== "GET"
  );
}

module.exports = function (app) {
  app.use(
    createProxyMiddleware(filter, {
      // The ́"xfwd" option adds "x-forwarded" headers to the proxied requests.
      // which allows backends to understand that a request comes from a proxy
      xfwd: true,
      target: "http://localhost:3000/",
    })
  );
};

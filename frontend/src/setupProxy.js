const { createProxyMiddleware } = require("http-proxy-middleware");

// Read: https://create-react-app.dev/docs/proxying-api-requests-in-development#configuring-the-proxy-manually
module.exports = function setupProxy(app) {
  const proxy = createProxyMiddleware({
    target: "https://localdev.kth.se:4444",
    changeOrigin: true,
    secure: false,
  });
  app.use("/scanned-exams/api", proxy);
  app.use("/scanned-exams/auth", proxy);
};

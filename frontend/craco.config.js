module.exports = {
  devServer: {
    allowedHosts: ["localdev.kth.se"],
    host: "localdev.kth.se",
    port: 4443,
    https: true,
    proxy: {
      "/scanned-exams": {
        target: "https://localdev.kth.se:4444",
        secure: false,
        bypass: function (req, res, proxyOptions) {
          if (
            req.method === "GET" &&
            !req.path.startsWith("/scanned-exams/api") &&
            !req.path.startsWith("/scanned-exams/auth")
          ) {
            // Only proxy requests for app resources
            return "/index.html";
          }
        },
      },
    },
  },
  style: {
    postcss: {
      // eslint-disable-next-line import/no-extraneous-dependencies
      plugins: [require("tailwindcss"), require("autoprefixer")],
    },
  },
};

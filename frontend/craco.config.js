module.exports = {
  devServer: {
    allowedHosts: ["localdev.kth.se"],
    host: "localdev.kth.se",
    port: 4443,
    https: true,
    proxy: {
      "/scanned-exams/api": "http://localhost:4444",
      "/scanned-exams/auth": "http://localhost:4444",
    },
  },
  style: {
    postcss: {
      // eslint-disable-next-line import/no-extraneous-dependencies
      plugins: [require("tailwindcss"), require("autoprefixer")],
    },
  },
};

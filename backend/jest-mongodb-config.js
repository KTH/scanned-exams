module.exports = {
  mongodbMemoryServerOptions: {
    binary: {
      version: "4.0.5",
      skipMD5: true,
    },
    instance: {},
    autoStart: false,
  },
  mongoURLEnvName: "MONGODB_CONNECTION_STRING",
};

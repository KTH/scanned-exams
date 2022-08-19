module.exports = {
  mongodbMemoryServerOptions: {
    instance: {},
    binary: {
      version: '4.4.0',
      skipMD5: true,
    },
    autoStart: false,
  },
  mongoURLEnvName: "MONGODB_CONNECTION_STRING",
};

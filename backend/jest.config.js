/*
## We are currently using JEST defaults
If you need to customise JEST config, be aware that:

- @shelf/jest-mongodb "If you have a custom jest.config.js make sure you remove testEnvironment property, otherwise it will conflict with the preset."
  https://github.com/shelfio/jest-mongodb
*/

module.exports = {
  preset: "@shelf/jest-mongodb",
};

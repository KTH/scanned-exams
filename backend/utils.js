const log = require("skog");

/**
 * Error handling
 */

function internalServerError(err, res) {
  log.error(err);
  res.status(500).send("");
}

function unauthorized(err, res) {
  log.error(err);
  res.status(401).json({
    message: "unauhtorized",
  });
}

module.exports = {
  internalServerError,
  unauthorized,
};

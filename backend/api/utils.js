const log = require("skog");

function handleUnexpectedError(err, req, res, next) {
  log.error(err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).send("Unexpected error. Please contact IT support");
}

module.exports = {
  handleUnexpectedError,
};

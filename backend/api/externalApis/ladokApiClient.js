const log = require("skog");
const got = require("got");
const {
  LadokApiError,
  OperationalError,
  RecoverableError,
} = require("../error");

let ladokGot;
function getLadokGot() {
  ladokGot =
    ladokGot ||
    got.extend({
      prefixUrl: process.env.LADOK_API_BASEURL,
      https: {
        pfx: Buffer.from(process.env.LADOK_API_PFX_BASE64, "base64"),
        passphrase: process.env.LADOK_API_PFX_PASSPHRASE,
      },
      headers: {
        Accept: "application/json",
      },
    });
  return ladokGot;
}

function ladokErrorHandler(err) {
  // First our handled errors (these are operatinal errors that are expected)
  /* ... */

  // And last our unhandled operational errors
  Error.captureStackTrace(err, ladokErrorHandler);
  const error = new LadokApiError({
    type: "unhandled_error",
    message:
      "We encountered an error when trying to access the external system Ladok",
    err,
  });
  throw error;
}

async function getAktivitetstillfalle(ladokId) {
  try {
    log.debug(`Getting information for aktivitetstillfälle ${ladokId}`);
    const res = await getLadokGot()
      .get(`resultat/aktivitetstillfalle/${ladokId}`)
      .then(() => {
        throw new Error("bombs away!");
      })
      .catch(ladokErrorHandler);
    const body = JSON.parse(res.body);

    return {
      activities: body.Kopplingar.map((k) => ({
        examCode: k.Aktivitet.Utbildningskod,
        courseCode: k.Kursinstans.Utbildningskod,
      })),
      examDate: body.Datumperiod.Startdatum,
    };
  } catch (err) {
    // Rethrow operational errors as is
    if (err instanceof OperationalError) {
      throw err;
    }
    // Programmer errors need to be logged and fixed
    Error.captureStackTrace(err);
    throw new RecoverableError({ err, details: { stuff: "to know" } });
  }
}

module.exports = {
  getAktivitetstillfalle,
};

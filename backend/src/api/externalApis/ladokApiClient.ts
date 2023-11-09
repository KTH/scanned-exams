import log from "skog";
import got from "got";
import { LadokApiError } from "../error";

/** Represents "ourself" in Ladok */
export interface AutentiseradAnvandare {
  Anvandarnamn: string;
}

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

// This got client is used to call the "Kataloginformation API".
// Note that it requires a specific `Accept` header
const gotClientKatalog = got.extend({
  prefixUrl: process.env.LADOK_API_BASEURL,
  headers: {
    Accept: "application/vnd.ladok-kataloginformation+json",
  },
  responseType: "json",
  https: {
    pfx: Buffer.from(process.env.LADOK_API_PFX_BASE64 as string, "base64"),
    passphrase: process.env.LADOK_API_PFX_PASSPHRASE,
  },
});

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

export async function getAktivitetstillfalle(ladokId) {
  log.debug(`Getting information for aktivitetstillfälle ${ladokId}`);
  const res = await getLadokGot()
    .get(`resultat/aktivitetstillfalle/${ladokId}`)
    .catch(ladokErrorHandler);

  const body = JSON.parse(res.body);

  return {
    activities: body.Kopplingar.map((k) => ({
      examCode: k.Aktivitet.Utbildningskod,
      courseCode: k.Kursinstans.Utbildningskod,
    })),
    examDate: body.Datumperiod.Startdatum,
  };
}

/**
 * Get information of "ourselves"
 */
export async function getAutentiserad() {
  return gotClientKatalog
    .get<AutentiseradAnvandare>(`kataloginformation/anvandare/autentiserad`)
    .then((response) => response.body);
}

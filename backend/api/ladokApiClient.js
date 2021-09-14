const log = require("skog");
const got = require("got");
const { assert } = require("./utils");

assert(
  process.env.LADOK_API_BASEURL !== undefined,
  "This app requires env-var LADOK_API_BASEURL to start."
);
assert(
  process.env.LADOK_API_PFX_BASE64 !== undefined,
  "This app requires env-var LADOK_API_PFX_BASE64 to start."
);
assert(
  process.env.LADOK_API_PFX_PASSPHRASE !== undefined,
  "This app requires env-var LADOK_API_PFX_PASSPHRASE to start."
);

const ladokGot = got.extend({
  prefixUrl: process.env.LADOK_API_BASEURL,
  https: {
    pfx: Buffer.from(process.env.LADOK_API_PFX_BASE64, "base64"),
    passphrase: process.env.LADOK_API_PFX_PASSPHRASE,
  },
  headers: {
    Accept: "application/json",
  },
});

async function getAktivitetstillfalle(ladokId) {
  log.info(`Getting information for aktivitetstillfälle ${ladokId}`);
  const res = ladokGot.get(`resultat/aktivitetstillfalle/${ladokId}`);
  const body = await res.json();

  return {
    activities: body.Kopplingar.map((k) => ({
      examCode: k.Aktivitet.Utbildningskod,
      courseCode: k.Kursinstans.Utbildningskod,
    })),
    examDate: body.Datumperiod.Startdatum,
  };
}

module.exports = {
  getAktivitetstillfalle,
};

const log = require("skog");
const got = require("got");

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

async function getAktivitetstillfalle(ladokId) {
  log.debug(`Getting information for aktivitetstillfälle ${ladokId}`);
  const res = getLadokGot().get(`resultat/aktivitetstillfalle/${ladokId}`);
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

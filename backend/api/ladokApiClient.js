const log = require("skog");
const got = require("got");

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

function removeDuplicates(arr) {
  return Array.from(new Set(arr.map(JSON.stringify))).map(JSON.parse);
}

async function getAktivitetstillfalle(ladokId) {
  log.info(`Getting information for aktivitetstillfälle ${ladokId}`);
  const res = ladokGot.get(`resultat/aktivitetstillfalle/${ladokId}`);
  const body = await res.json();

  const activities = body.Kopplingar.map((k) => ({
    examCode: k.Aktivitet.Utbildningskod,
    courseCode: k.Kursinstans.Utbildningskod,
  }));

  return {
    // When fetching Ladok asking which examCode-courseCode are associated
    // with one "aktivitetstillfälle", we might get the same pair of
    // courseCode-examCode. This is because the same course can have multiple
    // versions and in those cases every version is returned as a separate
    // element. Example:
    //   Try to GET https://api.integrationstest.ladok.se/resultat/aktivitetstillfalle/0aa3c265-9dce-11eb-863b-62bcffd242dd
    //   and look at "Kopplingar" in the body response
    // However, from our perspective all versions are identical so we can just
    // remove all duplicates safely.
    activities: removeDuplicates(activities),
    examDate: body.Datumperiod.Startdatum,
  };
}

module.exports = {
  getAktivitetstillfalle,
};

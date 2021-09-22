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
    activities: removeDuplicates(activities),
    examDate: body.Datumperiod.Startdatum,
  };
}

module.exports = {
  getAktivitetstillfalle,
};

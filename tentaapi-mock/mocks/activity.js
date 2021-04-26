/**
 * Get a Laodk aktivitetstillfälle given its uid
 * @param {string} uid Ladok's activitetstillfälle UID
 */
module.exports = function getActivity(uid) {
  if (uid !== "cfcb7186-94f1-4ad1-812d-1e2fba7b36d3") return {};

  return {
    aktivitetstillfallestypID: 135200,
    anmalan: true,
    anmalningsperiod: {
      slutdatum: "2050-12-15",
      startdatum: "2000-02-11",
      link: [],
    },
    anonymt: false,
    benamning: { sv: "Omtentamen", en: "Re-exam" },
    borttagen: false,
    datumperiod: {
      slutdatum: "2021-01-01", // IMPORTANT!!!
      startdatum: "2021-01-01", // IMPORTANT!!!
      link: [],
    },
    installd: false,
    kopplingar: [
      {
        aktivitet: {
          benamning: [
            { sprakkod: "sv", text: "Skriftlig tentamen", link: [] },
            { sprakkod: "en", text: "Written exam", link: [] },
          ],
          betygsskalaID: 131657, // IMPORTANT!!
          enhet: "HP",
          kravPaProjekttitel: false,
          omfattning: 6.0,
          uid: "00000008-73d8-11e8-b4e0-063f9afb40e3",
          utbildningUID: "00000007-73d8-11e8-afa7-8e408e694e54",
          utbildningskod: "ZZZ1", // IMPORTANT!!!
          versionsnummer: 1,
        },
        kursinstans: {
          benamning: [
            {
              sprakkod: "sv",
              text: "Organisk kemi, fortsättningskurs",
              link: [],
            },
            { sprakkod: "en", text: "Advanced Organic Chemistry", link: [] },
          ],
          betygsskalaID: 131657,
          enhet: "HP",
          omfattning: 7.5,
          uid: "c8ed16c0-db8e-11e8-b548-8cda89c64326",
          utbildningUID: "5d680b6b-73d8-11e8-afa7-8e408e694e54",
          utbildningskod: "XY0101", // IMPORTANT!!!
          versionsnummer: 3,
        },
      },
    ],
    uid: "cfcb7186-94f1-4ad1-812d-1e2fba7b36d3",
  };
};

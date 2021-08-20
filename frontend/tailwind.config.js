// eslint-disable-next-line import/no-extraneous-dependencies
const colors = require("tailwindcss/colors");

module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: colors.black,
      white: colors.white,
      gray: colors.trueGray,
      blue: {
        100: "#E0F5FF",
        200: "#94DCFF",
        300: "#33BDFF",
        400: "#0091D6",
        500: "#007CB7",
        600: "#006293",
        700: "#00517a",
        800: "#003956",
        900: "#002538",
      },
      green: colors.lime,
      yellow: colors.yellow,
      red: colors.red,
    },
    fontFamily: {
      sans: ["Open Sans", "Helvetica", "Arial"],
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};

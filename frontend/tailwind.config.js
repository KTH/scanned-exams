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
        // 600 or more distance: AAA
        // 500 distance: AA
        // 400 distance: AA-L
        //                 white  black
        100: "#E0F5FF", //        AAA
        200: "#94DCFF", //        AAA
        300: "#33BDFF", //        AAA
        400: "#0091D6", // AA-L   AA
        500: "#007CB7", // AA     AA
        600: "#006293", // AA     AA-L
        700: "#00517a", // AAA
        800: "#003956", // AAA
        900: "#002538", // AAA
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

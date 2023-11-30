const {
  mauve,
  mauveDark,
  blue,
  blueDark,
  orange,
  orangeDark,
  purple,
  purpleDark,
} = require("@radix-ui/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  plugins: [],
  theme: {
    extend: {
      colors: {
        ...mauve,
        ...renameKeys("mauve", mauveDark),
        ...blue,
        ...renameKeys("blue", blueDark),
        ...orange,
        ...renameKeys("orange", orangeDark),
        ...purple,
        ...renameKeys("purple", purpleDark),
      },
    },
  },
};

function renameKeys(name, colors) {
  return Object.fromEntries(
    Object.entries(colors).map(([key, value]) => {
      return [`${name}dark${key.replace(name, "")}`, value];
    }),
  );
}

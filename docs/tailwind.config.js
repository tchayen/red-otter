const { slate, slateDark } = require("@radix-ui/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  plugins: [],
  theme: {
    extend: {
      colors: {
        ...slate,
        ...renameKeys("slate", slateDark),
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

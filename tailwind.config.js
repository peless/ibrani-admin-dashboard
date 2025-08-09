/** @type {import('tailwindcss').Config} */

const { heroui } = require("@heroui/theme");

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/components/progress.js",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-green": "#AEC90B",
        "brand-green-highlight": "#C5E211",
        "brand-dark-green": "#D6DABF",
        "brand-dark-green-text": "#1D5C55",
        "brand-middle-gray": "#777777",
        "brand-light-gray": "#888888",
        "brand-dark-gray": "#555555",
        "brand-red": "#D32F2F",
        "brand-red-light": "#EF5350",
      },
    },
  },
  plugins: [heroui()],
  future: {
    hoverOnlyWhenSupported: true,
  },
  corePlugins: {
    preflight: true,
  },
};

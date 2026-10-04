import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        brand: ['"Playfair Display"', 'serif'],
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            primary: {
              50: "#eef6ff",
              100: "#d9ebff",
              200: "#bcddff",
              300: "#8ec8ff",
              400: "#59a9ff",
              500: "#4ca1f1", // Brand blue
              600: "#1b75d7",
              700: "#135cb5",
              800: "#144a8f",
              900: "#154077",
              DEFAULT: "#4ca1f1",
              foreground: "#ffffff",
            },
            focus: "#4ca1f1",
          },
        },
      },
    }),
  ],
};

export default config;

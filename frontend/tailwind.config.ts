import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "sans-serif"],
      },
      colors: {
        primary: "#2563eb",
        accent: "#f973w16",
        background: "#FFFFFF",
        "light-magenta-start": "#faccee",
        "light-magenta-end": "#f0d2dc",
        "dark-magenta-start": "#1e141e",
        "dark-magenta-end": "#140a14",
        "content-light": "#64505a",
        "content-dark": "#b496a0",
        offwhite: "#F0EDEE",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 135deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          850: "#0b1329",
          900: "#0f172a",
          950: "#090d16",
        },
        brand: {
          blue: "#2563eb",
          "blue-dark": "#1d4ed8",
          orange: "#f97316",
          "orange-dark": "#ea580c",
        },
      },
    },
  },
  plugins: [],
};
export default config;

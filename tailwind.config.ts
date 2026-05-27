import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        muted: "#627084",
        line: "#dbe3ee",
        panel: "#f7f9fc",
        brand: "#126b6f",
        accent: "#d96c3b"
      }
    }
  },
  plugins: []
};

export default config;

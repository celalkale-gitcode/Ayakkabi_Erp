import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}", // Özellik bazlı klasörlerimizi taraması için şart
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ERP'ye kurumsal bir hava katacak renkler
        primary: {
          DEFAULT: "#2563eb", // Mavi
          dark: "#1d4ed8",
        },
        secondary: {
          DEFAULT: "#64748b", // Gri/Slate
        },
        success: "#10b981",
        danger: "#ef4444",
      },
    },
  },
  plugins: [],
};

export default config;


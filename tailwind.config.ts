import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-base": "var(--bg-base)",
        "bg-elevated": "var(--bg-elevated)",
        "border-subtle": "var(--border-subtle)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        accent: {
          DEFAULT: "var(--accent-primary)",
          primary: "var(--accent-primary)",
          secondary: "var(--accent-secondary)",
        },
        brand: {
          50: "#eef2ff",
          100: "#d6e0ff",
          200: "#aebcff",
          300: "#8797ff",
          400: "#5d74f3",
          500: "#3a58d9",
          600: "#2b43ad",
          700: "#1f3182",
          800: "#142159",
          900: "#0a1233",
          DEFAULT: "#3a58d9",
        },
        surface: {
          DEFAULT: "#050910",
          foreground: "#e0e7ff",
        },
      },
    },
  },
  plugins: [],
};

export default config;

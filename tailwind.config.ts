import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FBFAF6",
        paper: "#F4F2EA",
        ink: "#1E2433",
        inkSoft: "#4B5266",
        gold: {
          DEFAULT: "#F2B705",
          dark: "#C99202",
          light: "#FBDD7E",
        },
        azul: {
          DEFAULT: "#1A3FA0",
          dark: "#102C78",
          light: "#5478D6",
        },
        rojo: {
          DEFAULT: "#D62839",
          dark: "#A91D2C",
          light: "#F0626F",
        },
        star: "#9AA3B2",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 8px 30px -10px rgba(30,36,51,0.15)",
        card: "0 2px 14px -4px rgba(30,36,51,0.10)",
      },
      keyframes: {
        ribbon: {
          "0%": { strokeDashoffset: "1200" },
          "100%": { strokeDashoffset: "0" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        ribbon: "ribbon 2.4s ease-out forwards",
        floaty: "floaty 6s ease-in-out infinite",
        pulseSoft: "pulseSoft 2.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

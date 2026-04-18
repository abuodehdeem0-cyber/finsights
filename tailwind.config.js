/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        noir: {
          black: "#000000",
          dark: "#0a0a0a",
          crimson: "#4a0f0f",
          crimsonLight: "#6b1515",
          crimsonGlow: "#8b1a1a",
          gray: "#d1d1d1",
          grayDark: "#8a8a8a",
          grayDarker: "#4a4a4a",
        },
        signal: {
          buy: "#22c55e",
          sell: "#ef4444",
          hold: "#f59e0b",
        },
      },
      boxShadow: {
        crimson: "0 0 20px rgba(74, 15, 15, 0.5), 0 0 40px rgba(74, 15, 15, 0.3)",
        "crimson-sm": "0 0 10px rgba(74, 15, 15, 0.4)",
        "crimson-lg": "0 0 30px rgba(74, 15, 15, 0.6), 0 0 60px rgba(74, 15, 15, 0.4)",
        glass: "0 8px 32px rgba(74, 15, 15, 0.3)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "noir-gradient": "linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #1a0a0a 100%)",
        "crimson-gradient": "linear-gradient(135deg, #4a0f0f 0%, #6b1515 50%, #4a0f0f 100%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(74, 15, 15, 0.4)" },
          "100%": { boxShadow: "0 0 30px rgba(74, 15, 15, 0.7), 0 0 50px rgba(74, 15, 15, 0.5)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-rtl'),
  ],
};

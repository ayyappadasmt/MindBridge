/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        calm: {
          50:  "#f0f4ff",
          100: "#e0eaff",
          200: "#c7d7fd",
          400: "#7da4f8",
          600: "#3b6ef5",
          800: "#1e3a8a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "breathe": "breathe 4s ease-in-out infinite",
        "fade-in": "fadeIn 0.4s ease-out",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%":       { transform: "scale(1.18)" },
        },
        fadeIn: {
          from: { opacity: 0, transform: "translateY(8px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
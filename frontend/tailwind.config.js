/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: { 50:"#eef2ff",100:"#e0e7ff",200:"#c7d2fe",300:"#a5b4fc",400:"#818cf8",500:"#3b5bdb",600:"#3451c7",700:"#2c44a8",800:"#253888",900:"#1e2d6e",950:"#141d4a" },
        teal:  { 50:"#f0fdfa",100:"#ccfbf1",200:"#99f6e4",300:"#5eead4",400:"#2dd4bf",500:"#14b8a6",600:"#0d9488",700:"#0f766e",800:"#115e59",900:"#134e4a",950:"#042f2e" },
        surface:{ 50:"#f8f9fc",100:"#f1f3f9",200:"#e4e7f0",300:"#d0d5e4",400:"#9ba3bb",500:"#6b7494",600:"#4e566e",700:"#363d54",800:"#242a3d",900:"#161b2e",950:"#0d1020" },
        danger: { 50:"#fff1f2",100:"#ffe4e6",200:"#fecdd3",300:"#fda4af",400:"#fb7185",500:"#f43f5e",600:"#e11d48",700:"#be123c",800:"#9f1239",900:"#881337",950:"#4c0519" },
        warning:{ 50:"#fffbeb",100:"#fef3c7",200:"#fde68a",300:"#fcd34d",400:"#fbbf24",500:"#f59e0b",600:"#d97706",700:"#b45309",800:"#92400e",900:"#78350f",950:"#451a03" },
        success:{ 50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",800:"#166534",900:"#14532d",950:"#052e16" },
      },
      fontFamily: {
        sans: ["'DM Sans'","system-ui","sans-serif"],
        mono: ["'JetBrains Mono'","monospace"],
      },
      fontSize: { "2xs": ["0.65rem",{lineHeight:"1rem"}] },
      boxShadow: {
        card:    "0 1px 3px 0 rgb(0 0 0/0.04),0 1px 2px -1px rgb(0 0 0/0.04)",
        "card-md":"0 4px 12px 0 rgb(0 0 0/0.06),0 2px 4px -1px rgb(0 0 0/0.04)",
        "card-lg":"0 8px 24px 0 rgb(0 0 0/0.08),0 4px 8px -2px rgb(0 0 0/0.06)",
        glow:    "0 0 20px 2px rgb(59 91 219/0.15)",
      },
      keyframes: {
        shimmer: {"0%":{backgroundPosition:"-200% 0"},"100%":{backgroundPosition:"200% 0"}},
        breathe: {"0%,100%":{transform:"scale(1)",opacity:"0.6"},"50%":{transform:"scale(1.15)",opacity:"0.9"}},
      },
      animation: {
        shimmer:"shimmer 1.8s linear infinite",
        breathe:"breathe 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

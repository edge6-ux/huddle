/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          0: "#0f0f0f",
          1: "#1a1a1a",
          2: "#242424",
          3: "#2e2e2e",
        },
        accent: {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
          muted: "#6366f120",
        },
      },
    },
  },
  plugins: [],
};

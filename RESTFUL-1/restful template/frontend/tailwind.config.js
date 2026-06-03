/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#D32F2F",
        secondary: "#1E3A5F",
        success: "#2E7D32",
        warning: "#FFB300",
        danger: "#C62828",
        accent: "#F57C00",
        background: "#F8FAFC",
      },
    },
  },
  plugins: [],
};

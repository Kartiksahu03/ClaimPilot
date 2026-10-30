/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sage: {
          50: "#f3f6f1",
          100: "#e7eee5",
          200: "#d1dfd0",
          500: "#78917e",
          600: "#617b68",
          700: "#4e6555",
          800: "#3e5144"
        },
        cream: "#f7f8f4",
        ink: "#25332b"
      },
      boxShadow: {
        soft: "0 10px 35px rgba(38, 51, 43, 0.06)"
      },
      borderRadius: {
        "4xl": "2rem"
      }
    }
  },
  plugins: []
};

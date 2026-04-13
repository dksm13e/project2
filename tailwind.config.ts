import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        fashion: "#bda889",
        home: "#7e8b6f",
        beauty: "#c3a29e",
        ink: "#1f1f1f"
      }
    }
  },
  plugins: []
} satisfies Config;

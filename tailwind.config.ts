import type { Config } from "tailwindcss"

export default {
  content: ["./src/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        filler: {
          green: "#22c55e",
          amber: "#f59e0b",
          grey: "#9ca3af"
        }
      }
    }
  },
  plugins: []
} satisfies Config

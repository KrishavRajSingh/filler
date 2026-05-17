import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "node:path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "tests/**/*.test.{ts,tsx}"]
  },
  resolve: {
    alias: [
      { find: /^~(.+)$/, replacement: path.resolve(__dirname, "src/$1") }
    ]
  }
})

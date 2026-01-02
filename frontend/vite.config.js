import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    watch: {
      usePolling: true, // Docker hot reload fix
    },
    proxy: {
      "/api": {
        target: "http://localhost:3001", // Docker: használj service nevet
        changeOrigin: true,
      },
    },
  },
})

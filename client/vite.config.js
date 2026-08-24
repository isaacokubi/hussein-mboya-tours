import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const apiTarget = process.env.VITE_DEV_API_TARGET || "http://localhost:5000";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },

    chunkSizeWarningLimit: 1000,
  },
});

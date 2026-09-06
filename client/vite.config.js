import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const apiTarget = env.VITE_DEV_API_TARGET || "http://localhost:5000";

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api": { target: apiTarget, changeOrigin: true, secure: false },
        "/socket.io": { target: apiTarget, changeOrigin: true, secure: false, ws: true },
      },
    },
    build: {
      target: "es2020",
      cssCodeSplit: true,
      sourcemap: false,
      assetsInlineLimit: 4096,
      reportCompressedSize: true,
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "query-vendor": ["@tanstack/react-query", "axios"],
            "ui-vendor": ["lucide-react", "react-toastify"],
            "charts-vendor": ["recharts"],
          },
        },
      },
      chunkSizeWarningLimit: 700,
    },
    esbuild: {
      legalComments: "none",
    },
  };
});

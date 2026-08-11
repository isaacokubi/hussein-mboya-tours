import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          // Core React
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/react-router/") ||
            id.includes("/react-router-dom/")
          ) {
            return "vendor-react";
          }

          // Data/API
          if (
            id.includes("/@tanstack/") ||
            id.includes("/axios/")
          ) {
            return "vendor-data";
          }

          // Charts
          if (id.includes("/recharts/")) {
            return "vendor-charts";
          }

          // Animations
          if (id.includes("/framer-motion/")) {
            return "vendor-motion";
          }

          // Sliders/carousels
          if (
            id.includes("/swiper/") ||
            id.includes("/swiper/")
          ) {
            return "vendor-swiper";
          }

          // Icons
          if (id.includes("/react-icons/")) {
            return "vendor-react-icons";
          }

          if (id.includes("/lucide-react/")) {
            return "vendor-lucide";
          }

          // Internationalization
          if (
            id.includes("/i18next/") ||
            id.includes("/react-i18next/")
          ) {
            return "vendor-i18n";
          }

          // Socket
          if (id.includes("/socket.io-client/")) {
            return "vendor-socket";
          }

          // Miscellaneous
          if (
            id.includes("/react-toastify/") ||
            id.includes("/react-helmet-async/")
          ) {
            return "vendor-misc";
          }

          return "vendor";
        },
      },
    },

    chunkSizeWarningLimit: 500,
  },
});

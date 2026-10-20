import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const apiTarget = env.VITE_DEV_API_TARGET || "http://localhost:5000";

  return {
    plugins: [
      react(),
      tailwindcss(),
      // Generate a service worker and web manifest so the already-visited app shell
      // and fingerprinted JS/CSS assets remain available when the network is lost.
      // API responses are deliberately not cached here: booking, payment, and tenant
      // data must not be replayed from a shared cache or exposed across tenant sessions.
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "auto",
        includeAssets: [],
        manifest: {
          name: "Global Tours",
          short_name: "Global Tours",
          description: "Tour operations and booking management",
          theme_color: "#047857",
          background_color: "#f8fafc",
          display: "standalone",
          start_url: "/",
          scope: "/",
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
          navigateFallback: "index.html",
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          // Do not cache API or Socket.IO requests. They contain private tenant
          // information and payment states must always be reconciled with the server.
        },
      }),
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
      // esbuild 0.28.x currently fails when asked to lower destructuring for
      // otherwise-compatible browser targets. All browsers previously targeted
      // by this project support destructuring, so preserve modern syntax during
      // the final Vite transpile instead of invoking the broken lowering path.
      target: "esnext",
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },

      chunkSizeWarningLimit: 1000,
    },
  };
});

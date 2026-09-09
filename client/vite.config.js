import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const apiTarget = env.VITE_DEV_API_TARGET || "http://localhost:5000";

  return {
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

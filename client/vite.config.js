/**
 * Purpose: vite.config client application module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { defineConfig, loadEnv } from "vite";
// Load @vitejs/plugin-react so this module can use its exported dependencies.
import react from "@vitejs/plugin-react";
// Load @tailwindcss/vite so this module can use its exported dependencies.
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  // Declare env for use by the surrounding module or function.
  const env = loadEnv(mode, ".", "");
  // Declare apiTarget for use by the surrounding module or function.
  const apiTarget = env.VITE_DEV_API_TARGET || "http://localhost:5000";

  // Return the object assembled below to the caller.
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

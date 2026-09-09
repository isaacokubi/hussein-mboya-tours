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
      // esbuild 0.28.x can reject destructuring even though every configured
      // browser target already supports it. Explicitly mark the feature as
      // supported so the secure esbuild version does not attempt an impossible
      // lowering during Vite's final transpile step.
      target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
      esbuildOptions: {
        supported: {
          destructuring: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },

      chunkSizeWarningLimit: 1000,
    },
  };
});

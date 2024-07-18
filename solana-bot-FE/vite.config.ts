import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import type { UserConfig as VitesUserConfigInterface } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

// https://vitejs.dev/config/
const vitestConfig: VitesUserConfigInterface = {
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["src/setupTest.ts"],
  },
};

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
  ],
  test: vitestConfig.test,
  server: {
    port: 3000,
    host: "0.0.0.0",
    hmr: {
      overlay: false
    }
  },
  resolve: {
    alias: {
      src: "/src",
      process: "process/browser",
      crypto: 'crypto-browserify',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true
        })
      ]
    }
  }
});

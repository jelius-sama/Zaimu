import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [solid(), nodePolyfills()],
  build: {
    outDir: "dist",
    assetsDir: "src"
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "~": path.resolve(__dirname, "..", "config"),
    },
  },
})

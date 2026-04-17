import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: "dist",
    emptyOutDir: true
  },
  server: {
    proxy: {
      "/api/documents": {
        target: "http://localhost:3001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/documents/, "")
      }
    }
  }
});

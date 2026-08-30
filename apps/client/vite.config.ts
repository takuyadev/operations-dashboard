import { fileURLToPath, URL } from "node:url";

import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    strictPort: true,
  },
  plugins: [reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
});

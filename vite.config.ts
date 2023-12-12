import { resolve } from "node:path";
import { defineConfig } from "vite";
import typescript from "@rollup/plugin-typescript";

export default defineConfig({
  build: {
    rollupOptions: {
      plugins: [typescript({ tsconfig: "./tsconfig.json" })],
    },
    lib: {
      name: "Red Otter",
      formats: ["es"],
      entry: resolve(__dirname, "src/index.ts"),
    },
  },
});

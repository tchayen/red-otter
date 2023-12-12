import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import typescript from "@rollup/plugin-typescript";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      name: "RedOtter",
      fileName: () => `index.js`,
    },
  },
  // @ts-expect-error dts types were not updated to vite 5.
  plugins: [dts({ include: "src", rollupTypes: true })],
});

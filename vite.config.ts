import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: [resolve(__dirname, "src/index.ts")],
      fileName: (format) => `redotter.${format}.js`,
      formats: ["es"],
      name: "RedOtter",
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
    }),
  ],
});

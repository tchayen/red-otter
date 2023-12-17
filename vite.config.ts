import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      // fileName: () => `index.js`,
      formats: ["es"],
      name: "RedOtter",
    },
    outDir: ".sandpack-files",
  },
  // @ts-expect-error dts types were not updated to vite 5.
  plugins: [dts({ include: "src", outDir: ".sandpack-files" })],
});

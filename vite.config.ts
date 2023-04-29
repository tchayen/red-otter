import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "umd"],
      name: "RedOtter",
    },
  },
  plugins: [
    dts({
      // Because tsconfig.json includes docs/ and examples/, we cannot let dts
      // use it (which happens by default).
      include: ["src"],
    }),
  ],
});

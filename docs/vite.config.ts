import { fileURLToPath } from "url";
import { defineConfig, Plugin } from "vite";

/**
 * Vite plugin to configure esbuild to use the `f` function as the JSX factory.
 */
function jsx(): Plugin {
  return {
    name: "jsx",
    config() {
      return {
        esbuild: {
          jsxFactory: "ę",
        },
      };
    },
  };
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
      },
    },
  },
  plugins: [jsx()],
});

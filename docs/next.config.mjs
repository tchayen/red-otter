import { SearchWebpackPlugin } from "./SearchWebpackPlugin.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import addMdx from "@next/mdx";
import remarkGfm from "remark-gfm";
import rehypeMdxCodeProps from "rehype-mdx-code-props";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, options) => {
    if (options.nextRuntime !== "edge" && options.isServer) {
      config.plugins ||= [];
      config.plugins.push(new SearchWebpackPlugin());
    }

    return {
      ...config,
      resolve: {
        ...config.resolve,
        fallback: {
          react: path.resolve(__dirname, "node_modules/react"),
          "react/jsx-dev-runtime": path.resolve(__dirname, "node_modules/react/jsx-dev-runtime.js"),
        },
      },
    };
  },
};

export default addMdx({
  extension: /\.mdx?$/,
  options: {
    rehypePlugins: [rehypeMdxCodeProps],
    remarkPlugins: [remarkGfm],
  },
})(nextConfig);

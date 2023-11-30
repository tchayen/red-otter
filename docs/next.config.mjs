import path from "path";
import { fileURLToPath } from "url";
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
  webpack: (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        fallback: {
          "react/jsx-dev-runtime": path.resolve(
            __dirname,
            "node_modules/react/jsx-dev-runtime.js",
          ),
          react: path.resolve(__dirname, "node_modules/react"),
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
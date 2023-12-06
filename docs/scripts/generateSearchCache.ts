import fs from "node:fs";
import { compile } from "@mdx-js/mdx";
import { transformAsync } from "@babel/core";
import vm from "node:vm";
import path from "node:path";
import { renderToString } from "react-dom/server";
import React from "react";

const searchableFiles = [
  "api/page.mdx",
  "layout/page.mdx",
  "renderer/page.mdx",
  "renderer/page.mdx",
  "roadmap/page.mdx",
  "page.mdx",
];

const result = searchableFiles.map(async (file) => {
  const content = fs.readFileSync(import.meta.dir + "/../app/" + file, "utf8");
  const jsx = await compile(content);
  const { code } = await transformAsync(jsx.value, {
    plugins: ["@babel/plugin-transform-modules-commonjs"],
    presets: ["@babel/preset-react"],
  });
  const script = new vm.Script(code);
  const module = { exports: {} };
  const context = vm.createContext({
    React,
    exports: module.exports,
    module,
    require: (name: string) => {
      try {
        return require(name);
      } catch {
        if (name === "../PackageJson") {
          return require(path.resolve(path.join("app", file, "..", name)));
        }
        return require(path.resolve(path.join("app", "empty")));
      }
    },
  });

  console.log(`Processing ${file}...`);
  script.runInContext(context);
  const element = React.createElement(module.exports.default);
  const renderedContent = renderToString(element);
  console.log(renderedContent);
});

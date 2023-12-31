import { evaluateSync } from "@mdx-js/mdx";
import { myComponents } from "../../mdx-components";
import { Fragment, createElement } from "react";

/**
 * When Markdown needs to be rendered from a string.
 */
export function Markdown({ children }: { children: string }) {
  const jsxContent = evaluateSync(children, {
    Fragment,
    format: "md",
    jsx: createElement,
    jsxs: createElement,
  });

  const Content = jsxContent.default;

  return <Content components={myComponents} />;
}

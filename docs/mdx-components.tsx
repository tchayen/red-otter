import type { MDXComponents } from "mdx/types";
import { A, H2, H4, Li, Ol, P, Strong, Ul, Code, H1, H3, Box, Hr } from "./app/components/tags";
import { Enums } from "./app/components/Enums";
import { CodeBlock } from "./app/components/CodeBlock";

export const myComponents = {
  A,
  Box,
  Code,
  Enums,
  a: A,
  blockquote: Box,
  code: Code,
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  hr: Hr,
  li: Li,
  ol: Ol,
  p: P,
  pre: CodeBlock,
  strong: Strong,
  ul: Ul,
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    ...myComponents,
  };
}

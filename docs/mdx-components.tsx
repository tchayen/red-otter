import type { MDXComponents } from "mdx/types";
import {
  A,
  H2,
  H4,
  Img,
  Li,
  Ol,
  P,
  Strong,
  Ul,
  Code,
  H1,
  H3,
  Box,
  Hr,
} from "./app/components/tags";
import { Enums } from "./app/components/Enums";
import { CodeBlock } from "./app/components/CodeBlock";
import { Blogpost } from "./app/components/Blogpost";

export const myComponents = {
  A,
  Blogpost,
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
  img: Img,
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

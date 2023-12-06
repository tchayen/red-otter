import type { MDXComponents } from "mdx/types";
import { A, H2, H4, Li, Ol, P, Strong, Ul, Code, H1, H3, Box, Hr } from "./app/tags";
import { TypeTable } from "./app/TypeTable";
import { Enums } from "./app/Enums";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    A,
    Box,
    Code,
    Enums,
    TypeTable,
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
    pre: Code,
    strong: Strong,
    ul: Ul, // Used in maps to manually create external link to local page.
  };
}

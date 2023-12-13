import hljs from "highlight.js";
import type { HTMLAttributes, PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";
import { jetBrainsMono } from "./tags";
import * as prettier from "prettier";
import { CopyCode } from "./CopyCode";

export const CHARACTER_LIMIT = 76;

export async function CodeBlock({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  if (!children) {
    return null;
  }

  let language = null;

  if (typeof children !== "object" || !("props" in children)) {
    return (
      <DivWrapper>
        <Pre>{children}</Pre>
      </DivWrapper>
    );
  }

  let code = children.props.children;

  try {
    language = children.props.className.replace(/language-/, "");
  } catch {
    /* empty */
  }

  // Wrap comments longer than line length.
  if (code) {
    code = wrapComments(code);
  }

  if (language === "zig") {
    language = "c";
  }

  if (language === "wgsl") {
    language = "rust";
  }

  if (!language) {
    return (
      <DivWrapper>
        <Pre>{code}</Pre>
      </DivWrapper>
    );
  }

  try {
    code = await prettier.format(code, { parser: "babel-ts", printWidth: 80 });
  } catch {
    /* empty */
  }

  try {
    code = highlight(code, language);
  } catch {
    /* empty */
  }

  return (
    <DivWrapper className={className}>
      <CopyCode code={children.props.children} />
      <div className="pointer-events-none select-none pl-2 pt-2 text-xs text-mauvedark10">
        {prettyPrint(language)}
      </div>
      <Pre dangerouslySetInnerHTML={{ __html: code }} />
    </DivWrapper>
  );
}

function prettyPrint(language: string) {
  switch (language) {
    case "ts":
      return "TypeScript";
    case "js":
      return "JavaScript";
    case "tsx":
      return "TypeScript";
  }
}

function wrapComments(code: string) {
  return code
    .split("\n")
    .map((line: string) => {
      if (line.match(/^\s*\/\//) && line.length > CHARACTER_LIMIT) {
        const words = line.split(" ");
        let text = "";
        const indentation = line.match(/^\s*/)?.[0] ?? "";

        for (const word of words) {
          const lastLineLength = (text.split("\n").pop() ?? []).length;
          if (lastLineLength + word.length > CHARACTER_LIMIT) {
            text += `\n${indentation}// `;
          }
          text += word + " ";
        }
        return text;
      }
      return line;
    })
    .join("\n");
}

function highlight(code: string, language: string) {
  return hljs.highlight(code, { language }).value;
}

function Pre({ children, ...rest }: HTMLAttributes<HTMLPreElement>) {
  return (
    <pre
      className={twMerge(
        jetBrainsMono.className,
        "scrollbar hljs codeblock overflow-x-auto p-4 pt-2 text-sm leading-[19px]",
      )}
      style={{ fontVariantLigatures: "none" }}
      {...rest}
    >
      {children}
    </pre>
  );
}

function DivWrapper({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={twMerge(
        "relative my-5 overflow-hidden rounded-lg border border-mauvedark5 bg-mauvedark2",
        className,
      )}
    >
      {children}
    </div>
  );
}

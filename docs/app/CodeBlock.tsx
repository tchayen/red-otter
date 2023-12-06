import hljs from "highlight.js";
import type { HTMLAttributes } from "react";
import { JetBrains_Mono } from "next/font/google";
import { twMerge } from "tailwind-merge";

export const CHARACTER_LIMIT = 76;

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
});

export function CodeBlock({ children, fileName }: { children?: any; fileName?: string }) {
  let language = null;
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
    code = highlight(code, language);
  } catch {
    /* empty */
  }

  console.log({ code });

  return (
    <DivWrapper>
      <Pre dangerouslySetInnerHTML={{ __html: code }} />
    </DivWrapper>
  );
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
        "hljs codeblock overflow-x-auto p-4 text-sm leading-[19px] subpixel-antialiased",
      )}
      style={{ fontVariantLigatures: "none" }}
      {...rest}
    >
      {children}
    </pre>
  );
}

function DivWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative my-5 overflow-hidden border-x-0 border-y border-mauvedark6 bg-mauvedark2 md:rounded-lg md:border-x">
      {children}
    </div>
  );
}

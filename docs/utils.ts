import { format } from "prettier/standalone";
import parserTypeScript from "prettier/parser-typescript";
import parserHtml from "prettier/parser-html";
import hljs from "highlight.js";

// Copied over from lib package.
export function invariant(value: unknown, message?: string): asserts value {
  if (!value) {
    throw new Error(message);
  }
}

export function toURLSafe(value: string): string {
  return value.replaceAll(" ", "-").toLowerCase();
}

export function formatCode(value: string, language: string): string {
  switch (language) {
    case "typescript":
      return format(value, {
        parser: "typescript",
        plugins: [parserTypeScript],
      });
    case "html":
      return format(value, {
        parser: "html",
        plugins: [parserHtml],
      });
    default:
      return value;
  }
}

export function codeExample(
  value: string,
  options: {
    language: string;
    fileName?: string;
    showLines?: boolean;
  }
): string {
  const language = options?.language ?? "typescript";
  const formatted = formatCode(value, language);

  const highlighted =
    language === "typescript" || language === "html"
      ? hljs.highlight(formatted, { language: language }).value
      : formatted;

  return `${
    options?.fileName
      ? `<div class="code-filename">${options.fileName}</div>`
      : ""
  }<div class="code-block-with-lines">
   ${
     options?.showLines
       ? `<div class="code-lines">${formatted
           .trim()
           .split("\n")
           .map((_, i) => `<div>${i + 1}</div>`)
           .join("")}</div>`
       : ""
   }
    <pre><code class="language-${language}">${highlighted}</code></pre>
  </div>`;
}

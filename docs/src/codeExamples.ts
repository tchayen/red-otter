// eslint-disable-next-line import/default
import prettier from "prettier/standalone";
import parserTypeScript from "prettier/parser-typescript";
import parserHtml from "prettier/parser-html";
import parserBabel from "prettier/parser-babel";
import hljs from "highlight.js";

export function formatCode(value: string, language: string): string {
  switch (language) {
    case "typescript":
      return prettier.format(value, {
        parser: "typescript",
        plugins: [parserTypeScript, parserBabel],
      });
    case "html":
      return prettier.format(value, {
        parser: "html",
        plugins: [parserHtml],
      });
    case "json":
      return prettier.format(value, {
        parser: "json",
        plugins: [parserBabel],
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
    language === "typescript" || language === "html" || language === "json"
      ? hljs.highlight(formatted, { language: language }).value
      : formatted;

  return `${
    options?.fileName
      ? `<div class="code-filename">${options.fileName}</div>`
      : ""
  }<div class="code-block-with-lines${options?.fileName ? " with-file" : ""}">
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

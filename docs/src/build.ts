import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import hljs from "highlight.js";
import chalk from "chalk";

import typescript from "highlight.js/lib/languages/typescript";
import { PluginItem, transformSync } from "@babel/core";

import { fixtures } from "./examples";
import { toURLSafe } from "../utils";

import packageJson from "../../package.json";
import { extractExports } from "./extractExports";
import { codeExample, formatCode } from "./codeExamples";

const versionNumber = `v${packageJson.version}`;

const steps: { name: string; start: number }[] = [];
const headers: { level: number; slug: string; title: string }[] = [];

function step(name: string): void {
  const lastStep = steps.at(-1);
  const now = performance.now();

  if (lastStep) {
    const time = now - lastStep.start;
    console.debug(`${chalk.yellow(lastStep.name)} ${time.toFixed(2)}ms`);
  }

  steps.push({ name, start: now });
}

function addHeader(level: number, title: string): string {
  const slug = toURLSafe(title);
  headers.push({ level, slug, title });
  return `<h${level} id="${slug}"><a href="#${slug}">${title}</a></h${level}>`;
}

function linkExternal(url: string, text: string): string {
  return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
}

const commandSymbol = "⌘";

/**
 * Find functions that have their name end with `Example` and add a `code`
 * property.
 *
 * Example:
 *
 * ```js
 * function fooExample() {
 *   return 42;
 * }
 * ```
 *
 * Becomes:
 *
 * ```js
 * function fooExample() {
 *   return 42;
 * }
 * fooExample.code = "function fooExample() {\n  return 42;\n}\n";
 * ```
 */
function copyCodeBabelPlugin(): PluginItem {
  return {
    visitor: {
      FunctionDeclaration(path): void {
        const name = path.node.id?.name;
        if (name?.endsWith("Example")) {
          // Using this instead of path.toString(); so it includes the code as
          // it was, especially including new lines. Printing babel AST skips
          // all new lines (but keeps comments).
          const code = fixturesSource.slice(
            path.node.start ?? 0,
            path.node.end ?? 0
          );
          fixtureSources[name] = code;
        }
      },
    },
  };
}

function showCodeBlocks(): string {
  return fixtures
    .map((fixture) => {
      const { callback, title, description } = fixture;

      const lineWithLayout = fixtureSources[callback.name]
        .split("\n")
        .findIndex((line) =>
          line.includes("const layout = new Layout(context);")
        );

      const code = fixtureSources[callback.name]
        .split("\n")
        .slice(lineWithLayout + 1, -3) // Remove function declaration and return statement.
        .map((line) => line.replace(/^ {2}/, "")) // Remove indentation.
        .join("\n");

      const highlighted = codeExample(code, {
        language: "typescript",
        showLines: true,
      });

      const slug = toURLSafe(title);

      return `${addHeader(3, title)}
    <p>${description}</p>
    <div class="canvas">
      <canvas
        id="${slug}-canvas"
        width="${LAYOUT_WIDTH}"
        height="${LAYOUT_HEIGHT}"
      ></canvas>
      <button class="run-button" id="${slug}-button">Run</button>
    </div>
    <details class="code-details">
      <summary class="code-summary">Show code</summary>
      ${highlighted}
    </details>`;
    })
    .join("\n");
}

step("Start");

const LAYOUT_WIDTH = 800;
const LAYOUT_HEIGHT = 600;

hljs.registerLanguage("typescript", typescript);

const fixtureSources: Record<string, string> = {};

step("Transform examples file using Babel");
const fixturesSource = fs.readFileSync(
  `${__dirname}/../src/examples.tsx`,
  "utf8"
);

transformSync(fixturesSource, {
  presets: [["@babel/preset-typescript", { isTSX: true, allExtensions: true }]],
  parserOpts: { sourceType: "module" },
  plugins: [copyCodeBabelPlugin],
  ast: true,
  sourceMaps: true,
});

step("Extract API reference");

const layoutPath = path.resolve(path.join(__dirname, "../../src/Layout.ts"));
const contextPath = path.resolve(path.join(__dirname, "../../src/Context.ts"));
const fontPath = path.resolve(path.join(__dirname, "../../src/fonts/Font.ts"));
const fontAtlasPath = path.resolve(
  path.join(__dirname, "../../src/fonts/FontAtlas.ts")
);

const apiExports = extractExports([
  layoutPath,
  fontPath,
  contextPath,
  fontAtlasPath,
]);

function escapeDescription(description: string): string {
  return description
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll(
      /```.+\n([^`]+)```/g,
      (_, p1) =>
        `</p>${codeExample(p1.replaceAll("&lt;", "<").replaceAll("&gt;", ">"), {
          language: "typescript",
        })}<p>`
    )
    .replaceAll(/`([^`]+)`/g, "<code>$1</code>");
}

type Method = {
  name: string;
  returnType?: string;
  description: string;
  parameters: { name: string; type: string }[];
};

function formatConstructors(methods: Method[]): string {
  const constructors = methods.filter(
    (method) => method.name === "__constructor"
  );

  if (constructors.length === 0) {
    return "";
  }

  const effectiveConstructors =
    constructors.length === 1 ? constructors : constructors.slice(0, -1);

  return `${effectiveConstructors
    .map((constructor) => formatMethodName(constructor))
    .join("")}<p>${effectiveConstructors[0].description}</p>${
    methods.filter((method) => method.name !== "__constructor").length > 0
      ? '<div class="hr"></div>'
      : ""
  }`;
}

function formatMethodName(method: Method): string {
  const name = method.name === "__constructor" ? "constructor" : method.name;

  // I wrap each method in a fake class and run prettier on it to get line
  // breaks for longer method signatures. That's why I need to remove the first
  // and last line and trim the indentation.
  return `<pre class="code-header"><code>${formatCode(
    `class X {${name}(${method.parameters
      .map((p) => `${p.name}: ${p.type}`)
      .join(", ")})${method.returnType ? `: ${method.returnType}` : ""}}`,
    "typescript"
  )
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .split("\n")
    .slice(1, -2)
    .map((line) => line.replace(/^ {2}/, ""))
    .join("\n")
    .slice(0, -1)}</code></pre>`;
}

function showApiReferences(): string {
  return `${addHeader(3, "Style")}
  <p>Styling available for views.</p>
  <div class="style-table">
    ${apiExports.types
      .find((t) => t.name === "Style")
      ?.properties.map(
        (p) =>
          `<div>${p.name}</div><div>${p.type}</div><div>${escapeDescription(
            p.description
          )}</div>`
      )
      .join("")}
  </div>
  ${apiExports.classes
    .filter((c) => ["Layout", "Context", "Font", "FontAtlas"].includes(c.name))
    .map((c) => {
      return `${addHeader(3, c.name)}
      <p>${escapeDescription(c.description)}</p>
      <div class="hr"></div>
        ${formatConstructors(c.methods)}
        ${c.methods
          .filter((method) => method.name !== "__constructor")
          .map((method, i) => {
            const hr =
              i > 0 && i < c.methods.length - 1 ? '<div class="hr"></div>' : "";

            return `${hr}${formatMethodName(method)}<p>${escapeDescription(
              method.description
            )}</p>`;
          })
          .join("")}`;
    })
    .join("")}`;
}

step("Process layout file");

const replace = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Red Otter – documentation</title>
    <meta property="og:title" content="Red Otter – documentation" />
    <meta name="og:description" content="A self-contained WebGL flexbox layout engine." />
    <meta property="og:url" content="https://red-otter.dev" />
    <meta property="og:image" content="https://red-otter.dev/og.png" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@tchayen" />
    <meta name="twitter:creator" content="@tchayen" />
    <meta name="twitter:description" content="A self-contained WebGL flexbox layout engine." />
    <meta property="twitter:image" content="https://red-otter.dev/og.png" />
    <meta property="twitter:image:alt" content="Red Otter – logo" />
    <link rel="icon" type="image/png" sizes="32x32" href="/32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/16x16.png" />
    <meta name="theme-color" content="#0F172A" />
  </head>
  <body>
    <div id="content">
      <div id="logo">
        <img id="logo-img" src="/logo.svg" alt="Logo" />
        <span id="logo-title">Red Otter</span>
        <span id="logo-description">Otters are cute. Red cars are fast.</span>
      </div>
      ${addHeader(2, "Introduction")}
      <p>
        Red otter is a self-contained WebGL flexbox layout engine.
      </p>
      ${addHeader(3, "Features")}
      <ul>
        <li>
          <strong>Canvas-like WebGL renderer</strong> which supports text
          rendering and arbitrary polygons (by triangulating them).
        </li>
        <li>
          <strong>Text rendering</strong> is based on a font atlas texture that
          uses SDF (signed distance field). This allows for smooth scaling and
          upscaling up to some extent (see example below). You can see how the
          texture looks ${linkExternal("/font-atlas.png", "here")}.
        </li>
        <li>
          <strong>TTF file parser</strong> that produces glyph atlas texture.
          The parser is quite simple and definitely won't parse all possible TTF
          files, but work on support for more features is in progress.
        </li>
        <li>
          <strong>Layout engine</strong> which resembles ${linkExternal(
            "https://yogalayout.com",
            "Facebook Yoga"
          )}.
          as it roughly implements CSS-like flexbox layout. It supports most of
          the properties and has some limited styling capabilities. API is
          designed to resemble React Native styling.
        </li>
        <li>
        <strong>JSX</strong> support with DOM-like elements:
          <code>&lt;view&gt;</code>, <code>&lt;text&gt;</code>,
          <code>&lt;shape&gt;</code>.
        </li>
        <li>
          Full <strong>TypeScript</strong> support. IDE will guide through
          creating elements and applying styles. All incorrect props will be
          easily detected.
        </li>
        <li>
          <strong>No dependencies</strong>. The whole library is hand-crafted
          bare minimum of code required to do the job.
        </li>
      </ul>
      ${addHeader(3, "Why?")}
      <p>
        There are apps (probably not websites but <em>apps</em>) that require
        very minimal rendering overhead, maybe they need to be lightweight and
        don't care about having persistent component tree or local state
        management (or anyway they need a fine-grained, custom solution for
        this). I am not the first person to notice similar thing [<a
          href="https://twitter.com/trueadm/status/1633265334533648385"
          referrerpolicy="no-referrer"
          target="_blank"
          >1</a>].
      </p>
      <p>
        It's also very common need of game developers to have a capable UI
        library. For example
        <a
          href="https://docs.unity3d.com/2020.2/Documentation/Manual/UIE-LayoutEngine.html"
          referrerpolicy="no-referrer"
          target="_blank"
        >Unity UI Toolkit</a>
        is using Yoga as a layout engine, which should be a nice illustration why
        this library might be very useful for WebGL applications.
      </p>
      <p>
        If you find yourself writing some WebGL and at any point think "I wish
        there was a simple way to render text and maybe some UI on top of it",
        then this library might be for you.
      </p>
      <p>
        In terms of software philosophy, think about products such as
        ${linkExternal("https://warp.dev", "Warp")} or
        ${linkExternal("https://zed.dev", "Zed")}. They are extremely fast
        programs which implement their own GPU rendering.
      </p>
      ${addHeader(3, "What this is not")}
      <ul>
        <li>
          <strong>This is not React</strong>. There is no virtual DOM, no
          reconciliation, no state management. This is a layout engine, not a
          full-blown framework. For instance, there are no components, only
          elements (you can use <code>&lt;view&gt;</code> but cannot define your
          own <code>&lt;HeaderView&gt;</code>).
        </li>
      </ul>
      <ul>
        <li>
          <strong>Not suitable for making websites</strong>. It doesn't utilize
          DOM, has absolutely no accessibility support. It is created for making
          UIs for games and other UI-heavy applications and should work
          absolutely great there, but this is not general-purpose tool.
        </li>
        <li>
          A <strong>compiler</strong> or other metaprogramming-based solution.
          It is just a library which happens to use JSX which is supported by
          various bundlers and IDEs.
        </li>
      </ul>
      ${addHeader(3, "What is it then?")}
      <p>
        Think about it as a lightweight
        <a
          href="https://docs.unity3d.com/2020.2/Documentation/Manual/UIE-LayoutEngine.html"
          referrerpolicy="no-referrer"
          target="_blank"
        >Unity UI Toolkit</a>
        for WebGL. TypeScript-first
        <a
          href="https://github.com/ocornut/imgui"
          referrerpolicy="no-referrer"
          target="_blank"
        >Dear ImGui</a>
        .
      </p>
      <p>
        Those are bold claims and current state is far from it, but this
        actually gives a good picture of the roadmap.
      </p>
      ${addHeader(2, "Roadmap")}
      <p>
        Talking about roadmap, here is an unordered list of things that need a
        lot attention before the 1.0 release.
      </p>
      <ul>
        <li>
          Some missing layout features: <code>flex-wrap</code>,
          <code>flex-grow</code>, <code>flex-shrink</code>, <code>overflow:
          hidden</code>, <code>aspect-ratio</code>.
        </li>
        <li>
          <strong>Styling</strong>: <code>border-radius</code>,
          <code>border</code>, <code>box-shadow</code>, <code>opacity</code>.
        </li>
        <li>
          <strong>Interactivity</strong>: UI controls like button, text input.
        </li>
        <li>
          Better <strong>text rendering</strong>: test more fonts, nested text
          elements, text alignment.
        </li>
        <li>
          <strong>Benchmarks</strong>: start measuring performance, find weak
          spots and fix them.
        </li>
        <li>
          <strong>Accessibility</strong>: it will be a hard topic to cover and I
          might in the end abandon it, but I have some ideas about maintaining
          a mirror DOM tree for screen reader support.
        </li>
      </ul>
      ${addHeader(2, "Install")}
      ${codeExample(`yarn add red-otter`, { language: "bash" })}
      <p>
        To render text you will also need to generate the font atlas. See
        <a href="/#generating-font-atlas">guide</a>.
      </p>
      <p>
        For editor to correctly highlight TypeScript code, add to <code>compilerOptions</code> in <code>tsconfig.json</code>:
      </p>
      ${codeExample(
        `{
  "jsx": "react",
  "jsxFactory": "ę"
}`,
        { language: "json" }
      )}
      ${addHeader(2, "Examples")}
      <p>All code present below follows similar pattern:</p>
      ${codeExample(
        `import { Font, Context, Layout } from "red-otter";

const canvas = document.createElement("canvas");
const scale = window.devicePixelRatio;
canvas.width = 800 * scale;
canvas.height = 600 * scale;

const div = document.getElementById("app");
div.appendChild(canvas);

const font = new Font({
  spacingMetadataJsonURL: "/spacing.json",
  spacingBinaryURL: "/spacing.dat",
  UVBinaryURL: "/uv.dat",
  fontAtlasTextureURL: "/font-atlas.png",
});
await font.load();

const context = new Context(canvas, font);
context.clear();

const layout = new Layout(context);
layout.add(
  <view style={{ width: 100, height: 100, backgroundColor: "#fff" }}>
    <text style={{ fontFamily: font, fontSize: 20, color: "#000" }}>Hello</text>
  </view>
);

layout.render();
context.flush();
`,
        { language: "typescript" }
      )}
      ${showCodeBlocks()}
      ${addHeader(2, "Interactivity WIP")}
      <p>
        Interactive UI controls are not part of this version. <strong>Everything
        that follows is a draft/RFC of the API design</strong>.
      </p>
      <p>
        I've been prototyping UI controls for months now and I have working
        implementations of buttons, dropdowns and text inputs, so it shouldn't
        take very long to get them into the library.
      </p>

      ${addHeader(3, "Animation frame loop")}
      <p>
        Very common way of rendering UI in games is called immediate mode GUI.
        It basically means that UI elements are drawn every frame. In similar
        fashion, one simple way of using this library is to follow the same
        method.
      </p>
      ${codeExample(
        `const context = new Context(canvas, font);

function frame() {
  context.clear();

  // Draw UI continuously in the loop.
  const layout = new Layout(context.getCanvas().clientWidth, context.getCanvas().clientHeight);
  layout.add(
    <view style={{ padding: 20, backgroundColor: "#fff" }}>
      <text style={{ fontFamily: font, fontSize: 20, color: "#000" }}>Hello</text>
    </view>
  )
  layout.render();

  context.flush();

  window.requestAnimationFrame(frame);
}

frame();`,
        { language: "typescript" }
      )}
      ${addHeader(3, "Button")}
      ${codeExample(
        `layout.add(
  <button
    onClick={() => {
      alert("Hello!");
    }}
  >
    {({ hovered, pressed }) => (
      <view style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: pressed ? zinc[900] : hovered ? zinc[700] : zinc[800],
      }}>
        <text style={{ fontFamily: font, fontSize: 16, color: "#fff" }}>Click me</text>
      </view>
    )}
  </button>
)`,
        { language: "typescript" }
      )}
      ${addHeader(3, "Input")}
      ${codeExample(
        `let value = "";

const onChange = (next: string) => {
  value = next;
}

// In the loop:
layout.add(
  <input placeholder="Type here" onChange={onChange} />
);`,
        { language: "typescript" }
      )}
      ${addHeader(3, "Checkbox")}
      ${codeExample(
        `let checked = false;

const onChange = (next: boolean) => {
  checked = next;
}

// In the loop:
layout.add(
  <checkbox checked={checked} onChange={onChange} />
);`,
        { language: "typescript" }
      )}
      ${addHeader(2, "Generating font atlas")}
      <p>
        The goal is to allow for both runtime and build step generation.
      </p>
      <p>Worth knowing:</p>
      <ul>
        <li>
          Full font atlas texture is usually much heavier than font file itself
          (in case of Inter it is 680kB vs 2MB).
        </li>
        <li>
          You can also generate a much smaller subset (for instance just ASCII
          vs 2.5k characters that Inter has) of the font. Or load only the
          characters that are actually used in the app. Or start by loading only
          ASCII to improve startup time and then load the rest on demand.
        </li>
        <li>
          There are also two other data files but their weight is around 30kB.
        </li>
      </ul>
      ${addHeader(3, "Runtime")}
      <p>
        The idea is to render font atlas on the fly using browser's canvas API.
        It will provide some bandwidth savings (especially if you use a system
        font and load a lot of characters – potentially megabytes of download
        saved) but might take a bit longer and is more fragile as it requires
        browser support for JS <code>font-face</code> manipulation and properly
        functioning <code>&lt;canvas&gt;</code>.
      </p>
      ${codeExample(
        `import { TTF, FontAtlas, Font } from "red-otter";

async function loadFont() {
  // Add font to the document so we will use browser to rasterize the font.
  const fontFace = new FontFace("Inter", 'url("/inter.ttf")');
  await fontFace.load();
  document.fonts.add(fontFace);

  // Download font file for parsing.
  const file = await fetch("/inter.ttf");
  const buffer = await file.arrayBuffer();

  const ttf = new TTF(buffer);
  if (!ttf.ok) {
    throw new Error("Failed to parse font file.");
  }

  // Render font atlas.
  const atlas = new FontAtlas(ttf);
  const { canvas, spacing } = atlas.render();

  const image = new Image();
  image.src = canvas.toDataURL();

  return new Font(spacing, image);
}`,
        { language: "typescript" }
      )}
      <p>See full app on ${linkExternal(
        "https://github.com/tchayen/red-otter/tree/main/examples/font-atlas-runtime",
        "GitHub"
      )}.</p>
      ${addHeader(3, "On CI")}
      <p>
        Another option is to generate font atlas on CI as a build step of your
        application. As a side effect, this will make font look precisely the
        same on all devices (as font rasterization happens on the server).
      </p>
      <p>Example setup for CI rendering:</p>
      ${codeExample(
        `.
├── ci
│   ├── run.ts        # Vercel CI runs this script as part of \`yarn build\`.
│   │                 # The script runs puppeteer and Vite, loads \`ci\` page
│   │                 # and downloads font files to \`/public\`.
│   ├── index.html    # Vite will use this file to show the font atlas page.
│   ├── main.ts       # Renders font atlas.
│   └── public
│       └── inter.ttf
├── index.html        # Final page. Both HTML files are identical.
├── main.ts           # Renders on the final page, loading fonts from \`/public\`.`,
        { language: "bash" }
      )}
      <p>
        CI runtime script can look like this:
      </p>
      ${codeExample(
        `import { FontAtlas, TTF } from "red-otter";

async function run() {
  const start = performance.now();

  const fontFace = new FontFace("Inter", 'url("/inter.ttf")');
  await fontFace.load();
  document.fonts.add(fontFace);

  const font = await fetch("/inter.ttf");
  const buffer = await font.arrayBuffer();

  const ttf = new TTF(buffer);
  if (!ttf.ok) {
    throw new Error("Failed to parse font file.");
  }

  const atlas = new FontAtlas(ttf);
  const { canvas, spacing } = atlas.render();

  const div = document.getElementById("app");
  if (!div) {
    throw new Error("Could not find #app element.");
  }

  const span = document.createElement("span");
  span.setAttribute("style", "display: none");
  span.innerText = JSON.stringify(spacing);

  div.appendChild(canvas);
  div.appendChild(span);

  console.log(
    \`Font atlas generated in $\{(performance.now() - start).toFixed(2)}ms.\`
  );
}

run();`,

        {
          language: "typescript",
          fileName: "ci/main.ts",
          showLines: true,
        }
      )}
      <p><code>index.html</code> is very simple:</p>
      ${codeExample(
        `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Font atlas</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/main.ts"></script>
  </body>
</html>
`,

        {
          language: "html",
          fileName: "index.html",
          showLines: true,
        }
      )}
      <p>
        Finally, there's a script that runs Vite server and Puppeteer to render
        the page and save the results to the filesystem.
      </p>
      ${codeExample(
        `import path from "node:path";
import fs from "node:fs";

import { createServer } from "vite";
import chromium from "@sparticuz/chromium";
import { launch } from "puppeteer-core";

const PNG_FILE = \`$\{__dirname}/../public/font-atlas.png\`;
const JSON_FILE = \`$\{__dirname}/../public/spacing.json\`;
const BINARY_FILE = \`$\{__dirname}/../public/spacing.dat\`;
const UV_FILE = \`$\{__dirname}/../public/uv.dat\`;

const BUNDLER_PORT = 3456;

async function getPuppeteerOptions(): Promise<Partial<PuppeteerLaunchOptions>> {
  if (process.env.CI === "1") {
    return {
      executablePath: await chromium.executablePath(),
      args: [...chromium.args, "--no-sandbox"],
      headless: chromium.headless,
    };
  } else if (process.platform === "darwin") {
    return {
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      args: ["--no-sandbox"],
      headless: true,
    };
  } else {
    throw new Error("Unsupported OS.");
  }
}

function saveFile(
  filePath: string,
  data: string | Int16Array | Float32Array,
  encoding: "utf-8" | "binary"
): void {
  fs.writeFileSync(filePath, data, { encoding });
  console.log(\`Saved $\{filePath}.\`);
}

async function run() {
  const server = await createServer({
    root: path.resolve(__dirname, "."),
    server: { port: BUNDLER_PORT },
  });
  await server.listen();
  console.log(\`Vite dev server started on port $\{BUNDLER_PORT}.\`);

  const browser = await launch(await getPuppeteerOptions());
  console.log("Chromium launched.");

  const page = await browser.newPage();
  page
    .on("console", (message) => {
      const type = message.type();
      console.log(\`$\{type}: $\{message.text()}\`);
    })
    .on("pageerror", ({ message }) => console.log(message))
    .on("response", (response) => {
      const status = response.status().toString();
      console.log(\`$\{\`HTTP $\{status}\`} $\{response.url()}\`);
    })
    .on("requestfailed", (request) => {
      console.log(\`$\{request.failure().errorText} $\{request.url()}\`);
    });

  // Because of CORS it has to be served by a server.
  await page.goto(\`http://localhost:$\{BUNDLER_PORT}\`);

  await page.waitForSelector("canvas");
  const canvas = await page.$("canvas");

  if (!canvas) {
    throw new Error("Canvas not found.");
  }

  console.log("Page loaded.");

  await canvas.screenshot({ path: PNG_FILE, omitBackground: true });

  console.log(\`Saved $\{PNG_FILE}.\`);

  const spacing = await page.$eval("span", (element) => {
    return JSON.parse(element.innerHTML);
  });

  const { glyphs, uvs, ...metadata } = spacing;

  const spacingJson = JSON.stringify(metadata, null, 2);
  saveFile(JSON_FILE, spacingJson, "utf-8");

  const glyphBinary = new Int16Array(glyphs);
  saveFile(BINARY_FILE, glyphBinary, "binary");

  const uvBinary = new Float32Array(uvs);
  saveFile(UV_FILE, uvBinary, "binary");

  await browser.close();
  await server.close();
}

run();`,

        { language: "typescript", fileName: "ci/run.ts", showLines: true }
      )}
      <p>Call it as part of <code>yarn build</code>:</p>
      ${codeExample(
        `{
  "scripts": {
    "build": "yarn font-atlas && vite build",
    "font-atlas": "yarn run ts-node -O '{\\"module\\":\\"nodenext\\"}' ci/run.ts"
  }
}`,
        { language: "json" }
      )}
      <p>Example of logs from running in the Vercel CI:</p>
      ${codeExample(
        `$ /vercel/path0/node_modules/.bin/ts-node -O '{"module":"nodenext"}' ci/run.ts
Vite dev server started on port 3456.
Chromium launched.
HTTP 200 http://localhost:3456/
HTTP 200 http://localhost:3456/main.ts
HTTP 200 http://localhost:3456/@vite/client
HTTP 200 http://localhost:3456/@fs/vercel/path0/node_modules/vite/dist/client/env.mjs
debug: [vite] connecting...
debug: [vite] connected.
HTTP 200 http://localhost:3456/@fs/vercel/path0/node_modules/.vite/deps/red-otter.js?v=c4488a07
HTTP 200 http://localhost:3456/inter.ttf
HTTP 304 http://localhost:3456/inter.ttf
log: Font atlas generated in 1155.50ms.
Page loaded.
Saved /vercel/path0/ci/../public/font-atlas.png.
Saved /vercel/path0/ci/../public/spacing.json.
Saved /vercel/path0/ci/../public/spacing.dat.
Saved /vercel/path0/ci/../public/uv.dat.`,
        { language: "bash" }
      )}
      <p>
        Full example on ${linkExternal(
          "https://github.com/tchayen/red-otter/tree/main/examples/font-atlas-vercel-ci",
          "GitHub"
        )}.</p>
      ${addHeader(2, "Why JSX")}
      <p>
        Compare code written with the direct API, probably a simplest form of
        immediate mode GUI:
      </p>
      ${codeExample(
        `const container: Style = {
  width: "100%",
  height: "100%",
  padding: 20,
};

const text: TextStyle = {
  fontFamily: font,
};

// Those code blocks are useless but increase readability.
layout.view(container);
{
  layout.view({ backgroundColor: zinc[900] });
  {
    layout.view({ padding: 20, backgroundColor: zinc[800] });
    layout.text("Hello, welcome to my layout", text);
    layout.end();

    layout.view({ padding: 20, backgroundColor: zinc[700] });
    layout.text("Components have automatic layout", text);
    layout.end();

    layout.view({
      flexDirection: "row",
      padding: 20,
      backgroundColor: zinc[600],
    });
    {
      layout.view({ padding: 20, backgroundColor: "#eb584e" });
      layout.text("One", text);
      layout.end();

      layout.view({ padding: 20, backgroundColor: "#eb584e" });
      layout.text("Two", text);
      layout.end();

      layout.view({ padding: 20, backgroundColor: "#eb584e" });
      layout.text("Three", text);
      layout.end();
    }
    layout.end();
  }
  layout.end();
}
layout.end();`,

        {
          language: "typescript",
          fileName: "direct-api.ts",
          showLines: true,
        }
      )}
      <p>
        Then with calling HyperScript-style function manually. Basically using
        JSX in plain JavaScript:
      </p>
      ${codeExample(
        `const container: Style = {
  width: "100%",
  height: "100%",
  padding: 20,
};

const text: TextStyle = {
  fontFamily: font,
};

layout.add(
  h(
    "view",
    { style: container },
    h(
      "view",
      { style: { backgroundColor: zinc[900] } },
      h(
        "view",
        { style: { padding: 20, backgroundColor: zinc[800] } },
        h("text", { style: text }, "Hello, welcome to my layout")
      ),
      h(
        "view",
        { style: { padding: 20, backgroundColor: zinc[700] } },
        h("text", { style: text }, "Components have automatic layout")
      ),
      h(
        "view",
        {
          style: {
            flexDirection: "row",
            padding: 20,
            backgroundColor: zinc[600],
          },
        },
        h(
          "view",
          { style: { padding: 20, backgroundColor: "#eb584e" } },
          h("text", { style: text }, "One")
        ),
        h(
          "view",
          { style: { padding: 20, backgroundColor: "#eb584e" } },
          h("text", { style: text }, "Two")
        ),
        h(
          "view",
          { style: { padding: 20, backgroundColor: "#eb584e" } },
          h("text", { style: text }, "Three")
        )
      )
    )
  )
);`,
        {
          language: "typescript",
          fileName: "hyperscript.ts",
          showLines: true,
        }
      )}
      <p>
        And finally JSX, which is easily supported by probably all bundlers and
        IDEs:
      </p>
      ${codeExample(
        `const container: Style = {
  width: "100%",
  height: "100%",
  padding: 20,
};

const text: TextStyle = {
  fontFamily: font,
};

layout.add(
  <view style={container}>
    <view style={{ backgroundColor: zinc[900] }}>
      <view style={{ padding: 20, backgroundColor: zinc[800] }}>
        <text style={text}>Hello, welcome to my layout</text>
      </view>
      <view style={{ padding: 20, backgroundColor: zinc[700] }}>
        <text style={text}>Components have automatic layout</text>
      </view>
      <view
        style={{
          flexDirection: "row",
          padding: 20,
          backgroundColor: zinc[600],
        }}
      >
        <view style={{ padding: 20, backgroundColor: "#eb584e" }}>
          <text style={text}>One</text>
        </view>
        <view style={{ padding: 20, backgroundColor: "#ef8950" }}>
          <text style={text}>Two</text>
        </view>
        <view style={{ padding: 20, backgroundColor: "#efaf50" }}>
          <text style={text}>Three</text>
        </view>
      </view>
    </view>
  </view>
);`,
        {
          language: "typescript",
          fileName: "jsx.ts",
          showLines: true,
        }
      )}
      <p>
        JSX has couple advantages here. It is the shortest. Arguably this syntax
        makes it more readable (which is for me not always the case with XML).
        And something that is harder to reason about just looking at the code –
        it is much easier for me to refactor than function calls above. Very
        clear boundaries of components (opening and closing tags) make it easier
        to move blocks around consciously.
      </p>
      ${
        "" /*
      ${addHeader(2, "Roadmap")}
      <ul>
        <li>
          Make lib more tree-shakable. Currently example which processes font
          server side loads 22.03 kB (7.04 kB gzipped) of code. By removing
          utility functions from classes and moving them to separate modules,
          this could be potentially reduced for users that don't use certain
          features (like triangulation of polygons, setting projection matrices,
          triangulation of lines).
        </li>
        <li>
          Testing with more fonts. So far TTF parser was fine-tuned to work with
          Inter. It should work with other fonts just as well, but maybe I was
          wrong with assumptions about which TTF tables are best to support.
        </li>
        <li>
          Better text rendering, including italics, bold, multiline text and
          nested text blocks (a single bold word inside a paragraph).
        </li>
        <li>
          Proper benchmarks.
        </li>
        <li>
          Missing layout features: <code>margin</code>, <code>flex-wrap</code>, <code>flex-grow</code>, <code>flex-shrink</code>, <code>justify-content: space-around</code> and <code>space-evenly</code>, <code>overflow: hidden</code>, <code>aspect-ratio</code>.
        </li>
        <li>
          Styling: <code>border-radius</code>, <code>border</code>, <code>box-shadow</code>, <code>opacity</code>.
        </li>
        <li>
          Interactivity: UI controls like button, text input etc.
        </li>
        <li>
          Accessibility: explore maintaining a copy of layout as a hidden DOM
          tree that can be used by screen readers. For performance reasons it
          can be updated for example only once per second.
          <code>aria-busy</code> could be useful for marking tree as under
          construction.
        </li>
      </ul>
*/
      }
      ${addHeader(2, "API reference")}
      ${showApiReferences()}
      ${addHeader(2, "Testing")}
      <p>
        To write unit tests for layout, you will need a class implementing
        <code>IContext</code> interface. Here is basic working example:
      </p>
      ${codeExample(
        `class MockContext implements IContext {
  getCanvas() {
    return {
      clientWidth: 800,
      clientHeight: 600,
    } as HTMLCanvasElement;
  }
  line() {
    // noop
  }
  polygon() {
    // noop
  }
  triangles() {
    // noop
  }
  rectangle() {
    // noop
  }
  clear() {
    // noop
  }
  setProjection() {
    // noop
  }
  text() {
    // noop
  }
  flush() {
    // noop
  }
  loadTexture() {
    return {} as WebGLTexture;
  }
}`,

        {
          language: "typescript",
          fileName: "MockContext.ts",
          showLines: true,
        }
      )}
      ${addHeader(2, "Credits")}
      <li>
        ${linkExternal("https://highlightjs.org", "Highlights.js")} for syntax
        highlighting.
      </li>
      <li>
        ${linkExternal(
          "https://highlightjs.org/static/demo/styles/github-dark.css",
          "Code theme"
        )} GitHub Dark from Highlight.js.
      </li>
      <li>
        <a href="https://tailwindcss.com/docs/customizing-colors"
          rel="noopener noreferrer"
          target="_blank"
        >Colors</a> Zinc from Tailwind CSS.
      </li>
      <li>
          ${linkExternal(
            "https://blog.mapbox.com/drawing-text-with-signed-distance-fields-in-mapbox-gl-b0933af6f817",
            "Drawing Text with Signed Distance Fields in Mapbox GL"
          )}.
      </li>
      <li>
          ${linkExternal(
            "https://madebyevan.com/shaders/fast-rounded-rectangle-shadows/",
            "Fast Rounded Rectangle Shadows"
          )}.
      </li>
      <li>
          ${linkExternal(
            "https://zed.dev/blog/videogame",
            "Leveraging Rust and the GPU to render user interfaces at 120 FPS"
          )}.
      </li>
      <p>
        This website was written in plain HTML and CSS with a build step script
        for extracting code examples from the source code.
      </p>
      <p>
        © Tomasz Czajęcki ${new Date().getFullYear()}
      </p>
    </div>
    <div id="sidebar">
      <div id="sidebar-logo">
        <img src="/logo.svg" alt="Logo" />
        <div>
          <span>Red Otter</span>
          <span class="version">${versionNumber}</span>
        </div>
      </div>
      <div id="search-box">
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="var(--zinc-400)" d="M20 6C12.268 6 6 12.268 6 20C6 27.732 12.268 34 20 34C23.4159 34 26.5461 32.7766 28.9763 30.7441L39.8662 41.6339C40.3543 42.122 41.1458 42.122 41.6339 41.6339C42.1221 41.1457 42.1221 40.3543 41.6339 39.8661L30.7441 28.9763C32.7766 26.5461 34 23.4159 34 20C34 12.268 27.732 6 20 6ZM8.5 20C8.5 13.6487 13.6487 8.5 20 8.5C26.3513 8.5 31.5 13.6487 31.5 20C31.5 26.3513 26.3513 31.5 20 31.5C13.6487 31.5 8.5 26.3513 8.5 20Z" />
        </svg>
        Just use ${commandSymbol}+F
      </div>
      <div id="table-of-contents">
      ${headers
        .map(
          (header) =>
            `<div class="pusher">
              <div style="margin-right:${12 * (header.level - 2)}px"></div>
              <a href="#${header.slug}" style="font-weight: ${
              header.level === 2 ? "700" : "400"
            }">${header.title}</a>
            </div>`
        )
        .join("\n")}
      </div>
      <div id="social-link-list">
        <a
          href="https://github.com/tchayen/red-otter"
          rel="noopener noreferrer"
          target="_blank"
          class="social-link"
        >
          <svg viewBox="0 0 16 16" width="24" height="24">
            <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
          </svg>
          <span>Source code</span>
        </a>
        <a
          href="https://npmjs.com/package/red-otter"
          rel="noopener noreferrer"
          target="_blank"
          class="social-link"
        >
          <svg viewBox="0 0 780 250" height="12">
            <defs>
              <style>.cls-1{fill:#c12127;}.cls-2{fill:#fff;}</style>
            </defs>
            <path d="M240,250h100v-50h100V0H240V250z M340,50h50v100h-50V50z M480,0v200h100V50h50v150h50V50h50v150h50V0H480zM0,200h100V50h50v150h50V0H0V200z" />
          </svg>
          <span>Package</span>
        </a>
        <a
          href="https://twitter.com/tchayen"
          rel="noopener noreferrer"
          target="_blank"
          class="social-link"
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path>
          </svg>
          <span>Twitter</span>
        </a>
      </div>
    </div>
    <details id="sidebar-mobile">
      <summary>Table of contents</summary>
      <div id="mobile-list">
        ${headers
          .map(
            (header) =>
              `<div class="pusher"><div style="margin-right:${
                20 * (header.level - 2)
              }px"></div><a href="#${header.slug}">${header.title}</a></div>`
          )
          .join("\n")}
      </div>
    </details>
    <script type="module" src="/src/main.ts"></script>
    <script defer src="/_vercel/insights/script.js"></script>
  </body>
</html>`;

step("Format HTML");

const result = formatCode(replace, "html");

step("Write file");
fs.writeFileSync(`${__dirname}/../index.html`, result, "utf8");

step("End");
const total = performance.now() - steps[0].start;
console.debug(`${chalk.yellow("Total")} ${(total / 1000).toFixed(2)}s`);

// Reddit
// <a
//   href="https://twitter.com/tchayen"
//   rel="noopener noreferrer"
//   target="_blank"
//   class="social-link reddit"
// >
//   <svg viewBox="85.4 85.4 171 171" width="24" height="24">
//     <circle cx="170.9" cy="170.9" r="85.5"/>
//     <path d="M227.9,170.9c0-6.9-5.6-12.5-12.5-12.5c-3.4,0-6.4,1.3-8.6,3.5c-8.5-6.1-20.3-10.1-33.3-10.6l5.7-26.7 l18.5,3.9c0.2,4.7,4.1,8.5,8.9,8.5c4.9,0,8.9-4,8.9-8.9c0-4.9-4-8.9-8.9-8.9c-3.5,0-6.5,2-7.9,5l-20.7-4.4c-0.6-0.1-1.2,0-1.7,0.3 c-0.5,0.3-0.8,0.8-1,1.4l-6.3,29.8c-13.3,0.4-25.2,4.3-33.8,10.6c-2.2-2.1-5.3-3.5-8.6-3.5c-6.9,0-12.5,5.6-12.5,12.5 c0,5.1,3,9.4,7.4,11.4c-0.2,1.2-0.3,2.5-0.3,3.8c0,19.2,22.3,34.7,49.9,34.7s49.9-15.5,49.9-34.7c0-1.3-0.1-2.5-0.3-3.7 C224.8,180.4,227.9,176,227.9,170.9z M142.4,179.8c0-4.9,4-8.9,8.9-8.9c4.9,0,8.9,4,8.9,8.9c0,4.9-4,8.9-8.9,8.9 C146.4,188.7,142.4,184.7,142.4,179.8z M192.1,203.3c-6.1,6.1-17.7,6.5-21.1,6.5c-3.4,0-15.1-0.5-21.1-6.5c-0.9-0.9-0.9-2.4,0-3.3 c0.9-0.9,2.4-0.9,3.3,0c3.8,3.8,12,5.2,17.9,5.2s14-1.4,17.9-5.2c0.9-0.9,2.4-0.9,3.3,0C193,201,193,202.4,192.1,203.3z M190.5,188.7c-4.9,0-8.9-4-8.9-8.9c0-4.9,4-8.9,8.9-8.9c4.9,0,8.9,4,8.9,8.9C199.4,184.7,195.4,188.7,190.5,188.7z"/>
//   </svg>
//   <span>Reddit</span>
// </a>

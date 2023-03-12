import fs from "node:fs";
import { performance } from "node:perf_hooks";
import hljs from "highlight.js";
import chalk from "chalk";

import typescript from "highlight.js/lib/languages/typescript";
import { PluginItem, transformSync } from "@babel/core";

import { fixtures } from "./examples";
import { codeExample, formatCode, toURLSafe } from "../utils";

const steps: { name: string; start: number }[] = [];

function step(name: string): void {
  const lastStep = steps.at(-1);
  const now = performance.now();

  if (lastStep) {
    const time = now - lastStep.start;
    console.log(`${chalk.yellow(lastStep.name)} ${time.toFixed(2)}ms`);
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
      FunctionDeclaration(path) {
        const name = path.node.id?.name;
        if (name && name.endsWith("Example")) {
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

step("Start");

const LAYOUT_WIDTH = 800;
const LAYOUT_HEIGHT = 600;

hljs.registerLanguage("typescript", typescript);

const fixtureSources: Record<string, string> = {};

step("Read fixtures file");
// Read the source code of the fixtures.
const fixturesSource = fs.readFileSync(`${__dirname}/examples.tsx`, "utf8");

step("Transform file using Babel");
transformSync(fixturesSource, {
  presets: [
    [
      "@babel/preset-typescript",
      {
        isTSX: true,
        allExtensions: true,
      },
    ],
  ],
  plugins: [copyCodeBabelPlugin],
  ast: true,
  sourceMaps: true,
  parserOpts: {
    sourceType: "module",
  },
});

step("Process layout file");

const headers: { level: number; slug: string; title: string }[] = [];

const replace = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Red Otter</title>
    <style>
      @import url("https://rsms.me/inter/inter.css");

      body {
        margin: 0;
        padding: 0;
        font-family: "Inter", sans-serif;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        color: #fff;
        background-color: var(--zinc-700);
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-left: 320px; /* sidebar width */
        font-display: swap;
      }

      @media only screen and (max-width: 1160px) {
        body {
          flex-direction: column-reverse;
          padding-left: 0;
        }
      }

      .canvas {
        background-color: #000;
        margin: 0;
        margin-top: 24px;
        margin-bottom: 24px;
        overflow-x: auto;
        display: flex; /* Prevents black space from appearing below the <canvas>. */
      }

      #content {
        width: ${LAYOUT_WIDTH}px;
        padding-bottom: 48px;
      }

      #sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: 320px;
        display: flex;
        flex-direction: column;
        padding: 24px;
        gap: 16px;
        background-color: var(--zinc-800);
        overflow: auto;
      }

      #sidebar-mobile {
        display: none;
      }

      #sidebar-mobile {
        width: 100%;
        position: fixed;
        top: 0;
        left: 0;
      }

      #search-box {
        user-select: none;
        cursor: default;
        display: flex;
        align-items: center;
        width: 100%;
        border-radius: 16px;
        padding: 8px;
        padding-left: 12px;
        gap: 4px;
        color: var(--zinc-400);
        font-size: 14px;
        line-height: 14px;
        background-color: var(--zinc-900);
      }

      #mobile-list {
        display: flex;
        height: 100vh;
        flex-direction: column;
        padding: 24px;
        padding-top: 8px;
        gap: 8px;
        background-color:var(--zinc-800);
      }

      #sidebar-mobile > summary {
        outline: none;
        cursor: pointer;
        width: 100%;
        padding: 8px;
        background-color: var(--zinc-600);
      }

      @media only screen and (max-width: 1160px) {
        #sidebar {
          display: none;
        }

        #sidebar-mobile {
          display: block;
        }
      }

      @media only screen and (max-width: 840px) {
        #content {
          width: 100%;
          padding: 20px;
        }
      }

      h1 {
        font-weight: 500;
        margin: 0;
        margin-top: 24px;
        scroll-margin-top: 24px;
        font-size: 40px;
      }

      h2 {
        font-weight: 500;
        margin: 0;
        margin-top: 24px;
        margin-bottom: 12px;
        scroll-margin-top: 24px;
        font-size: 28px;
      }

      h2 > a {
        text-decoration: none;
      }

      h2 > a:hover::after {
        content: "#";
        font-size: 20px;
        color: var(--zinc-400);
      }

      h3 {
        font-weight: 500;
        margin: 0;
        margin-top: 24px;
        margin-bottom: 12px;
        scroll-margin-top: 24px;
        font-size: 24px;
      }

      h3 > a {
        text-decoration: none;
      }

      h3 > a:hover::after {
        content: "#";
        font-size: 20px;
        color: var(--zinc-400);
      }

      @media only screen and (max-width: 1160px) {
        h1 {
          scroll-margin-top: 64px;
        }

        h2 {
          scroll-margin-top: 64px;
        }

        h3 {
          scroll-margin-top: 64px;
        }
      }

      p {
        font-weight: 300;
        font-size: 15px;
        line-height: 1.5em;
        color: var(--zinc-300);
        margin: 0;
        margin-top: 12px;
        margin-bottom: 12px;
      }

      strong {
        color: #fff;
        font-weight: 500;
      }

      em {
        font-style: italic;
      }

      ul {
        margin: 0;
        margin-left: 24px;
        padding: 0;
      }

      li {
        font-weight: 300;
        font-size: 15px;
        line-height: 1.5em;
        margin: 0;
        color: var(--zinc-300);
        margin-bottom: 8px;
      }

      a {
        color: #fff;
        text-decoration: underline var(--zinc-500) 1px;
        text-underline-offset: 3px;
      }

      .code-details {
        width: 100%;
        margin-top: 24px;
        margin-bottom: 24px;
      }

      .code-summary {
        outline: none;
        cursor: pointer;
        padding: 8px;
        padding-left: 12px;
        background-color: var(--zinc-600);
      }

      pre {
        width: 100%;
        background-color: #18181b;
        overflow-x: auto;
        margin: 0;
        margin-top: 24px;
        margin-bottom: 24px;
        padding: 16px;
      }

      details > pre {
        margin-top: 0px;
      }

      code {
        font-size: 14px;
        line-height: 1.4em;
        font-family: Menlo, Consolas, Liberation Mono, monospace;
      }

      .code-filename {
        font-family: Menlo, Consolas, Liberation Mono, monospace;
        font-size: 14px;
        background-color: var(--zinc-600);
        padding: 8px;
        padding-left: 12px;
        margin-bottom: -24px;
      }

      .pusher {
        display: flex;
        flex-direction: row;
      }

      .pusher > a {
        text-decoration: none;
        color: #d4d4d8;
        font-size: 15px;
      }

      .pusher > a:hover {
        color: var(--yellow);
      }

      #logo {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 24px;
        margin-top: 48px;
      }

      #logo-img {
        width: 200px;
        height: 200px;
        margin-bottom: 16px;
      }

      #logo-title {
        font-size: 44px;
        font-weight: 800;
        color: #fff;
      }

      #logo-description {
        font-size: 13px;
        font-style: italic;
        color: var(--zinc-400);
      }

      #sidebar-logo {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      #sidebar-logo img {
        width: 100px;
        height: 100px;
      }

      #sidebar-logo span {
        font-size: 24px;
        font-weight: 800;
        color: #fff;
      }

      #sidebar-logo .version {
        font-size: 13px;
        font-weight: 400;
        color: var(--zinc-400);
      }

      #table-of-contents {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .social-link {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        font-size: 15px;
        color: var(--zinc-400);
        margin-top: 12px;
      }

      .social-link path {
        fill: var(--zinc-400);
      }

      .reddit circle {
        fill: var(--zinc-400);
      }

      .reddit path {
        fill: var(--zinc-800);
      }

      .social-link:hover {
        color: var(--yellow);
      }

      .social-link:hover path {
        fill: var(--yellow);
      }

      .reddit:hover circle {
        fill: var(--yellow);
      }

      .reddit:hover path {
        fill: var(--zinc-800);
      }

      * {
        box-sizing: border-box;
      }

      ::selection {
        color: #000;
        background-color: var(--yellow);
      }

      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      /* Track */
      ::-webkit-scrollbar-track {
        background: var(--zinc-700);
      }

      /* Handle */
      ::-webkit-scrollbar-thumb {
        background: var(--zinc-600);
      }

      /* Handle on hover */
      ::-webkit-scrollbar-thumb:hover {
        background: var(--zinc-500);
      }

      :root {
        --zinc-900: #18181b;
        --zinc-800: #27272a;
        --zinc-700: #3f3f46;
        --zinc-600: #52525b;
        --zinc-500: #71717a;
        --zinc-400: #a1a1aa;
        --zinc-300: #d4d4d8;
        --zinc-200: #e4e4e7;
        --zinc-100: #f4f4f5;
        --zinc-50: #fafafa;

        --yellow: #efaf50;
        --orange: #ef8950;
        --red: #eb584e;
      }

      /* GitHub dark */
      .hljs {
        color: #c9d1d9;
        background: #0d1117;
      }
      .hljs-doctag,
      .hljs-keyword,
      .hljs-meta .hljs-keyword,
      .hljs-template-tag,
      .hljs-template-variable,
      .hljs-type,
      .hljs-variable.language_ {
        color: #ff7b72;
      }
      .hljs-title,
      .hljs-title.class_,
      .hljs-title.class_.inherited__,
      .hljs-title.function_ {
        color: #d2a8ff;
      }
      .hljs-attr,
      .hljs-attribute,
      .hljs-literal,
      .hljs-meta,
      .hljs-number,
      .hljs-operator,
      .hljs-selector-attr,
      .hljs-selector-class,
      .hljs-selector-id,
      .hljs-variable {
        color: #79c0ff;
      }
      .hljs-meta .hljs-string,
      .hljs-regexp,
      .hljs-string {
        color: #a5d6ff;
      }
      .hljs-built_in,
      .hljs-symbol {
        color: #ffa657;
      }
      .hljs-code,
      .hljs-comment,
      .hljs-formula {
        color: #8b949e;
      }
      .hljs-name,
      .hljs-quote,
      .hljs-selector-pseudo,
      .hljs-selector-tag {
        color: #7ee787;
      }
      .hljs-subst {
        color: #c9d1d9;
      }
      .hljs-section {
        color: #1f6feb;
        font-weight: 700;
      }
      .hljs-bullet {
        color: #f2cc60;
      }
      .hljs-emphasis {
        color: #c9d1d9;
        font-style: italic;
      }
      .hljs-strong {
        color: #c9d1d9;
        font-weight: 700;
      }
      .hljs-addition {
        color: #aff5b4;
        background-color: #033a16;
      }
      .hljs-deletion {
        color: #ffdcd7;
        background-color: #67060c;
      }
    </style>
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
        Red otter is a self-contained WebGL flexbox layout engine that I've been
        developing with long breaks for the past many months.
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
        And finally, because it's fun. Reinventing the wheel is my hobby [<a
          href="https://tchayen.com"
          referrerpolicy="no-referrer"
          target="_blank"
          >2</a>] and writing this library was the goal itself.
      </p>
      ${addHeader(3, "What this is not")}
      <ul>
        <li>
          <strong>This is not React</strong>. There is no virtual DOM, no
          reconciliation, no state management. This is a layout engine, not a
          full-blown framework. For instance, there are no components, only
          elements (<code>&lt;view&gt;</code> etc.).
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
          It's <strong>just a library</strong>. There is no compiler or hidden
          magic. No new build steps required.
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
      ${addHeader(2, "Install")}
      ${codeExample(`yarn add red-otter`, "bash")}
      <p>
        To render text you will also need to generate the font atlas. See
        <a href="/#generating-font-atlas">guide</a>.
      </p>
      ${addHeader(2, "Layout")}
      <p>All code present below follows similar pattern:</p>
      ${codeExample(
        `import { Font, Context, Layout } from "red-otter";

const canvas = document.createElement("canvas");
const scale = window.devicePixelRatio;
canvas.width = 800 * scale;
canvas.height = 600 * scale;

const div = document.getElementById("app");
div.appendChild(canvas);

const inter = new Font({
  spacingMetadataJsonURL: "/spacing.json",
  spacingBinaryURL: "/spacing.dat",
  fontAtlasTextureURL: "/uv.dat",
  UVBinaryURL: "/font-atlas.png",
});
await font.load();

const context = new Context(canvas, font);
context.clear();
context.setProjection(0, 0, canvas.clientWidth, context.getCanvas().clientHeight);

const layout = new Layout(context);
layout.add(
  <view style={{ width: 100, height: 100, backgroundColor: "#fff" }}>
    <text style={{ fontFamily: font, fontSize: 20, color: "#000" }}>Hello</text>
  </view>
);

layout.render();
context.flush();
`
      )}
      ${fixtures
        .map((fixture) => {
          const { callback, title, description } = fixture;

          const code = fixtureSources[callback.name]
            .split("\n")
            .slice(3, -2) // Remove function declaration and return statement.
            .map((line) => line.replace(/^ {2}/, "")) // Remove indentation.
            .join("\n");

          const highlighted = codeExample(code);

          const slug = toURLSafe(title);

          return `${addHeader(3, title)}
            <p>${description}</p>
            <div class="canvas"><canvas
              id="${slug}-canvas"
              width="${LAYOUT_WIDTH}"
              height="${LAYOUT_HEIGHT}"
            ></canvas></div>
            <details class="code-details">
              <summary class="code-summary">Show code</summary>
              ${highlighted}
            </details>`;
        })
        .join("\n")}
      ${addHeader(2, "Context")}
      <p>
        Context is low level drawing API, resembling Canvas API from browsers.
        Used by layout engine to draw elements. Library features a simple
        reference implementation that should work well in most cases.
      </p>
      ${codeExample(
        `export interface IContext {
  /**
   * Get canvas element.
   */
  getCanvas(): HTMLCanvasElement;

  /**
   * Draw line connecting given list of points.
   */
  line(points: Vec2[], thickness: number, color: Vec4): void;

  /**
   * Triangulates and draws given polygon.
   * TODO: only takes CW/CCW. Make sure which. Flip direction if needed.
   */
  polygon(points: Vec2[], color: Vec4): void;

  /**
   * Draw given list of triangles.
   */
  triangles(points: Vec2[], color: Vec4): void;

  /**
   * Draw rectangle.
   */
  rectangle(position: Vec2, size: Vec2, color: Vec4): void;

  /**
   * Clears the screen.
   */
  clear(): void;

  /**
   * Sets projection matrix to orthographic with given dimensions.
   * Y axis is flipped - point \`(0, 0)\` is in the top left.
   */
  setProjection(x: number, y: number, width: number, height: number): void;

  /**
   * Writes text on the screen.
   */
  text(
    text: string,
    x: number,
    y: number,
    fontSize: number,
    color: string
  ): void;

  /**
   * Renders to screen and resets buffers.
   */
  flush(): void;

  /**
   * Load texture to GPU memory.
   */
  loadTexture(image: HTMLImageElement): WebGLTexture;
}`
      )}
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

frame();`
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
)`
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
);`
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
);`
      )}
      ${addHeader(2, "Generating font atlas")}
      <p>
        The goal is to allow for both runtime and build step generation.
      </p>
      <p>Worth knowing:</p>
      <ul>
        <li>
          Full font atlas texture is usually much heavier than font file itself
          (in case of Inter it is 680KB vs 2MB).
        </li>
        <li>
          You can also generate a much smaller subset (for instance just ASCII
          vs 2.5k characters that Inter has) of the font. Or load only the
          characters that are actually used in the app. Or start by loading only
          ASCII to improve startup time and then load the rest on demand.
        </li>
        <li>
          There are also two other data files but their weight is around 30KB.
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
      ${codeExample(`import { TTF, FontAtlas, Font } from "red-otter";

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
}`)}
      <p>See full app on ${linkExternal(
        "https://github.com/tchayen/red-otter/tree/main/examples/font-atlas-runtime",
        "GitHub"
      )}.</p>
      ${addHeader(3, "On CI")}
      <p>
        Another option is to generate font atlas on CI as a build step of your
        application. This will make font look precisely the same on all devices
        (as font rasterization happens on the server).
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
        "bash"
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
        "typescript",
        "ci/main.ts"
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
        "html",
        "index.html"
      )}
      <p>
        Finally, there's a script that runs Vite server and Puppeteer to render
        the page and save the results to the filesystem.
      </p>
      ${codeExample(
        'yarn run ts-node  -O \'{"module":"nodenext"}\' ci-script.ts',
        "bash"
      )}
      <p>And the script itself:</p>
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

  const browser = await launch({
    executablePath: await chromium.executablePath(),
    args: [...chromium.args, "--no-sandbox"],
    headless: false,
  });
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

  // Because of CORS it has to be served as a server.
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
        "typescript",
        "ci/run.ts"
      )}
      <p>Example output from running on the CI:</p>
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
        "bash"
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
      ${codeExample(`const container: Style = {
  width: "100%",
  height: "100%",
  padding: 20,
};

const text: TextStyle = {
  fontFamily: font,
};

// Those code blocks are useless but increase readability.
layout.frame(container);
{
  layout.frame({ backgroundColor: zinc[900] });
  {
    layout.frame({ padding: 20, backgroundColor: zinc[800] });
    layout.text("Hello, welcome to my layout", text);
    layout.end();

    layout.frame({ padding: 20, backgroundColor: zinc[700] });
    layout.text("Components have automatic layout", text);
    layout.end();

    layout.frame({
      flexDirection: "row",
      padding: 20,
      backgroundColor: zinc[600],
    });
    {
      layout.frame({ padding: 20, backgroundColor: "#eb584e" });
      layout.text("One", text);
      layout.end();

      layout.frame({ padding: 20, backgroundColor: "#eb584e" });
      layout.text("Two", text);
      layout.end();

      layout.frame({ padding: 20, backgroundColor: "#eb584e" });
      layout.text("Three", text);
      layout.end();
    }
    layout.end();
  }
  layout.end();
}
layout.end();`)}
      <p>
        Then with calling HyperScript-style function manually. Basically using
        JSX in plain JavaScript:
      </p>
      ${codeExample(`const container: Style = {
  width: "100%",
  height: "100%",
  padding: 20,
};

const text: TextStyle = {
  fontFamily: font,
};

layout.add(
  f(
    "view",
    { style: container },
    f(
      "view",
      { style: { backgroundColor: zinc[900] } },
      f(
        "view",
        { style: { padding: 20, backgroundColor: zinc[800] } },
        f("text", { style: text }, "Hello, welcome to my layout")
      ),
      f(
        "view",
        { style: { padding: 20, backgroundColor: zinc[700] } },
        f("text", { style: text }, "Components have automatic layout")
      ),
      f(
        "view",
        {
          style: {
            flexDirection: "row",
            padding: 20,
            backgroundColor: zinc[600],
          },
        },
        f(
          "view",
          { style: { padding: 20, backgroundColor: "#eb584e" } },
          f("text", { style: text }, "One")
        ),
        f(
          "view",
          { style: { padding: 20, backgroundColor: "#eb584e" } },
          f("text", { style: text }, "Two")
        ),
        f(
          "view",
          { style: { padding: 20, backgroundColor: "#eb584e" } },
          f("text", { style: text }, "Three")
        )
      )
    )
  )
);`)}
      <p>
        And finally JSX, which is easily supported by probably all bundlers and
        IDEs:
      </p>
      ${codeExample(`const container: Style = {
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
);`)}
      <p>
        JSX is definitely shortest and, at least to me, the easiest to read and
        reason about.
      </p>
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
}`
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
          <span class="version">v0.0.1</span>
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
        <a
          href="https://twitter.com/tchayen"
          rel="noopener noreferrer"
          target="_blank"
          class="social-link reddit"
        >
          <svg viewBox="85.4 85.4 171 171" width="24" height="24">
            <circle cx="170.9" cy="170.9" r="85.5"/>
            <path d="M227.9,170.9c0-6.9-5.6-12.5-12.5-12.5c-3.4,0-6.4,1.3-8.6,3.5c-8.5-6.1-20.3-10.1-33.3-10.6l5.7-26.7 l18.5,3.9c0.2,4.7,4.1,8.5,8.9,8.5c4.9,0,8.9-4,8.9-8.9c0-4.9-4-8.9-8.9-8.9c-3.5,0-6.5,2-7.9,5l-20.7-4.4c-0.6-0.1-1.2,0-1.7,0.3 c-0.5,0.3-0.8,0.8-1,1.4l-6.3,29.8c-13.3,0.4-25.2,4.3-33.8,10.6c-2.2-2.1-5.3-3.5-8.6-3.5c-6.9,0-12.5,5.6-12.5,12.5 c0,5.1,3,9.4,7.4,11.4c-0.2,1.2-0.3,2.5-0.3,3.8c0,19.2,22.3,34.7,49.9,34.7s49.9-15.5,49.9-34.7c0-1.3-0.1-2.5-0.3-3.7 C224.8,180.4,227.9,176,227.9,170.9z M142.4,179.8c0-4.9,4-8.9,8.9-8.9c4.9,0,8.9,4,8.9,8.9c0,4.9-4,8.9-8.9,8.9 C146.4,188.7,142.4,184.7,142.4,179.8z M192.1,203.3c-6.1,6.1-17.7,6.5-21.1,6.5c-3.4,0-15.1-0.5-21.1-6.5c-0.9-0.9-0.9-2.4,0-3.3 c0.9-0.9,2.4-0.9,3.3,0c3.8,3.8,12,5.2,17.9,5.2s14-1.4,17.9-5.2c0.9-0.9,2.4-0.9,3.3,0C193,201,193,202.4,192.1,203.3z M190.5,188.7c-4.9,0-8.9-4-8.9-8.9c0-4.9,4-8.9,8.9-8.9c4.9,0,8.9,4,8.9,8.9C199.4,184.7,195.4,188.7,190.5,188.7z"/>
          </svg>
          <span>Reddit</span>
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
  </body>
</html>`;

step("Format HTML");

const result = formatCode(replace, "html");

step("Write file");
fs.writeFileSync(`${__dirname}/../index.html`, result, "utf8");

step("End");
const total = performance.now() - steps[0].start;
console.log(`${chalk.yellow("Total")} ${(total / 1000).toFixed(2)}s`);

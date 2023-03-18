# red-otter

![Logo](.github/assets/logo.png)

Self-contained WebGL flexbox layout engine.

## Documentation

See [https://red-otter.dev](https://red-otter.dev).

## Install

```
yarn add red-otter
```

To render text you will also need to generate the font atlas. See [guide](https://red-otter.dev/#generating-font-atlas).

## Usage

```ts
import { Font, Context, Layout } from "red-otter";

const canvas = document.getElementById("app");

const font = new Font({
  spacingMetadataJsonURL: "/spacing.json",
  spacingBinaryURL: "/spacing.dat",
  fontAtlasTextureURL: "/uv.dat",
  UVBinaryURL: "/font-atlas.png",
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
```

## Features

- **Canvas-like WebGL renderer** which supports text rendering and arbitrary polygons (by triangulating them).
- **Text rendering** is based on a font atlas texture that uses SDF (signed distance field). This allows for smooth scaling and upscaling up to some extent (see example below). You can see how the texture looks here.
- **TTF file parser** that produces glyph atlas texture. The parser is quite simple and definitely won't parse all possible TTF files, but work on support for more features is in progress.
- **Layout engine** which resembles Facebook Yoga. as it roughly implements CSS-like flexbox layout. It supports most of the properties and has some limited styling capabilities. API is designed to resemble React Native styling.
- JSX support with DOM-like elements: `<view>`, `<text>`, `<shape>`.
- Full **TypeScript** support. IDE will guide through creating elements and applying styles. All incorrect props will be easily detected.
- **No dependencies**. The whole library is hand-crafted bare minimum of code required to do the job.

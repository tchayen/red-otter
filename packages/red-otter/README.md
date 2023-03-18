# red-otter

Self-contained WebGL flexbox layout engine.

## Documentation

See [https://red-otter.dev](https://red-otter.dev).

## Install

```
yarn add red-otter
```

To render text you will also need to generate the font atlas. See [guide](https://red-otter.dev/#generating-font-atlas).

For editor to correctly highlight TypeScript code, add to `compilerOptions` in `tsconfig.json`:

```json
{
  "jsx": "react",
  "jsxFactory": "ę"
}
```

## Usage

```ts
import { Font, Context, Layout } from "red-otter";

const canvas = document.getElementById("app");

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
```

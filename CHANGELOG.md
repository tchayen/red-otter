# Changelog

## 0.0.12

- Switch to the new JSX transform. As a consequence, now `tsconfig.json` fragment looks like this:
  ```diff
  - "jsx": "react",
  - "jsxFactory": "jsx",
  + "jsx": "react-jsx",
  + "jsxImportSource": "red-otter",
  ```
  and `vite.config.ts` plugin like this:
  ```diff
  - jsxFactory: "jsx",
  + jsx: "automatic",
  + jsxImportSource: "red-otter",
  ```

## 0.0.11

- Expand math utils further. Make each of the `Vec2`, `Vec3` and `Vec4` support the same set of methods. Add `math/utils.ts` file which supports basic 1D methods such as degree to radian conversion.

## 0.0.10

- More methods in the `Mat4` class. New exports of math utils from main package: `packShelves`, `triangulateLine`, `triangulatePolygon`.

## 0.0.9

- Sneak in some more math utils. Long term I suppose they will need to be extracted to another package, but so far I am happily avoiding messing with monorepo restructure.

## 0.0.8

- Add `Context#getWebGLContext()` so WebGL context can be accessed from outside.

## 0.0.7

- Move `Interactions` class to the main package.

## 0.0.6

- This version brings a considerable rendering speed up from rewriting `Context.ts` to use one buffer with strides instead of separate buffers for each vertex attribute. On `examples/interactivity` I am seeing frame times go down from 2ms to 0.5ms.

## 0.0.5

- It is now possible to trim text by providing `trimStart` and `trimEnd` coordinates to `Context#text()`, `Layout#text()` or via `TextStyle` prop `trimRectangle` in JSX API.
- A small fix to typings: functions returning JSX can now return `<shape>` and `<text>` and not only `<view>`.

## 0.0.4

- Fix for `<text>` showing only the first text node, making JSX much less useful.

## 0.0.3

- `Layout#flush()` is now `Layout#calculate()` to be more explicit and avoid confusion with `Context#flush()`
- Fix for critical error that would cause infinite loop if any element was too small to be displayed or had `display: none` set.

## 0.0.2

- Fix for TypeScript type of font atlas metadata.

## 0.0.1

- First public release.

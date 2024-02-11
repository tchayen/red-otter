

## [0.1.15](https://github.com/tchayen/red-otter/compare/v0.1.14...v0.1.15) (2024-02-11)


### Bug Fixes

* export LRUCache and Queue ([2a59580](https://github.com/tchayen/red-otter/commit/2a595800e802e847070bd72f7d6d3dcc89ca4dd5))

## [0.1.14](https://github.com/tchayen/red-otter/compare/v0.1.13...v0.1.14) (2024-02-04)


### Bug Fixes

* replace Mat4.rotateFromQuat() with Mat4.getRotationAndTranslationFromQuatAndVec() ([2c11e0e](https://github.com/tchayen/red-otter/commit/2c11e0eaa3279d4332dbd199aa57722cfbee78cd))

## [0.1.13](https://github.com/tchayen/red-otter/compare/v0.1.12...v0.1.13) (2024-02-04)


### Bug Fixes

* correct more math functions ([c013d58](https://github.com/tchayen/red-otter/commit/c013d58011c41f4f97ac3ef8fb7b38b973404ba1))

## [0.1.12](https://github.com/tchayen/red-otter/compare/v0.1.11...v0.1.12) (2024-02-03)


### Bug Fixes

* remove unnecessary * 2 ([9df2463](https://github.com/tchayen/red-otter/commit/9df246334ea35375546da13fbad99f16bcdb1086))

## [0.1.11](https://github.com/tchayen/red-otter/compare/v0.1.10...v0.1.11) (2024-02-03)


### Bug Fixes

* change Mat4.perspective to use WebGPU NDC space ([ebaf0fa](https://github.com/tchayen/red-otter/commit/ebaf0faa90a8ce855371045a05b79c83854e820a))

## [0.1.10](https://github.com/tchayen/red-otter/compare/v0.1.9...v0.1.10) (2024-02-02)


### Bug Fixes

* load color attachment in render pass instead of clearing ([70e763e](https://github.com/tchayen/red-otter/commit/70e763e442b0fd3185ad6e76995eb68671720c02))

## [0.1.9](https://github.com/tchayen/red-otter/compare/v0.1.8...v0.1.9) (2024-02-02)


### Bug Fixes

* add missing typings ([8162293](https://github.com/tchayen/red-otter/commit/8162293458f26933f6fd64440ff7c1a529106445))

## [0.1.8](https://github.com/tchayen/red-otter/compare/v0.1.7...v0.1.8) (2024-02-02)


### Bug Fixes

* make Mat4.lookAt() work like in other math libraries ([d9e2dbf](https://github.com/tchayen/red-otter/commit/d9e2dbf3d0c48a5dccba310e5e0a351fd19d79e0))

## [0.1.7](https://github.com/tchayen/red-otter/compare/v0.1.6...v0.1.7) (2024-01-20)


### Bug Fixes

* expose Input[#update](https://github.com/tchayen/red-otter/issues/update)() method ([07ea373](https://github.com/tchayen/red-otter/commit/07ea3739a54e9bb3d2a963c07b9d1aaaedd537a3))
* upgrade libraries to fix TS mismatch error ([2e69434](https://github.com/tchayen/red-otter/commit/2e69434e275e843c6fe7cdf8c6f3d48ae2cae387))

## [0.1.6](https://github.com/tchayen/red-otter/compare/v0.1.5...v0.1.6) (2024-01-13)


### Bug Fixes

* add support for onKeyDown in inputs ([53e7aad](https://github.com/tchayen/red-otter/commit/53e7aad61555462326630ac34f92fec7980236a4))

## [0.1.5](https://github.com/tchayen/red-otter/compare/v0.1.4...v0.1.5) (2024-01-13)

## [0.1.4](https://github.com/tchayen/red-otter/compare/v0.1.3...v0.1.4) (2024-01-07)


### Bug Fixes

* export lookups types ([f594b42](https://github.com/tchayen/red-otter/commit/f594b4282962da5df2680a306ddb5837fac4acac))

## [0.1.3](https://github.com/tchayen/red-otter/compare/v0.1.2...v0.1.3) (2024-01-07)


### Bug Fixes

* add onChange() handler to input fields ([52a29dc](https://github.com/tchayen/red-otter/commit/52a29dc20266224936c30c4524160196544bcd83))

## [0.1.2](https://github.com/tchayen/red-otter/compare/v0.1.1...v0.1.2) (2024-01-01)


### Bug Fixes

* export event enums and functions as values not types ([bdd6a43](https://github.com/tchayen/red-otter/commit/bdd6a43e554951ba3b608848e3110da734ed97d7))

## [0.1.1](https://github.com/tchayen/red-otter/compare/v0.1.0...v0.1.1) (2024-01-01)


### Bug Fixes

* export event types ([d2ba6db](https://github.com/tchayen/red-otter/commit/d2ba6db5fb8b10ec11e030d2b632b1e9cf403796))

## [0.1.0](https://github.com/tchayen/red-otter/compare/v0.0.16...v0.1.0) (2023-12-31)


### Features

* publish 0.1.0 ([#13](https://github.com/tchayen/red-otter/issues/13)) ([fd6d908](https://github.com/tchayen/red-otter/commit/fd6d9087f724dc223d039599c3c01b1397f49484))

# Changelog

## [Unreleased]

- Add new WebGPU renderer.
- Add missing styling and layout properties: `flexWrap`, `flexShrink`, `flexGrow`, `flexBasis`, `aspectRatio`, `minHeight` (and width and max variants), `overflow`.
- Refactor font handling code and added line wrapping, kerning, text alignment.
- Split layout and rendering into phases: `layout()`, `compose()`, `paint()`.
- Add event system scrolling support to `View` (use `BaseView` to avoid runtime cost of it).
- Add first components as building blocks for larger UIs: `Button` and `Input` (which supports keyboard and mouse selection).
- Improve CI and automated the release process.
- Remove JSX API for the time being while research is ongoing on how to make it play well with interactive components.
- Add unit tests.
- Add New docs website with multiple pages, search, API reference, examples, and guides.

## [0.0.16]

- Fix paths in `package.json` field `exports`.

## [0.0.15]

- Export `jsx-dev-runtime`.

## [0.0.14]

- Restore two entrypoints and replace UMD with CJS.

## [0.0.13]

- Fix UMD export.

## [0.0.12]

- Switch to the new JSX transform. As a consequence, now `tsconfig.json` fragment looks like this:
  ```diff
  - "jsx": "react",
  - "jsxFactory": "jsx",
  + "jsx": "react-jsx",
  + "jsxImportSource": "red-otter/dist",
  ```
  and `vite.config.ts` plugin like this:
  ```diff
  - jsxFactory: "jsx",
  + jsx: "automatic",
  + jsxImportSource: "red-otter",
  ```

## [0.0.11]

- Expand math utils further. Make each of the `Vec2`, `Vec3` and `Vec4` support the same set of methods. Add `math/utils.ts` file which supports basic 1D methods such as degree to radian conversion.

## [0.0.10]

- More methods in the `Mat4` class. New exports of math utils from main package: `packShelves`, `triangulateLine`, `triangulatePolygon`.

## [0.0.9]

- Sneak in some more math utils. Long term I suppose they will need to be extracted to another package, but so far I am happily avoiding messing with monorepo restructure.

## [0.0.8]

- Add `Context#getWebGLContext()` so WebGL context can be accessed from outside.

## [0.0.7]

- Move `Interactions` class to the main package.

## [0.0.6]

- This version brings a considerable rendering speed up from rewriting `Context.ts` to use one buffer with strides instead of separate buffers for each vertex attribute. On `examples/interactivity` I am seeing frame times go down from 2ms to 0.5ms.

## [0.0.5]

- It is now possible to trim text by providing `trimStart` and `trimEnd` coordinates to `Context#text()`, `Layout#text()` or via `TextStyle` prop `trimRectangle` in JSX API.
- A small fix to typings: functions returning JSX can now return `<shape>` and `<text>` and not only `<view>`.

## [0.0.4]

- Fix for `<text>` showing only the first text node, making JSX much less useful.

## [0.0.3]

- `Layout#flush()` is now `Layout#calculate()` to be more explicit and avoid confusion with `Context#flush()`
- Fix for critical error that would cause infinite loop if any element was too small to be displayed or had `display: none` set.

## [0.0.2]

- Fix for TypeScript type of font atlas metadata.

## [0.0.1]

- First public release.

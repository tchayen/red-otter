# Changelog

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

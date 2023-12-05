# Red Otter

> [!WARNING]
> This project is in early development stage. It's not ready for production use.

### What is it?

A flexbox (think CSS or Yoga) layout engine that comes with its own TTF font parser, text rasterizer, UI renderer, and a declarative UI API (think React).

Using JavaScript you can create a fully interactive, browser-like layout that lives inside a `<canvas />`.

### Why is it useful?

It's bold of you to assume I'd make something useful.

### What problem does it solve?

It is lightweight, zero-dependency solution for building complex UIs in environments where the only external APIs are the one to communicate to GPU the (like WebGPU, DirectX, Vulkan, Metal etc.) and the one to receive user input events.

Although in situations where JS is used, DOM is usually available, but the idea of this project is that the code is meant to be simple and C-style so it can easily be ported to many other languages and used in compiled code.

### When would I use it?

If you are writing a JavaScript application and need to render a browser-grade UI somewhere where you don't have or don't want to have a browser DOM, this might be useful. Architecture is layered and modular so WebGPU renderer for instance can be replaced with WebGL, canvas or Skia based one if needed.

### Why retained mode?

- Immediate mode often involves heavily caching which effectively becomes retained mode under the hood.
- Declarative expressiveness and ease of use of IMGUI can be for the most part achieved using a declarative API like React (and is some way it boils down to the same thing, oversimplifying it… greatly).
- Screen readers and other assistive technologies are easier to support with persistent UI trees.

> [!IMPORTANT]
> Red Otter is not meant to be used for creating websites. By rendering your own UI and text you prevent users from using screen readers, automatic translations, high-contrast mode etc. Use it only for applications where it is implied that those capabilities are not needed or otherwise would not be available.

---

## Context

This library works in a bit different set of constraints than a typical web application. When browser renders a web page, if all animations run under the screen’s frame rate time (usually 16.66ms) and all larger paints run under 100ms or however much time there is before user notices a part of UI and decides to interact with it – it’s perfect. There’s nothing really to improve there. It doesn’t matter if the actual rendering process took 1ms or 10ms as long as it happens in a given timeframe. If browser leans closer to the upper end but uses less CPU and consumes less battery – that’s great.

Games and 3D applications are different. Very different. It’s ok, even better if the game can use all computer resources effectively. CPU has 16 cores? Run on all 16. There’s never too fast for rendering a game. If all rendering work is done under 1ms – it leaves time for more complex game simulations and makes it more likely that the game will run on older PCs.

---

## Modularity

Even though this library does a lot of things, you don't need to use it all. Modern JS bundlers do well with tree shaking so as long as you import only what you need, your bundle size will grow only by the amount of code you actually use.

## Design and structure

Layers:

- `layout()` - takes tree of nodes and calculates screen positions and sizes. Runs only when component tree changes.
- `compose()` - takes tree of nodes after layout and calculates screen-space positions after including scrolling. Runs after user events.
- `paint()` - takes tree of nodes after compose and prepares commands for the renderer.
- `Renderer` - given precise commands renderes styled rectangles and text to the screen.

## Styling

As a rule of thumb, styling most closely resembles React Native which in turn resembles CSS.

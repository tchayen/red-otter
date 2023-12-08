# Red Otter

> [!WARNING]
> This project is in early development stage. It's not ready for production use.

### What is it?

A flexbox (think CSS or Yoga) layout engine that comes with its own TTF font parser, text rasterizer, UI renderer, and a declarative UI API (think React).

Using JavaScript you can create a fully interactive, browser-like layout that lives inside a `<canvas />`.

### What problem does it solve?

It gives you a fully working UI system written in plain JavaScript.

While it doesn't introduce anything new, all other possible solutions to this problem are either heavy C++ libraries or… entire web browsers. If you need a layout engine, Facebook Yoga is often used but it requires loading either via asm.js or WASM (See [Satori](https://github.com/vercel/satori#runtime-and-wasm)).

Usually in situations where one would use JavaScript for presenting UIs, DOM and generally the rest of the browser is available. But sometimes you would rather prefer to have a full control over rendering process, to be able to tie it to the game loop or want to use JS in non-browser environment while supplying it with the 3D graphics platform API.

### When would you use it?

If you are writing a JavaScript application and need to render a browser-grade UI somewhere where you don't have or don't want to have a browser DOM, this might be useful. Architecture is layered and modular, with WebGPU, WebGL and Canvas renderers available. You can also write your own.

If you are working on a web browser, operating system, game engine, a game with AAA-grade UI, Red Otter might be very useful.

> [!IMPORTANT]
> Red Otter is not meant to be used for creating websites. By rendering your own UI and text you prevent users from using screen readers, automatic translations, high-contrast mode etc. Use it only for applications where it is implied that those capabilities are not needed or otherwise would not be available.

### Why did I build this?

I always loved recreating things from scratch to learn how they work (see my [blog](https://tchayen.com)). So eventually time came for complex UIs.

This resonates well with the recent trend of creating new software that attemps to solve problems that were deemed too hard to be ever approach again, especially by a small team. Good example is a new web browser [Ladybird](https://ladybird.dev) and a new operating system [Serenity OS](https://serenityos.org/).

And finally, it was just a fun set of problems to work on.

---

## Context

This library works in a bit different set of constraints than a typical web application. When browser renders a web page, if all animations run under the screen’s frame rate time (usually 16.66ms) and all larger paints run under 100ms or however much time there is before user notices a part of UI and decides to interact with it – it’s perfect. There’s nothing really to improve there. It doesn’t matter if the actual rendering process took 1ms or 10ms as long as it happens in a given timeframe. If browser leans closer to the upper end but uses less CPU and consumes less battery – that’s great.

Games and 3D applications are different. Very different. It’s ok, even better if the game can use all computer resources effectively. CPU has 16 cores? Run on all 16. There’s never too fast for rendering a game. If all rendering work is done under 1ms – it leaves time for more complex game simulations and makes it more likely that the game will run on older PCs.

---

## Modularity

Even though this library does a lot of things, you don't need to use it all. Modern JS bundlers do well with tree shaking so as long as you import only what you need, your bundle size will grow only by the amount of code you actually use.

It's entirely up to you which parts to pick. Do you need a TTF parser? Good, we have one. Are you in need of some matrix calculations? We've got you covered. Do you need a full UI renderer for your WebGL game? We have that and all the needed pieces.

---

## Design and structure

The library consists of several directories grouping different features.

There's:

- `font` - providing TTF parsing, font atlas generation.
- `ui` - with `layout()`, `compose()` and `paint()`.
- `math` - with a math library equipped with `Mat4`, `Vec2`, `Vec3`, `Vec4`.

The pipeline of taking user defined components to the screen has multiple layers, separated based on how often they need to be run:

- `layout()` - takes tree of nodes and calculates screen positions and sizes. Runs only when component tree changes.
- `compose()` - takes tree of nodes after layout and calculates screen-space positions after including scrolling. Runs after user events.
- `paint()` - takes tree of nodes after compose and prepares commands for the renderer.
- `Renderer` - given precise commands renderes styled rectangles and text to the screen.

---

## Styling

As a rule of thumb, styling most closely resembles React Native which in turn resembles CSS.

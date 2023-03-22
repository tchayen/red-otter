import { describe, it, expect } from "vitest";

import { Vec4 } from "./math/Vec4";
import { parseColor } from "./parseColor";

describe("parseColor", () => {
  it("parses hex", () => {
    expect(parseColor("#ff0000")).toEqual(new Vec4(1, 0, 0, 1));
  });

  it("parses rgb", () => {
    expect(parseColor("rgb(255, 0, 0)")).toEqual(new Vec4(1, 0, 0, 1));
  });

  it("parses rgba", () => {
    expect(parseColor("rgba(255, 0, 0, 0.5)")).toEqual(new Vec4(1, 0, 0, 0.5));
  });

  it("parses hsl", () => {
    expect(parseColor("hsl(60, 100%, 50%)")).toEqual(new Vec4(1, 1, 0, 1));
    expect(parseColor("hsl(60 100% 50%)")).toEqual(new Vec4(1, 1, 0, 1));
  });

  it("parses hsla", () => {
    expect(parseColor("hsla(30, 60%, 90%, 0.8)")).toEqual(
      new Vec4(0.96, 0.9, 0.8400000000000001, 0.8)
    );
    expect(parseColor("hsla(30 60% 90% 0.8)")).toEqual(
      new Vec4(0.96, 0.9, 0.8400000000000001, 0.8)
    );
    expect(parseColor("hsla(30 60% 90% / 0.8)")).toEqual(
      new Vec4(0.96, 0.9, 0.8400000000000001, 0.8)
    );
  });
});

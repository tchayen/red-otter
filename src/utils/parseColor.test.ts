import { describe, it, expect } from "vitest";

import { parseColor } from "./parseColor";
import { Vec4 } from "../math/Vec4";

describe("parseColor", () => {
  describe("hex colors", () => {
    it("should parse hex color", () => {
      expect(parseColor("#ff0000")).toEqual(new Vec4(1, 0, 0, 1));
    });

    it("should parse with alpha", () => {
      expect(parseColor("#ff0000aa")).toEqual(new Vec4(1, 0, 0, 0.666_666_666_666_666_6));
    });

    it("should parse short hex", () => {
      expect(parseColor("#f00")).toEqual(new Vec4(1, 0, 0, 1));
    });

    it("should reject other length of hex", () => {
      expect(() => parseColor("#ff00")).toThrow();
    });
  });

  describe("RGB colors", () => {
    it("should parse RGB", () => {
      expect(parseColor("rgb(255, 0, 0)")).toEqual(new Vec4(1, 0, 0, 1));
    });

    it("should parse RGB without commas", () => {
      expect(parseColor("rgb(255 0 0)")).toEqual(new Vec4(1, 0, 0, 1));
    });

    it("should parse RGBA", () => {
      expect(parseColor("rgba(255, 0, 0, 0.5)")).toEqual(new Vec4(1, 0, 0, 0.5));
    });

    it("should reject RGB with alpha", () => {
      expect(() => parseColor("rgb(255, 0, 0, 0.5)")).toThrow();
    });
  });

  describe("HSL colors", () => {
    it("should parse", () => {
      expect(parseColor("hsl(60, 100%, 50%)")).toEqual(new Vec4(1, 1, 0, 1));
    });

    it("should parse without commas", () => {
      expect(parseColor("hsl(60 100% 50%)")).toEqual(new Vec4(1, 1, 0, 1));
    });

    it("should parse with alpha", () => {
      expect(parseColor("hsl(60, 100%, 50%, 0.8)")).toEqual(new Vec4(1, 1, 0, 0.8));
    });

    it("should parse HSLA", () => {
      expect(parseColor("hsla(60, 100%, 50%, 0.8)")).toEqual(new Vec4(1, 1, 0, 0.8));
    });

    it("should parse HSLA without commas", () => {
      expect(parseColor("hsla(60 100% 50% 0.8)")).toEqual(new Vec4(1, 1, 0, 0.8));
    });

    it("should parse HSLA with a slash", () => {
      expect(parseColor("hsla(60 100% 50% / 0.8)")).toEqual(new Vec4(1, 1, 0, 0.8));
    });
  });
});

import { describe, expect, it } from "vitest";
import { shapeText } from "./shapeText";
import interTTF from "../../public/interTTF.json"; // This is a 1.8MB JSON file (95kB gzipped).
import { prepareLookups } from "../font/prepareLookups";
import type { TTF } from "../font/parseTTF";

const alphabet =
  "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890 ,.:•-–()[]{}!?@#$%^&*+=/\\|<>`~’'\";_";
const lookups = prepareLookups(
  [{ buffer: new ArrayBuffer(0), name: "Inter", ttf: interTTF as TTF }],
  { alphabet, fontSize: 150 },
);

describe("shapeText", () => {
  it("should work", () => {
    expect(true).toBe(true);

    shapeText({
      fontName: "Inter",
      fontSize: 15,
      lineHeight: 20,
      lookups,
      text: "Hello, World!",
      textAlignment: "left",
    });
  });
});

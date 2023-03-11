import path from "node:path";
import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { TTF } from "./TTF";

describe("parseTTF", () => {
  it("parses Inter 3.19 OTF file", () => {
    const file = fs.readFileSync(
      path.join(__dirname, "../../../../assets/inter-hinted-3-19.ttf")
    );

    const ttf = new TTF(file);

    expect(ttf.head.checksumAdjustment).toBe(79606982);
    expect(ttf.head.xMax).toBe(7274);
    expect(ttf.head.xMin).toBe(-2080);

    expect(ttf.cmap.version).toBe(0);
    expect(ttf.cmap.format).toBe(4);
    expect(ttf.cmap.glyphIndexMap.get(32)).toBe(1682);

    expect(ttf.maxp.numGlyphs).toBe(2548);

    expect(ttf.hhea.ascender).toBe(2728);
    expect(ttf.hhea.descender).toBe(-680);
  });
});

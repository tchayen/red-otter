import { TTF, ValueRecord } from "./parseTTF";
import { KerningFunction } from "./types";
import { generateGlyphToClassMap } from "./generateGlyphToClassMap";

/**
 * @param ttf parsed TTF file (see parseTTF.ts)
 * @returns a function that takes two glyph IDs and returns the kerning value.
 */
export function generateKerningFunction(ttf: TTF): KerningFunction {
  const kerningPairs = new Map<number, Map<number, number>>();
  let firstGlyphClassMapping = new Map<number, number>();
  let secondGlyphClassMapping = new Map<number, number>();

  let classRecords: {
    value1?: ValueRecord | undefined;
    value2?: ValueRecord | undefined;
  }[][] = [];

  const kern = ttf.GPOS?.features.find((f) => f.tag === "kern");
  if (kern) {
    const lookups = kern.lookupListIndices.map((id) => ttf.GPOS?.lookups[id]);

    for (const lookup of lookups) {
      if (lookup && (lookup.lookupType === 2 || lookup.lookupType === 9)) {
        // Ensure it's Pair Adjustment
        for (const subtable of lookup.subtables) {
          if (lookup.lookupType === 9 && subtable.extensionLookupType === 2) {
            const coverage = subtable.extension.coverage;

            if (subtable.extension.posFormat === 1) {
              // Adjustment for glyph pairs.
              const pairSets = subtable.extension.pairSets;

              if (coverage.coverageFormat === 2) {
                let indexCounter = 0;
                for (const range of coverage.rangeRecords) {
                  for (let glyphID = range.startGlyphID; glyphID <= range.endGlyphID; glyphID++) {
                    const pairs = pairSets[indexCounter];

                    const glyphKernMap = kerningPairs.get(glyphID) || new Map<number, number>();
                    for (const pair of pairs) {
                      if (pair.value1?.xAdvance) {
                        glyphKernMap.set(pair.secondGlyph, pair.value1.xAdvance);
                      }
                    }
                    if (glyphKernMap.size > 0) {
                      kerningPairs.set(glyphID, glyphKernMap);
                    }

                    indexCounter++;
                  }
                }
              } else {
                console.warn(`Coverage format ${coverage.coverageFormat} is not supported.`);
              }
            } else if (subtable.extension.posFormat === 2) {
              // Adjustment for glyph classes.
              if (coverage.coverageFormat === 2) {
                const { classDef1, classDef2 } = subtable.extension;
                firstGlyphClassMapping = generateGlyphToClassMap(classDef1);
                secondGlyphClassMapping = generateGlyphToClassMap(classDef2);
                classRecords = subtable.extension.classRecords;
              } else {
                console.warn(`Coverage format ${coverage.coverageFormat} is not supported.`);
              }
            }
          }
        }
      }
    }
  }

  return (leftGlyph: number, rightGlyph: number): number => {
    if (!ttf.GPOS) {
      return 0;
    }

    const firstGlyphID = ttf.cmap.glyphIndexMap[leftGlyph];
    const secondGlyphID = ttf.cmap.glyphIndexMap[rightGlyph];
    if (!firstGlyphID || !secondGlyphID) {
      return 0;
    }

    const firstMap = kerningPairs.get(firstGlyphID);
    if (firstMap) {
      if (firstMap.get(secondGlyphID)) {
        return firstMap.get(secondGlyphID) ?? 0;
      }
    }

    if (classRecords.length === 0) {
      return 0;
    }

    // It's specified in the spec that if class is not defined for a glyph, it
    // should be set to 0.
    const firstClass = firstGlyphClassMapping.get(firstGlyphID) ?? 0;
    const secondClass = secondGlyphClassMapping.get(secondGlyphID) ?? 0;

    const record = classRecords[firstClass][secondClass];
    return record.value1?.xAdvance ?? 0;
  };
}

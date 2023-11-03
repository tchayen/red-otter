import { ClassDefFormat1, ClassDefFormat2 } from "./parseTTF";

/**
 * @param classDef class definition table.
 * @returns a map from glyph ID to class ID.
 */
export function generateGlyphToClassMap(
  classDef: ClassDefFormat1 | ClassDefFormat2
): Map<number, number> {
  const glyphToClass = new Map<number, number>();

  if (classDef.format === 1) {
    // ClassDefFormat1
    let glyphID = classDef.startGlyph;
    for (const classValue of classDef.classes) {
      glyphToClass.set(glyphID, classValue);
      glyphID++;
    }
  } else if (classDef.format === 2) {
    // ClassDefFormat2
    for (const range of classDef.ranges) {
      for (
        let glyphID = range.startGlyphID;
        glyphID <= range.endGlyphID;
        glyphID++
      ) {
        glyphToClass.set(glyphID, range.class);
      }
    }
  }

  return glyphToClass;
}

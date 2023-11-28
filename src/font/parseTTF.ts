import { invariant } from "../utils/invariant";
import type { Fixed, FWord, Int16, Uint16, Uint32 } from "./BinaryReader";
import { BinaryReader } from "./BinaryReader";

/**
 * @param data TTF file in binary format.
 * @returns a parsed TTF object.
 */
export function parseTTF(data: ArrayBuffer): TTF {
  const ttf: Partial<TTF> = {};

  const reader = new BinaryReader(data);
  reader.getUint32(); // scalar type
  const numTables = reader.getUint16();
  reader.getUint16(); // searchRange
  reader.getUint16(); // entrySelector
  reader.getUint16(); // rangeShift

  const tables: Record<string, Table> = {};

  for (let i = 0; i < numTables; i++) {
    const tag = reader.getString(4);
    const checksum = reader.getUint32();
    const offset = reader.getUint32();
    const length = reader.getUint32();
    tables[tag] = {
      checksum,
      length,
      offset,
    };

    if (tag !== "head") {
      const table = tables[tag];
      invariant(table, `Table ${tag} is missing.`);
      const calculated = calculateChecksum(
        reader.getDataSlice(table.offset, 4 * Math.ceil(table.length / 4))
      );
      invariant(calculated === table.checksum, `Checksum for table ${tag} is invalid.`);
    }
  }

  const shared = "table is missing. Please use other font variant that contains it.";

  invariant(tables["head"], `head ${shared}`);
  ttf.head = readHeadTable(reader, tables["head"].offset);

  invariant(tables["cmap"], `cmap ${shared}`);
  ttf.cmap = readCmapTable(reader, tables["cmap"].offset);

  invariant(tables["maxp"], `maxp ${shared}`);
  ttf.maxp = readMaxpTable(reader, tables["maxp"].offset);

  invariant(tables["hhea"], `hhea ${shared}`);
  ttf.hhea = readHheaTable(reader, tables["hhea"].offset);

  invariant(tables["hmtx"], `hmtx ${shared}`);
  ttf.hmtx = readHmtxTable(
    reader,
    tables["hmtx"].offset,
    ttf.maxp?.numGlyphs,
    ttf.hhea?.numberOfHMetrics
  );

  invariant(tables["loca"], `loca ${shared}`);
  ttf.loca = readLocaTable(
    reader,
    tables["loca"].offset,
    ttf.maxp?.numGlyphs,
    ttf.head?.indexToLocFormat
  );

  invariant(tables["glyf"], `glyf ${shared}`);
  ttf.glyf = readGlyfTable(reader, tables["glyf"].offset, ttf.loca, ttf.head?.indexToLocFormat);

  if (tables["GPOS"]) {
    ttf.GPOS = readGPOSTable(reader, tables["GPOS"].offset);
  }

  return ttf as TTF;
}

/**
 *  See: [Microsoft docs](https://learn.microsoft.com/en-us/typography/opentype/spec/otff#calculating-checksums).
 */
function calculateChecksum(data: Uint8Array): number {
  const nlongs = data.length / 4;
  invariant(nlongs === Math.floor(nlongs), "Data length must be divisible by 4.");

  let sum = 0;
  for (let i = 0; i < nlongs; i++) {
    const int32 =
      (data[i * 4]! << 24) + (data[i * 4 + 1]! << 16) + (data[i * 4 + 2]! << 8) + data[i * 4 + 3]!;
    const unsigned = int32 >>> 0;
    sum = ((sum + unsigned) & 0xff_ff_ff_ff) >>> 0;
  }

  return sum;
}

/**
 *  See: [Microsoft docs](https://learn.microsoft.com/en-us/typography/opentype/spec/head).
 */
function readHeadTable(reader: BinaryReader, offset: number): HeadTable {
  const position = reader.getPosition();
  reader.setPosition(offset);

  const majorVersion = reader.getUint16();
  const minorVersion = reader.getUint16();
  const fontRevision = reader.getFixed();
  const checksumAdjustment = reader.getUint32();
  const magicNumber = reader.getUint32();
  const flags = reader.getUint16();
  const unitsPerEm = reader.getUint16();
  const created = reader.getDate().toISOString();
  const modified = reader.getDate().toISOString();
  const xMin = reader.getFWord();
  const yMin = reader.getFWord();
  const xMax = reader.getFWord();
  const yMax = reader.getFWord();
  const macStyle = reader.getUint16();
  const lowestRecPPEM = reader.getUint16();
  const fontDirectionHint = reader.getInt16();
  const indexToLocFormat = reader.getInt16();
  const glyphDataFormat = reader.getInt16();

  const head: HeadTable = {
    checksumAdjustment,
    created,
    flags,
    fontDirectionHint,
    fontRevision,
    glyphDataFormat,
    indexToLocFormat,
    lowestRecPPEM,
    macStyle,
    magicNumber,
    majorVersion,
    minorVersion,
    modified,
    unitsPerEm,
    xMax,
    xMin,
    yMax,
    yMin,
  };

  invariant(head.magicNumber === 0x5f_0f_3c_f5, "Invalid magic number.");

  reader.setPosition(position);
  return head;
}

/**
 *  See: [Microsoft docs](https://docs.microsoft.com/en-us/typography/opentype/spec/maxp).
 */
function readMaxpTable(reader: BinaryReader, offset: number): MaxpTable {
  const position = reader.getPosition();
  reader.setPosition(offset);

  const version = reader.getUint32();
  const versionString =
    version === 0x00_00_50_00 ? "0.5" : version === 0x00_01_00_00 ? "1.0" : null;

  invariant(
    versionString,
    `Unsupported maxp table version (expected 0x00005000 or 0x00010000 but found ${version.toString(
      16
    )}).`
  );
  const numGlyphs = reader.getUint16();

  const maxp: MaxpTable = {
    numGlyphs,
    version: versionString,
  };

  reader.setPosition(position);
  return maxp;
}

/**
 *  See: [Microsoft docs](https://docs.microsoft.com/en-us/typography/opentype/spec/cmap).
 */
export function readCmapTable(reader: BinaryReader, offset: number): CmapTable {
  const position = reader.getPosition();
  reader.setPosition(offset);

  const version = reader.getUint16();
  invariant(version === 0, "Invalid cmap table version.");

  const numTables = reader.getUint16();
  const encodingRecords: {
    encodingID: Uint16;
    offset: Uint32;
    platformID: Uint16;
  }[] = [];

  let selectedOffset: number | null = null;
  for (let i = 0; i < numTables; i++) {
    const platformID = reader.getUint16();
    const encodingID = reader.getUint16();
    const offset = reader.getUint32();
    encodingRecords.push({ encodingID, offset, platformID });

    const isWindowsPlatform =
      platformID === 3 && (encodingID === 0 || encodingID === 1 || encodingID === 10);

    const isUnicodePlatform =
      platformID === 0 &&
      (encodingID === 0 ||
        encodingID === 1 ||
        encodingID === 2 ||
        encodingID === 3 ||
        encodingID === 4);

    if (isWindowsPlatform || isUnicodePlatform) {
      selectedOffset = offset;
    }
  }

  invariant(selectedOffset !== null, "No supported cmap table found.");
  const format = reader.getUint16();

  invariant(format === 4, `Unsupported cmap table format. Expected 4, found ${format}.`);

  const length = reader.getUint16();
  const language = reader.getUint16();
  const segCountX2 = reader.getUint16();
  const segCount = segCountX2 / 2;
  const searchRange = reader.getUint16();
  const entrySelector = reader.getUint16();
  const rangeShift = reader.getUint16();

  const endCodes: number[] = [];
  for (let i = 0; i < segCount; i++) {
    endCodes.push(reader.getUint16());
  }

  reader.getUint16(); // reservedPad

  const startCodes: number[] = [];
  for (let i = 0; i < segCount; i++) {
    startCodes.push(reader.getUint16());
  }

  const idDeltas: number[] = [];
  for (let i = 0; i < segCount; i++) {
    idDeltas.push(reader.getUint16());
  }

  const idRangeOffsetsStart = reader.getPosition();

  const idRangeOffsets: number[] = [];
  for (let i = 0; i < segCount; i++) {
    idRangeOffsets.push(reader.getUint16());
  }

  const glyphIndexMap: Record<number, number> = {};

  for (let i = 0; i < segCount - 1; i++) {
    let glyphIndex = 0;
    const endCode = endCodes[i];
    const startCode = startCodes[i];
    const idDelta = idDeltas[i];
    const idRangeOffset = idRangeOffsets[i];
    invariant(endCode !== undefined, "endCode is undefined.");
    invariant(startCode !== undefined, "startCode is undefined.");
    invariant(idDelta !== undefined, "idDelta is undefined.");
    invariant(idRangeOffset !== undefined, "idRangeOffset is undefined.");

    for (let c = startCode; c <= endCode; c++) {
      if (idRangeOffset !== 0) {
        const startCodeOffset = (c - startCode) * 2;
        const currentRangeOffset = i * 2; // 2 because the numbers are 2 byte big.

        const glyphIndexOffset =
          idRangeOffsetsStart + idRangeOffset + currentRangeOffset + startCodeOffset;

        reader.setPosition(glyphIndexOffset);
        glyphIndex = reader.getUint16();
        if (glyphIndex !== 0) {
          // & 0xffff is modulo 65536.
          glyphIndex = (glyphIndex + idDelta) & 65_535;
        }
      } else {
        glyphIndex = (c + idDelta) & 65_535;
      }
      glyphIndexMap[c] = glyphIndex;
    }
  }

  const cmap: CmapTable = {
    encodingRecords,
    endCodes,
    entrySelector,
    format,
    glyphIndexMap,
    idDeltas,
    idRangeOffsets,
    language,
    length,
    numTables,
    rangeShift,
    searchRange,
    segCount,
    segCountX2,
    startCodes,
    version,
  };

  reader.setPosition(position);
  return cmap;
}

/**
 *  See: [Microsoft docs](https://docs.microsoft.com/en-us/typography/opentype/spec/hhea).
 */
function readHheaTable(reader: BinaryReader, offset: number): HheaTable {
  const position = reader.getPosition();
  reader.setPosition(offset);

  const majorVersion = reader.getUint16();
  const minorVersion = reader.getUint16();
  const ascender = reader.getInt16();
  const descender = reader.getInt16();
  const lineGap = reader.getInt16();
  const advanceWidthMax = reader.getUint16();
  const minLeftSideBearing = reader.getInt16();
  const minRightSideBearing = reader.getInt16();
  const xMaxExtent = reader.getInt16();
  const caretSlopeRise = reader.getInt16();
  const caretSlopeRun = reader.getInt16();
  const caretOffset = reader.getInt16();
  const reserved1 = reader.getInt16();
  const reserved2 = reader.getInt16();
  const reserved3 = reader.getInt16();
  const reserved4 = reader.getInt16();
  const metricDataFormat = reader.getInt16();
  const numberOfHMetrics = reader.getUint16();

  const hhea: HheaTable = {
    advanceWidthMax,
    ascender,
    caretOffset,
    caretSlopeRise,
    caretSlopeRun,
    descender,
    lineGap,
    majorVersion,
    metricDataFormat,
    minLeftSideBearing,
    minRightSideBearing,
    minorVersion,
    numberOfHMetrics,
    reserved1,
    reserved2,
    reserved3,
    reserved4,
    xMaxExtent,
  };

  reader.setPosition(position);
  return hhea;
}

/**
 * Records are indexed by glyph ID. As an optimization, the number of records
 * can be less than the number of glyphs, in which case the advance width value
 * of the last record applies to all remaining glyph IDs.
 *
 * If `numberOfHMetrics` is less than the total number of glyphs, then the
 * `hMetrics` array is followed by an array for the left side bearing values of
 * the remaining glyphs.
 *
 *  See: [Microsoft docs](https://learn.microsoft.com/en-us/typography/opentype/spec/hmtx).
 */
function readHmtxTable(
  reader: BinaryReader,
  offset: number,
  numGlyphs: number,
  numOfLongHorMetrics: number
): HmtxTable {
  const position = reader.getPosition();
  reader.setPosition(offset);

  const hMetrics: {
    advanceWidth: Uint16;
    leftSideBearing: Int16;
  }[] = [];
  for (let i = 0; i < numOfLongHorMetrics; i++) {
    hMetrics.push({
      advanceWidth: reader.getUint16(),
      leftSideBearing: reader.getInt16(),
    });
  }

  const leftSideBearings: number[] = [];
  for (let i = 0; i < numGlyphs - numOfLongHorMetrics; i++) {
    leftSideBearings.push(reader.getInt16());
  }

  const hmtx: HmtxTable = {
    hMetrics,
    leftSideBearings,
  };

  invariant(
    hMetrics.length + leftSideBearings.length === numGlyphs,
    `The number of hMetrics (${hMetrics.length}) plus the number of left side bearings (${leftSideBearings.length}) must equal the number of glyphs (${numGlyphs}).`
  );

  reader.setPosition(position);
  return hmtx;
}

/**
 * Size of `offsets` is `numGlyphs + 1`.
 *
 * By definition, index zero points to the "missing character", which is the
 * character that appears if a character is not found in the font. The missing
 * character is commonly represented by a blank box or a space.
 *
 *  See: [Microsoft docs](https://docs.microsoft.com/en-us/typography/opentype/spec/loca).
 */
function readLocaTable(
  reader: BinaryReader,
  offset: number,
  numGlyphs: number,
  indexToLocFormat: number
): LocaTable {
  const position = reader.getPosition();
  reader.setPosition(offset);

  const loca: number[] = [];
  for (let i = 0; i < numGlyphs + 1; i++) {
    loca.push(indexToLocFormat === 0 ? reader.getUint16() : reader.getUint32());
  }

  reader.setPosition(position);
  return { offsets: loca };
}
/**
 * See: [Microsoft docs](https://docs.microsoft.com/en-us/typography/opentype/spec/glyf).
 */
function readGlyfTable(
  reader: BinaryReader,
  offset: number,
  loca: LocaTable,
  indexToLocFormat: number
): GlyfTable {
  const position = reader.getPosition();
  reader.setPosition(offset);

  const glyfs = [];
  for (let i = 0; i < loca.offsets.length - 1; i++) {
    const multiplier = indexToLocFormat === 0 ? 2 : 1;
    const locaOffset = loca.offsets[i];
    invariant(locaOffset !== undefined, "Loca offset is undefined.");

    reader.setPosition(offset + locaOffset * multiplier);

    const numberOfContours = reader.getInt16();
    const xMin = reader.getInt16();
    const yMin = reader.getInt16();
    const xMax = reader.getInt16();
    const yMax = reader.getInt16();

    glyfs.push({
      numberOfContours,
      xMax,
      xMin,
      yMax,
      yMin,
    });
  }

  reader.setPosition(position);
  return glyfs;
}

function readGPOSTable(reader: BinaryReader, offset: number): GPOSTable {
  const position = reader.getPosition();
  reader.setPosition(offset);

  const major = reader.getUint16();
  const minor = reader.getUint16();

  invariant(major === 1 && minor === 0, "Only GPOS version 1.0 is supported.");

  reader.getUint16(); // scriptListOffset
  const featureListOffset = reader.getUint16();
  const lookupListOffset = reader.getUint16();

  reader.setPosition(offset + featureListOffset);

  const featureCount = reader.getUint16();

  const featureInfo = [];
  const features = [];
  for (let i = 0; i < featureCount; i++) {
    const tag = reader.getString(4);
    const offset = reader.getUint16();
    const feature = { offset, tag };

    featureInfo.push(feature);
  }

  for (let i = 0; i < featureCount; i++) {
    const featureInfoElement = featureInfo[i];
    invariant(featureInfoElement !== undefined, "Feature info is undefined.");
    reader.setPosition(offset + featureListOffset + featureInfoElement.offset);

    const paramsOffset = reader.getUint16();
    const lookupIndexCount = reader.getUint16();
    const lookupListIndices: number[] = [];

    for (let j = 0; j < lookupIndexCount; j++) {
      lookupListIndices.push(reader.getUint16());
    }

    features.push({
      lookupListIndices,
      paramsOffset,
      tag: featureInfoElement.tag,
    });
  }

  reader.setPosition(offset + lookupListOffset);
  const lookupCount = reader.getUint16();

  enum LookupType {
    SingleAdjustment = 1,
    PairAdjustment = 2,
    CursiveAttachment = 3,
    MarkToBaseAttachment = 4,
    MarkToLigatureAttachment = 5,
    MarkToMarkAttachment = 6,
    ContextPositioning = 7,
    ChainedContextPositioning = 8,
    ExtensionPositioning = 9,
  }

  const lookupTables: number[] = [];
  for (let i = 0; i < lookupCount; i++) {
    lookupTables.push(reader.getUint16());
  }

  const lookups: GPOSLookup[] = [];
  for (let i = 0; i < lookupCount; i++) {
    const lookupTable = lookupTables[i];
    invariant(lookupTable !== undefined, "Lookup table is undefined.");
    reader.setPosition(offset + lookupListOffset + lookupTable);

    const lookupType = reader.getUint16();
    const lookupFlag = reader.getUint16();
    const subTableCount = reader.getUint16();
    const subTableOffsets: number[] = [];
    for (let j = 0; j < subTableCount; j++) {
      subTableOffsets.push(reader.getUint16());
    }

    let markFilteringSet;
    if (lookupFlag & 0x00_10) {
      markFilteringSet = reader.getUint16();
    }

    const lookup: GPOSLookup = {
      lookupFlag,
      lookupType: lookupType,
      markFilteringSet,
      subtables: [],
    };

    // Only extension supported for now.
    if (lookupType === LookupType.ExtensionPositioning) {
      for (let j = 0; j < subTableCount; j++) {
        const subTableOffset = subTableOffsets[j];
        invariant(subTableOffset !== undefined, "Subtable offset is undefined.");
        reader.setPosition(offset + lookupListOffset + lookupTable + subTableOffset);

        const posFormat = reader.getUint16();
        const extensionLookupType = reader.getUint16();
        const extensionOffset = reader.getUint32();

        let extension = {} as ExtensionLookupType2Format1 | ExtensionLookupType2Format2;
        reader.runAt(
          offset + lookupListOffset + lookupTable + subTableOffset + extensionOffset,
          () => {
            if (extensionLookupType === LookupType.PairAdjustment) {
              const posFormat = reader.getUint16();
              invariant(posFormat === 1 || posFormat === 2, "Invalid posFormat.");
              extension.posFormat = posFormat;

              if (posFormat === 1) {
                const coverageOffset = reader.getUint16();
                const valueFormat1 = reader.getUint16();
                const valueFormat2 = reader.getUint16();
                const pairSetCount = reader.getUint16();
                const pairSetOffsets: number[] = [];
                for (let i = 0; i < pairSetCount; i++) {
                  pairSetOffsets.push(reader.getUint16());
                }

                const pairSets: {
                  secondGlyph: number;
                  value1?: ValueRecord;
                  value2?: ValueRecord;
                }[][] = [];
                for (let k = 0; k < pairSetCount; k++) {
                  const pairSetOffset = pairSetOffsets[k];
                  invariant(pairSetOffset !== undefined, "Pair set offset is undefined.");
                  reader.setPosition(
                    offset +
                      lookupListOffset +
                      lookupTable +
                      subTableOffset +
                      extensionOffset +
                      pairSetOffset
                  );

                  const pairValueCount = reader.getUint16();
                  const pairValues: (typeof pairSets)[number] = [];
                  for (let l = 0; l < pairValueCount; l++) {
                    const pairValue: (typeof pairSets)[number][number] = {
                      secondGlyph: reader.getUint16(),
                    };
                    const value1 = getValueRecord(reader, valueFormat1);
                    const value2 = getValueRecord(reader, valueFormat2);

                    if (value1) {
                      pairValue.value1 = value1;
                    }
                    if (value2) {
                      pairValue.value2 = value2;
                    }
                    pairValues.push(pairValue);
                  }
                  pairSets.push(pairValues);
                }

                extension.coverage = reader.runAt(
                  offset +
                    lookupListOffset +
                    lookupTable +
                    subTableOffset +
                    extensionOffset +
                    coverageOffset,
                  () => {
                    const coverageFormat = reader.getUint16();

                    return parseCoverage(reader, coverageFormat);
                  }
                );

                extension = {
                  ...extension,
                  pairSets,
                  valueFormat1: valueFormat1,
                  valueFormat2: valueFormat2,
                } as ExtensionLookupType2Format1;
              } else if (posFormat === 2) {
                const coverageOffset = reader.getUint16();
                const valueFormat1 = reader.getUint16();
                const valueFormat2 = reader.getUint16();
                const classDef1Offset = reader.getUint16();
                const classDef2Offset = reader.getUint16();
                const class1Count = reader.getUint16();
                const class2Count = reader.getUint16();

                extension.coverage = reader.runAt(
                  offset +
                    lookupListOffset +
                    lookupTable +
                    subTableOffset +
                    extensionOffset +
                    coverageOffset,
                  () => {
                    const coverageFormat = reader.getUint16();
                    return parseCoverage(reader, coverageFormat);
                  }
                );

                const classDef1 = reader.runAt(
                  offset +
                    lookupListOffset +
                    lookupTable +
                    subTableOffset +
                    extensionOffset +
                    classDef1Offset,
                  () => {
                    return parseClassDef(reader);
                  }
                );

                const classDef2 = reader.runAt(
                  offset +
                    lookupListOffset +
                    lookupTable +
                    subTableOffset +
                    extensionOffset +
                    classDef2Offset,
                  () => {
                    return parseClassDef(reader);
                  }
                );

                const classRecords: {
                  value1?: ValueRecord;
                  value2?: ValueRecord;
                }[][] = [];

                for (let k = 0; k < class1Count; k++) {
                  const class1Record: (typeof classRecords)[number] = [];
                  for (let l = 0; l < class2Count; l++) {
                    const class2Record: (typeof class1Record)[number] = {};
                    const value1 = getValueRecord(reader, valueFormat1);
                    const value2 = getValueRecord(reader, valueFormat2);

                    if (value1) {
                      class2Record.value1 = value1;
                    }

                    if (value2) {
                      class2Record.value2 = value2;
                    }

                    class1Record.push(class2Record);
                  }
                  classRecords.push(class1Record);
                }

                extension = {
                  ...extension,
                  classDef1,
                  classDef2,
                  classRecords,
                  valueFormat1: valueFormat1,
                  valueFormat2: valueFormat2,
                } as ExtensionLookupType2Format2;
              } else {
                console.warn("Only Pair Adjustment lookup format 1 and 2 are supported.");
              }
            }
          }
        );

        lookup.subtables.push({
          extension,
          extensionLookupType,
          posFormat,
        });
      }
    } else {
      console.warn("Only Extension Positioning lookup type is supported.");
    }

    lookups.push(lookup);
  }

  reader.setPosition(position);

  return {
    features,
    lookups,
  };
}

export type TTF = {
  GPOS?: GPOSTable;
  cmap: CmapTable;
  glyf: GlyfTable;
  head: HeadTable;
  hhea: HheaTable;
  hmtx: HmtxTable;
  loca: LocaTable;
  maxp: MaxpTable;
};

export type Table = {
  checksum: number;
  length: number;
  offset: number;
};

export type HeadTable = {
  checksumAdjustment: Uint32;
  created: string;
  flags: Uint16;
  fontDirectionHint: Int16;
  fontRevision: Fixed;
  glyphDataFormat: Int16;
  indexToLocFormat: Int16;
  lowestRecPPEM: Uint16;
  macStyle: Uint16;
  magicNumber: Uint32;
  majorVersion: Uint16;
  minorVersion: Uint16;
  modified: string;
  unitsPerEm: Uint16;
  xMax: FWord;
  xMin: FWord;
  yMax: FWord;
  yMin: FWord;
};

export type CmapTable = {
  encodingRecords: {
    encodingID: Uint16;
    offset: Uint32;
    platformID: Uint16;
  }[];
  endCodes: Uint16[];
  entrySelector: Uint16;
  format: Uint16;
  glyphIndexMap: Record<number, number>;
  idDeltas: Int16[];
  idRangeOffsets: Uint16[];
  language: Uint16;
  length: Uint16;
  numTables: Uint16;
  rangeShift: Uint16;
  searchRange: Uint16;
  segCount: Uint16;
  segCountX2: Uint16;
  startCodes: Uint16[];
  version: Uint16;
};

export type MaxpTable = {
  numGlyphs: Uint16;
  version: "0.5" | "1.0";
};

export type HheaTable = {
  advanceWidthMax: Uint16;
  ascender: FWord;
  caretOffset: FWord;
  caretSlopeRise: Int16;
  caretSlopeRun: Int16;
  descender: FWord;
  lineGap: FWord;
  majorVersion: Uint16;
  metricDataFormat: Int16;
  minLeftSideBearing: FWord;
  minRightSideBearing: FWord;
  minorVersion: Uint16;
  numberOfHMetrics: Uint16;
  reserved1: Int16;
  reserved2: Int16;
  reserved3: Int16;
  reserved4: Int16;
  xMaxExtent: FWord;
};

export type HmtxTable = {
  hMetrics: {
    advanceWidth: Uint16;
    leftSideBearing: Int16;
  }[];
  leftSideBearings: FWord[];
};

export type LocaTable = {
  offsets: number[];
};

export type GlyfTable = {
  numberOfContours: Int16;
  xMax: FWord;
  xMin: FWord;
  yMax: FWord;
  yMin: FWord;
}[];

export type GPOSTable = {
  features: {
    lookupListIndices: number[];
    paramsOffset: number;
    tag: string;
  }[];
  lookups: GPOSLookup[];
};

export type GPOSLookup = {
  lookupFlag: number;
  lookupType: number;
  markFilteringSet?: number;
  subtables: {
    extension: ExtensionLookupType2Format1 | ExtensionLookupType2Format2;
    extensionLookupType: number;
    posFormat: number;
  }[];
};

export type ValueRecord = {
  xAdvDevice?: number;
  xAdvance?: number;
  xPlaDevice?: number;
  xPlacement?: number;
  yAdvDevice?: number;
  yAdvance?: number;
  yPlaDevice?: number;
  yPlacement?: number;
};

export type ExtensionLookupType2Format1 = {
  coverage: CoverageTableFormat1 | CoverageTableFormat2;
  pairSets: {
    secondGlyph: number;
    value1?: ValueRecord;
    value2?: ValueRecord;
  }[][];
  posFormat: 1;
  valueFormat1: number;
  valueFormat2: number;
};

export type ClassDefFormat1 = {
  classes: number[];
  format: 1;
  startGlyph: number;
};

export type ClassDefFormat2 = {
  format: 2;
  ranges: {
    class: number;
    endGlyphID: number;
    startGlyphID: number;
  }[];
};

export type ExtensionLookupType2Format2 = {
  classDef1: ClassDefFormat1 | ClassDefFormat2;
  classDef2: ClassDefFormat1 | ClassDefFormat2;
  classRecords: {
    value1?: ValueRecord;
    value2?: ValueRecord;
  }[][];
  coverage: CoverageTableFormat1 | CoverageTableFormat2;
  posFormat: 2;
  valueFormat1: number;
  valueFormat2: number;
};

/**
 * https://learn.microsoft.com/en-us/typography/opentype/spec/chapter2#coverage-table
 */
export type CoverageTableFormat1 = {
  coverageFormat: 1;
  glyphArray: number[];
};

export type CoverageTableFormat2 = {
  coverageFormat: 2;
  rangeRecords: {
    endGlyphID: number;
    startCoverageIndex: number;
    startGlyphID: number;
  }[];
};

/**
 * https://learn.microsoft.com/en-us/typography/opentype/spec/gpos#value-record
 */
function getValueRecord(reader: BinaryReader, valueRecord: number): ValueRecord | undefined {
  const result: ValueRecord = {};

  if (valueRecord & 0x00_01) {
    result.xPlacement = reader.getInt16();
  }

  if (valueRecord & 0x00_02) {
    result.yPlacement = reader.getInt16();
  }

  if (valueRecord & 0x00_04) {
    result.xAdvance = reader.getInt16();
  }

  if (valueRecord & 0x00_08) {
    result.yAdvance = reader.getInt16();
  }

  if (valueRecord & 0x00_10) {
    result.xPlaDevice = reader.getInt16();
  }

  if (valueRecord & 0x00_20) {
    result.yPlaDevice = reader.getInt16();
  }

  if (valueRecord & 0x00_40) {
    result.xAdvDevice = reader.getInt16();
  }

  if (valueRecord & 0x00_80) {
    result.yAdvDevice = reader.getInt16();
  }

  if (Object.keys(result).length === 0) {
    return undefined;
  }

  return result;
}

function parseCoverage(
  reader: BinaryReader,
  coverageFormat: number
): CoverageTableFormat1 | CoverageTableFormat2 {
  if (coverageFormat === 2) {
    const rangeCount = reader.getUint16();
    const rangeRecords = [];
    for (let i = 0; i < rangeCount; i++) {
      const startGlyphID = reader.getUint16();
      const endGlyphID = reader.getUint16();
      const startCoverageIndex = reader.getUint16();
      rangeRecords.push({
        endGlyphID,
        startCoverageIndex,
        startGlyphID,
      });
    }
    return {
      coverageFormat,
      rangeRecords,
    };
  } else {
    throw new Error("Only Coverage Table format 2 is supported as of now.");
  }
}

function parseClassDef(reader: BinaryReader): ClassDefFormat1 | ClassDefFormat2 {
  const format = reader.getUint16();

  if (format === 1) {
    const startGlyph = reader.getUint16();
    const glyphCount = reader.getUint16();
    const glyphs = [];
    for (let k = 0; k < glyphCount; k++) {
      glyphs.push(reader.getUint16());
    }

    return {
      classes: glyphs,
      format,
      startGlyph,
    } as ClassDefFormat1;
  } else if (format === 2) {
    const rangeCount = reader.getUint16();
    const ranges = [];

    for (let k = 0; k < rangeCount; k++) {
      const startGlyphID = reader.getUint16();
      const endGlyphID = reader.getUint16();
      const classValue = reader.getUint16();
      ranges.push({
        class: classValue,
        endGlyphID,
        startGlyphID,
      });
    }

    return {
      format,
      ranges,
    } as ClassDefFormat2;
  } else {
    throw new Error(`Unsupported ClassDef format ${format}.`);
  }
}

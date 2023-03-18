import { invariant } from "../invariant";
import {
  BinaryReader,
  Fixed,
  FWord,
  Int16,
  Uint16,
  Uint32,
} from "./BinaryReader";

/**
 * Parses TTF font files to read information about available characters, their
 * sizes and spacing information.
 */
export class TTF {
  head: HeadTable;
  hhea: HheaTable;
  hmtx: HmtxTable;
  maxp: MaxpTable;
  cmap: CmapTable;
  loca: LocaTable;
  glyf: GlyfTable;

  ok = false;

  constructor(data: ArrayBuffer) {
    const reader = new BinaryReader(data);
    reader.getUint32(); // scalar type
    const numTables = reader.getUint16();
    reader.getUint16(); // searchRange
    reader.getUint16(); // entrySelector
    reader.getUint16(); // rangeShift

    const tables: Record<string, Table> = {};

    for (let i = 0; i < numTables; i++) {
      const tag = reader.getString(4);
      tables[tag] = {
        checksum: reader.getUint32(),
        offset: reader.getUint32(),
        length: reader.getUint32(),
      };

      if (tag !== "head") {
        const calculated = calculateChecksum(
          reader.getDataSlice(
            tables[tag].offset,
            4 * Math.ceil(tables[tag].length / 4)
          )
        );
        invariant(
          calculated === tables[tag].checksum,
          `Checksum for table ${tag} is invalid.`
        );
      }
    }

    const shared =
      "table is missing. Please use other font variant that contains it.";

    invariant(tables["head"].offset, `head ${shared}`);
    this.head = readHeadTable(reader, tables["head"].offset);

    invariant(tables["cmap"].offset, `cmap ${shared}`);
    this.cmap = readCmapTable(reader, tables["cmap"].offset);

    invariant(tables["maxp"].offset, `maxp ${shared}`);
    this.maxp = readMaxpTable(reader, tables["maxp"].offset);

    invariant(tables["hhea"].offset, `hhea ${shared}`);
    this.hhea = readHheaTable(reader, tables["hhea"].offset);

    invariant(tables["hmtx"].offset, `hmtx ${shared}`);
    this.hmtx = readHmtxTable(
      reader,
      tables["hmtx"].offset,
      this.maxp.numGlyphs,
      this.hhea.numberOfHMetrics
    );

    invariant(tables["loca"].offset, `loca ${shared}`);
    this.loca = readLocaTable(
      reader,
      tables["loca"].offset,
      this.maxp.numGlyphs,
      this.head.indexToLocFormat
    );

    invariant(tables["glyf"].offset, `glyf ${shared}`);
    this.glyf = readGlyfTable(
      reader,
      tables["glyf"].offset,
      this.loca,
      this.head.indexToLocFormat
    );

    this.ok = true;
  }
}

type Table = {
  checksum: number;
  offset: number;
  length: number;
};

type HeadTable = {
  majorVersion: Uint16;
  minorVersion: Uint16;
  fontRevision: Fixed;
  checksumAdjustment: Uint32;
  magicNumber: Uint32;
  flags: Uint16;
  unitsPerEm: Uint16;
  created: Date;
  modified: Date;
  yMin: FWord;
  xMin: FWord;
  xMax: FWord;
  yMax: FWord;
  macStyle: Uint16;
  lowestRecPPEM: Uint16;
  fontDirectionHint: Int16;
  indexToLocFormat: Int16;
  glyphDataFormat: Int16;
};

type CmapTable = {
  version: Uint16;
  numTables: Uint16;
  encodingRecords: {
    platformID: Uint16;
    encodingID: Uint16;
    offset: Uint32;
  }[];
  format: Uint16;
  length: Uint16;
  language: Uint16;
  segCountX2: Uint16;
  segCount: Uint16;
  searchRange: Uint16;
  entrySelector: Uint16;
  rangeShift: Uint16;
  endCodes: Uint16[];
  startCodes: Uint16[];
  idDeltas: Int16[];
  idRangeOffsets: Uint16[];
  glyphIndexMap: Map<number, number>;
};

type MaxpTable = {
  version: "0.5" | "1.0";
  numGlyphs: Uint16;
};

type HheaTable = {
  majorVersion: Uint16;
  minorVersion: Uint16;
  ascender: FWord;
  descender: FWord;
  lineGap: FWord;
  advanceWidthMax: Uint16;
  minLeftSideBearing: FWord;
  minRightSideBearing: FWord;
  xMaxExtent: FWord;
  caretSlopeRise: Int16;
  caretSlopeRun: Int16;
  caretOffset: FWord;
  reserved1: Int16;
  reserved2: Int16;
  reserved3: Int16;
  reserved4: Int16;
  metricDataFormat: Int16;
  numberOfHMetrics: Uint16;
};

type HmtxTable = {
  hMetrics: {
    advanceWidth: Uint16;
    leftSideBearing: Int16;
  }[];
  leftSideBearings: FWord[];
};

type LocaTable = {
  offsets: number[];
};

type GlyfTable = {
  numberOfContours: Int16;
  xMin: FWord;
  yMin: FWord;
  xMax: FWord;
  yMax: FWord;
}[];

/**
 *  See: [Microsoft docs](https://learn.microsoft.com/en-us/typography/opentype/spec/otff#calculating-checksums).
 */
function calculateChecksum(data: Uint8Array): number {
  const nlongs = data.length / 4;
  invariant(
    nlongs === Math.floor(nlongs),
    "Data length must be divisible by 4."
  );

  let sum = 0;
  for (let i = 0; i < nlongs; i++) {
    const int32 =
      (data[i * 4] << 24) +
      (data[i * 4 + 1] << 16) +
      (data[i * 4 + 2] << 8) +
      data[i * 4 + 3];
    const unsigned = int32 >>> 0;
    sum = ((sum + unsigned) & 0xffffffff) >>> 0;
  }

  return sum;
}

/**
 *  See: [Microsoft docs](https://learn.microsoft.com/en-us/typography/opentype/spec/head).
 */
function readHeadTable(reader: BinaryReader, offset: number): HeadTable {
  const position = reader.getPosition();
  reader.setPosition(offset);

  const head: HeadTable = {
    majorVersion: reader.getUint16(),
    minorVersion: reader.getUint16(),
    fontRevision: reader.getFixed(),
    checksumAdjustment: reader.getUint32(),
    magicNumber: reader.getUint32(),
    flags: reader.getUint16(),
    unitsPerEm: reader.getUint16(),
    created: reader.getDate(),
    modified: reader.getDate(),
    xMin: reader.getFWord(),
    yMin: reader.getFWord(),
    xMax: reader.getFWord(),
    yMax: reader.getFWord(),
    macStyle: reader.getUint16(),
    lowestRecPPEM: reader.getUint16(),
    fontDirectionHint: reader.getInt16(),
    indexToLocFormat: reader.getInt16(),
    glyphDataFormat: reader.getInt16(),
  };

  invariant(head.magicNumber === 0x5f0f3cf5, "Invalid magic number.");

  reader.setPosition(position);
  return head;
}

/**
 *  See: [Microsoft docs](https://docs.microsoft.com/en-us/typography/opentype/spec/cmap).
 */
function readCmapTable(reader: BinaryReader, offset: number): CmapTable {
  const position = reader.getPosition();
  reader.setPosition(offset);

  const version = reader.getUint16();
  invariant(version === 0, "Invalid cmap table version.");

  const numTables = reader.getUint16();
  const encodingRecords: {
    platformID: Uint16;
    encodingID: Uint16;
    offset: Uint32;
  }[] = [];

  let selectedOffset: number | null = null;
  for (let i = 0; i < numTables; i++) {
    const platformID = reader.getUint16();
    const encodingID = reader.getUint16();
    const offset = reader.getUint32();
    encodingRecords.push({ platformID, encodingID, offset });

    const isWindowsPlatform =
      platformID === 3 &&
      (encodingID === 0 || encodingID === 1 || encodingID === 10);

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

  invariant(
    format === 4,
    `Unsupported cmap table format. Expected 4, found ${format}.`
  );

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

  const glyphIndexMap = new Map<number, number>();

  for (let i = 0; i < segCount - 1; i++) {
    let glyphIndex = 0;
    const endCode = endCodes[i];
    const startCode = startCodes[i];
    const idDelta = idDeltas[i];
    const idRangeOffset = idRangeOffsets[i];

    for (let c = startCode; c < endCode; c++) {
      if (idRangeOffset !== 0) {
        const startCodeOffset = (c - startCode) * 2;
        const currentRangeOffset = i * 2; // 2 because the numbers are 2 byte big.

        const glyphIndexOffset =
          idRangeOffsetsStart +
          idRangeOffset +
          currentRangeOffset +
          startCodeOffset;

        reader.setPosition(glyphIndexOffset);
        glyphIndex = reader.getUint16();
        if (glyphIndex !== 0) {
          // & 0xffff is modulo 65536.
          glyphIndex = (glyphIndex + idDelta) & 0xffff;
        }
      } else {
        glyphIndex = (c + idDelta) & 0xffff;
      }
      glyphIndexMap.set(c, glyphIndex);
    }
  }

  const cmap: CmapTable = {
    version,
    numTables,
    encodingRecords,
    format,
    length,
    language,
    segCountX2,
    segCount,
    searchRange,
    entrySelector,
    rangeShift,
    endCodes,
    startCodes,
    idDeltas,
    idRangeOffsets,
    glyphIndexMap,
  };

  reader.setPosition(position);
  return cmap;
}

/**
 *  See: [Microsoft docs](https://docs.microsoft.com/en-us/typography/opentype/spec/maxp).
 */
function readMaxpTable(reader: BinaryReader, offset: number): MaxpTable {
  const position = reader.getPosition();
  reader.setPosition(offset);

  const version = reader.getUint32();
  const versionString =
    version === 0x00005000 ? "0.5" : version === 0x00010000 ? "1.0" : null;

  invariant(
    versionString,
    `Unsupported maxp table version (expected 0x00005000 or 0x00010000 but found ${version.toString(
      16
    )}).`
  );
  const numGlyphs = reader.getUint16();

  const maxp: MaxpTable = {
    version: versionString,
    numGlyphs,
  };

  reader.setPosition(position);
  return maxp;
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
    majorVersion,
    minorVersion,
    ascender,
    descender,
    lineGap,
    advanceWidthMax,
    minLeftSideBearing,
    minRightSideBearing,
    xMaxExtent,
    caretSlopeRise,
    caretSlopeRun,
    caretOffset,
    reserved1,
    reserved2,
    reserved3,
    reserved4,
    metricDataFormat,
    numberOfHMetrics,
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
 * By definition, index zero points to the “missing character”, which is the
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
    const locaOffset = loca.offsets[i] * multiplier;

    reader.setPosition(offset + locaOffset);

    glyfs.push({
      numberOfContours: reader.getInt16(),
      xMin: reader.getInt16(),
      yMin: reader.getInt16(),
      xMax: reader.getInt16(),
      yMax: reader.getInt16(),
    });
  }

  reader.setPosition(position);
  return glyfs;
}

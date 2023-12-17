export const DEFAULT_LINE_HEIGHT_MULTIPLIER = 1.4;

export const CROSS_AXIS_SIZE = 10;
export const SCROLLBAR_COLOR = "#111";
export const SCROLLBAR_CORNER_COLOR = "#111";
export const SCROLLBAR_TRACK_COLOR = "#666";
export const SCROLLBAR_TRACK_HOVER_COLOR = "#777";

export const isWindowDefined = typeof window !== "undefined";

const windowWidth = isWindowDefined ? window.innerWidth : 1024;
const windowHeight = isWindowDefined ? window.innerHeight : 768;

export const settings = {
  rectangleBufferSize: 16 * 4096,
  sampleCount: 4,
  textBufferSize: 16 * 100_000,
  windowHeight,
  windowWidth,
};

export type Settings = typeof settings;

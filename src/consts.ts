export const DEFAULT_FONT_SIZE = 16;
export const DEFAULT_LINE_HEIGHT_MULTIPLIER = 1.4;

export const isWindowDefined = typeof window !== "undefined";

const windowWidth = isWindowDefined ? window.innerWidth : 1024;
const windowHeight = isWindowDefined ? window.innerHeight : 768;

export const settings = {
  sampleCount: 4,
  windowHeight,
  windowWidth,
};

export type Settings = typeof settings;

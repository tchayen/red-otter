const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

export const settings = {
  sampleCount: 4,
  windowHeight,
  windowWidth,
};

export type Settings = typeof settings;

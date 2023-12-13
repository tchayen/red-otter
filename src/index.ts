export { layout } from "./layout/layout";
export { paint } from "./layout/paint";
export { compose } from "./layout/compose";
export type {
  LayoutProps,
  DecorativeProps,
  TextStyleProps,
  LayoutNodeState,
  AlignItems,
  JustifyContent,
  AlignContent,
  FlexDirection,
  FlexWrap,
  Overflow,
  Display,
  Position,
  TextTransform,
  TextAlign,
  Whitespace,
} from "./layout/styling";

export { BinaryReader } from "./font/BinaryReader";
export { toSDF } from "./font/toSDF";
export { parseTTF } from "./font/parseTTF";
export { shapeText } from "./font/shapeText";
export { renderFontAtlas, fontSizeToGap } from "./font/renderFontAtlas";
export { generateGlyphToClassMap } from "./font/generateGlyphToClassMap";
export { generateKerningFunction } from "./font/generateKerningFunction";
export { calculateGlyphQuads } from "./font/calculateGlyphQuads";

export type { Renderer } from "./renderer/Renderer";
export { WebGPURenderer } from "./renderer/WebGPURenderer";

export { Vec2 } from "./math/Vec2";
export { Vec3 } from "./math/Vec3";
export { Vec4 } from "./math/Vec4";
export { Mat4 } from "./math/Mat4";
export { packShelves } from "./math/packShelves";
export { triangulateLine } from "./math/triangulateLine";
export {
  clamp,
  lerp,
  smoothstep,
  toRadians,
  toDegrees,
  nextPowerOfTwo,
  intersection,
  isInside,
} from "./math/utils";
export { triangulatePolygon } from "./math/triangulatePolygon";

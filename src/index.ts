export { EventManager } from "./EventManager";

export { layout } from "./layout/layout";
export { paint } from "./layout/paint";
export { compose } from "./layout/compose";
export type { Node } from "./layout/Node";
export { BaseView } from "./layout/BaseView";
export { View } from "./layout/View";
export { Text } from "./layout/Text";
export type {
  DecorativeProps,
  LayoutNodeState,
  LayoutProps,
  TextStyleProps,
  ViewStyleProps,
} from "./layout/styling";
export {
  AlignItems,
  AlignSelf,
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

export { invariant } from "./utils/invariant";

export { BinaryReader } from "./font/BinaryReader";
export { toSDF } from "./font/toSDF";
export { parseTTF } from "./font/parseTTF";
export { shapeText } from "./font/shapeText";
export { prepareLookups } from "./font/prepareLookups";
export type { Lookups, Glyph, KerningFunction } from "./font/types";
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

export { Button } from "./widgets/Button";
export { Input } from "./widgets/Input";

export type {
  MouseClickHandler,
  MouseMoveHandler,
  MouseEnterHandler,
  MouseLeaveHandler,
  MouseDownHandler,
  MouseUpHandler,
  ScrollHandler,
  KeyDownHandler,
  KeyUpHandler,
  KeyPressHandler,
  FocusHandler,
  BlurHandler,
  LayoutHandler,
  MouseEvent,
  ScrollEvent,
  KeyboardEvent,
  FocusEvent,
  LayoutEvent,
  UserEvent,
} from "./layout/eventTypes";
export { UserEventType, isMouseEvent, isKeyboardEvent } from "./layout/eventTypes";

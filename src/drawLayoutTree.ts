import { Vec2 } from "./math/Vec2";
import { Vec4 } from "./math/Vec4";
import { Text } from "./Text";
import { UIRenderer } from "./UIRenderer";
import { parseColor } from "./utils/parseColor";
import { View } from "./View";

export function drawLayoutTree(
  ui: UIRenderer,
  rectangles: (View | Text)[]
): void {
  for (const rect of rectangles) {
    if ("text" in rect) {
      const position = new Vec2(rect.__state.layout.x, rect.__state.layout.y);
      ui.text(
        rect.text,
        position,
        rect.style.fontName,
        rect.style.fontSize,
        parseColor(rect.style.color),
        {
          lineHeight: rect.style.lineHeight,
          maxWidth: rect.style.maxWidth,
          // trimEnd: r.textStyle.trimEnd
          //   ? position.add(r.textStyle.trimEnd)
          //   : undefined,
          // trimStart: r.textStyle.trimStart
          //   ? position.add(r.textStyle.trimStart)
          //   : undefined,
        }
      );
    } else {
      const outerBorderRadius = new Vec4(
        rect.style.borderTopLeftRadius,
        rect.style.borderTopRightRadius,
        rect.style.borderBottomLeftRadius,
        rect.style.borderBottomRightRadius
      );

      if (rect.style.boxShadowRadius >= 0.25) {
        ui.rectangle(
          parseColor(rect.style.boxShadowColor),
          new Vec2(
            rect.__state.layout.x + rect.style.boxShadowOffsetX,
            rect.__state.layout.y + rect.style.boxShadowOffsetY
          ),
          new Vec2(rect.__state.layout.width, rect.__state.layout.height),
          outerBorderRadius,
          rect.style.boxShadowRadius
        );
      }

      if (rect.style.borderColor) {
        ui.rectangle(
          parseColor(rect.style.borderColor),
          new Vec2(rect.__state.layout.x, rect.__state.layout.y),
          new Vec2(rect.__state.layout.width, rect.__state.layout.height),
          outerBorderRadius,
          0.25
        );
      }

      const position = new Vec2(
        rect.__state.layout.x + rect.style.borderLeftWidth,
        rect.__state.layout.y + rect.style.borderTopWidth
      );

      const size = new Vec2(
        rect.__state.layout.width -
          rect.style.borderLeftWidth -
          rect.style.borderRightWidth,
        rect.__state.layout.height -
          rect.style.borderTopWidth -
          rect.style.borderBottomWidth
      );

      // Correct border radius for the border width.
      const borderRadius = new Vec4(
        rect.style.borderTopLeftRadius -
          Math.max(rect.style.borderTopWidth, rect.style.borderLeftWidth),
        rect.style.borderTopRightRadius -
          Math.max(rect.style.borderTopWidth, rect.style.borderRightWidth),
        rect.style.borderBottomLeftRadius -
          Math.max(rect.style.borderBottomWidth, rect.style.borderLeftWidth),
        rect.style.borderBottomRightRadius -
          Math.max(rect.style.borderBottomWidth, rect.style.borderRightWidth)
      );

      ui.rectangle(
        parseColor(rect.style.backgroundColor),
        position,
        size,
        borderRadius,
        0.25
      );
    }
  }
}

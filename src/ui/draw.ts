import { Vec2 } from "../math/Vec2";
import { Vec4 } from "../math/Vec4";
import { Text } from "../Text";
import { UIRenderer } from "../UIRenderer";
import { parseColor } from "../utils/parseColor";
import { View } from "../View";

export function draw(ui: UIRenderer, rectangles: (View | Text)[]): void {
  for (const rect of rectangles) {
    if ("text" in rect) {
      const position = new Vec2(rect._state.metrics.x, rect._state.metrics.y);
      ui.text(
        rect.text,
        position,
        rect._style.fontName,
        rect._style.fontSize,
        parseColor(rect._style.color),
        {
          lineHeight: rect._style.lineHeight,
          maxWidth: rect._style.maxWidth,
          // eslint-disable-next-line multiline-comment-style
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
        rect._style.borderTopLeftRadius,
        rect._style.borderTopRightRadius,
        rect._style.borderBottomLeftRadius,
        rect._style.borderBottomRightRadius
      );

      if (rect._style.boxShadowRadius >= 0.25) {
        ui.rectangle(
          parseColor(rect._style.boxShadowColor),
          new Vec2(
            rect._state.metrics.x + rect._style.boxShadowOffsetX,
            rect._state.metrics.y + rect._style.boxShadowOffsetY
          ),
          new Vec2(rect._state.metrics.width, rect._state.metrics.height),
          outerBorderRadius,
          rect._style.boxShadowRadius
        );
      }

      if (rect._style.borderColor) {
        ui.rectangle(
          parseColor(rect._style.borderColor),
          new Vec2(rect._state.metrics.x, rect._state.metrics.y),
          new Vec2(rect._state.metrics.width, rect._state.metrics.height),
          outerBorderRadius,
          0.25
        );
      }

      const position = new Vec2(
        rect._state.metrics.x + rect._style.borderLeftWidth,
        rect._state.metrics.y + rect._style.borderTopWidth
      );

      const size = new Vec2(
        rect._state.metrics.width -
          rect._style.borderLeftWidth -
          rect._style.borderRightWidth,
        rect._state.metrics.height -
          rect._style.borderTopWidth -
          rect._style.borderBottomWidth
      );

      // Correct border radius for the border width.
      const borderRadius = new Vec4(
        rect._style.borderTopLeftRadius -
          Math.max(rect._style.borderTopWidth, rect._style.borderLeftWidth),
        rect._style.borderTopRightRadius -
          Math.max(rect._style.borderTopWidth, rect._style.borderRightWidth),
        rect._style.borderBottomLeftRadius -
          Math.max(rect._style.borderBottomWidth, rect._style.borderLeftWidth),
        rect._style.borderBottomRightRadius -
          Math.max(rect._style.borderBottomWidth, rect._style.borderRightWidth)
      );

      ui.rectangle(
        parseColor(rect._style.backgroundColor),
        position,
        size,
        borderRadius,
        0.25
      );
    }
  }
}

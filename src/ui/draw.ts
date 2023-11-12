import { Vec2 } from "../math/Vec2";
import { Vec4 } from "../math/Vec4";
import { Text } from "../Text";
import { UIRenderer } from "../UIRenderer";
import { parseColor } from "../utils/parseColor";
import { View } from "../View";

export function draw(ui: UIRenderer, rectangles: (View | Text)[]): void {
  // console.log(`Drawing ${rectangles.length} rectangles.`);

  for (const r of rectangles) {
    if ("text" in r) {
      const position = new Vec2(r._state.metrics.x, r._state.metrics.y);
      ui.text(
        r.text,
        position,
        r._style.fontName,
        r._style.fontSize,
        parseColor(r._style.color),
        r._style.textAlign ?? "left",
        {
          lineHeight: r._style.lineHeight,
          maxWidth: r._state.textWidthLimit,
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
        r._style.borderTopLeftRadius,
        r._style.borderTopRightRadius,
        r._style.borderBottomLeftRadius,
        r._style.borderBottomRightRadius
      );

      // if (r._style.boxShadowRadius >= 0.25) {
      //   ui.rectangle(
      //     parseColor(r._style.boxShadowColor),
      //     new Vec2(
      //       r._state.metrics.x + r._style.boxShadowOffsetX,
      //       r._state.metrics.y + r._style.boxShadowOffsetY
      //     ),
      //     new Vec2(r._state.metrics.width, r._state.metrics.height),
      //     outerBorderRadius,
      //     r._style.boxShadowRadius
      //   );
      // }

      // if (r._style.borderColor) {
      //   ui.rectangle(
      //     parseColor(r._style.borderColor),
      //     new Vec2(r._state.metrics.x, r._state.metrics.y),
      //     new Vec2(r._state.metrics.width, r._state.metrics.height),
      //     outerBorderRadius,
      //     0.25
      //   );
      // }

      // const position = new Vec2(
      //   r._state.metrics.x + r._style.borderLeftWidth,
      //   r._state.metrics.y + r._style.borderTopWidth
      // );

      // const size = new Vec2(
      //   r._state.metrics.width -
      //     r._style.borderLeftWidth -
      //     r._style.borderRightWidth,
      //   r._state.metrics.height -
      //     r._style.borderTopWidth -
      //     r._style.borderBottomWidth
      // );

      // // Correct border radius for the border width.
      // const borderRadius = new Vec4(
      //   r._style.borderTopLeftRadius -
      //     Math.max(r._style.borderTopWidth, r._style.borderLeftWidth),
      //   r._style.borderTopRightRadius -
      //     Math.max(r._style.borderTopWidth, r._style.borderRightWidth),
      //   r._style.borderBottomLeftRadius -
      // Math.max(r._style.borderBottomWidth, r._style.borderLeftWidth),
      // r._style.borderBottomRightRadius -
      // Math.max(r._style.borderBottomWidth, r._style.borderRightWidth)
      // );

      // ui.rectangle(
      //   parseColor(r._style.backgroundColor),
      //   position,
      //   size,
      //   borderRadius,
      //   0.25
      // );

      // Simplified:
      const position = new Vec2(r._state.metrics.x, r._state.metrics.y);
      const size = new Vec2(r._state.metrics.width, r._state.metrics.height);

      // // Parent's dimensions and overflow property
      // const parentMetrics = r.parent?._state.metrics;
      // const parentOverflow = r.parent?._style.overflow;

      // // Determine the drawable area based on the parent's overflow property
      // let drawableArea = new Vec2(size.x, size.y);

      // // If the element is inside a parent with overflow: hidden, adjust the
      // // drawable area
      // if (parentOverflow === "scroll" && parentMetrics) {
      //   const overflowRight =
      //     position.x + size.x - (parentMetrics.x + parentMetrics.width);
      //   if (overflowRight > 0) {
      //     drawableArea = new Vec2(
      //       Math.max(0, drawableArea.x - overflowRight),
      //       drawableArea.y
      //     );
      //   }

      //   const overflowBottom =
      //     position.y + size.y - (parentMetrics.y + parentMetrics.height);
      //   if (overflowBottom > 0) {
      //     drawableArea = new Vec2(
      //       drawableArea.x,
      //       Math.max(0, drawableArea.y - overflowBottom)
      //     );
      //   }
      // }

      ui.rectangle(parseColor(r._style.backgroundColor), position, size, outerBorderRadius, 0.25);
    }
  }
}

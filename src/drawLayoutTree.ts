import { Vec2 } from "./math/Vec2";
import { Vec4 } from "./math/Vec4";
import { UIRenderer } from "./UIRenderer";
import { parseColor } from "./utils/parseColor";
import { Tree } from "./utils/Tree";
import type { FixedRectangle } from "./ui/types";

export function drawLayoutTree(
  ui: UIRenderer,
  rectangles: Tree<FixedRectangle>[]
): void {
  for (const { value: r } of rectangles) {
    if ("text" in r) {
      const position = new Vec2(r.x, r.y);
      ui.text(
        r.text,
        position,
        r.textStyle.fontName,
        r.textStyle.fontSize,
        r.textStyle.color,
        {
          lineHeight: r.textStyle.lineHeight,
          maxWidth: r.textStyle.maxWidth,
          trimEnd: r.textStyle.trimEnd
            ? position.add(r.textStyle.trimEnd)
            : undefined,
          trimStart: r.textStyle.trimStart
            ? position.add(r.textStyle.trimStart)
            : undefined,
        }
      );
    } else {
      if (r.styles.boxShadow.sigma !== 0.25) {
        ui.rectangle(
          r.styles.boxShadow.color,
          new Vec2(r.x + r.styles.boxShadow.x, r.y + r.styles.boxShadow.y),
          new Vec2(r.width, r.height),
          r.styles.borderRadius,
          r.styles.boxShadow.sigma
        );
      }

      if (r.input.borderColor) {
        ui.rectangle(
          parseColor(r.input.borderColor),
          new Vec2(r.x, r.y),
          new Vec2(r.width, r.height),
          r.styles.borderRadius,
          0.25
        );
      }

      const position = new Vec2(
        r.x + r.styles.borderWidth.w,
        r.y + r.styles.borderWidth.x
      );

      const size = new Vec2(
        r.width - r.styles.borderWidth.w - r.styles.borderWidth.y,
        r.height - r.styles.borderWidth.x - r.styles.borderWidth.z
      );

      // Correct border radius for the border width.
      const borderRadius = new Vec4(
        r.styles.borderRadius.x -
          Math.max(r.styles.borderWidth.w, r.styles.borderWidth.x),
        r.styles.borderRadius.y -
          Math.max(r.styles.borderWidth.y, r.styles.borderWidth.x),
        r.styles.borderRadius.z -
          Math.max(r.styles.borderWidth.y, r.styles.borderWidth.z),
        r.styles.borderRadius.w -
          Math.max(r.styles.borderWidth.w, r.styles.borderWidth.z)
      );

      ui.rectangle(
        r.styles.backgroundColor,
        position,
        size,
        borderRadius,
        0.25
      );
    }
  }
}

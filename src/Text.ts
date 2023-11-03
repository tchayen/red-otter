import { shapeText } from "./font/shapeText";

import { FixedRectangle } from "./ui/types";
import { Tree } from "./utils/Tree";
import { Lookups } from "./font/types";
import {
  ExactLayoutProps,
  TextStyleProps,
  normalizeLayoutProps,
} from "./types";
import { Vec2 } from "./math/Vec2";

export class Text {
  next: Text | null = null;
  prev: Text | null = null;
  firstChild: Text | null = null;
  lastChild: Text | null = null;
  parent: Text | null = null;

  /**
   * Should always be normalized.
   */
  public readonly style: TextStyleProps & ExactLayoutProps;

  __state: {
    layout: { height: number; width: number; x: number; y: number };
    scroll?: Vec2;
    scrollSize?: Vec2;
  } = { layout: { height: 0, width: 0, x: 0, y: 0 } };

  constructor(
    public text: string,
    public props: {
      lookups: Lookups;
      style: TextStyleProps;
    }
  ) {
    const shape = shapeText({
      fontName: props.style.fontName,
      fontSize: props.style.fontSize,
      lookups: props.lookups,
      text: text, // TODO: enforce not repeating value when same as key.
    });
    const { width, height } = shape.boundingRectangle;

    this.style = normalizeLayoutProps(props.style);
    this.style.width = width;
    this.style.height = height;
  }

  add(): Tree<FixedRectangle> {
    throw new Error("Text node cannot have children.");
  }

  handleEvent(): void {
    // Do nothing.
  }
}

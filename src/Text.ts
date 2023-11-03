import { shapeText } from "./font/shapeText";
import {
  fixedRectangleDefaults,
  rectangleDefaults,
  resolveSpacing,
  textDefaults,
} from "./styling";
import { FixedRectangle, TextStyle } from "./ui/types";
import { Tree } from "./utils/Tree";
import { parseColor } from "./utils/parseColor";
import { Lookups } from "./font/types";

export class Text implements Tree<FixedRectangle> {
  next: Tree<FixedRectangle> | null = null;
  prev: Tree<FixedRectangle> | null = null;
  firstChild: Tree<FixedRectangle> | null = null;
  lastChild: Tree<FixedRectangle> | null = null;
  parent: Tree<FixedRectangle> | null = null;
  value: FixedRectangle;

  constructor(
    value: string,
    public props: {
      lookups: Lookups;
      style: TextStyle;
    }
  ) {
    const shape = shapeText({
      fontName: props.style.fontName,
      fontSize: props.style.fontSize,
      lookups: props.lookups,
      text: value,
    });
    const { width, height } = shape.boundingRectangle;

    const input = {
      ...rectangleDefaults,
      ...resolveSpacing({}),
      height,
      width,
    };

    this.value = {
      ...fixedRectangleDefaults,
      height,
      input,
      text: value,
      textStyle: {
        ...textDefaults,
        ...props.style,
        color: parseColor(props.style.color),
      },
      width,
    };
  }

  add(): Tree<FixedRectangle> {
    throw new Error("Text node cannot have children.");
  }

  handleEvent(): void {
    // Do nothing.
  }
}

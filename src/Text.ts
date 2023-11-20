import { shapeText } from "./font/shapeText";

import { Lookups } from "./font/types";
import {
  ExactLayoutProps,
  LayoutNodeState,
  TextStyleProps,
  UserEvent,
  normalizeLayoutProps,
} from "./types";
import { DEFAULT_FONT_SIZE, DEFAULT_LINE_HEIGHT_MULTIPLIER } from "./consts";

export class Text {
  next: Text | null = null;
  prev: Text | null = null;
  firstChild: Text | null = null;
  lastChild: Text | null = null;
  parent: Text | null = null;
  /**
   * Should always be normalized.
   */
  _style: TextStyleProps & ExactLayoutProps;
  _state: LayoutNodeState = {
    children: [],
    clientHeight: 0,
    clientWidth: 0,
    scrollHeight: 0,
    scrollWidth: 0,
    scrollX: 0,
    scrollY: 0,
    x: 0,
    y: 0,
  };

  constructor(
    public text: string,
    public props: {
      lookups: Lookups;
      style: TextStyleProps;
      testID?: string;
    }
  ) {
    const fontSize = props.style.fontSize ?? DEFAULT_FONT_SIZE;
    const shape = shapeText({
      fontName: props.style.fontName,
      fontSize: fontSize,
      lineHeight: props.style.lineHeight ?? DEFAULT_LINE_HEIGHT_MULTIPLIER * fontSize,
      lookups: props.lookups,
      text: text, // TODO @tchayen: enforce in eslint not repeating value when same as key.
      textAlignment: "left",
    });
    const { width, height } = shape.boundingRectangle;

    this._style = normalizeLayoutProps(props.style);
    this._style.width = width;
    this._style.height = height;
  }

  handleEvent(event: UserEvent): void {}
}

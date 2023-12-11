import { shapeText } from "../font/shapeText";
import type { Lookups } from "../font/types";
import type { UserEvent } from "./eventTypes";
import type { ExactLayoutProps, LayoutNodeState, LayoutProps, TextStyleProps } from "./styling";
import { defaultLayoutNodeState, defaultTextStyleProps, normalizeLayoutProps } from "./styling";

/**
 * Basic text node. The only way to create text. It cannot have children.
 */
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
  _state: LayoutNodeState = { ...defaultLayoutNodeState };

  constructor(
    public text: string,
    public props: {
      lookups: Lookups;
      style: TextStyleProps;
      testID?: string;
    },
  ) {
    const shape = shapeText(
      props.lookups,
      props.style.fontName ?? defaultTextStyleProps.fontName,
      props.style.fontSize ?? defaultTextStyleProps.fontSize,
      props.style.lineHeight ?? defaultTextStyleProps.lineHeight,
      text,
      props.style.textAlign ?? defaultTextStyleProps.textAlign,
    );
    const { width, height } = shape.boundingRectangle;

    this._style = normalizeLayoutProps(props.style as LayoutProps);
    this._style.width = width;
    this._style.height = height;
  }

  handleEvent(event: UserEvent): void {}
}

import { shapeText } from "./font/shapeText";
import type { Lookups } from "./font/types";
import type {
  ExactLayoutProps,
  LayoutNodeState,
  LayoutProps,
  TextStyleProps,
  UserEvent,
} from "./types";
import { defaultLayoutNodeState, defaultTextStyleProps, normalizeLayoutProps } from "./types";

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
    const shape = shapeText({
      ...defaultTextStyleProps,
      ...props.style,
      lookups: props.lookups,
      text: text, // TODO @tchayen: enforce in eslint not repeating value when same as key.
    });
    const { width, height } = shape.boundingRectangle;

    this._style = normalizeLayoutProps(props.style as LayoutProps);
    this._style.width = width;
    this._style.height = height;
  }

  handleEvent(event: UserEvent): void {}
}

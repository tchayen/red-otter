import type { Lookups } from "../font/types";
import type { Node } from "./Node";
import type { ExactLayoutProps, LayoutNodeState, LayoutProps, TextStyleProps } from "./styling";
import { defaultLayoutNodeState, normalizeLayoutProps } from "./styling";

/**
 * Basic text node. The only way to create text. It cannot have children.
 */
export class Text implements Node {
  testID: string | null;
  next: Node | null = null;
  prev: Node | null = null;
  firstChild: Node | null = null;
  lastChild: Node | null = null;
  parent: Node | null = null;
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
    this.testID = props.testID ?? null;
    this._style = normalizeLayoutProps(props.style as LayoutProps);
  }
}

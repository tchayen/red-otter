import type {
  ExactDecorativeProps,
  ExactLayoutProps,
  ViewStyleProps,
  LayoutNodeState,
} from "./styling";
import { normalizeLayoutProps, normalizeDecorativeProps, defaultLayoutNodeState } from "./styling";
import type { Text } from "./Text";

/**
 * Basic building block of the UI. A node in a tree which is mutated by the layout algorithm.
 */
export class BaseView {
  next: BaseView | Text | null = null;
  prev: BaseView | Text | null = null;
  firstChild: BaseView | Text | null = null;
  lastChild: BaseView | Text | null = null;
  parent: BaseView | null = null;
  /**
   * Internal state of the node. It's public so that you can use it if you need to, but it's ugly
   * so that you don't forget it might break at any time.
   */
  _state: LayoutNodeState = { ...defaultLayoutNodeState };
  /**
   * Should always be normalized.
   */
  _style: ExactDecorativeProps & ExactLayoutProps;

  constructor(
    public props: {
      onClick?(): void;
      style?: ViewStyleProps;
      testID?: string;
    },
  ) {
    this._style = normalizeDecorativeProps(
      normalizeLayoutProps(props.style ?? {}) as ViewStyleProps,
    );
  }

  add(node: BaseView | Text): BaseView | Text {
    node.parent = this;

    if (this.firstChild === null) {
      this.firstChild = node;
      this.lastChild = node;
    } else {
      if (this.lastChild === null) {
        throw new Error("Last child must be set.");
      }

      node.prev = this.lastChild;
      this.lastChild.next = node;
      this.lastChild = node;
    }

    return node;
  }
}

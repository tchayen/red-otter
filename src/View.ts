import {
  UserEvent,
  UserEventType,
  ExactDecorativeProps,
  ExactLayoutProps,
  ViewStyleProps,
  normalizeLayoutProps,
  normalizeDecorativeProps,
  LayoutNodeState,
} from "./types";
import { Text } from "./Text";
import { Vec2 } from "./math/Vec2";

export class View {
  next: View | Text | null = null;
  prev: View | Text | null = null;
  firstChild: View | Text | null = null;
  lastChild: View | Text | null = null;
  parent: View | null = null;
  _state: LayoutNodeState = {
    metrics: { height: 0, width: 0, x: 0, y: 0 },
    scrollOffset: new Vec2(0, 0),
    scrollableContentSize: new Vec2(0, 0),
  };
  /**
   * Should always be normalized.
   */
  _style: ExactDecorativeProps & ExactLayoutProps;

  constructor(
    public props: {
      onClick?(): void;
      style: ViewStyleProps;
      testID?: string;
    }
  ) {
    this._style = normalizeDecorativeProps(normalizeLayoutProps(props.style));
  }

  add(node: View | Text): View | Text {
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

  handleEvent(event: UserEvent): void {
    if (event.type === UserEventType.MouseClick && this.props.onClick) {
      this.props.onClick();
    }
  }
}

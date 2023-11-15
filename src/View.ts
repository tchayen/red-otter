import {
  UserEventType,
  ExactDecorativeProps,
  ExactLayoutProps,
  ViewStyleProps,
  normalizeLayoutProps,
  normalizeDecorativeProps,
  LayoutNodeState,
  ScrollEvent,
} from "./types";
import { Text } from "./Text";
import { Vec2 } from "./math/Vec2";
import { events } from "./main";

export class View {
  next: View | Text | null = null;
  prev: View | Text | null = null;
  firstChild: View | Text | null = null;
  lastChild: View | Text | null = null;
  parent: View | null = null;
  _state: LayoutNodeState = {
    children: [],
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
    if (props.onClick) {
      events.addEventListener(UserEventType.MouseClick, this, props.onClick);
    }
    if (this._style.overflow === "scroll") {
      events.addEventListener(UserEventType.MouseScroll, this, (event: ScrollEvent) => {
        this._state.scrollOffset = new Vec2(
          Math.min(
            Math.max(this._state.scrollOffset.x + event.delta.x, 0),
            this._state.scrollableContentSize.x - this._state.metrics.width
          ),
          Math.min(
            Math.max(this._state.scrollOffset.y + event.delta.y, 0),
            this._state.scrollableContentSize.y - this._state.metrics.height
          )
        );
        console.log(this.props.testID, this._state.scrollOffset);
      });
    }
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
}

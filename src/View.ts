import {
  UserEventType,
  ExactDecorativeProps,
  ExactLayoutProps,
  ViewStyleProps,
  normalizeLayoutProps,
  normalizeDecorativeProps,
  LayoutNodeState,
  ScrollEvent,
  Overflow,
  ClickEvent,
  MoveEvent,
} from "./types";
import { Text } from "./Text";
import { Vec2 } from "./math/Vec2";

type UserEventTuple =
  | [UserEventType.MouseClick, (event: ClickEvent) => void]
  | [UserEventType.MouseMove, (event: MoveEvent) => void]
  | [UserEventType.MouseScroll, (event: ScrollEvent) => void];

export class View {
  next: View | Text | null = null;
  prev: View | Text | null = null;
  firstChild: View | Text | null = null;
  lastChild: View | Text | null = null;
  parent: View | null = null;
  _state: LayoutNodeState = {
    children: [],
    clientHeight: 0,
    clientWidth: 0,
    clipSize: new Vec2(0, 0),
    clipStart: new Vec2(0, 0),
    scrollHeight: 0,
    scrollWidth: 0,
    scrollX: 0,
    scrollY: 0,
    totalScrollX: 0,
    totalScrollY: 0,
    x: 0,
    y: 0,
  };
  /**
   * Should always be normalized.
   */
  _style: ExactDecorativeProps & ExactLayoutProps;
  _eventListeners: Array<UserEventTuple> = [];

  constructor(
    public props: {
      onClick?(): void;
      style: ViewStyleProps;
      testID?: string;
    }
  ) {
    this._style = normalizeDecorativeProps(normalizeLayoutProps(props.style));
    if (props.onClick) {
      this._eventListeners.push([UserEventType.MouseClick, props.onClick]);
    }
    if (this._style.overflow === Overflow.Scroll) {
      this._eventListeners.push([
        UserEventType.MouseScroll,
        (event: ScrollEvent) => {
          // BRAINSTORM: so technically here the this._state.metrics.height (or width) should be
          // lowered by the presence of parent scrollbars
          // But if implemented as described then also the outer root is being moved inside the page
          // which is not what should happen.
          const hasParentHorizontalScroll = this.parent?._style.overflowX === Overflow.Scroll;
          const hasParentVerticalScroll = this.parent?._style.overflowY === Overflow.Scroll;
          this._state.scrollX = Math.min(
            Math.max(this._state.scrollX + event.delta.x, 0),
            this._state.scrollWidth - this._state.clientWidth
            // + (hasParentVerticalScroll ? CROSS_AXIS_SIZE : 0)
          );
          this._state.scrollY = Math.min(
            Math.max(this._state.scrollY + event.delta.y, 0),
            this._state.scrollHeight - this._state.clientHeight
            //  + (hasParentHorizontalScroll ? CROSS_AXIS_SIZE : 0)
          );
        },
      ]);
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

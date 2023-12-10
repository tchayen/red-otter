import type { ClickEvent, MoveEvent, ScrollEvent } from "./eventTypes";
import { UserEventType } from "./eventTypes";
import type {
  ExactDecorativeProps,
  ExactLayoutProps,
  ViewStyleProps,
  LayoutNodeState,
} from "./styling";
import {
  normalizeLayoutProps,
  normalizeDecorativeProps,
  Overflow,
  defaultLayoutNodeState,
} from "./styling";
import type { Text } from "./Text";

type UserEventTuple =
  | [UserEventType.MouseClick, (event: ClickEvent) => void]
  | [UserEventType.MouseMove, (event: MoveEvent) => void]
  | [UserEventType.MouseScroll, (event: ScrollEvent) => void];

/**
 * Basic building block of the UI. A node in a tree which is mutated by the layout algorithm.
 */
export class View {
  next: View | Text | null = null;
  prev: View | Text | null = null;
  firstChild: View | Text | null = null;
  lastChild: View | Text | null = null;
  parent: View | null = null;
  /**
   * Internal state of the node. It's public so that you can use it if you need to, but it's ugly
   * so that you don't forget it might break at any time.
   */
  _state: LayoutNodeState = { ...defaultLayoutNodeState };
  /**
   * Should always be normalized.
   */
  _style: ExactDecorativeProps & ExactLayoutProps;
  _eventListeners: Array<UserEventTuple> = [];

  constructor(
    public props: {
      onClick?(): void;
      style?: ViewStyleProps;
      testID?: string;
    },
  ) {
    this.onScroll = this.onScroll.bind(this);

    this._style = normalizeDecorativeProps(
      normalizeLayoutProps(props.style ?? {}) as ViewStyleProps,
    );
    if (props.onClick) {
      this._eventListeners.push([UserEventType.MouseClick, props.onClick]);
    }
    if (this._style.overflowX === Overflow.Scroll || this._style.overflowY === Overflow.Scroll) {
      this._eventListeners.push([UserEventType.MouseScroll, this.onScroll]);
    }
  }

  onScroll(event: ScrollEvent) {
    this._state.scrollX = Math.min(
      Math.max(this._state.scrollX + Math.round(event.delta.x), 0),
      this._state.scrollWidth - this._state.clientWidth,
    );
    this._state.scrollY = Math.min(
      Math.max(this._state.scrollY + Math.round(event.delta.y), 0),
      this._state.scrollHeight - this._state.clientHeight,
    );
  }

  // TODO: this could be in some base class.
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

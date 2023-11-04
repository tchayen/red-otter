import {
  UserEvent,
  UserEventType,
  ExactDecorativeProps,
  ExactLayoutProps,
  ViewStyleProps,
  normalizeLayoutProps,
  normalizeDecorativeProps,
} from "./types";
import { Vec2 } from "./math/Vec2";
import { Text } from "./Text";

export class View {
  /**
   * Should always be normalized.
   */
  public readonly style: ExactDecorativeProps & ExactLayoutProps;
  next: View | null = null;
  prev: View | null = null;
  firstChild: View | Text | null = null;
  lastChild: View | Text | null = null;
  parent: View | null = null;

  __state: {
    metrics: { height: number; width: number; x: number; y: number };
    scroll?: Vec2;
    scrollSize?: Vec2;
  } = { metrics: { height: 0, width: 0, x: 0, y: 0 } };

  constructor(
    public props: {
      onClick?(): void;
      style: ViewStyleProps;
    }
  ) {
    this.style = normalizeDecorativeProps(normalizeLayoutProps(props.style));
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

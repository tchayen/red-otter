import { intersection, Vec4, type Vec2, isInside } from "..";
import { CROSS_AXIS_SIZE } from "../consts";
import { getScreenVisibleRectangle } from "../hitTest";
import { BaseView } from "./BaseView";
import type { MouseEvent, ScrollEvent } from "./eventTypes";
import { UserEventType } from "./eventTypes";
import type { ViewStyleProps } from "./styling";
import { Overflow } from "./styling";

type UserEventTuple =
  | [UserEventType.MouseClick, (event: MouseEvent) => void]
  | [UserEventType.MouseMove, (event: MouseEvent) => void]
  | [UserEventType.MouseEnter, (event: MouseEvent) => void]
  | [UserEventType.MouseLeave, (event: MouseEvent) => void]
  | [UserEventType.MouseScroll, (event: ScrollEvent) => void]
  | [UserEventType.MouseDown, (event: MouseEvent) => void]
  | [UserEventType.MouseUp, (event: MouseEvent) => void];

/**
 * `BaseView` but with event listeners.
 */
export class View extends BaseView {
  _eventListeners: Array<UserEventTuple> = [];

  /**
   * Controlled by `EventManager`. Needed for dispatching mouseEnter and mouseLeave events.
   */
  _isMouseOver = false;
  /**
   * Accessed by `paint()`.
   */
  isHorizontalScrollbarHovered: boolean = false;
  /**
   * Accessed by `paint()`.
   */
  isVerticalScrollbarHovered: boolean = false;

  private isMouseDown = false;
  private lastPosition: Vec2 | null = null;

  constructor(props: {
    onClick?(): void;
    onMouseEnter?(): void;
    onMouseLeave?(): void;
    style?: ViewStyleProps;
    testID?: string;
  }) {
    super(props);

    this.onScroll = this.onScroll.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);

    if (props.onClick) {
      this._eventListeners.push([UserEventType.MouseClick, props.onClick]);
    }

    // For mouse-interacting with the scrollbar.
    // TODO: this is done when creating the node but scrollbar can be added later (like with
    // Overflow.Auto). What then?
    if (this._style.overflowX === Overflow.Scroll || this._style.overflowY === Overflow.Scroll) {
      this._eventListeners.push([UserEventType.MouseScroll, this.onScroll]);
      this._eventListeners.push([UserEventType.MouseDown, this.onMouseDown]);
      this._eventListeners.push([UserEventType.MouseUp, this.onMouseUp]);
      this._eventListeners.push([UserEventType.MouseMove, this.onMouseMove]);
      this._eventListeners.push([UserEventType.MouseEnter, this.onMouseEnter]);
      this._eventListeners.push([UserEventType.MouseLeave, this.onMouseLeave]);
    }
    if (props.onMouseEnter) {
      this._eventListeners.push([UserEventType.MouseEnter, props.onMouseEnter]);
    }

    if (props.onMouseLeave) {
      this._eventListeners.push([UserEventType.MouseLeave, props.onMouseLeave]);
    }
  }

  private onScroll(event: ScrollEvent) {
    this._state.scrollX = Math.min(
      Math.max(this._state.scrollX + Math.round(event.delta.x), 0),
      this._state.scrollWidth - this._state.clientWidth,
    );
    this._state.scrollY = Math.min(
      Math.max(this._state.scrollY + Math.round(event.delta.y), 0),
      this._state.scrollHeight - this._state.clientHeight,
    );
  }

  private onMouseEnter(_: MouseEvent) {
    console.log(`Mouse entered ${this.testID}`);
  }

  private onMouseLeave(_: MouseEvent) {
    console.log(`Mouse left ${this.testID}`);
  }

  private onMouseDown(_: MouseEvent) {
    console.log("aa");
    if (this.isHorizontalScrollbarHovered || this.isVerticalScrollbarHovered) {
      this.isMouseDown = true;
    }
  }

  private onMouseUp(_: MouseEvent) {
    this.isMouseDown = false;
  }

  // TODO: don't abruply stop scrolling when mouse leaves the scrollbar but is still pressed.
  private onMouseMove(event: MouseEvent) {
    if (this.isMouseDown) {
      console.log("down");
      // Scroll.
      const deltaX = this.lastPosition ? event.position.x - this.lastPosition.x : 0;
      const deltaY = this.lastPosition ? event.position.y - this.lastPosition.y : 0;

      // 1 pixel of scrollbar is how many pixels of content?
      const ratioX = this._state.scrollWidth / this._state.clientWidth;
      const ratioY = this._state.scrollHeight / this._state.clientHeight;

      if (this.isHorizontalScrollbarHovered) {
        this._state.scrollX = Math.min(
          Math.max(this._state.scrollX + Math.round(deltaX * ratioX), 0),
          this._state.scrollWidth - this._state.clientWidth,
        );
      }

      if (this.isVerticalScrollbarHovered) {
        this._state.scrollY = Math.min(
          Math.max(this._state.scrollY + Math.round(deltaY * ratioY), 0),
          this._state.scrollHeight - this._state.clientHeight,
        );
      }
      this.lastPosition = event.position;
    } else if (this._isMouseOver) {
      // Screen space rectangle of the node's visible area, including scrollbars.
      const rectangle = getScreenVisibleRectangle(this);

      if (this._state.hasHorizontalScrollbar) {
        const horizontalScrollbar = intersection(
          rectangle,
          new Vec4(
            rectangle.x,
            rectangle.y + this._state.clientHeight,
            this._state.clientWidth,
            CROSS_AXIS_SIZE,
          ),
        );
        this.isHorizontalScrollbarHovered = isInside(event.position, horizontalScrollbar);
      }

      if (this._state.hasVerticalScrollbar) {
        const verticalScrollbar = intersection(
          rectangle,
          new Vec4(
            rectangle.x + this._state.clientWidth,
            rectangle.y,
            CROSS_AXIS_SIZE,
            this._state.clientHeight,
          ),
        );
        this.isVerticalScrollbarHovered = isInside(event.position, verticalScrollbar);
      }
    } else {
      this.isHorizontalScrollbarHovered = false;
      this.isVerticalScrollbarHovered = false;
    }
  }
}

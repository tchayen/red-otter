import { CROSS_AXIS_SIZE } from "../consts";
import { getScreenVisibleRectangle } from "../hitTest";
import { Vec4 } from "../math/Vec4";
import { intersection, isInside } from "../math/utils";
import { BaseView } from "./BaseView";
import type {
  BlurHandler,
  FocusHandler,
  KeyDownHandler,
  KeyPressHandler,
  KeyUpHandler,
  LayoutHandler,
  MouseClickHandler,
  MouseDownHandler,
  MouseEnterHandler,
  MouseEvent,
  MouseLeaveHandler,
  MouseMoveHandler,
  MouseUpHandler,
  ScrollEvent,
  ScrollHandler,
} from "./eventTypes";
import { UserEventType } from "./eventTypes";
import type { ViewStyleProps } from "./styling";
import { Overflow } from "./styling";

type UserEventTuple =
  | [UserEventType.MouseClick, MouseClickHandler]
  | [UserEventType.MouseMove, MouseMoveHandler]
  | [UserEventType.MouseEnter, MouseEnterHandler]
  | [UserEventType.MouseLeave, MouseLeaveHandler]
  | [UserEventType.MouseDown, MouseDownHandler]
  | [UserEventType.MouseUp, MouseUpHandler]
  | [UserEventType.Scroll, ScrollHandler]
  | [UserEventType.KeyDown, KeyDownHandler]
  | [UserEventType.KeyUp, KeyUpHandler]
  | [UserEventType.KeyPress, KeyPressHandler]
  | [UserEventType.Focus, FocusHandler]
  | [UserEventType.Blur, BlurHandler]
  | [UserEventType.Layout, LayoutHandler];

/**
 * `BaseView` but with event listeners.
 */
export class View extends BaseView {
  _eventListeners: Array<UserEventTuple> = [];
  /**
   * Controlled by `EventManager`. Needed for dispatching mouseEnter and mouseLeave events.
   */
  _isMouseOver = false;

  _scrolling: {
    xActive: boolean;
    xHovered: boolean;
    yActive: boolean;
    yHovered: boolean;
  };

  constructor(
    readonly props: {
      onClick?(): void;
      onMouseEnter?(): void;
      onMouseLeave?(): void;
      style?: ViewStyleProps;
      testID?: string;
    },
  ) {
    super(props);

    this._scrolling = {
      xActive: false,
      xHovered: false,
      yActive: false,
      yHovered: false,
    };

    this.onScroll = this.onScroll.bind(this);
    this.handleMouseDownScrollStart = this.handleMouseDownScrollStart.bind(this);
    this.handleMouseMoveScrollHovering = this.handleMouseMoveScrollHovering.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);

    // For mouse-interacting with the scrollbar.
    // TODO: this is done when creating the node but scrollbar can be added later (like with
    // Overflow.Auto). What then?
    if (this._style.overflowX === Overflow.Scroll || this._style.overflowY === Overflow.Scroll) {
      this._eventListeners.push(
        [UserEventType.Scroll, this.onScroll],
        [UserEventType.MouseDown, this.handleMouseDownScrollStart],
        [UserEventType.MouseMove, this.handleMouseMoveScrollHovering],
        [UserEventType.MouseEnter, this.onMouseEnter],
        [UserEventType.MouseLeave, this.onMouseLeave],
      );
    }

    if (props.onClick) {
      this._eventListeners.push([UserEventType.MouseClick, props.onClick]);
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
    // No-op but important to keep this._isMouseOver up to date.
  }

  private onMouseLeave(_: MouseEvent) {
    this._scrolling.xHovered = false;
    this._scrolling.yHovered = false;
  }

  private handleMouseDownScrollStart(_: MouseEvent) {
    if (this._scrolling.xHovered) {
      this._scrolling.xActive = true;
    }

    if (this._scrolling.yHovered) {
      this._scrolling.yActive = true;
    }
  }

  private handleMouseMoveScrollHovering(event: MouseEvent) {
    if (this._scrolling.xActive || this._scrolling.yActive) {
      return;
    }

    if (this._isMouseOver) {
      // Screen space rectangle of the node's visible area, including scrollbars.
      const rectangle = getScreenVisibleRectangle(this);

      if (this._state.hasHorizontalScrollbar) {
        const scrollbar = new Vec4(
          rectangle.x,
          rectangle.y + rectangle.w - CROSS_AXIS_SIZE,
          this._state.clientWidth,
          CROSS_AXIS_SIZE,
        );

        const clippedScrollbar = intersection(rectangle, scrollbar);
        this._scrolling.xHovered = isInside(event.position, clippedScrollbar);
      }
      if (this._state.hasVerticalScrollbar) {
        const scrollbar = new Vec4(
          rectangle.x + rectangle.z - CROSS_AXIS_SIZE,
          rectangle.y,
          CROSS_AXIS_SIZE,
          this._state.clientHeight,
        );
        const clippedScrollbar = intersection(rectangle, scrollbar);
        this._scrolling.yHovered = isInside(event.position, clippedScrollbar);
      }
    } else {
      this._scrolling.xHovered = false;
      this._scrolling.yHovered = false;
    }
  }
}

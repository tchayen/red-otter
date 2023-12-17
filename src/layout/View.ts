import { type Vec2 } from "..";
import { hitTest } from "../hitTest";
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

  _isMouseOver: boolean = false;
  private mouseDownPosition: Vec2 | null = null;
  private mousePosition: Vec2 | null = null;
  isHorizontalScrollbarHovered: boolean = false;
  isVerticalScrollbarHovered: boolean = false;

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

  private onMouseEnter(event: MouseEvent) {
    console.log(`Mouse entered ${this.testID}`);
  }

  private onMouseLeave(event: MouseEvent) {
    console.log(`Mouse left ${this.testID}`);
    this.isHorizontalScrollbarHovered = false;
    this.isVerticalScrollbarHovered = false;
  }

  private onMouseDown(event: MouseEvent) {
    this.mouseDownPosition = event.position;
  }

  private onMouseUp(event: MouseEvent) {
    this.mouseDownPosition = null;
  }

  private onMouseMove(event: MouseEvent) {
    if (!this._isMouseOver) {
      return;
    }

    if (hitTest(this, event)) {
      if (this._state.hasHorizontalScrollbar) {
        this.isHorizontalScrollbarHovered = event.position.y >= this._state.clientHeight;
      }

      if (this._state.hasVerticalScrollbar) {
        this.isVerticalScrollbarHovered = event.position.x >= this._state.clientWidth;
      }
      // console.log(this.testID, "it's me");
    }
  }
}

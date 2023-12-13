import type { Vec2 } from "..";
import { hitTest } from "../hitTest";
import { BaseView } from "./BaseView";
import type {
  ClickEvent,
  MoveEvent,
  ScrollEvent,
  MouseDownEvent,
  MouseUpEvent,
} from "./eventTypes";
import { UserEventType } from "./eventTypes";
import type { ViewStyleProps } from "./styling";
import { Overflow } from "./styling";

type UserEventTuple =
  | [UserEventType.MouseClick, (event: ClickEvent) => void]
  | [UserEventType.MouseMove, (event: MoveEvent) => void]
  | [UserEventType.MouseScroll, (event: ScrollEvent) => void]
  | [UserEventType.MouseDown, (event: MouseDownEvent) => void]
  | [UserEventType.MouseUp, (event: MouseUpEvent) => void];

/**
 * `BaseView` but with event listeners.
 */
export class View extends BaseView {
  _eventListeners: Array<UserEventTuple> = [];

  private mouseDownPosition: Vec2 | null = null;
  private isScrollbarHovered: boolean = false;

  constructor(props: { onClick?(): void; style?: ViewStyleProps; testID?: string }) {
    super(props);

    this.onScroll = this.onScroll.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

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

  onMouseDown(event: MouseDownEvent) {
    this.mouseDownPosition = event.position;
  }

  onMouseUp(event: MouseUpEvent) {
    //
  }

  onMouseMove(event: MoveEvent) {
    //
    if (hitTest(this, event)) {
      console.log(this.testID, "it's me");
    }
  }
}

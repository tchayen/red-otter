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

export class View extends BaseView {
  _eventListeners: Array<UserEventTuple> = [];
  _scrollbarClickPosition: number = -1;
  _isScrollbarHovered: boolean = false;

  constructor(props: { onClick?(): void; style?: ViewStyleProps; testID?: string }) {
    super(props);

    this.onScroll = this.onScroll.bind(this);
    this.onScrollbarDown = this.onScrollbarDown.bind(this);
    this.onScrollbarUp = this.onScrollbarUp.bind(this);
    this.onScrollbarDrag = this.onScrollbarDrag.bind(this);

    if (props.onClick) {
      this._eventListeners.push([UserEventType.MouseClick, props.onClick]);
    }
    if (this._style.overflowX === Overflow.Scroll || this._style.overflowY === Overflow.Scroll) {
      this._eventListeners.push([UserEventType.MouseScroll, this.onScroll]);
    }

    // For mouse-interacting with the scrollbar.
    if (this._style.overflowX === Overflow.Scroll || this._style.overflowY === Overflow.Scroll) {
      this._eventListeners.push([UserEventType.MouseDown, this.onScrollbarDown]);
      this._eventListeners.push([UserEventType.MouseUp, this.onScrollbarUp]);
      this._eventListeners.push([UserEventType.MouseMove, this.onScrollbarDrag]);
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

  onScrollbarDown(event: MouseDownEvent) {
    //
  }

  onScrollbarUp(event: MouseUpEvent) {
    //
  }

  onScrollbarDrag(event: MoveEvent) {
    //
    if (hitTest(this, event)) {
      console.log("it's me");
    }
  }
}

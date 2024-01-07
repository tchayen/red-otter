import type { EventManager } from "../EventManager";
import type { Vec2 } from "../math/Vec2";

export const enum UserEventType {
  MouseClick,
  MouseDown,
  MouseUp,
  MouseMove,
  MouseEnter,
  MouseLeave,

  Scroll,

  KeyDown,
  KeyUp,
  KeyPress,

  Focus,
  Blur,

  InputChange,

  Layout,
}

export type MouseClickHandler = (event: MouseEvent, eventManager: EventManager) => void;
export type MouseMoveHandler = (event: MouseEvent, eventManager: EventManager) => void;
export type MouseEnterHandler = (event: MouseEvent, eventManager: EventManager) => void;
export type MouseLeaveHandler = (event: MouseEvent, eventManager: EventManager) => void;
export type MouseDownHandler = (event: MouseEvent, eventManager: EventManager) => void;
export type MouseUpHandler = (event: MouseEvent, eventManager: EventManager) => void;
export type ScrollHandler = (event: ScrollEvent, eventManager: EventManager) => void;
export type KeyDownHandler = (event: KeyboardEvent, eventManager: EventManager) => void;
export type KeyUpHandler = (event: KeyboardEvent, eventManager: EventManager) => void;
export type KeyPressHandler = (event: KeyboardEvent, eventManager: EventManager) => void;
export type FocusHandler = (event: FocusEvent, eventManager: EventManager) => void;
export type BlurHandler = (event: FocusEvent, eventManager: EventManager) => void;
export type LayoutHandler = (eventManager: EventManager) => void;

export type MouseEvent = {
  bubbles: boolean;
  capturable: boolean;
  position: Vec2;
  type:
    | UserEventType.MouseClick
    | UserEventType.MouseDown
    | UserEventType.MouseUp
    | UserEventType.MouseMove
    | UserEventType.MouseEnter
    | UserEventType.MouseLeave;
};

export type ScrollEvent = {
  bubbles: boolean;
  capturable: boolean;
  delta: Vec2;
  position: Vec2;
  type: UserEventType.Scroll;
};

export type KeyboardEvent = {
  /**
   * When even is handled by a listener, should it also be dispatched to any parent listeners (that
   * match the type).
   */
  bubbles: boolean;
  /**
   * Is the event going to be 'consumed' by the first listener.
   */
  capturable: boolean;
  /**
   * The key code of the key that was pressed.
   */
  character: string;
  code: number;
  modifiers: {
    alt: boolean;
    control: boolean;
    meta: boolean;
    shift: boolean;
  };
  type: UserEventType.KeyDown | UserEventType.KeyUp | UserEventType.KeyPress;
};

export type FocusEvent = {
  bubbles: boolean;
  capturable: boolean;
  type: UserEventType.Focus | UserEventType.Blur;
};

export type LayoutEvent = {
  bubbles: boolean;
  capturable: boolean;
  type: UserEventType.Layout;
};

export type UserEvent = MouseEvent | ScrollEvent | KeyboardEvent | FocusEvent | LayoutEvent;

export function isMouseEvent(event: UserEvent): event is MouseEvent {
  return "position" in event;
}

export function isKeyboardEvent(event: UserEvent): event is KeyboardEvent {
  return "character" in event;
}

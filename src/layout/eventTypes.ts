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
}

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

export type UserEvent = MouseEvent | ScrollEvent | KeyboardEvent;

export function isMouseEvent(event: UserEvent): event is MouseEvent {
  return "position" in event;
}

import type { Vec2 } from "../math/Vec2";

export const enum UserEventType {
  MouseClick,
  MouseDown,
  MouseUp,
  MouseMove,
  MouseScroll,
  MouseEnter,
  MouseLeave,
}

export type MouseEvent = {
  bubbles: boolean;
  capturable: boolean;
  position: Vec2;
  type: Omit<UserEventType, UserEventType.MouseScroll>;
};

export type ScrollEvent = {
  bubbles: boolean;
  capturable: boolean;
  delta: Vec2;
  position: Vec2;
  type: UserEventType.MouseScroll;
};

export type UserEvent = MouseEvent | ScrollEvent;

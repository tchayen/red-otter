import type { Vec2 } from "../math/Vec2";

export const enum UserEventType {
  MouseClick,
  MouseDown,
  MouseUp,
  MouseMove,
  MouseScroll,
}

export type ClickEvent = {
  position: Vec2;
  type: UserEventType.MouseClick;
};

export type MouseDownEvent = {
  position: Vec2;
  type: UserEventType.MouseDown;
};

export type MouseUpEvent = {
  position: Vec2;
  type: UserEventType.MouseUp;
};

export type MoveEvent = {
  position: Vec2;
  type: UserEventType.MouseMove;
};

export type ScrollEvent = {
  delta: Vec2;
  position: Vec2;
  type: UserEventType.MouseScroll;
};

export type UserEvent = ClickEvent | MouseDownEvent | MouseUpEvent | MoveEvent | ScrollEvent;

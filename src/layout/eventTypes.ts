import type { Vec2 } from "../math/Vec2";

export const enum UserEventType {
  MouseClick,
  MouseMove,
  MouseScroll,
}

export type ClickEvent = {
  position: Vec2;
  type: UserEventType.MouseClick;
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

export type UserEvent = ClickEvent | MoveEvent | ScrollEvent;

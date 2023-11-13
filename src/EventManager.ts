import { View } from "./View";
import { Vec2 } from "./math/Vec2";
import type { ClickEvent, MoveEvent, ScrollEvent, UserEvent } from "./types";
import { UserEventType } from "./types";

type UserEventTuple =
  | [UserEventType.MouseClick, View, (event: ClickEvent) => void]
  | [UserEventType.MouseMove, View, (event: MoveEvent) => void]
  | [UserEventType.MouseScroll, View, (event: ScrollEvent) => void];

export class EventManager {
  private readonly events: UserEvent[] = [];
  private readonly listeningViews: Array<UserEventTuple> = [];

  constructor() {
    window.addEventListener("pointermove", (event) => {
      this.push({
        position: new Vec2(event.clientX, event.clientY),
        type: UserEventType.MouseMove,
      });
    });

    window.addEventListener("pointerup", (event) => {
      console.log("pointerup", event.clientX, event.clientY);
      this.push({
        position: new Vec2(event.clientX, event.clientY),
        type: UserEventType.MouseClick,
      });
    });

    window.addEventListener("wheel", (event) => {
      this.push({
        delta: new Vec2(event.deltaX, event.deltaY),
        position: new Vec2(event.clientX, event.clientY),
        type: UserEventType.MouseScroll,
      });
    });

    // Turn off right-click since it will be used within the UI.
    document.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  public push(event: UserEvent): void {
    this.events.push(event);
  }

  public pop(): UserEvent | undefined {
    return this.events.shift();
  }

  public addEventListener(
    type: UserEventType,
    view: View,
    callback: (event: ClickEvent | ScrollEvent | MoveEvent) => void
  ): void {
    this.listeningViews.push([type, view, callback]);
    console.log(this.listeningViews);
  }

  public removeEventListener(callback: () => void): void {
    const index = this.listeningViews.findIndex(([, , c]) => c === callback);
    if (index !== -1) {
      this.listeningViews.splice(index, 1);
    }
  }

  public deliverEvents(): void {
    let event = this.pop();
    while (event) {
      for (const [type, view, callback] of this.listeningViews) {
        if (type === event.type && hitTest(view, event)) {
          callback(event);
        }
      }
      event = this.pop();
    }
  }
}

function hitTest(view: View, event: UserEvent): boolean {
  return (
    event.position.x >= view._state.metrics.x &&
    event.position.x <= view._state.metrics.x + view._state.metrics.width &&
    event.position.y >= view._state.metrics.y &&
    event.position.y <= view._state.metrics.y + view._state.metrics.height
  );
}

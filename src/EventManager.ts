import type { UserEvent } from "./types";
import { UserEventType } from "./types";

export class EventManager {
  private readonly events: UserEvent[] = [];

  constructor() {
    window.addEventListener("pointermove", (event) => {
      this.push({
        type: UserEventType.MouseMove,
        x: event.clientX,
        y: event.clientY,
      });
    });

    window.addEventListener("pointerup", (event) => {
      this.push({
        type: UserEventType.MouseClick,
        x: event.clientX,
        y: event.clientY,
      });
    });
  }

  public push(event: UserEvent): void {
    this.events.push(event);
  }

  public pop(): UserEvent | undefined {
    return this.events.shift();
  }
}

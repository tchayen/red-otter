import type { UserEvent } from "./types";
import { UserEventType } from "./types";

export class EventManager {
  private readonly events: UserEvent[] = [];

  constructor() {
    // window.addEventListener("pointermove", (event) => {
    //   this.push({
    //     type: UserEventType.MouseMove,
    //     x: event.clientX,
    //     y: event.clientY,
    //   });
    // });

    window.addEventListener("pointerup", (event) => {
      console.log("pointerup", event.clientX, event.clientY);
      this.push({
        type: UserEventType.MouseClick,
        x: event.clientX,
        y: event.clientY,
      });
    });

    // window.addEventListener("wheel", (event) => {
    //   this.push({
    //     type: UserEventType.MouseScroll,
    //     x: event.deltaX,
    //     y: event.deltaY,
    //   });
    // });

    // Turn off right-click since it will be used within the UI.
    document.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  public push(event: UserEvent): void {
    this.events.push(event);
  }

  public pop(): UserEvent | undefined {
    return this.events.shift();
  }
}

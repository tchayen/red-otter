import { View } from "./layout/View";
import { isWindowDefined } from "./consts";
import { Vec2 } from "./math/Vec2";
import { Display } from "./layout/styling";
import { invariant } from "./utils/invariant";
import type { UserEvent } from "./layout/eventTypes";
import { UserEventType } from "./layout/eventTypes";
import { hitTest } from "./hitTest";

export class EventManager {
  private readonly events: Array<UserEvent> = [];

  constructor() {
    if (!isWindowDefined) {
      return;
    }

    if (typeof window !== "undefined") {
      window.addEventListener("keydown", (event) => {
        // TODO release: implement key repeating? Maybe use keypress.
      });
      window.addEventListener("keyup", (event) => {
        // TODO release: implement key repeating? Maybe use keypress.
      });

      window.addEventListener("pointermove", (event) => {
        this.dispatchEvent({
          position: new Vec2(event.clientX, event.clientY),
          type: UserEventType.MouseMove,
        });
      });

      window.addEventListener("pointerup", (event) => {
        this.dispatchEvent({
          position: new Vec2(event.clientX, event.clientY),
          type: UserEventType.MouseClick,
        });
      });

      window.addEventListener("mousedown", (event) => {
        this.dispatchEvent({
          position: new Vec2(event.clientX, event.clientY),
          type: UserEventType.MouseDown,
        });
      });

      window.addEventListener("mouseup", (event) => {
        this.dispatchEvent({
          position: new Vec2(event.clientX, event.clientY),
          type: UserEventType.MouseUp,
        });
      });

      window.addEventListener("wheel", (event) => {
        this.dispatchEvent({
          delta: new Vec2(event.deltaX, event.deltaY),
          position: new Vec2(event.clientX, event.clientY),
          type: UserEventType.MouseScroll,
        });
      });
    }

    // Turn off right-click since it will be used within the UI.
    document.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  public dispatchEvent(event: UserEvent): void {
    this.events.push(event);
  }

  public deliverEvents(root: View): void {
    const stack: Array<View> = [root];
    const reverse = [];

    while (stack.length > 0) {
      const node = stack.pop();
      invariant(node, "Node should be defined.");

      if (node._style.display === Display.None) {
        continue;
      }

      reverse.push(node);

      let c = node.firstChild;
      while (c) {
        if (c instanceof View) {
          stack.push(c);
        }
        c = c.next;
      }
    }

    for (let i = reverse.length - 1; i >= 0; i--) {
      const node = reverse[i];
      invariant(node, "Node should be defined.");
      for (const [type, listener] of node._eventListeners) {
        for (let j = 0; j < this.events.length; j++) {
          const event = this.events[j];
          invariant(event, "Event should be defined.");
          if (event.type === type && hitTest(node, event)) {
            const typedListener = listener as (e: typeof event) => void;
            typedListener(event);
            // Remove event from queue.
            this.events.splice(j, 1);
            j--;
          }
        }
      }
    }

    // Remove all events that were not handled.
    this.events.length = 0;
  }
}

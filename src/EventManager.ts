import { View } from "./View";
import { isWindowDefined } from "./consts";
import { Vec2 } from "./math/Vec2";
import type { UserEvent } from "./types";
import { Display, UserEventType } from "./types";
import { invariant } from "./utils/invariant";

export class EventManager {
  private readonly events: UserEvent[] = [];

  constructor() {
    if (!isWindowDefined) {
      return;
    }

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

  public deliverEvents(root: View): void {
    const stack: Array<View> = [root];
    const reverse = [];

    while (stack.length > 0) {
      const node = stack.pop();
      invariant(node, "Node should be defined.");

      if (node._style.display === Display.None) {
        continue;
      }

      // TODO: maybe also build-up scroll offset and store it in the array so the node 'knows'
      // where it is on the screen?
      reverse.push(node);

      let c = node.firstChild;
      while (c) {
        if (c instanceof View) {
          stack.push(c);
        }
        c = c.firstChild;
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
            listener(event);
            // remove event from queue
            this.events.splice(j, 1);
            j--;
          }
        }
      }
    }
  }
}

// TODO @tchayen: this does not take into account: scroll position, parent clipping, scrollbar
// (it's outside of the metrics size now).
function hitTest(view: View, event: UserEvent): boolean {
  return (
    event.position.x >= view._state.x &&
    event.position.x <= view._state.x + view._state.clientWidth &&
    event.position.y >= view._state.y &&
    event.position.y <= view._state.y + view._state.clientHeight
  );
}

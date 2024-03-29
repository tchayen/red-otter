import { View } from "./layout/View";
import { isWindowDefined } from "./consts";
import { Vec2 } from "./math/Vec2";
import { Display } from "./layout/styling";
import { invariant } from "./utils/invariant";
import { UserEventType, isKeyboardEvent, isMouseEvent } from "./layout/eventTypes";
import { hitTest } from "./hitTest";
import type { MouseEvent, UserEvent } from "./layout/eventTypes";
import { Input } from "./widgets/Input";

/**
 * Responsible for dispatching events to the correct views.
 */
export class EventManager {
  private readonly events: Array<UserEvent> = [];

  private focused: View | null = null;

  constructor() {
    if (!isWindowDefined) {
      return;
    }

    this.setFocused = this.setFocused.bind(this);
    this.dispatchEvent = this.dispatchEvent.bind(this);
    this.deliverEvents = this.deliverEvents.bind(this);

    if (typeof window !== "undefined") {
      window.addEventListener("keydown", (event) => {
        this.dispatchEvent({
          bubbles: false,
          capturable: false,
          character: event.key,
          code: event.keyCode,
          modifiers: {
            alt: event.altKey,
            control: event.ctrlKey,
            meta: event.metaKey,
            shift: event.shiftKey,
          },
          type: UserEventType.KeyDown,
        });
      });

      window.addEventListener("keyup", (event) => {
        this.dispatchEvent({
          bubbles: false,
          capturable: true,
          character: event.key,
          code: event.keyCode,
          modifiers: {
            alt: event.altKey,
            control: event.ctrlKey,
            meta: event.metaKey,
            shift: event.shiftKey,
          },
          type: UserEventType.KeyUp,
        });
      });

      window.addEventListener("keypress", (event) => {
        this.dispatchEvent({
          bubbles: false,
          capturable: true,
          character: event.key,
          code: event.keyCode,
          modifiers: {
            alt: event.altKey,
            control: event.ctrlKey,
            meta: event.metaKey,
            shift: event.shiftKey,
          },
          type: UserEventType.KeyPress,
        });
      });

      window.addEventListener("pointermove", (event) => {
        this.dispatchEvent({
          bubbles: true,
          capturable: false,
          position: new Vec2(event.clientX, event.clientY),
          type: UserEventType.MouseMove,
        });
      });

      window.addEventListener("pointerup", (event) => {
        this.dispatchEvent({
          bubbles: true,
          capturable: true,
          position: new Vec2(event.clientX, event.clientY),
          type: UserEventType.MouseClick,
        });
      });

      window.addEventListener("mousedown", (event) => {
        this.dispatchEvent({
          bubbles: true,
          capturable: true,
          position: new Vec2(event.clientX, event.clientY),
          type: UserEventType.MouseDown,
        });
      });

      window.addEventListener("mouseup", (event) => {
        this.dispatchEvent({
          bubbles: true,
          capturable: true,
          position: new Vec2(event.clientX, event.clientY),
          type: UserEventType.MouseUp,
        });
      });

      window.addEventListener("wheel", (event) => {
        this.dispatchEvent({
          bubbles: false,
          capturable: true,
          delta: new Vec2(event.deltaX, event.deltaY),
          position: new Vec2(event.clientX, event.clientY),
          type: UserEventType.Scroll,
        });
      });
    }

    // Turn off right-click since it will be used within the UI.
    document.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  /**
   * Adds an event to the queue.
   */
  dispatchEvent(event: UserEvent): void {
    this.events.push(event);
  }

  setFocused(view: View | null): void {
    this.focused?._eventListeners.forEach(([type, listener]) => {
      if (type === UserEventType.Blur) {
        listener({ bubbles: false, capturable: false, type: UserEventType.Blur }, this);
      }
    });

    this.focused = view;

    this.focused?._eventListeners.forEach(([type, listener]) => {
      if (type === UserEventType.Focus) {
        listener({ bubbles: false, capturable: false, type: UserEventType.Focus }, this);
      }
    });
  }

  /**
   * Processes all events in the queue, leaving it empty, by visiting all views in the given root
   * tree and offering them to the views in the reverse DFS order.
   */
  deliverEvents(root: View): void {
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

    // Handle dragging scrollbar, potentially outside of the view (so it doesn't abruptly stop when
    // user goes one pixel too far).
    const currentlyScrolled = reverse.find(
      (node) => node._scrolling.xActive || node._scrolling.yActive,
    );
    if (currentlyScrolled) {
      this.events
        .filter((event) => event.type === UserEventType.MouseMove)
        .forEach((event) => {
          this.onMouseMove(currentlyScrolled, event as MouseEvent);
        });

      const mouseUp = this.events.find((event) => event.type === UserEventType.MouseUp);
      if (mouseUp) {
        currentlyScrolled._scrolling.xActive = false;
        currentlyScrolled._scrolling.yActive = false;
      }
    }

    // Dispatch mouse enter and leave events before other events because they are not consumed or
    // bubbled.
    for (let i = reverse.length - 1; i >= 0; i--) {
      const node = reverse[i];
      invariant(node, "Node should be defined.");

      for (const [type, listener] of node._eventListeners) {
        for (let j = 0; j < this.events.length; j++) {
          const event = this.events[j];
          invariant(event, "Event should be defined.");

          // Dispatch mouse enter and leave events.
          if (event.type === UserEventType.MouseMove) {
            const previous = node._isMouseOver;

            if (type === UserEventType.MouseEnter && !previous && hitTest(node, event)) {
              node._isMouseOver = true;
              listener(event as MouseEvent, this);
            }
            if (type === UserEventType.MouseLeave && previous && !hitTest(node, event)) {
              node._isMouseOver = false;
              listener(event as MouseEvent, this);
            }
          }
        }
      }
    }

    for (let i = reverse.length - 1; i >= 0; i--) {
      const node = reverse[i];
      invariant(node, "Node should be defined.");

      for (const [type, listener] of node._eventListeners) {
        for (let j = 0; j < this.events.length; j++) {
          if (j < 0) {
            continue;
          }
          const event = this.events[j];
          invariant(event, "Event should be defined.");
          if (event.type !== type) {
            continue;
          }

          if (isMouseEvent(event) && hitTest(node, event)) {
            const typedListener = listener as (e: typeof event, em: EventManager) => void;
            typedListener(event, this);

            // Bubble up the event.
            if (event.bubbles) {
              let parent = node.parent;
              while (parent) {
                if (!(parent instanceof View)) {
                  break;
                }

                for (const listener of parent._eventListeners) {
                  if (listener[0] === type) {
                    const typedListener = listener[1] as (
                      e: typeof event,
                      em: EventManager,
                    ) => void;
                    typedListener(event, this);
                  }
                }
                parent = parent.parent;
              }
            }

            if (event.capturable) {
              // Remove event from queue.
              this.events.splice(j, 1);
              j--;
            }
          }

          if (isKeyboardEvent(event) && node instanceof Input && node === this.focused) {
            const typedListener = listener as (e: typeof event, em: EventManager) => void;
            typedListener(event, this);

            if (event.capturable) {
              // Remove event from queue.
              this.events.splice(j, 1);
              j--;
            }
          }

          if (event.type === UserEventType.Layout) {
            const typedListener = listener as (em: EventManager) => void;
            typedListener(this);
            // Layout events are not capturable or bubbled.
          }
        }
      }
    }

    // Remove all events that were not handled.
    this.events.length = 0;
  }

  private lastPosition: Vec2 | null = null;
  private onMouseMove(node: View, event: MouseEvent): void {
    const deltaX = this.lastPosition ? event.position.x - this.lastPosition.x : 0;
    const deltaY = this.lastPosition ? event.position.y - this.lastPosition.y : 0;

    // 1 pixel of scrollbar is how many pixels of content?
    const ratioX = (node._state.scrollWidth / node._state.clientWidth) * window.devicePixelRatio;
    const ratioY = (node._state.scrollHeight / node._state.clientHeight) * window.devicePixelRatio;

    if (node._scrolling.xActive) {
      node._state.scrollX = Math.min(
        Math.max(node._state.scrollX + Math.round(deltaX * ratioX), 0),
        node._state.scrollWidth - node._state.clientWidth,
      );
    }

    if (node._scrolling.yActive) {
      node._state.scrollY = Math.min(
        Math.max(node._state.scrollY + Math.round(deltaY * ratioY), 0),
        node._state.scrollHeight - node._state.clientHeight,
      );
    }
    this.lastPosition = event.position;
  }
}

import {
  fixedRectangleDefaults,
  resolveRectangleStyling,
  rectangleDefaults,
  resolveSpacing,
} from "./styling";
import {
  FixedRectangle,
  RectangleStyleSheet,
  UserEvent,
  UserEventType,
} from "./ui/types";
import { Tree } from "./utils/Tree";
import { Text } from "./Text";

export class View extends Tree<FixedRectangle> {
  constructor(
    public props: {
      onClick?(): void;
      style: RectangleStyleSheet;
    }
  ) {
    super({
      ...fixedRectangleDefaults,
      input: { ...rectangleDefaults, ...resolveSpacing(props.style) },
      styles: resolveRectangleStyling(props.style),
    });
  }

  add(node: View | Text): View {
    node.parent = this;

    if (this.firstChild === null) {
      this.firstChild = node;
      this.lastChild = node;
    } else {
      if (this.lastChild === null) {
        throw new Error("Last child must be set.");
      }

      node.prev = this.lastChild;
      this.lastChild.next = node;
      this.lastChild = node;
    }

    return node as View;
  }

  handleEvent(event: UserEvent): void {
    if (event.type === UserEventType.MouseClick && this.props.onClick) {
      this.props.onClick();
    }
  }
}

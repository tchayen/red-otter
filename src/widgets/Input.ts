import { Vec4 } from "../math/Vec4";
import type { Vec2 } from "../math/Vec2";
import type { Shape } from "../font/shapeText";
import { shapeText } from "../font/shapeText";
import type { Lookups } from "../font/types";
import { Text } from "../layout/Text";
import { View } from "../layout/View";
import { UserEventType } from "../layout/eventTypes";
import type { MouseEvent, KeyboardEvent } from "../layout/eventTypes";
import { Whitespace, type ViewStyleProps, Position, TextAlign } from "../layout/styling";
import { invariant } from "../utils/invariant";
import { updateSelection } from "./updateSelection";
import { updateText } from "./updateText";
import { pointToNodeSpace } from "../hitTest";

const placeholderColor = "#606060";
const textColor = "#EEEEEE";
const selectionColor = "rgba(40, 112, 189, 0.5)";
const cursorColor = "rgb(40, 112, 189)";
const blinkIntervalMs = 500;
const typingStoppedTimeoutMs = 1000;

const fontSize = 24;

export class Input extends View {
  value: string = "";
  mark: number = 0;
  cursor: number = 0;

  isFocused: boolean = true;

  isMouseDown: boolean = false;
  offset: Vec2 | null = null;
  /**
   * Start and end coordinates.
   */
  mouseDrag: Vec4 | null = null;
  textShape: Shape | null = null;

  constructor(
    readonly props: {
      lookups: Lookups;
      onChange?(value: string): void;
      onClick?(): void;
      onKeyDown?(event: KeyboardEvent): void;
      placeholder?: string;
      style: ViewStyleProps;
      testID?: string;
      value?: string;
    },
  ) {
    super({ ...props, style: { width: 200, ...props.style } });

    // Blinking cursor.
    setInterval(() => {
      const cursor = this.firstChild?.next?.next;
      invariant(cursor instanceof View, "Third child should be cursor.");
      cursor._style.backgroundColor =
        cursor._style.backgroundColor === cursorColor ? "transparent" : cursorColor;
    }, blinkIntervalMs);

    // Text (placeholder or value).
    this.add(
      new Text(props.placeholder ?? "", {
        lookups: props.lookups,
        style: {
          color: placeholderColor,
          fontName: "Inter",
          fontSize: fontSize,
          whitespace: Whitespace.NoWrap,
        },
      }),
    );

    // Selection.
    this.add(
      new View({
        style: {
          backgroundColor: selectionColor,
          height: "100%",
          left: 0,
          position: Position.Absolute,
          top: 0,
          width: 5,
        },
      }),
    );

    // Cursor.
    this.add(
      new View({
        style: {
          backgroundColor: cursorColor,
          height: "100%",
          left: 30,
          position: Position.Absolute,
          top: 0,
          width: 1,
        },
      }),
    );

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onMouseDownForDragging = this.onMouseDownForDragging.bind(this);
    this.onMouseUpForDragging = this.onMouseUpForDragging.bind(this);
    this.onMouseMoveForDragging = this.onMouseMoveForDragging.bind(this);

    this._eventListeners.push(
      [UserEventType.KeyDown, this.onKeyDown],
      [UserEventType.KeyPress, this.onKeyPress],
      [UserEventType.MouseDown, this.onMouseDownForDragging],
      [UserEventType.MouseUp, this.onMouseUpForDragging],
      [UserEventType.MouseMove, this.onMouseMoveForDragging],
    );
  }

  private onKeyDown(event: KeyboardEvent) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event#:~:text=Since%20Firefox%2065,by%20an%20IME)%3A
    if (event.code === 229) {
      return;
    }

    if (this.isFocused) {
      const { cursor, mark, value } = updateSelection(this.value, this.cursor, this.mark, event);
      this.value = value;
      this.cursor = cursor;
      this.mark = mark;
      this.update();
    }
  }

  private onKeyPress(event: KeyboardEvent) {
    if (this.isFocused) {
      const { cursor, mark, value } = updateText(this.value, this.cursor, this.mark, event);
      this.value = value;
      this.cursor = cursor;
      this.mark = mark;
      this.update();
    }
  }

  private onMouseDownForDragging(event: MouseEvent) {
    console.log("onMouseDownForDragging", this.testID, event);

    this.isMouseDown = true;
    this.mouseDrag = new Vec4(
      event.position.x,
      event.position.y,
      event.position.x, // TODO: uhm what? I guess store previous position and use here?
      event.position.y,
    );
  }

  private onMouseUpForDragging(event: MouseEvent) {
    console.log("onMouseUpForDragging", this.testID, event);

    this.isMouseDown = false;
    this.mouseDrag = null;
  }

  private onMouseMoveForDragging(event: MouseEvent) {
    this.offset = pointToNodeSpace(this, event.position);

    if (this.mouseDrag && this.textShape) {
      const goingLeft = this.mouseDrag.x > this.mouseDrag.z;
      const rectangleX = Math.min(this.mouseDrag.x, this.mouseDrag.z) - 0; //previous?
      const rectangleWidth = Math.abs(this.mouseDrag.x - this.mouseDrag.z);

      for (let i = 0; i < this.textShape.positions.length; i++) {
        // Calculate if mouse click occured > half width of this letter and update cursor and mark.
      }
    }
  }

  private update() {
    invariant(this.firstChild instanceof Text, "First child should be text.");
    this.textShape = shapeText(
      this.props.lookups,
      this.firstChild?._style.fontName,
      fontSize,
      28,
      this.value,
      TextAlign.Left,
      Number.POSITIVE_INFINITY,
      true,
    );
    const text = this.firstChild;
    invariant(text instanceof Text, "First child should be text.");

    const selection = text.next;
    invariant(selection instanceof View, "Second child should be selection.");

    const cursor = selection.next;
    invariant(cursor instanceof View, "Third child should be cursor.");

    selection._state.clientWidth = this.textShape.boundingRectangle.width;

    if (this.value.length > 0) {
      text._style.color = textColor;
      text._style.left = this.offset?.x ?? 0;
      text.text = this.value;

      cursor._style.backgroundColor = cursorColor;
    } else {
      text._style.color = placeholderColor;
      text._style.left = 0;
      text.text = this.props.placeholder ?? "";

      cursor._style.backgroundColor = "transparent";
    }

    const start = Math.min(this.cursor, this.mark);
    const end = Math.max(this.cursor, this.mark);
    const maxIndex = this.textShape.positions.length - 1;

    // The x position of the start of the selection.
    const selectionStartX =
      (this.textShape.positions[Math.min(start, maxIndex)]?.x ?? 0) +
      (start === this.textShape.positions.length ? this.textShape.sizes[maxIndex]?.x ?? 0 : 0);

    const mostRightX =
      (this.textShape.positions[Math.min(end, maxIndex)]?.x ?? 0) +
      (end === this.textShape.positions.length ? this.textShape.sizes[maxIndex]?.x ?? 0 : 0);
  }
}

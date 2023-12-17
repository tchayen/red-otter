import { shapeText } from "../font/shapeText";
import type { Lookups } from "../font/types";
import { Text } from "../layout/Text";
import { View } from "../layout/View";
import { UserEventType } from "../layout/eventTypes";
import type { MouseEvent, KeyboardEvent } from "../layout/eventTypes";
import { Whitespace, type ViewStyleProps, Position, TextAlign } from "../layout/styling";
import { invariant } from "../utils/invariant";

const placeholderColor = "#606060";
const textColor = "#EEEEEE";
const selectionColor = "rgba(40, 112, 189, 0.5)";
const cursorColor = "rgb(40, 112, 189)";

const fontSize = 14;

export class Input extends View {
  value: string = "";
  mark: number = 0;
  cursor: number = 0;

  isFocused: boolean = true;
  offsetX: number = 0;

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
    }, 530);

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
          left: 10,
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

    this._eventListeners.push(
      [UserEventType.KeyDown, this.onKeyDown],
      [UserEventType.KeyPress, this.onKeyPress],
      [UserEventType.MouseDown, this.onMouseDownForDragging],
      [UserEventType.MouseUp, this.onMouseUpForDragging],
    );
  }

  private onKeyDown(event: KeyboardEvent) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event#:~:text=Since%20Firefox%2065,by%20an%20IME)%3A
    // if (event.isComposing || event.keyCode === 229) {
    //   return;
    // }

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
    console.log("onMouseDownForDragging", this, event);
  }

  private onMouseUpForDragging(event: MouseEvent) {
    console.log("onMouseUpForDragging", this, event);
  }

  private update() {
    invariant(this.firstChild instanceof Text, "First child should be text.");
    const textShape = shapeText(
      this.props.lookups,
      this.firstChild?._style.fontName,
      fontSize,
      28,
      this.value,
      TextAlign.Left,
      Number.POSITIVE_INFINITY,
      true,
    );
    const selection = this.firstChild.next;
    const cursor = selection?.next;
    invariant(selection instanceof View, "Second child should be selection.");
    invariant(cursor instanceof View, "Third child should be cursor.");

    selection._state.clientWidth = textShape.boundingRectangle.width;

    if (this.value.length > 0) {
      this.firstChild._style.color = textColor;
      this.firstChild._style.left = this.offsetX;
      this.firstChild.text = this.value;
    } else {
      this.firstChild._style.color = placeholderColor;
      this.firstChild._style.left = 0;
      this.firstChild.text = this.props.placeholder ?? "";
    }
  }
}

export function updateSelection(
  value: string,
  cursor: number,
  mark: number,
  event: KeyboardEvent,
): { cursor: number; mark: number; value: string } {
  const valueAsNumbers = value.split("").map((character) => character.charCodeAt(0));

  const isCtrlPressed = event.modifiers.control;
  const isShiftPressed = event.modifiers.shift;
  const isCmdPressed = event.modifiers.meta;

  const selectionLength = Math.abs(cursor - mark);

  switch (event.code) {
    // Arrow left
    case 0x25: {
      if ((isCmdPressed || isCtrlPressed) && isShiftPressed) {
        cursor = 0;
      } else if (isCmdPressed || isCtrlPressed) {
        cursor = 0;
        mark = 0;
      } else if (isShiftPressed) {
        cursor = Math.max(0, cursor - 1);
      } else if (selectionLength > 0) {
        cursor = Math.min(cursor, mark);
        mark = cursor;
      } else {
        cursor = Math.max(0, cursor - 1);
        mark = cursor;
      }
      break;
    }
    // Arrow right
    case 0x27: {
      if ((isCmdPressed || isCtrlPressed) && isShiftPressed) {
        cursor = value.length;
      } else if (isCmdPressed || isCtrlPressed) {
        cursor = value.length;
        mark = cursor;
      } else if (isShiftPressed) {
        cursor = Math.min(value.length, cursor + 1);
      } else if (selectionLength > 0) {
        cursor = Math.max(cursor, mark);
        mark = cursor;
      } else {
        cursor = Math.min(value.length, cursor + 1);
        mark = cursor;
      }
      break;
    }

    // Backspace
    case 0x08: {
      if (selectionLength > 0) {
        valueAsNumbers.splice(Math.min(cursor, mark), selectionLength);
        cursor = Math.min(cursor, mark);
        mark = cursor;
      } else if (cursor === 0) {
        // Do nothing.
      } else {
        valueAsNumbers.splice(cursor - 1, 1);
        mark = cursor - 1;
        cursor = mark;
      }
      break;
    }

    // Delete
    case 0x2e: {
      if (selectionLength > 0) {
        valueAsNumbers.splice(Math.min(cursor, mark), selectionLength);
        cursor = Math.min(cursor, mark);
        mark = cursor;
      } else if (cursor === value.length) {
        // Do nothing.
      } else {
        valueAsNumbers.splice(cursor, 1);
        mark = cursor;
      }
      break;
    }

    // A
    case 0x41: {
      if (isCmdPressed || isCtrlPressed) {
        cursor = value.length;
        mark = 0;
      }
      break;
    }
  }

  return {
    cursor,
    mark,
    value: valueAsNumbers.map((code) => String.fromCharCode(code)).join(""),
  };
}

export function updateText(
  value: string,
  cursor: number,
  mark: number,
  event: KeyboardEvent,
): { cursor: number; mark: number; value: string } {
  const valueAsNumbers = value.split("").map((character) => character.charCodeAt(0));
  const selectionLength = Math.abs(cursor - mark);

  // If selection length is greater than 0, delete the selection first.
  if (selectionLength > 0) {
    valueAsNumbers.splice(Math.min(cursor, mark), selectionLength);
    cursor = Math.min(cursor, mark);
    mark = cursor;
  }

  valueAsNumbers.splice(cursor, 0, event.code);
  cursor += 1;
  mark = cursor;

  return {
    cursor,
    mark,
    value: valueAsNumbers.map((code) => String.fromCharCode(code)).join(""),
  };
}

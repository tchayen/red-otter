import { Vec4 } from "../math/Vec4";
import { Vec2 } from "../math/Vec2";
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
import { fontSizeToGap } from "../font/renderFontAtlas";
import type { EventManager } from "../EventManager";

const placeholderColor = "#606060";
const textColor = "#EEEEEE";
const selectionColor = "rgba(40, 112, 189, 0.5)";
const cursorColor = "rgb(40, 112, 189)";
const blinkIntervalMs = 500;
const typingStoppedTimeoutMs = 1000;

const fontSize = 14;

export class Input extends View {
  value = "";
  /**
   * The index of the cursor.
   */
  cursor = 0;
  previousCursor = 0;
  /**
   * The index of the other end of the selection. If there's no selection, it's the same as cursor.
   */
  mark = 0;

  /**
   * Start and end coordinates.
   */
  mouseDrag: Vec4 | null = null;
  textShape: Shape | null = null;

  horizontalScroll = 0;
  scrollWhenDragStarted = 0;

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
    super({ ...props, style: { width: 160, ...props.style } });

    // // Blinking cursor.
    // setInterval(() => {
    //   const cursor = this.firstChild?.next?.next;
    //   invariant(cursor instanceof View, "Third child should be cursor.");
    //   cursor._style.backgroundColor =
    //     cursor._style.backgroundColor === cursorColor ? "transparent" : cursorColor;
    // }, blinkIntervalMs);

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
          width: 0,
        },
      }),
    );

    // Cursor.
    this.add(
      new View({
        style: {
          backgroundColor: cursorColor,
          height: "100%",
          left: this._style.paddingLeft,
          position: Position.Absolute,
          top: 0,
          width: 2,
        },
      }),
    );

    this.onClick = this.onClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onMouseDownForDragging = this.onMouseDownForDragging.bind(this);
    this.onMouseUpForDragging = this.onMouseUpForDragging.bind(this);
    this.onMouseMoveForDragging = this.onMouseMoveForDragging.bind(this);
    this.onMouseEnterNOOP = this.onMouseEnterNOOP.bind(this);

    this._eventListeners.push(
      [UserEventType.MouseClick, this.onClick],
      [UserEventType.KeyDown, this.onKeyDown],
      [UserEventType.KeyPress, this.onKeyPress],
      [UserEventType.MouseDown, this.onMouseDownForDragging],
      [UserEventType.MouseUp, this.onMouseUpForDragging],
      [UserEventType.MouseMove, this.onMouseMoveForDragging],
      [UserEventType.MouseEnter, this.onMouseEnterNOOP],
      [UserEventType.MouseLeave, this.onMouseUpForDragging],
    );

    if (props.value) {
      this.value = props.value;
      this.update();
    }
  }

  private onClick(event: MouseEvent, eventManager: EventManager) {
    eventManager.setFocused(this);
    this.update();
  }

  private onBlur() {
    this.update();
  }

  private onMouseEnterNOOP(_: MouseEvent) {
    // No-op but important to keep this._isMouseOver up to date. Otherwise a state variable won't
    // be updated. This should be fixed by views getting a default onMouseEnter and onMouseLeave
    // events.
  }

  private onKeyDown(event: KeyboardEvent) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event#:~:text=Since%20Firefox%2065,by%20an%20IME)%3A
    if (event.code === 229) {
      return;
    }

    const { cursor, mark, value } = updateSelection(this.value, this.cursor, this.mark, event);
    this.value = value;
    this.previousCursor = this.cursor;
    this.cursor = cursor;
    this.mark = mark;
    this.update();
  }

  private onKeyPress(event: KeyboardEvent) {
    const { cursor, mark, value } = updateText(this.value, this.cursor, this.mark, event);
    this.value = value;
    this.previousCursor = this.cursor;
    this.cursor = cursor;
    this.mark = mark;
    this.update();
  }

  private onMouseDownForDragging(event: MouseEvent) {
    event.position = pointToNodeSpace(this, event.position);

    this.mouseDrag = new Vec4(
      event.position.x,
      event.position.y,
      event.position.x,
      event.position.y,
    );
    this.scrollWhenDragStarted = this.horizontalScroll;
  }

  private onMouseUpForDragging(event: MouseEvent) {
    if (this.mouseDrag && this.mouseDrag.x === this.mouseDrag.z) {
      this.setSelection(
        new Vec2(this.mouseDrag.x, this.mouseDrag.y),
        new Vec2(this.mouseDrag.z, this.mouseDrag.w),
      );
    }

    this.mouseDrag = null;
  }

  private onMouseMoveForDragging(event: MouseEvent) {
    const text = this.firstChild;
    invariant(text instanceof Text, "First child should be text.");
    const selection = text.next;
    invariant(selection instanceof View, "Second child should be selection.");
    const cursor = selection.next;
    invariant(cursor instanceof View, "Third child should be cursor.");

    event.position = pointToNodeSpace(this, event.position);

    if (this.mouseDrag) {
      this.mouseDrag =
        this.mouseDrag.x < 0
          ? new Vec4(event.position.x, event.position.y, this.mouseDrag.z, this.mouseDrag.w)
          : new Vec4(this.mouseDrag.x, this.mouseDrag.y, event.position.x, event.position.y);
    }

    if (this.mouseDrag && this.textShape) {
      this.setSelection(
        new Vec2(this.mouseDrag.x, this.mouseDrag.y),
        new Vec2(this.mouseDrag.z, this.mouseDrag.w),
      );
    }

    text._state.x = this._state.x + this._style.paddingLeft - this.horizontalScroll;
  }

  private setSelection(startPoint: Vec2, endPoint: Vec2) {
    if (!this.textShape) {
      return;
    }

    const text = this.firstChild;
    invariant(text instanceof Text, "First child should be text.");
    const selection = text.next;
    invariant(selection instanceof View, "Second child should be selection.");
    const cursor = selection.next;
    invariant(cursor instanceof View, "Third child should be cursor.");

    const goingLeft = startPoint.x > endPoint.x;
    const scrollDelta = this.scrollWhenDragStarted - this.horizontalScroll;
    const rectangleX = Math.min(startPoint.x + scrollDelta, endPoint.x);
    const rectangleWidth = Math.abs(startPoint.x - endPoint.x) + scrollDelta;

    const offsetLeft = -this.horizontalScroll + this._style.paddingLeft;
    const atlasGap = fontSizeToGap(this.props.lookups.atlas.fontSize);
    const fontPadding = (atlasGap * fontSize) / this.props.lookups.atlas.fontSize;

    for (let i = 0; i < this.textShape.positions.length; i++) {
      const character = this.textShape.positions[i];
      invariant(character, "Character should exist.");

      const positionX = character.x + offsetLeft;
      const width = this.textShape.sizes[i]!.x - 2 * fontPadding;

      if (rectangleX > positionX - width / 2) {
        if (goingLeft) {
          this.previousCursor = this.cursor;
          this.cursor = i;
        } else {
          this.mark = i;
        }
      }

      if (rectangleX + rectangleWidth >= positionX - width / 2) {
        if (goingLeft) {
          this.mark = i;
        } else {
          this.previousCursor = this.cursor;
          this.cursor = i;
        }
      }

      // Update scroll.
      const scrollMargin = 10;
      const scrollSpeed = 0.1;
      const textWidth = this.textShape.boundingRectangle.width;
      const textInputWidth = this._state.clientWidth;
      if (!goingLeft && rectangleX + rectangleWidth > textInputWidth - scrollMargin) {
        this.horizontalScroll = Math.min(
          this.horizontalScroll + scrollSpeed,
          textWidth - (textInputWidth - scrollMargin),
        );
      }
      if (goingLeft && rectangleX < scrollMargin) {
        this.horizontalScroll = Math.max(0, this.horizontalScroll - scrollSpeed);
      }

      this.update();
    }

    const lastCharacterWidth = (this.textShape.sizes.at(-1)?.x ?? 0) - 2 * fontPadding;
    const totalWidth = this.textShape.boundingRectangle.width;

    if (rectangleX > totalWidth + offsetLeft - lastCharacterWidth / 2) {
      if (goingLeft) {
        this.previousCursor = this.cursor;
        this.cursor = this.textShape.positions.length;
      } else {
        this.mark = this.textShape.positions.length;
      }

      this.update();
    }

    if (rectangleX + rectangleWidth >= totalWidth + offsetLeft - lastCharacterWidth / 2) {
      if (goingLeft) {
        this.mark = this.textShape.positions.length;
      } else {
        this.previousCursor = this.cursor;
        this.cursor = this.textShape.positions.length;
      }

      this.update();
    }
  }

  private update() {
    invariant(this.firstChild instanceof Text, "First child should be text.");
    const text = this.firstChild;
    invariant(text instanceof Text, "First child should be text.");
    const selection = text.next;
    invariant(selection instanceof View, "Second child should be selection.");
    const cursor = selection.next;
    invariant(cursor instanceof View, "Third child should be cursor.");

    this.textShape = shapeText(
      this.props.lookups,
      text._style.fontName,
      fontSize,
      28,
      this.value,
      TextAlign.Left,
      Number.POSITIVE_INFINITY,
      true,
    );

    const start = Math.min(this.cursor, this.mark);
    const end = Math.max(this.cursor, this.mark);

    const atlasGap = fontSizeToGap(this.props.lookups.atlas.fontSize);
    const padding = (atlasGap * fontSize) / this.props.lookups.atlas.fontSize;

    const cursorPosition =
      (this.cursor >= this.textShape.positions.length
        ? this.textShape.positions.length > 0
          ? (this.textShape.positions.at(-1)?.x ?? 0) +
            (this.textShape.sizes.at(-1)?.x ?? 0) -
            padding
          : 0
        : this.textShape.positions[this.cursor]?.x) ?? 0;

    // If cursor is near the edge of the text input, scroll a bit.
    const cursorX = cursorPosition - this.horizontalScroll;
    const textInputWidth = this._state.clientWidth;
    const textWidth = this.textShape.boundingRectangle.width;
    const scrollMargin = 20;

    const goingLeft = this.cursor < this.previousCursor;
    const goingRight = this.cursor > this.previousCursor;

    // If not dragging, which means navigating by keyboard.
    if (this.mouseDrag === null) {
      if (goingRight && cursorX > textInputWidth - scrollMargin) {
        this.horizontalScroll += scrollMargin;
      }
      if (goingLeft && cursorX < scrollMargin) {
        this.horizontalScroll -= scrollMargin;
      }

      this.horizontalScroll = Math.min(
        Math.max(this.horizontalScroll, 0),
        textWidth - (textInputWidth - scrollMargin),
      );
    }

    // Reduce horizontal scroll if text is shorter than the text input.
    if (textWidth < textInputWidth) {
      this.horizontalScroll = 0;
    }

    text._state.x = this._state.x + this._style.paddingLeft - this.horizontalScroll;

    if (end - start > 0) {
      const selectionStartX = this.textShape.positions[start]?.x ?? 0;
      const width =
        end === this.textShape.positions.length
          ? Math.max(
              (this.textShape.positions[end - 1]?.x ?? 0) +
                (this.textShape.sizes[end - 1]?.x ?? 0) -
                padding,
              0,
            )
          : this.textShape.positions[end]?.x ?? 0;

      selection._state.x =
        this._state.x + this._style.paddingLeft - this.horizontalScroll + selectionStartX;
      selection._state.clientWidth = width - selectionStartX;
    } else {
      selection._state.clientWidth = 0;
    }

    cursor._state.x =
      this._state.x + this._style.paddingLeft - this.horizontalScroll + cursorPosition;

    if (this.value.length > 0) {
      text._style.color = textColor;
      text.text = this.value;
    } else {
      text._style.color = placeholderColor;
      text.text = this.props.placeholder ?? "";
    }
  }
}

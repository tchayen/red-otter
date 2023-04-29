// NOTE: this is NOT needed if you are using red-otter outside of this
// repository. You can safely remove the next line.
/** @jsxImportSource . */

import { Queue } from "./Queue";
import { invariant } from "./invariant";
import { FixedView, Layout, TreeNode } from "./Layout";
import { hash } from "./hash";
import { IContext } from "./IContext";
import { Vec2 } from "./math/Vec2";
import {
  Key,
  MODIFIER_ALT,
  MODIFIER_CMD,
  MODIFIER_CTRL,
  MODIFIER_SHIFT,
  updateSelection,
  updateText,
} from "./textSelectionUtils";

type Rectangle = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type InputState = {
  cursor: number;
  mark: number;
  horizontalScroll: number;
};

const UI_FONT_SIZE = 16;
const UI_PADDING_HORIZONTAL = 12;
const UI_PADDING_VERTICAL = 8;
const UI_BORDER_RADIUS = 6;
const UI_ELEMENT_HEIGHT = 28;

const colors = {
  slate1: "hsl(200 7.0% 8.8%)",
  slate2: "hsl(195 7.1% 11.0%)",
  slate3: "hsl(197 6.8% 13.6%)",
  slate4: "hsl(198 6.6% 15.8%)",
  slate5: "hsl(199 6.4% 17.9%)",
  slate6: "hsl(201 6.2% 20.5%)",
  slate7: "hsl(203 6.0% 24.3%)",
  slate8: "hsl(207 5.6% 31.6%)",
  slate9: "hsl(206 6.0% 43.9%)",
  slate10: "hsl(206 5.2% 49.5%)",
  slate11: "hsl(206 6.0% 63.0%)",
  slate12: "hsl(210 6.0% 93.0%)",
  indigo1: "hsl(229 24.0% 10.0%)",
  indigo2: "hsl(230 36.4% 12.9%)",
  indigo3: "hsl(228 43.3% 17.5%)",
  indigo4: "hsl(227 47.2% 21.0%)",
  indigo5: "hsl(227 50.0% 24.1%)",
  indigo6: "hsl(226 52.9% 28.2%)",
  indigo7: "hsl(226 56.0% 34.5%)",
  indigo8: "hsl(226 58.2% 44.1%)",
  indigo9: "hsl(226 70.0% 55.5%)",
  indigo10: "hsl(227 75.2% 61.6%)",
  indigo11: "hsl(228 100% 75.9%)",
  indigo12: "hsl(226 83.0% 96.3%)",
};

export class Interactions {
  mouseX = -1;
  mouseY = -1;
  isMouseDown = false;
  characterKeys = new Queue<Key>();
  controlKeys = new Queue<Key>();

  mouseDownComponent: number | null = null;

  inputStates = new Map<string, InputState>();

  hover = 0;
  active = 0;
  keyboardFocus = 0;
  openDropdownId: string | null = null;

  private layout: Layout | null = null;
  private previousLayout: Layout | null = null;

  private readonly mouseDrag: Rectangle = { x1: -1, y1: -1, x2: -1, y2: -1 };

  constructor(private readonly context: IContext) {
    const canvas = context.getCanvas();

    this.Button = this.Button.bind(this);
    this.Input = this.Input.bind(this);
    this.Checkbox = this.Checkbox.bind(this);
    this.Select = this.Select.bind(this);
    this.Slider = this.Slider.bind(this);
    this.Tooltip = this.Tooltip.bind(this);
    this.Toggle = this.Toggle.bind(this);
    this.RadioGroup = this.RadioGroup.bind(this);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);

    canvas.addEventListener("mousedown", this.onMouseDown);
    canvas.addEventListener("mouseup", this.onMouseUp);
    canvas.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("keydown", this.onKeyDown);
  }

  onMouseDown(): void {
    this.isMouseDown = true;

    this.mouseDrag.x1 = this.mouseX;
    this.mouseDrag.y1 = this.mouseY;
    this.mouseDrag.x2 = this.mouseX;
    this.mouseDrag.y2 = this.mouseY;

    this.mouseDownComponent = this.hover !== 0 ? this.hover : null;
  }

  onMouseUp(): void {
    this.isMouseDown = false;
  }

  onMouseMove(event: MouseEvent): void {
    this.mouseX = event.offsetX;
    this.mouseY = event.offsetY;
  }

  onKeyDown(event: KeyboardEvent): void {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event#:~:text=Since%20Firefox%2065,by%20an%20IME)%3A
    if (event.isComposing || event.keyCode === 229) {
      return;
    }

    if (["Shift", "Alt", "Control", "Meta"].includes(event.key)) {
      return;
    }

    let modifiers = 0;
    if (event.shiftKey) {
      modifiers |= MODIFIER_SHIFT;
    }

    if (event.ctrlKey) {
      modifiers |= MODIFIER_CTRL;
    }

    if (event.altKey) {
      modifiers |= MODIFIER_ALT;
    }

    if (event.metaKey) {
      modifiers |= MODIFIER_CMD;
    }

    if (
      [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Enter",
        "Backspace",
        "Tab",
        "Escape",
        "Delete",
        "Home",
        "End",
      ].includes(event.key) ||
      event.metaKey
    ) {
      this.controlKeys.enqueue({
        code: event.which,
        modifiers,
      });
    } else {
      this.characterKeys.enqueue({
        code: event.key.charCodeAt(0),
        modifiers,
      });
    }
  }

  findViewById(id: string): TreeNode<FixedView> | null {
    if (!this.previousLayout) {
      return null;
    }

    const hashed = hash(id);
    let result: TreeNode<FixedView> | null = null;

    const queue = new Queue<TreeNode<FixedView>>();
    queue.enqueue(this.previousLayout.root as TreeNode<FixedView>);
    while (!queue.isEmpty()) {
      const node = queue.dequeueFront();
      invariant(node, "Node should not be null.");

      if (node.id === hashed) {
        result = node;
        break;
      }

      let p = node.lastChild;
      while (p) {
        queue.enqueue(p);
        p = p.prev;
      }
    }

    return result;
  }

  handleActiveOrHover(id: string): void {
    const hashed = hash(id);
    let isMouseColliding = false;

    if (!this.previousLayout) {
      return;
    }

    // Traverse the tree in DFS order to respect local order of components
    // (unlike in level order traversal).
    const queue = new Queue<TreeNode<FixedView>>();
    queue.enqueue(this.previousLayout.root as TreeNode<FixedView>);

    const view = this.findViewById(id);

    if (view) {
      const { x, y, width, height } = view.value;

      if (
        this.mouseX >= x &&
        this.mouseX <= x + width &&
        this.mouseY >= y &&
        this.mouseY <= y + height
      ) {
        isMouseColliding = true;
      }
    }

    if (isMouseColliding) {
      this.hover = hashed;

      if (this.active === 0 && this.isMouseDown) {
        this.active = hashed;
        this.keyboardFocus = hashed;
      }
    }
  }

  Button(props: {
    id: string;
    label: string;
    onClick(): void;
  }): TreeNode<FixedView> {
    const { id, label, onClick } = props;
    invariant(this.layout, "Layout is missing. Did you call startFrame()?");

    const font = this.context.getFont();

    const hashed = hash(id);
    this.handleActiveOrHover(id);

    const isActive = this.active === hashed;
    const isHovered = this.hover === hashed;

    const node = (
      <view
        id={id}
        style={{
          paddingHorizontal: UI_PADDING_HORIZONTAL,
          paddingVertical: UI_PADDING_VERTICAL,
          borderRadius: UI_BORDER_RADIUS,
          backgroundColor: isActive
            ? colors.indigo10
            : isHovered
            ? colors.indigo9
            : colors.indigo8,
        }}
      >
        <text
          style={{
            fontSize: UI_FONT_SIZE,
            color: colors.slate12,
            fontFamily: font,
          }}
        >
          {label}
        </text>
      </view>
    );

    if (
      !this.isMouseDown &&
      this.hover === hashed &&
      this.active === hashed &&
      this.mouseDownComponent === hashed
    ) {
      onClick();
    }

    return node;
  }

  Checkbox(props: {
    id: string;
    label: string;
    checked: boolean;
    onChange(checked: boolean): void;
  }): TreeNode<FixedView> {
    const { id, label, checked, onChange } = props;
    invariant(this.layout, "Layout is missing. Did you call startFrame()?");

    const hashed = hash(id);
    this.handleActiveOrHover(id);

    const isActive = this.active === hashed;
    const isHovered = this.hover === hashed;

    const font = this.context.getFont();

    function getBackground(): string {
      if (isActive) {
        return checked ? colors.indigo10 : colors.slate9;
      }

      if (isHovered) {
        return checked ? colors.indigo9 : colors.slate8;
      }

      return checked ? colors.indigo8 : colors.slate7;
    }

    const node = (
      <view
        style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
        id={id}
      >
        <view
          style={{
            width: 20,
            height: 20,
            borderRadius: UI_BORDER_RADIUS,
            backgroundColor: getBackground(),
            justifyContent: "center",
            alignItems: "center",
            marginRight: 8,
          }}
        >
          {checked && (
            <shape
              type="polygon"
              color={colors.slate12}
              points={[
                [3.5, 7],
                [6.5, 10],
                [12.5, 4],
                [14, 5.5],
                [6.5, 13],
                [2, 8.5],
              ]}
            />
          )}
        </view>
        <text
          style={{
            fontSize: UI_FONT_SIZE,
            color: colors.slate12,
            fontFamily: font,
          }}
        >
          {label}
        </text>
      </view>
    );

    if (
      !this.isMouseDown &&
      this.hover === hashed &&
      this.active === hashed &&
      this.mouseDownComponent === hashed
    ) {
      onChange(!checked);
    }

    return node;
  }

  Toggle(props: {
    id: string;
    label: string;
    checked: boolean;
    onChange(checked: boolean): void;
  }): TreeNode<FixedView> {
    const { id, label, checked, onChange } = props;
    invariant(this.layout, "Layout is missing. Did you call startFrame()?");

    const hashed = hash(id);
    this.handleActiveOrHover(id);

    const font = this.context.getFont();

    const isActive = this.active === hashed;
    const isHovered = this.hover === hashed;

    const HEIGHT = 12 + 2 * 8;

    function getBackground(): string {
      if (isActive) {
        return checked ? colors.indigo10 : colors.slate9;
      }

      if (isHovered) {
        return checked ? colors.indigo9 : colors.slate8;
      }

      return checked ? colors.indigo8 : colors.slate7;
    }

    const node = (
      <view
        style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
        id={id}
      >
        <view
          style={{
            width: 48,
            height: HEIGHT,
            borderRadius: HEIGHT / 2,
            backgroundColor: getBackground(),
            marginRight: 8,
          }}
        >
          <view
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              top: 4,
              left: checked ? 24 : 4,
              backgroundColor: colors.slate12,
            }}
          />
        </view>
        <text
          style={{
            fontSize: UI_FONT_SIZE,
            color: colors.slate12,
            fontFamily: font,
          }}
        >
          {label}
        </text>
      </view>
    );

    if (
      !this.isMouseDown &&
      this.hover === hashed &&
      this.active === hashed &&
      this.mouseDownComponent === hashed
    ) {
      onChange(!checked);
    }

    return node;
  }

  Input(props: {
    id: string;
    value: string;
    onChange(value: string): void;
  }): void {
    invariant(this.layout, "Layout is missing. Did you call startFrame()?");

    const { id, value, onChange } = props;

    let state = this.inputStates.get(id);
    if (!state) {
      state = {
        cursor: -1,
        mark: -1,
        horizontalScroll: 0,
      };
      this.inputStates.set(id, state);
    }

    const font = this.context.getFont();

    const PADDING_HORIZONTAL = 12;
    const PADDING_VERTICAL = 8;
    const INPUT_WIDTH = 240;

    const hashed = hash(id);
    this.handleActiveOrHover(id);

    let highlight = null;
    let cursor = null;

    let currentValue = value;

    // Update selection.
    if (this.keyboardFocus === hashed && this.mouseDownComponent === hashed) {
      let key = this.controlKeys.dequeue();
      while (key) {
        const update = updateSelection(
          currentValue,
          state.cursor,
          state.mark,
          key
        );
        state.cursor = update.cursor;
        state.mark = update.mark;
        onChange(update.value);
        currentValue = update.value;

        key = this.controlKeys.dequeue();
      }

      let character = this.characterKeys.dequeue();
      while (character) {
        const update = updateText(
          currentValue,
          state.cursor,
          state.mark,
          character
        );
        state.cursor = update.cursor;
        state.mark = update.mark;
        onChange(update.value);
        currentValue = update.value;

        character = this.characterKeys.dequeue();
      }
    }

    const textShape = font.getTextShape(currentValue, UI_FONT_SIZE);

    const previous = this.findViewById(id);
    if (
      previous &&
      this.keyboardFocus === hashed &&
      this.mouseDownComponent === hashed
    ) {
      if (this.isMouseDown) {
        if (this.mouseDrag.x1 < 0) {
          this.mouseDrag.x1 = this.mouseX;
          this.mouseDrag.y1 = this.mouseY;
        } else {
          this.mouseDrag.x2 = this.mouseX;
          this.mouseDrag.y2 = this.mouseY;
        }
      } else {
        this.mouseDrag.x1 = -1;
        this.mouseDrag.y1 = -1;
        this.mouseDrag.x2 = -1;
        this.mouseDrag.y2 = -1;
      }

      if (this.isMouseDown) {
        const goingLeft = this.mouseDrag.x1 > this.mouseDrag.x2;
        const rectangleX =
          Math.min(this.mouseDrag.x1, this.mouseDrag.x2) - previous.value.x;
        const rectangleWidth = Math.abs(this.mouseDrag.x1 - this.mouseDrag.x2);

        for (let i = 0; i < textShape.positions.length + 1; i++) {
          const positionX =
            -state.horizontalScroll +
            PADDING_HORIZONTAL +
            (i === textShape.positions.length
              ? textShape.positions[i - 1]?.x + textShape.sizes[i - 1]?.x
              : textShape.positions[i].x);
          const size =
            i === textShape.positions.length
              ? new Vec2(0, 0)
              : textShape.sizes[i];

          if (rectangleX > positionX - size.x / 2) {
            if (goingLeft) {
              state.cursor = i;
            } else {
              state.mark = i;
            }
          }

          if (rectangleX + rectangleWidth >= positionX - size.x / 2) {
            if (goingLeft) {
              state.mark = i;
            } else {
              state.cursor = i;
            }
          }
        }
      }

      const start = Math.min(state.cursor, state.mark);
      const end = Math.max(state.cursor, state.mark);

      const maxIndex = textShape.positions.length - 1;

      // The x position of the start of the selection.
      const selectionStartX =
        (textShape.positions[Math.min(start, maxIndex)]?.x ?? 0) +
        (start === textShape.positions.length
          ? textShape.sizes[maxIndex]?.x ?? 0
          : 0);

      const mostRightX =
        (textShape.positions[Math.min(end, maxIndex)]?.x ?? 0) +
        (end === textShape.positions.length
          ? textShape.sizes[maxIndex]?.x ?? 0
          : 0);

      // Handle scrolling.
      if (state.cursor !== -1) {
        const cursorPosition =
          (textShape.positions[Math.min(state.cursor, maxIndex)]?.x ?? 0) +
          (state.cursor === textShape.positions.length
            ? textShape.sizes[maxIndex]?.x ?? 0
            : 0);
        const cursorRight =
          cursorPosition - state.horizontalScroll + PADDING_HORIZONTAL;

        const horizontalSpan = INPUT_WIDTH - 2 * PADDING_HORIZONTAL;

        state.horizontalScroll = Math.min(
          Math.max(
            cursorPosition - horizontalSpan,
            cursorRight - PADDING_HORIZONTAL
          ),
          state.horizontalScroll
        );

        state.horizontalScroll = Math.max(0, cursorPosition - horizontalSpan);
      }

      const highlightLeft =
        -state.horizontalScroll + PADDING_HORIZONTAL + selectionStartX;

      highlight = (
        <view
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            borderRadius: UI_BORDER_RADIUS,
            left: Math.max(0, highlightLeft),
            width: Math.min(
              Math.min(
                highlightLeft + mostRightX - selectionStartX,
                INPUT_WIDTH
              ) - highlightLeft,
              INPUT_WIDTH - PADDING_HORIZONTAL
            ),
            backgroundColor: "rgba(37, 99, 235, 0.4)",
          }}
        />
      );
      cursor = (
        <view
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: 2,
            left:
              -state.horizontalScroll +
              PADDING_HORIZONTAL +
              (state.cursor > state.mark ? mostRightX : selectionStartX) -
              1,
            backgroundColor: colors.indigo8,
          }}
        />
      );
    }

    const node = (
      <view
        id={id}
        style={{
          width: INPUT_WIDTH,
          paddingHorizontal: PADDING_HORIZONTAL,
          paddingVertical: PADDING_VERTICAL,
          height: UI_ELEMENT_HEIGHT,
          backgroundColor: colors.slate1,
          flexDirection: "row",
          borderRadius: UI_BORDER_RADIUS,
        }}
      >
        {highlight}
        {cursor}
        {previous && (
          <view
            style={{
              left: -state.horizontalScroll,
            }}
          >
            <text
              style={{
                fontSize: UI_FONT_SIZE,
                color: colors.slate12,
                fontFamily: font,
                trimRectangle: [
                  previous.value.x,
                  previous.value.y,
                  previous.value.x + INPUT_WIDTH,
                  previous.value.y + 28,
                ],
              }}
            >
              {currentValue}
            </text>
          </view>
        )}
      </view>
    );

    this.inputStates.set(id, state);

    return node;
  }

  Select(props: {
    id: string;
    options: { value: string; label: string }[];
    value: string | null;
    onChange(value: string): void;
  }): TreeNode<FixedView> {
    const { id, options, value, onChange } = props;
    invariant(this.layout, "Layout is missing. Did you call startFrame()?");

    const hashed = hash(id);
    this.handleActiveOrHover(id);

    const selectedOption = options.find((option) => option.value === value);

    const font = this.context.getFont();

    const isActive = this.active === hashed;
    const isHovered = this.hover === hashed;

    const node = (
      <view>
        <view
          id={id}
          style={{
            borderRadius: UI_BORDER_RADIUS,
            paddingHorizontal: UI_PADDING_HORIZONTAL,
            paddingVertical: UI_PADDING_VERTICAL,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: isActive
              ? colors.slate9
              : isHovered
              ? colors.slate8
              : colors.slate7,
          }}
        >
          <text
            style={{
              fontSize: UI_FONT_SIZE,
              color: colors.slate12,
              fontFamily: font,
            }}
          >
            {selectedOption ? selectedOption.label : "Select..."}
          </text>
          {/* Triangle */}
          <shape
            points={[
              [10, 0],
              [0, 0],
              [5, 8],
            ]}
            color={
              isActive
                ? colors.slate11
                : isHovered
                ? colors.slate10
                : colors.slate9
            }
            type="polygon"
          />
        </view>
        {this.openDropdownId === id && (
          <view
            style={{
              marginTop: UI_ELEMENT_HEIGHT + 12,
              alignItems: "stretch",
              position: "absolute",
              zIndex: 1,
              padding: 4,
              gap: 4,
              backgroundColor: colors.slate7,
              borderRadius: UI_BORDER_RADIUS,
            }}
          >
            {options.map((option) => {
              const optionId = `${id}-${option.value}`;
              const optionHashed = hash(optionId);
              this.handleActiveOrHover(`${id}-${option.value}`);

              const isActive = this.active === optionHashed;
              const isHovered = this.hover === optionHashed;
              const isSelected = option.value === value;

              return (
                <view
                  id={optionId}
                  style={{
                    borderRadius: UI_BORDER_RADIUS - 2,
                    paddingHorizontal: UI_PADDING_HORIZONTAL,
                    paddingVertical: UI_PADDING_VERTICAL,
                    backgroundColor: isActive
                      ? colors.slate9
                      : isHovered && option.value !== value
                      ? colors.slate8
                      : isSelected
                      ? colors.indigo8
                      : colors.slate7,
                  }}
                >
                  <text
                    style={{
                      fontSize: UI_FONT_SIZE,
                      color: colors.slate12,
                      fontFamily: this.context.getFont(),
                    }}
                  >
                    {option.label}
                  </text>
                </view>
              );
            })}
          </view>
        )}
      </view>
    );

    // Handling clicks for selecting an option.
    options.forEach((option) => {
      const optionHashed = hash(`${id}-${option.value}`);
      if (this.hover === optionHashed && this.active === optionHashed) {
        onChange(option.value);
        this.openDropdownId = null;
      }
    });

    if (this.isMouseDown) {
      if (this.active === hashed) {
        if (this.openDropdownId !== id) {
          if (this.mouseDownComponent === hashed) {
            this.openDropdownId = id;
          }
        }
      }
    }

    return node;
  }

  Slider(props: {
    id: string;
    value: number;
    min: number;
    max: number;
    onChange(value: number): void;
  }): TreeNode<FixedView> {
    const { id, value, min, max, onChange } = props;
    invariant(this.layout, "Layout is missing. Did you call startFrame()?");

    const font = this.context.getFont();

    const hashed = hash(id);
    this.handleActiveOrHover(id);

    const sliderWidth = 200;
    const sliderHeight = UI_ELEMENT_HEIGHT;
    const handleWidth = 8;
    const adjustedSliderWidth = sliderWidth - handleWidth - 2 * 2;
    const sliderPosition = ((value - min) / (max - min)) * adjustedSliderWidth;

    const node = (
      <view
        id={id}
        style={{
          backgroundColor: colors.slate1,
          borderRadius: UI_BORDER_RADIUS,
        }}
      >
        <view
          style={{
            width: sliderWidth,
            height: sliderHeight,
          }}
        >
          <view
            style={{
              position: "absolute",
              left: sliderPosition + 2,
              width: handleWidth,
              top: 2,
              bottom: 2,
              borderRadius: handleWidth / 2,
              backgroundColor: colors.indigo8,
            }}
          />
        </view>
        <view
          style={{
            position: "absolute",
            justifyContent: "center",
            top: 0,
            bottom: 0,
            left: UI_PADDING_HORIZONTAL,
          }}
        >
          <text
            style={{
              fontSize: UI_FONT_SIZE,
              color: colors.slate12,
              fontFamily: font,
            }}
          >
            {value.toFixed(2)}
          </text>
        </view>
      </view>
    );

    node.id = hashed;

    const previous = this.findViewById(id);
    if (previous) {
      // Check if the user has clicked within the slider box.
      const isWithinSliderBox =
        this.mouseX >= previous.value.x &&
        this.mouseX <= previous.value.x + sliderWidth &&
        this.mouseY >= previous.value.y &&
        this.mouseY <= previous.value.y + sliderHeight;

      // If the user clicked within the slider box, set the mouseDownComponent
      // to the slider's ID and start dragging.
      if (this.isMouseDown && !this.mouseDownComponent && isWithinSliderBox) {
        this.mouseDownComponent = hash(id);
      }

      // Update handle dragging logic.
      if (this.mouseDownComponent === hashed) {
        const mouseRatio = Math.max(
          0,
          Math.min(
            1,
            (this.mouseX - previous.value.x - handleWidth / 2) /
              adjustedSliderWidth
          )
        );
        const newValue = min + mouseRatio * (max - min);

        if (value !== newValue) {
          onChange(newValue);
        }
      }
    }

    if (!this.isMouseDown && this.mouseDownComponent === hashed) {
      this.mouseDownComponent = null;
    }

    return node;
  }

  Tooltip(props: {
    id: string;
    trigger: TreeNode<FixedView>;
    content: TreeNode<FixedView>;
  }): TreeNode<FixedView> {
    const { id, trigger, content } = props;
    invariant(this.layout, "Layout is missing. Did you call startFrame()?");

    const hashed = hash(id);
    this.handleActiveOrHover(id);

    const node = (
      <view id={id}>
        {trigger}
        {this.hover === hashed && (
          <view
            style={{
              top: -36,
              position: "absolute",
              backgroundColor: "#000",
              paddingHorizontal: UI_PADDING_HORIZONTAL,
              paddingVertical: UI_PADDING_VERTICAL,
              borderRadius: UI_BORDER_RADIUS,
            }}
          >
            {content}
          </view>
        )}
      </view>
    );
    return node;
  }

  RadioGroup(props: {
    id: string;
    value: string | null;
    options: { label: string; value: string }[];
    onChange(value: string): void;
  }): TreeNode<FixedView> {
    const { id, value, options, onChange } = props;

    const font = this.context.getFont();

    return (
      <view style={{ flexDirection: "column", gap: 12 }}>
        {options.map((option) => {
          const optionId = `radio-${id}-${option.value}`;
          this.handleActiveOrHover(optionId);

          const isChecked = value === option.value;
          const isActive = this.active === hash(optionId);
          const isHovered = this.hover === hash(optionId);

          if (this.isMouseDown && this.active === hash(optionId)) {
            onChange(option.value);
          }

          function getBackground(): string {
            if (isActive) {
              return isChecked ? colors.indigo10 : colors.slate9;
            }

            if (isHovered) {
              return isChecked ? colors.indigo9 : colors.slate8;
            }

            return isChecked ? colors.indigo8 : colors.slate7;
          }

          return (
            <view
              id={optionId}
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <view
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: getBackground(),
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isChecked && (
                  <view
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: colors.slate4,
                    }}
                  />
                )}
              </view>
              <text
                style={{
                  fontSize: UI_FONT_SIZE,
                  color: colors.slate12,
                  fontFamily: font,
                }}
              >
                {option.label}
              </text>
            </view>
          );
        })}
      </view>
    );
  }

  startFrame(layout: Layout): void {
    this.hover = 0;
    this.previousLayout = this.layout;
    this.layout = layout;
  }

  endFrame(): void {
    if (!this.isMouseDown) {
      this.active = 0;
    }

    if (this.isMouseDown && this.hover === 0) {
      this.active = 0;
    }

    const unclaimedKeys = [];
    while (!this.characterKeys.isEmpty()) {
      const key = this.characterKeys.dequeue();
      invariant(key, "Key cannot be null because it was just dequeued.");
      unclaimedKeys.push(String.fromCharCode(key.code));
    }

    if (this.isMouseDown && this.active === 0) {
      this.openDropdownId = null;
    }

    this.characterKeys.clear();
  }
}

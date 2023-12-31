import type { KeyboardEvent } from "../layout/eventTypes";

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
    case 37: {
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
    case 39: {
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
    case 8: {
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
    case 46: {
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
    case 65: {
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

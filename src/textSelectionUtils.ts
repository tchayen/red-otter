export const MODIFIER_SHIFT = 0x0001;
export const MODIFIER_CTRL = 0x0002;
export const MODIFIER_ALT = 0x0004;
export const MODIFIER_CMD = 0x0008;

export type Key = {
  code: number;
  modifiers: number;
};

export function updateSelection(
  value: string,
  cursor: number,
  mark: number,
  key: Key
): { value: string; cursor: number; mark: number } {
  const valueAsNumbers = value
    .split("")
    .map((character) => character.charCodeAt(0));

  const isCtrlPressed = (key.modifiers & MODIFIER_CTRL) !== 0;
  const isShiftPressed = (key.modifiers & MODIFIER_SHIFT) !== 0;
  const isCmdPressed = (key.modifiers & MODIFIER_CMD) !== 0;

  const selectionLength = Math.abs(cursor - mark);

  switch (key.code) {
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
    value: valueAsNumbers.map((code) => String.fromCharCode(code)).join(""),
    cursor,
    mark,
  };
}

export function updateText(
  value: string,
  cursor: number,
  mark: number,
  key: Key
): { value: string; cursor: number; mark: number } {
  const valueAsNumbers = value
    .split("")
    .map((character) => character.charCodeAt(0));
  const selectionLength = Math.abs(cursor - mark);

  // If selection length is greater than 0, delete the selection first.
  if (selectionLength > 0) {
    valueAsNumbers.splice(Math.min(cursor, mark), selectionLength);
    cursor = Math.min(cursor, mark);
    mark = cursor;
  }

  valueAsNumbers.splice(cursor, 0, key.code);
  cursor += 1;
  mark = cursor;

  return {
    value: valueAsNumbers.map((code) => String.fromCharCode(code)).join(""),
    cursor,
    mark,
  };
}

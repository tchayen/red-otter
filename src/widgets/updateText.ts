import type { KeyboardEvent } from "../layout/eventTypes";

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

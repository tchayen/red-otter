// Copied over from lib package.
export function invariant(value: unknown, message?: string): asserts value {
  if (!value) {
    throw new Error(message);
  }
}

export function toURLSafe(value: string): string {
  return value.replaceAll(" ", "-").toLowerCase();
}

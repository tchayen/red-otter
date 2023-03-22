export function toURLSafe(value: string): string {
  return value.replaceAll(" ", "-").toLowerCase();
}

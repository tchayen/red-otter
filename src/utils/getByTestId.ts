import { View } from "../layout/View";
import type { Text } from "../layout/Text";

export function getByTestId(root: View, testId: string): View | Text | null {
  let c = root.firstChild;
  while (c) {
    if (c.props.testID === testId) {
      return c;
    }
    if (c instanceof View) {
      const inSubTree = getByTestId(c, testId);
      if (inSubTree) {
        return inSubTree;
      }
    }
    c = c.next;
  }
  return null;
}

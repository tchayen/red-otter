import { BaseView } from "../layout/BaseView";
import type { Node } from "../layout/Node";

export function getByTestId(root: Node, testId: string): Node | null {
  let c = root.firstChild;
  while (c) {
    if (c.testID === testId) {
      return c;
    }
    if (c instanceof BaseView) {
      const inSubTree = getByTestId(c, testId);
      if (inSubTree) {
        return inSubTree;
      }
    }
    c = c.next;
  }
  return null;
}

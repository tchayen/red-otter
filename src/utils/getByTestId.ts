import { BaseView } from "../layout/BaseView";
import type { Text } from "../layout/Text";

export function getByTestId(root: BaseView, testId: string): BaseView | Text | null {
  let c = root.firstChild;
  while (c) {
    if (c.props.testID === testId) {
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

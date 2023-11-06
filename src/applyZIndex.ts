import { Text } from "./Text";
import { View } from "./View";
import { Queue } from "./utils/Queue";

export function applyZIndex(root: View): (View | Text)[] {
  const rectangles: (View | Text)[] = [];

  // Traverse the tree in DFS order to respect local order of components
  // (unlike in level order traversal).
  const queue = new Queue<View | Text>();
  queue.enqueue(root);

  while (!queue.isEmpty()) {
    const node = queue.dequeueFront();
    if (node === null) {
      throw new Error("Node should not be null.");
    }

    rectangles.push(node);

    let p = node.lastChild;
    while (p) {
      if (p._style.display === "none") {
        p = p.prev;
        continue;
      }

      queue.enqueue(p);
      p = p.prev;
    }
  }

  rectangles.sort((a, b) => (a._style.zIndex ?? 0) - (b._style.zIndex ?? 0));

  return rectangles;
}

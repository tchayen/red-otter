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
      if (p.style.display === "none") {
        p = p.prev;
        continue;
      }

      queue.enqueue(p);
      p = p.prev;
    }
  }

  rectangles.sort((a, b) => a.style.zIndex - b.style.zIndex);

  return rectangles;
}

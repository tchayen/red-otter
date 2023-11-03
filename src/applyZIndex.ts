import { FixedRectangle } from "./ui/types";
import { Queue } from "./utils/Queue";
import { Tree } from "./utils/Tree";

export function applyZIndex(
  root: Tree<FixedRectangle>
): Tree<FixedRectangle>[] {
  const rectangles: Tree<FixedRectangle>[] = [];

  // Traverse the tree in DFS order to respect local order of components
  // (unlike in level order traversal).
  const queue = new Queue<Tree<FixedRectangle>>();
  queue.enqueue(root);

  while (!queue.isEmpty()) {
    const node = queue.dequeueFront();
    if (node === null) {
      throw new Error("Node should not be null.");
    }

    rectangles.push(node);

    let p = node.lastChild;
    while (p) {
      if (p.value.input.display === "none") {
        p = p.prev;
        continue;
      }

      queue.enqueue(p);
      p = p.prev;
    }
  }

  rectangles.sort((a, b) => a.value.zIndex - b.value.zIndex);

  return rectangles;
}

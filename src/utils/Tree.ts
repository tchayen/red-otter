export class Tree<T> {
  next: Tree<T> | null = null;
  prev: Tree<T> | null = null;
  firstChild: Tree<T> | null = null;
  lastChild: Tree<T> | null = null;
  parent: Tree<T> | null = null;

  constructor(public value: T) {}

  add(node: Tree<T>): Tree<T> {
    node.parent = this;

    if (this.firstChild === null) {
      this.firstChild = node;
      this.lastChild = node;
    } else {
      if (this.lastChild === null) {
        throw new Error("Last child must be set.");
      }

      node.prev = this.lastChild;
      this.lastChild.next = node;
      this.lastChild = node;
    }

    return node;
  }
}

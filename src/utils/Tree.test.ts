import { describe, it, expect } from "vitest";
import { Tree } from "./Tree";

describe("Tree<T>", () => {
  describe("constructor", () => {
    it("should create a new Tree node with the given value", () => {
      const tree = new Tree<number>(5);

      expect(tree.value).toBe(5);
      expect(tree.next).toBeNull();
      expect(tree.prev).toBeNull();
      expect(tree.firstChild).toBeNull();
      expect(tree.lastChild).toBeNull();
      expect(tree.parent).toBeNull();
    });
  });

  describe("addChild", () => {
    it("should add a child to the tree when it has no children", () => {
      const tree = new Tree<number>(5);

      const child = new Tree<number>(10);
      tree.add(child);

      expect(tree.firstChild).toBe(child);
      expect(tree.lastChild).toBe(child);
      expect(child.parent).toBe(tree);
      expect(child.prev).toBeNull();
      expect(child.next).toBeNull();
    });

    it("should add a second child correctly to the tree", () => {
      const tree = new Tree<number>(5);

      const firstChild = new Tree<number>(10);
      tree.add(firstChild);

      const secondChild = new Tree<number>(20);
      tree.add(secondChild);

      expect(tree.firstChild).toBe(firstChild);
      expect(tree.lastChild).toBe(secondChild);
      expect(secondChild.prev).toBe(firstChild);
      expect(firstChild.next).toBe(secondChild);
      expect(secondChild.parent).toBe(tree);
    });

    it("should handle adding multiple children", () => {
      const tree = new Tree<number>(5);

      const child1 = new Tree<number>(10);
      const child2 = new Tree<number>(20);
      const child3 = new Tree<number>(30);

      tree.add(child1);
      tree.add(child2);
      tree.add(child3);

      expect(tree.firstChild).toBe(child1);
      expect(tree.lastChild).toBe(child3);

      expect(child1.prev).toBeNull();
      expect(child1.next).toBe(child2);
      expect(child1.parent).toBe(tree);

      expect(child2.prev).toBe(child1);
      expect(child2.next).toBe(child3);
      expect(child2.parent).toBe(tree);

      expect(child3.prev).toBe(child2);
      expect(child3.next).toBeNull();
      expect(child3.parent).toBe(tree);
    });
  });
});

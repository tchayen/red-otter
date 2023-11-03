import { describe, it, expect } from "vitest";
import { Queue } from "./Queue";

describe("Queue<T>", () => {
  describe("enqueue", () => {
    it("should add an item to the queue", () => {
      const queue = new Queue<number>();
      queue.enqueue(1);
      expect(queue.isEmpty()).toBe(false);
    });
  });

  describe("dequeue", () => {
    it("should remove and return the first item in the queue", () => {
      const queue = new Queue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.dequeue()).toBe(1);
      expect(queue.dequeue()).toBe(2);
    });

    it("should return null if the queue is empty", () => {
      const queue = new Queue<number>();
      expect(queue.dequeue()).toBe(null);
    });
  });

  describe("dequeueFront", () => {
    it("should remove and return the last item in the queue", () => {
      const queue = new Queue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.dequeueFront()).toBe(2);
      expect(queue.dequeueFront()).toBe(1);
    });

    it("should return null if the queue is empty", () => {
      const queue = new Queue<number>();
      expect(queue.dequeueFront()).toBe(null);
    });
  });

  describe("isEmpty", () => {
    it("should return true if the queue is empty", () => {
      const queue = new Queue<number>();
      expect(queue.isEmpty()).toBe(true);
    });

    it("should return false if the queue is not empty", () => {
      const queue = new Queue<number>();
      queue.enqueue(1);
      expect(queue.isEmpty()).toBe(false);
    });
  });
});

interface QueueNode<T> {
  data: T;
  prev: QueueNode<T> | null;
  next: QueueNode<T> | null;
}

export class Queue<T> {
  private start: QueueNode<T> | null = null;
  private end: QueueNode<T> | null = null;
  private size = 0;

  enqueue(value: T): void {
    const node: QueueNode<T> = {
      data: value,
      next: null,
      prev: null,
    };

    if (this.end) {
      this.end.next = node;
      node.prev = this.end;
    } else {
      this.start = node;
    }

    this.end = node;
    this.size += 1;
  }

  dequeue(): T | null {
    const node = this.start;
    if (node === null) {
      return null;
    }

    if (node.next) {
      this.start = node.next;
    } else {
      this.start = null;
      this.end = null;
    }

    this.size -= 1;
    return node.data;
  }

  dequeueFront(): T | null {
    const node = this.end;
    if (node === null) {
      return null;
    }

    if (node.prev) {
      this.end = node.prev;
    } else {
      this.start = null;
      this.end = null;
    }

    this.size -= 1;
    return node.data;
  }

  isEmpty(): boolean {
    return this.size === 0;
  }
}

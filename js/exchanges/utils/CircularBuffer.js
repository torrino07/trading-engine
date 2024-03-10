class CircularBuffer {
  constructor(capacity) {
    this.capacity = capacity;
    this.buffer = [];
    this.head = 0;
    this.tail = 0;
    this.isFull = false;
  }

  append(item) {
    if (this.isFull) {
      this.head = (this.head + 1) % this.capacity;
    }
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
    this.isFull = this.head === this.tail;
  }

  getBuffer() {
    if (!this.isFull) {
      return this.buffer.slice(this.head, this.tail);
    }
    return [
      ...this.buffer.slice(this.head, this.capacity),
      ...this.buffer.slice(0, this.tail),
    ];
  }
}

module.exports = CircularBuffer;

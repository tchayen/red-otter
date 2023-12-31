export type Uint8 = number;
export type Uint16 = number;
export type Uint32 = number;
export type Int16 = number;
export type Int32 = number;
export type FWord = Int16;
export type Fixed = number;

/**
 * A module for reading binary data. Used internally by `parseTTF()`. Keeps track of the current
 * position, assuming sequential reads.
 */
export class BinaryReader {
  private readonly view: DataView;
  private position = 0;

  constructor(
    data: ArrayBuffer,
    private readonly options?: { littleEndian?: boolean },
  ) {
    this.view = new DataView(data);
  }

  /**
   * Read two bytes as an unsigned integer and advance the position by two bytes.
   */
  getUint16(): Uint16 {
    const value = this.view.getUint16(this.position, this.options?.littleEndian);
    this.position += 2;
    return value;
  }

  /**
   * Read two bytes as a signed integer and advance the position by two bytes.
   */
  getInt16(): Int16 {
    const value = this.view.getInt16(this.position, this.options?.littleEndian);
    this.position += 2;
    return value;
  }

  /**
   * Read four bytes as an unsigned integer and advance the position by four bytes.
   */
  getUint32(): Uint32 {
    const value = this.view.getUint32(this.position, this.options?.littleEndian);
    this.position += 4;
    return value;
  }

  /**
   * Read four bytes as a signed integer and advance the position by four bytes.
   */
  getInt32(): Int32 {
    const value = this.view.getInt32(this.position, this.options?.littleEndian);
    this.position += 4;
    return value;
  }

  /**
   * Read four bytes as a fixed-point number (2 bytes integer and 2 byte fraction) and advance the
   * position by four bytes.
   */
  getFixed(): Fixed {
    const integer = this.getUint16();
    const fraction = this.getUint16();
    return integer + fraction / 0x1_00_00;
  }

  /**
   * Read eight bytes as a date (seconds since 1904-01-01 00:00:00) without advancing the position.
   */
  getDate(): Date {
    const macTime = this.getUint32() * 0x1_00_00_00_00 + this.getUint32();
    const utcTime = macTime * 1000 + Date.UTC(1904, 1, 1);
    return new Date(utcTime);
  }

  /**
   * Alias for `getUint16`.
   */
  getFWord(): FWord {
    return this.getInt16();
  }

  /**
   * Read a string of the given length and advance the position by that length.
   */
  getString(length: number): string {
    const bytes = new Uint8Array(this.view.buffer, this.position, length);
    const string = new TextDecoder().decode(bytes);
    this.position += length;

    return string;
  }

  /**
   * Look up array slice of the given length at the current position without advancing it.
   */
  getDataSlice(offset: number, length: number): Uint8Array {
    return new Uint8Array(this.view.buffer, offset, length);
  }

  /**
   * Get the current position.
   */
  getPosition(): number {
    return this.position;
  }

  /**
   * Set the current position.
   */
  setPosition(position: number): void {
    this.position = position;
  }

  /**
   * Run the given action at the given position, restoring the original position afterwards.
   */
  runAt<T>(position: number, action: () => T): T {
    const current = this.position;
    this.setPosition(position);
    const result = action();
    this.setPosition(current);
    return result;
  }
}

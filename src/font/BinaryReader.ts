export type Uint8 = number;
export type Uint16 = number;
export type Uint32 = number;
export type Int16 = number;
export type Int32 = number;
export type FWord = Int16;
export type Fixed = number;

export class BinaryReader {
  private readonly view: DataView;
  private position = 0;

  constructor(
    data: ArrayBuffer,
    private readonly options?: { littleEndian?: boolean }
  ) {
    this.view = new DataView(data);
  }

  getUint16(): Uint16 {
    const value = this.view.getUint16(
      this.position,
      this.options?.littleEndian
    );
    this.position += 2;
    return value;
  }

  getInt16(): Int16 {
    const value = this.view.getInt16(this.position, this.options?.littleEndian);
    this.position += 2;
    return value;
  }

  getUint32(): Uint32 {
    const value = this.view.getUint32(
      this.position,
      this.options?.littleEndian
    );
    this.position += 4;
    return value;
  }

  getInt32(): Int32 {
    const value = this.view.getInt32(this.position, this.options?.littleEndian);
    this.position += 4;
    return value;
  }

  getFixed(): Fixed {
    const integer = this.getUint16();
    const fraction = this.getUint16();
    return integer + fraction / 0x1_00_00;
  }

  getDate(): Date {
    const macTime = this.getUint32() * 0x1_00_00_00_00 + this.getUint32();
    const utcTime = macTime * 1000 + Date.UTC(1904, 1, 1);
    return new Date(utcTime);
  }

  getFWord(): FWord {
    return this.getInt16();
  }

  getString(length: number): string {
    const bytes = new Uint8Array(this.view.buffer, this.position, length);
    const string = new TextDecoder().decode(bytes);
    this.position += length;

    return string;
  }

  getDataSlice(offset: number, length: number): Uint8Array {
    return new Uint8Array(this.view.buffer, offset, length);
  }

  getPosition(): number {
    return this.position;
  }

  setPosition(position: number): void {
    this.position = position;
  }

  runAt<T>(position: number, action: () => T): T {
    const current = this.position;
    this.setPosition(position);
    const result = action();
    this.setPosition(current);
    return result;
  }
}

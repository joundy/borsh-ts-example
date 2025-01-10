import { field } from "@dao-xyz/borsh";
import { BUFFER_MAX_VARUINT_LENGTH, U128_MAX_NUMBER } from "./types";

export class VaruintField {
  @field({
    serialize: (value: bigint, writer) => {
      const varuint = Varuint.fromNumber(value);
      const bytes = new Uint8Array(varuint.buffer);
      writer.set(bytes);
    },
    deserialize: (reader): bigint => {
      const start = reader._offset;
      const buffer = Buffer.alloc(BUFFER_MAX_VARUINT_LENGTH);

      while (true) {
        if (reader._offset >= reader._buf.length) {
          throw new Error("Unexpected end of buffer");
        }

        const byte = reader._buf[reader._offset];
        buffer[reader._offset - start] = byte;

        reader._offset++;

        if ((byte & 128) === 0) {
          break;
        }
      }

      const number = new Varuint(
        buffer.subarray(0, reader._offset - start),
      ).toNumber();

      return number;
    },
  })
  value: bigint;

  constructor(value: bigint) {
    this.value = value;
  }
}

export class Varuint {
  buffer: Buffer;

  constructor(buffer: Buffer) {
    if (
      buffer.length > BUFFER_MAX_VARUINT_LENGTH ||
      (buffer.length === BUFFER_MAX_VARUINT_LENGTH &&
        buffer[buffer.length - 1] > 3)
    ) {
      throw new Error(`Value more than ${U128_MAX_NUMBER}, buffer overflow`);
    }

    this.buffer = buffer;
  }

  static fromNumber(n: bigint): Varuint {
    if (n < 0n) {
      throw new Error("Value must be positive");
    }
    if (n > U128_MAX_NUMBER) {
      throw new Error(`Can't encode value more than ${U128_MAX_NUMBER}`);
    }

    const buff = Buffer.alloc(BUFFER_MAX_VARUINT_LENGTH);

    let i = 0;
    while (n >> 7n > 0) {
      buff[i] = Number((n & 0b1111_1111n) | 0b1000_0000n);
      n >>= 7n;
      i += 1;
    }
    buff[i] = Number(n);

    return new Varuint(buff.subarray(0, i + 1));
  }

  toNumber() {
    let finalValue = BigInt(0);
    for (let i = 0; i < this.buffer.length; i += 1) {
      const byte = this.buffer[i];
      const value = byte & 0b0111_1111;
      finalValue = finalValue | (BigInt(value) << (7n * BigInt(i)));
    }

    if (finalValue < 0n) {
      // this can't be happen, just for safety
      throw new Error("Value is minus, something wrong");
    }

    return finalValue;
  }
}

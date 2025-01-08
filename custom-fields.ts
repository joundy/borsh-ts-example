import { field } from "@dao-xyz/borsh";
import {
  BUFFER_MAX_VARUINT_LENGTH,
  U128_MAX_NUMBER,
  U16_MAX_NUMBER,
  U32_MAX_NUMBER,
  U64_MAX_NUMBER,
  U8_MAX_NUMBER,
  type UintTypes,
} from "./types";
import { decodeVaruint, encodeVaruint } from "./varuint";

export function validateValueUintTypes(value: bigint, type: UintTypes) {
  if (value < 0) {
    throw new Error("Value must be positive");
  }

  switch (type) {
    case "u128":
      if (value > U128_MAX_NUMBER) {
        throw new Error(`Value more than ${U128_MAX_NUMBER}`);
      }
      break;
    case "u64":
      if (value > U64_MAX_NUMBER) {
        throw new Error(`Value more than ${U64_MAX_NUMBER}`);
      }
      break;
    case "u32":
      if (value > U32_MAX_NUMBER) {
        throw new Error(`Value more than ${U32_MAX_NUMBER}`);
      }
      break;
    case "u16":
      if (value > U16_MAX_NUMBER) {
        throw new Error(`Value more than ${U16_MAX_NUMBER}`);
      }
      break;
    case "u8":
      if (value > U8_MAX_NUMBER) {
        throw new Error(`Value more than ${U8_MAX_NUMBER}`);
      }
  }
}

export function varuintField(properties: { type: UintTypes }) {
  return field({
    serialize: (value: bigint, writer) => {
      validateValueUintTypes(value, properties.type);
      const varuint = encodeVaruint(value);
      const bytes = new Uint8Array(varuint);
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

      return decodeVaruint(buffer.subarray(0, reader._offset - start));
    },
  });
}

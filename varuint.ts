import { BUFFER_MAX_VARUINT_LENGTH, U128_MAX_NUMBER } from "./types";

export function encodeVaruint(n: bigint) {
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

  return buff.subarray(0, i + 1);
}

export function decodeVaruint(buff: Buffer) {
  if (
    buff.length > BUFFER_MAX_VARUINT_LENGTH ||
    (buff.length === BUFFER_MAX_VARUINT_LENGTH && buff[buff.length - 1] > 3)
  ) {
    throw new Error(
      `Can't decode value more than ${U128_MAX_NUMBER}, buffer overflow`,
    );
  }

  let finalValue = BigInt(0);
  for (let i = 0; i < buff.length; i += 1) {
    const byte = buff[i];
    const value = byte & 0b0111_1111;
    finalValue = finalValue | (BigInt(value) << (7n * BigInt(i)));
  }

  if (finalValue < 0n) {
    // this can't be happen, just for safety
    throw new Error("Value is minus, something wrong");
  }

  return finalValue;
}

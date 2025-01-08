import { deserialize, serialize, field } from "@dao-xyz/borsh";
import { varuintField } from "./custom-fields";
import { U128_MAX_NUMBER, U64_MAX_NUMBER } from "./types";

class SomeClass {
  @field({ type: "string" })
  a: string;

  @varuintField({ type: "u64" })
  x: bigint;

  @field({ type: "u128" })
  y: bigint;

  @varuintField({ type: "u128" })
  z: bigint;

  constructor(data: SomeClass) {
    Object.assign(this, data);
  }
}
async function main() {
  const value = new SomeClass({
    a: "TEST",
    x: U64_MAX_NUMBER,
    y: 1n,
    z: U128_MAX_NUMBER,
  });

  // Serialize
  const serialized = serialize(value);
  console.log({ serialized });

  // Deserialize
  const deserialized = deserialize(serialized, SomeClass);
  console.log({ deserialized });
}

main();

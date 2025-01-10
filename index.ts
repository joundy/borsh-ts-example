import { serialize, field, option, deserialize } from "@dao-xyz/borsh";
import { VaruintField } from "./varuint";
import { AZBase26Field } from "./az-base26";
import { brotli } from "./brotli";

class SomeClass {
  // example with optional value
  @field({ type: option(AZBase26Field) })
  ticker?: AZBase26Field;

  @field({ type: VaruintField })
  supply: VaruintField;

  @field({ type: VaruintField })
  amount: VaruintField;

  constructor(data: SomeClass) {
    Object.assign(this, data);
  }
}
async function main() {
  const value = new SomeClass({
    ticker: new AZBase26Field("POHON.PISANG.ENAK.SEKALI"),
    supply: new VaruintField(100_000_000n),
    amount: new VaruintField(1n),
  });

  // Serialize
  const serialized = serialize(value);
  const size = serialized.length;
  console.log({ serialized, totalBytes: `${size} bytes` });

  const buffer = Buffer.from(serialized);
  console.log(buffer.length);

  // const compressed = await brotli.compress(buffer);
  // console.log({ compressed });
  // const decompressed = await brotli.decompress(compressed);
  // console.log({ decompressed });

  // Deserialize
  // const deserialized = deserialize(serialized, SomeClass);
  // const ticker = deserialized.ticker?.toString();
  // console.log({ deserialized, ticker });
}

main();

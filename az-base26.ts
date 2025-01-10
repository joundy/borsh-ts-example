import { field, option } from "@dao-xyz/borsh";
import { U128_MAX_NUMBER } from "./types";
import { VaruintField } from "./varuint";

export class AZBase26Field {
  @field({ type: VaruintField })
  number: VaruintField;

  @field({ type: option(VaruintField) })
  spacers?: VaruintField;

  constructor(str: string) {
    const az = AZBase26.fromString(str);
    this.number = new VaruintField(az.number);

    if (az.spacers) {
      this.spacers = new VaruintField(az.spacers);
    }
  }

  toString() {
    return new AZBase26(this.number.value, this.spacers?.value).toString();
  }
}

export class AZBase26 {
  number: bigint;

  spacers?: bigint;

  constructor(number: bigint, spacers: bigint | undefined) {
    this.number = number;
    this.spacers = spacers;
  }

  static fromString(str: string): AZBase26 {
    str = str.toUpperCase();

    // should be u128
    let number = 0n;

    // should be u32
    let spacersValue = 0n;

    let charIndex = 0;
    for (let i = 0; i < str.length; i += 1) {
      const c = str.charAt(i);
      if (c >= "A" && c <= "Z") {
        if (charIndex > 0) {
          number += 1n;
        }
        number *= 26n;

        number += BigInt(c.charCodeAt(0) - "A".charCodeAt(0));

        if (number > U128_MAX_NUMBER) {
          throw new Error("Character is too large to be encoded");
        }
        charIndex += 1;
      } else if (c === "." || c === "•") {
        const flag = 1n << BigInt(charIndex);

        if ((spacersValue & flag) === 0n) {
          spacersValue |= flag;
        }
      } else {
        throw new Error(`Invalid character in rune name: ${c}`);
      }
    }

    return new AZBase26(number, spacersValue > 0n ? spacersValue : undefined);
  }

  toString(): string {
    let n = this.number;

    if (n > U128_MAX_NUMBER) {
      throw new Error("Number is too large to be decoded");
    }

    if (n === U128_MAX_NUMBER) {
      return "BCGDENLQRQWDSLRUGSNLBTMFIJAV";
    }

    n += 1n;

    let str = "";

    while (n > 0n) {
      str += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Number((n - 1n) % 26n)];
      n = (n - 1n) / 26n;
    }

    const rev = str.split("").reverse().join("");
    let result = rev;
    if (this.spacers && this.spacers > 0n) {
      result = "";
      for (let i = 0; i < rev.length; i++) {
        const flag = 1n << BigInt(i);
        if ((this.spacers & flag) !== 0n) {
          result += "•";
        }

        result += rev[i];
      }
    }

    return result;
  }
}

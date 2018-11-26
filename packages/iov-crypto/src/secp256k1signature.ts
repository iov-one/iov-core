function trimLeadingNullBytes(inData: Uint8Array): Uint8Array {
  let numberOfLeadingNullBytes = 0;
  for (const byte of inData) {
    if (byte === 0x00) {
      numberOfLeadingNullBytes++;
    } else {
      break;
    }
  }
  return inData.slice(numberOfLeadingNullBytes);
}

const derTagInteger = 0x02;

export class Secp256k1Signature {
  public static fromDer(data: Uint8Array): Secp256k1Signature {
    let pos = 0;

    if (data[pos++] !== 0x30) {
      throw new Error("Prefix 0x30 expected");
    }

    const bodyLength = data[pos++];
    if (data.length - pos !== bodyLength) {
      throw new Error("Data length mismatch detected");
    }

    // r
    const rTag = data[pos++];
    if (rTag !== derTagInteger) {
      throw new Error("INTEGER tag expected");
    }
    const rLength = data[pos++];
    if (rLength >= 0x80) {
      throw new Error("Decoding length values above 127 not supported");
    }
    const rData = data.slice(pos, pos + rLength);
    pos += rLength;

    // s
    const sTag = data[pos++];
    if (sTag !== derTagInteger) {
      throw new Error("INTEGER tag expected");
    }
    const sLength = data[pos++];
    if (sLength >= 0x80) {
      throw new Error("Decoding length values above 127 not supported");
    }
    const sData = data.slice(pos, pos + sLength);
    pos += sLength;

    return new Secp256k1Signature(
      // r/s data can contain leading 0 bytes to express integers being non-negative in DER
      trimLeadingNullBytes(rData),
      trimLeadingNullBytes(sData),
    );
  }

  private readonly data: {
    readonly r: Uint8Array;
    readonly s: Uint8Array;
  };

  constructor(r: Uint8Array, s: Uint8Array) {
    if (r.length > 32 || r.length === 0 || r[0] === 0x00) {
      throw new Error("Unsigned integer r must be encoded as unpadded big endian.");
    }

    if (s.length > 32 || s.length === 0 || s[0] === 0x00) {
      throw new Error("Unsigned integer s must be encoded as unpadded big endian.");
    }

    this.data = {
      r: r,
      s: s,
    };
  }

  public r(length?: number): Uint8Array {
    if (length === undefined) {
      return this.data.r;
    } else {
      const paddingLength = length - this.data.r.length;
      if (paddingLength < 0) {
        throw new Error("Length too small to hold parameter r");
      }
      const padding = new Uint8Array(paddingLength);
      return new Uint8Array([...padding, ...this.data.r]);
    }
  }

  public s(length?: number): Uint8Array {
    if (length === undefined) {
      return this.data.s;
    } else {
      const paddingLength = length - this.data.s.length;
      if (paddingLength < 0) {
        throw new Error("Length too small to hold parameter s");
      }
      const padding = new Uint8Array(paddingLength);
      return new Uint8Array([...padding, ...this.data.s]);
    }
  }

  public toDer(): Uint8Array {
    // DER supports negative integers but our data is unsigned. Thus we need to prepend
    // a leading 0 byte when the higest bit is set to differentiate nagative values
    const rEncoded = this.data.r[0] >= 0x80 ? new Uint8Array([0, ...this.data.r]) : this.data.r;
    const sEncoded = this.data.s[0] >= 0x80 ? new Uint8Array([0, ...this.data.s]) : this.data.s;

    const rLength = rEncoded.length;
    const sLength = sEncoded.length;
    const data = new Uint8Array([derTagInteger, rLength, ...rEncoded, derTagInteger, sLength, ...sEncoded]);

    return new Uint8Array([0x30, data.length, ...data]);
  }
}

/**
 * A Secp256k1Signature plus the recovery parameter
 */
export class ExtendedSecp256k1Signature extends Secp256k1Signature {
  public readonly recovery: number;

  constructor(r: Uint8Array, s: Uint8Array, recovery: number) {
    super(r, s);

    if (!Number.isInteger(recovery)) {
      throw new Error("The recovery parameter must be an integer.");
    }

    if (recovery < 0 || recovery > 4) {
      throw new Error("The recovery parameter must be one of 0, 1, 2, 3.");
    }

    this.recovery = recovery;
  }
}

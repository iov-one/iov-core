import shajs from "sha.js";

export interface HashFunction {
  readonly blockSize: number;
  readonly update: (_: Uint8Array) => HashFunction;
  readonly digest: () => Uint8Array;
}

export class Sha1 implements HashFunction {
  public readonly blockSize = 512 / 8;

  private readonly impl: any;

  public constructor(firstData?: Uint8Array) {
    this.impl = shajs("sha1");

    if (firstData) {
      this.update(firstData);
    }
  }

  public update(data: Uint8Array): Sha1 {
    this.impl.update(data);
    return this;
  }

  public digest(): Uint8Array {
    return new Uint8Array(this.impl.digest());
  }
}

export class Sha256 implements HashFunction {
  public readonly blockSize = 512 / 8;

  private readonly impl: any;

  public constructor(firstData?: Uint8Array) {
    this.impl = shajs("sha256");

    if (firstData) {
      this.update(firstData);
    }
  }

  public update(data: Uint8Array): Sha256 {
    this.impl.update(data);
    return this;
  }

  public digest(): Uint8Array {
    return new Uint8Array(this.impl.digest());
  }
}

export class Sha512 implements HashFunction {
  public readonly blockSize = 1024 / 8;

  private readonly impl: any;

  public constructor(firstData?: Uint8Array) {
    this.impl = shajs("sha512");

    if (firstData) {
      this.update(firstData);
    }
  }

  public update(data: Uint8Array): Sha512 {
    this.impl.update(data);
    return this;
  }

  public digest(): Uint8Array {
    return new Uint8Array(this.impl.digest());
  }
}

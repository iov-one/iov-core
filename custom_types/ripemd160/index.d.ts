declare module 'ripemd160' {
  class RIPEMD160 {
    constructor();
    update(data: Buffer|string, encoding?: string): RIPEMD160;
    digest(): Uint8Array;
    digest(encoding: string): string;
  }

  export = RIPEMD160;
}

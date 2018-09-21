declare module 'ripemd160' {
  class RIPEMD160 {
    constructor();
    update(data: Buffer|string, encoding?: string): RIPEMD160;
    digest(): Buffer;
    digest(encoding: string): string;
  }

  export = RIPEMD160;
}

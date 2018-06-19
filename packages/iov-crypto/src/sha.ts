import shajs from "sha.js";

export class Sha256 {
  // async interface to support implementations that rely on WebAssemby compilation later on
  public static digest(data: Uint8Array): Promise<Uint8Array> {
    const hasher = shajs("sha256");
    hasher.update(data);
    return Promise.resolve(hasher.digest());
  }
}

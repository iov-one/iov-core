import { Algorithm, PublicKeyBundle, PublicKeyBytes } from "@iov/types";

export function toHex(data: Uint8Array): string {
  /* tslint:disable-next-line:no-let */
  let out: string = "";
  for (const byte of data) {
    out += ("0" + byte.toString(16)).slice(-2);
  }
  return out;
}

export function fromHex(hexstring: string): Uint8Array {
  /* tslint:disable-next-line:readonly-array */
  const listOfInts: number[] = [];
  /* tslint:disable-next-line:no-let */
  for (let i = 0; i < hexstring.length; i += 2) {
    listOfInts.push(parseInt(hexstring.substr(i, 2), 16));
  }
  return new Uint8Array(listOfInts);
}

/*
This info came from `bov testgen <dir>`.
That dumped a number of files in a directory, formatted as the
bov blockchain application desires. I import them as strings
in this testfile to allow simpler tests in the browser as well.
*/

// testdata/pub_key.{json,bin}
export const pubJSON: PublicKeyBundle = {
  algo: Algorithm.ED25519,
  data: fromHex("5b418ca5f788e567bc8c40b023988358d66083c84834dc72b774884aa86dd4e0") as PublicKeyBytes,
};
export const pubBin = fromHex("0a205b418ca5f788e567bc8c40b023988358d66083c84834dc72b774884aa86dd4e0");

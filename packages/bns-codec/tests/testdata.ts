import { Encoding } from "@iov/crypto";
import { Algorithm, PublicKeyBundle, PublicKeyBytes } from "@iov/types";

export const toHex = Encoding.toHex;
export const fromHex = Encoding.fromHex;

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

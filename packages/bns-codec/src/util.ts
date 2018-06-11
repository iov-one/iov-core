import { Sha256 } from "@iov/crypto";
import { AddressBytes, PublicKeyBundle } from "@iov/types";

export const concatBytes = (buffers: Uint8Array[]) : Uint8Array => {
  // TODO: something like this:
  /*
  var a = new Int8Array( [ 1, 2, 3 ] );
var b = new Int8Array( [ 4, 5, 6 ] );

var c = new Int8Array(a.length + b.length);
c.set(a);
c.set(b, a.length);
*/
}

export const keyToAddress = (key: PublicKeyBundle) => 
  Sha256.digest(keyToIdentifier(key)).
    then((bz: Uint8Array) => bz.slice(0, 20) as AddressBytes);

// TODO: better
export const keyToIdentifier = (key: PublicKeyBundle) => 
  concatBytes([Buffer.from('sigs/ed25519/'), key.data])

  
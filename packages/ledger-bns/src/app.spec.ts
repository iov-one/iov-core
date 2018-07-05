import { getPublicKey, signTransaction } from "./app";
import { connectToFirstLedger } from "./exchange";

import { Ed25519, Encoding, Sha512 } from "@iov/crypto";

describe("Communicate with app", () => {
  const transport = connectToFirstLedger();

  it("can read the public key", done => {
    const checkKey = async () => {
      const pubkey = await getPublicKey(transport);
      expect(pubkey).toBeTruthy();
      expect(pubkey.length).toBe(32);
    };
    return checkKey()
      .catch(err => fail(err))
      .then(done);
  });

  it("can properly sign valid message", done => {
    // this is pre-generated signbytes
    const message = Encoding.fromHex("00cafe0008746573742d31323300000000000000110a440a1403694b56200b605a3a726304b6dfaa6e916458ee12146bc29ffe4fc6a4b2395c3f47b5ca9dfa377295f91a0808fa011a03455448220c54657374207061796d656e74");
    const messageHash = new Sha512(message).digest();

    const validateSig = async () => {
      const pubkey = await getPublicKey(transport);
      expect(pubkey.length).toBe(32);
      const signature = await signTransaction(transport, message);
      expect(signature.length).toBe(64);
      const ok = await Ed25519.verifySignature(signature, messageHash, pubkey);
      expect(ok).toEqual(true);
    };

    return validateSig()
      .catch(err => fail(err))
      .then(done);
  });
});

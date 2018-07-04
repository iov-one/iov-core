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
    const message = Encoding.fromHex("0a440a148a59e1dac0b8c5b59a9b2cfabe0be3fa6c2279f8121422feea060e235b06ffeef19015a50cdcb97d4f011a0808fa011a03455448220c466c61742032353020455448");
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

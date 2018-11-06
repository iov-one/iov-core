import { Ed25519, Sha512 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";

const { fromHex } = Encoding;

describe("Verifies sample signature from ledger", () => {
  const message = fromHex(
    "0a440a148a59e1dac0b8c5b59a9b2cfabe0be3fa6c2279f8121422feea060e235b06ffeef19015a50cdcb97d4f011a0808fa011a03455448220c466c61742032353020455448",
  );
  const messageHash = fromHex(
    "a26329dc1fa6cea63f7353c59693d0dd7b91d5de90afad9e62d884db943c6f7929830997ba1c5c8919da16d3464445ebe519fd6821973d2143e6fcb879e18f44",
  );
  const pubkey = fromHex("4cb2a15864611e8af56637047eb7e81d780774fd7bb259d9409ab9662879954b");
  const signature = fromHex(
    "4d9baafcd9e0aaec6cb19a91e859eef5209a75e8e45c396c012ab41cae41fbfa447288cd0ee6a4aa66cfc0fc630f07f50bf32dca0e0e669b4b242724791d110f",
  );

  it("Produces proper sha512 hash", () => {
    const hash = new Sha512(message).digest();
    expect(messageHash).toEqual(hash);
  });

  it("Produces valid signature", async () => {
    const unhashed = await Ed25519.verifySignature(signature, message, pubkey);
    expect(unhashed).toEqual(false);
    const ok = await Ed25519.verifySignature(signature, messageHash, pubkey);
    expect(ok).toEqual(true);
  });
});

// Using 24-word restore phrase from BIP-0039 test vector:
// "panda eyebrow bullet gorilla call smoke muffin taste mesh discover
//  soft ostrich alcohol speed nation flash devote level hobby quick
//  inner drive ghost inside" with path "4804438'/0'"

describe("Verifies sample signature from ledger part two", () => {
  const message = fromHex(
    "0a440a148a59e1dac0b8c5b59a9b2cfabe0be3fa6c2279f8121422feea060e235b06ffeef19015a50cdcb97d4f011a0808fa011a03455448220c466c61742032353020455448",
  );
  const messageHash = fromHex(
    "a26329dc1fa6cea63f7353c59693d0dd7b91d5de90afad9e62d884db943c6f7929830997ba1c5c8919da16d3464445ebe519fd6821973d2143e6fcb879e18f44",
  );
  const pubkey = fromHex("02c45ff501e4ee1f3f30f134cf80a9cf437337b0fe29786aeb947b1e6ea803a0");
  const signature = fromHex(
    "6b2de57b6e8b4b5623c9dd154feaea2842fdc1e6c02ed1fb8b017118160a977a1183d1c4d38d6154ea065307c625047288ecccbce1a5ac33f6af14736e6e6802",
  );

  it("Produces proper sha512 hash still", () => {
    const hash = new Sha512(message).digest();
    expect(messageHash).toEqual(hash);
  });

  it("Produces valid signature still", async () => {
    const unhashed = await Ed25519.verifySignature(signature, message, pubkey);
    expect(unhashed).toEqual(false);
    const ok = await Ed25519.verifySignature(signature, messageHash, pubkey);
    expect(ok).toEqual(true);
  });
});

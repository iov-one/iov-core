/* This is test code for the js-nacl type defintions, to make sure it compiles */

import nacl from "js-nacl";

// tslint:disable:no-expression-statement
nacl.instantiate((inst: nacl.Nacl) => {
  try {
    demo_hex(inst);
    demo_hash(inst);
    demo_sign(inst);
    demo_box(inst);
    demo_secret_box(inst);
    demo_derived(inst);
  } catch (err) {
    // tslint:disable:no-console
    console.log(err);
  }
});

function demo_hex(inst: nacl.Nacl): void {
  const hex = "1234567890ABCDEF";
  const bin = inst.from_hex(hex);
  inst.to_hex(bin); // $ExpectType string

  const text = "\uD800\uDC01";
  const utf8 = inst.encode_utf8(text);
  inst.decode_utf8(utf8); // $ExpectType string

  const latinText = "Bl\xf6\xdf";
  const latin = inst.encode_latin1(latinText);
  inst.decode_latin1(latin); // $ExpectType string
}

function demo_hash(inst: nacl.Nacl): void {
  const msg: nacl.Message = Buffer.from("some text to hash");
  inst.crypto_hash(msg); // $ExpectType Uint8Array
  inst.crypto_hash_sha256(msg); // $ExpectType Uint8Array
}

function demo_sign(inst: nacl.Nacl): void {
  const keypair = inst.crypto_sign_keypair();
  const msg: nacl.Message = Buffer.from("very important message");
  const packet = inst.crypto_sign(msg, keypair.signSk);
  inst.crypto_sign_open(packet, keypair.signPk); // $ExpectType Uint8Array | null

  const sig = inst.crypto_sign_detached(msg, keypair.signSk);
  inst.crypto_sign_verify_detached(sig, msg, keypair.signPk); // $ExpectType boolean
}

function demo_box(inst: nacl.Nacl): void {
  const msg: nacl.Message = Buffer.from("signed, sealed, and delivered");
  const sender = inst.crypto_box_keypair();
  const rcpt = inst.crypto_box_keypair();
  const nonce = inst.crypto_box_random_nonce();

  const cipher = inst.crypto_box(msg, nonce, rcpt.boxPk, sender.boxSk);
  inst.crypto_box_open(cipher, nonce, sender.boxPk, rcpt.boxSk); // $ExpectType Uint8Array

  const senderPrecompute = inst.crypto_box_precompute(rcpt.boxPk, sender.boxSk);
  const rcptPrecompute = inst.crypto_box_precompute(sender.boxPk, rcpt.boxSk);
  const cipher2 = inst.crypto_box_precomputed(msg, nonce, senderPrecompute);
  inst.crypto_box_open_precomputed(cipher2, nonce, rcptPrecompute); // $ExpectType Uint8Array
}

function demo_secret_box(inst: nacl.Nacl): void {
  const msg: nacl.Message = Buffer.from("for your eyes only");
  const keypair = inst.crypto_box_keypair();
  const nonce = inst.crypto_secretbox_random_nonce();

  const cipher = inst.crypto_secretbox(msg, nonce, keypair.boxSk);
  inst.crypto_secretbox(cipher, nonce, keypair.boxSk); // $ExpectType Uint8Array
}

function demo_derived(inst: nacl.Nacl): void {
  const seed = Buffer.from("123456789012345678901234567890qq"); // 32 byte secret
  inst.crypto_sign_seed_keypair(seed); // $ExpectType nacl.SignKeyPair
  inst.crypto_box_seed_keypair(seed); // $ExpectType nacl.BoxKeyPair
  inst.crypto_box_keypair_from_raw_sk(seed); // $ExpectType nacl.BoxKeyPair
}

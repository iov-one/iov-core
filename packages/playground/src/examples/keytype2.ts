// This demos trying to use different types to enforce
// public and private key separation

const enum AsPrivateKey {}
const enum AsPublicKey {}

type PrivateKey2 = Uint8Array & AsPrivateKey;
type PublicKey2 = Uint8Array & AsPublicKey;

interface IKeyPair2 {
  readonly pubkey: PublicKey2;
  readonly secret: PrivateKey2;
}

function demoKeyPair2(): IKeyPair2 {
  const pub: Uint8Array = Buffer.from("for the lolz");
  const priv: Buffer = Buffer.from("top secret");
  return {
    // if this is Uint8Array we can force a more specific type
    pubkey: pub as PublicKey2,
    // both Buffer and PrivateKey2 are subtypes of Uint8Array and not castable to each other
    // without an intermediate step
    secret: (priv as Uint8Array) as PrivateKey2
  };
}

function signMessage2(msg: string, secret: PrivateKey2): Uint8Array {
  return secret.length === 20 ? Buffer.from(msg) : Buffer.from("weird key");
}

function shouldError2(): Uint8Array {
  const pair = demoKeyPair2();
  // this errors on tsc, uncomment and see
  //  return signMessage("some message to sign", pair.pubkey);
  return signMessage2("some message to sign", pair.secret);
}

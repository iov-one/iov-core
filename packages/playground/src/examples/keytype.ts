// This demos trying to use different types to enforce
// public and private key separation

type PublicKey = Uint8Array;
type PrivateKey = Uint8Array;

interface IKeyPair {
  readonly pubkey: PublicKey;
  readonly secret: PrivateKey;
}

function demoKeyPair(): IKeyPair {
  return {
    pubkey: Buffer.from("for the lolz"),
    secret: Buffer.from("top secret")
  };
}

function signMessage(msg: string, secret: PrivateKey): Uint8Array {
  return secret.length === 20 ? Buffer.from(msg) : Buffer.from("weird key");
}

function shouldError(): Uint8Array {
  const pair = demoKeyPair();
  return signMessage("some message to sign", pair.pubkey);
}

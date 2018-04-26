// This demos trying to use different types to enforce
// public and private key separation

interface IPrivateKey extends Uint8Array {
  readonly assertPrivateKey: undefined;
}

interface IPublicKey extends Uint8Array {
  readonly assertPublicKey: undefined;
}

interface IKeyPair {
  readonly pubkey: IPublicKey;
  readonly secret: IPrivateKey;
}

function asPublic(bin: Uint8Array): IPublicKey {
  // tslint:disable-next-line:prefer-object-spread
  return Object.assign(bin, { assertPublicKey: undefined });
}

function asPrivate(bin: Uint8Array): IPrivateKey {
  // tslint:disable-next-line:prefer-object-spread
  return Object.assign(bin, { assertPrivateKey: undefined });
}

function demoKeyPair(): IKeyPair {
  return {
    pubkey: asPublic(Buffer.from("for the lolz")),
    secret: asPrivate(Buffer.from("top secret"))
  };
}

function signMessage(msg: string, secret: IPrivateKey): Uint8Array {
  return secret.length === 20 ? Buffer.from(msg) : Buffer.from("weird key");
}

function shouldError(): Uint8Array {
  const pair = demoKeyPair();
  return signMessage("some message to sign", pair.pubkey);
}

import { Address } from "@iov/bcp-types";
import { bnsCodec } from "@iov/bns";
import { Ed25519, Random } from "@iov/crypto";
import { Algorithm, PublicKeyBundle, PublicKeyBytes } from "@iov/tendermint-types";

/**
 * Helper function for tests. Not exported in the package.
 */
export async function randomBnsAddress(): Promise<Address> {
  const rawKeypair = await Ed25519.makeKeypair(await Random.getBytes(32));
  const pubkey: PublicKeyBundle = {
    algo: Algorithm.Ed25519,
    data: rawKeypair.pubkey as PublicKeyBytes,
  };
  return bnsCodec.keyToAddress(pubkey);
}

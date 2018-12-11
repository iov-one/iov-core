// export the most commonly needed pieces to pull together higher-level apps,
// even if they come from other repos. We also pull in all types here.

// this should serve as an entry point into the whole monorepo.

export { ChainId } from "@iov/base-types";
export { Address, Nonce, SendTransaction, TokenTicker } from "@iov/bcp-types";
export { bnsConnector, bnsFromOrToTag, bnsNonceTag, bnsSwapQueryTags } from "@iov/bns";
export {
  Ed25519HdWallet,
  Ed25519Wallet,
  HdPaths,
  Keyring,
  Secp256k1HdWallet,
  UserProfile,
  Wallet,
  WalletId,
  WalletImplementationIdString,
  WalletSerializationString,
} from "@iov/keycontrol";

export { MultiChainSigner } from "./multichainsigner";

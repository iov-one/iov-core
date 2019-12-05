import {
  Address,
  BlockchainConnection,
  ChainConnector,
  ChainId,
  Identity,
  Nonce,
  PostTxResponse,
  SignedTransaction,
  TxCodec,
  UnsignedTransaction,
} from "@iov/bcp";
/**
 * TransactionSigner is just the methods on `UserProfile` that we need in `MultiChainSigner`.
 * By only requiring this interface, we allow the use of other implementations with custom
 * logic for key derivation, etc.
 */
export interface Profile {
  readonly signTransaction: (
    identity: Identity,
    transaction: UnsignedTransaction,
    codec: TxCodec,
    nonce: Nonce,
  ) => Promise<SignedTransaction>;
  readonly appendSignature: (
    identity: Identity,
    originalTransaction: SignedTransaction,
    codec: TxCodec,
    nonce: Nonce,
  ) => Promise<SignedTransaction>;
}
export declare class MultiChainSigner {
  private readonly knownChains;
  private readonly profile;
  constructor(profile: Profile);
  chainIds(): readonly ChainId[];
  connection(chainId: ChainId): BlockchainConnection;
  /**
   * Connects to a chain using the provided connector.
   *
   * @returns an object of chain information, currently just a BlockchainConnection
   */
  addChain(
    connector: ChainConnector,
  ): Promise<{
    readonly connection: BlockchainConnection;
  }>;
  /**
   * Calculate an address in a blockchain-specific way
   */
  identityToAddress(identity: Identity): Address;
  /**
   * A chain-dependent validation of address
   */
  isValidAddress(chainId: ChainId, address: string): boolean;
  /**
   * Queries the nonce, signs the transaction and posts it to the blockchain.
   */
  signAndPost(identity: Identity, transaction: UnsignedTransaction): Promise<PostTxResponse>;
  /**
   * Call this to free ressources when signer is not needed anymore.
   * This disconnects all chains and other housekeeping if necessary.
   */
  shutdown(): void;
  /**
   * Throws for unknown chain ID
   */
  private getChain;
}

import * as $protobuf from "protobufjs";
/** Namespace app. */
export namespace app {
  /** Properties of a Tx. */
  interface ITx {
    /** Tx sendMsg */
    sendMsg?: cash.ISendMsg | null;

    /** Tx newTokenMsg */
    newTokenMsg?: namecoin.INewTokenMsg | null;

    /** Tx setNameMsg */
    setNameMsg?: namecoin.ISetWalletNameMsg | null;

    /** Tx createEscrowMsg */
    createEscrowMsg?: escrow.ICreateEscrowMsg | null;

    /** Tx releaseEscrowMsg */
    releaseEscrowMsg?: escrow.IReleaseEscrowMsg | null;

    /** Tx returnEscrowMsg */
    returnEscrowMsg?: escrow.IReturnEscrowMsg | null;

    /** Tx updateEscrowMsg */
    updateEscrowMsg?: escrow.IUpdateEscrowPartiesMsg | null;

    /** Tx createContractMsg */
    createContractMsg?: multisig.ICreateContractMsg | null;

    /** Tx updateContractMsg */
    updateContractMsg?: multisig.IUpdateContractMsg | null;

    /** Tx setValidatorsMsg */
    setValidatorsMsg?: validators.ISetValidatorsMsg | null;

    /** Tx addApprovalMsg */
    addApprovalMsg?: nft.IAddApprovalMsg | null;

    /** Tx removeApprovalMsg */
    removeApprovalMsg?: nft.IRemoveApprovalMsg | null;

    /** Tx issueUsernameNftMsg */
    issueUsernameNftMsg?: username.IIssueTokenMsg | null;

    /** Tx addUsernameAddressNftMsg */
    addUsernameAddressNftMsg?: username.IAddChainAddressMsg | null;

    /** Tx removeUsernameAddressMsg */
    removeUsernameAddressMsg?: username.IRemoveChainAddressMsg | null;

    /** Tx issueBlockchainNftMsg */
    issueBlockchainNftMsg?: blockchain.IIssueTokenMsg | null;

    /** Tx issueTickerNftMsg */
    issueTickerNftMsg?: ticker.IIssueTokenMsg | null;

    /** Tx issueBootstrapNodeNftMsg */
    issueBootstrapNodeNftMsg?: bootstrap_node.IIssueTokenMsg | null;

    /** Tx fees */
    fees?: cash.IFeeInfo | null;

    /** Tx signatures */
    signatures?: sigs.IStdSignature[] | null;

    /** Tx preimage */
    preimage?: Uint8Array | null;

    /** Tx multisig */
    multisig?: Uint8Array[] | null;
  }

  /** Represents a Tx. */
  class Tx implements ITx {
    /**
     * Constructs a new Tx.
     * @param [properties] Properties to set
     */
    constructor(properties?: app.ITx);

    /** Tx sendMsg. */
    public sendMsg?: cash.ISendMsg | null;

    /** Tx newTokenMsg. */
    public newTokenMsg?: namecoin.INewTokenMsg | null;

    /** Tx setNameMsg. */
    public setNameMsg?: namecoin.ISetWalletNameMsg | null;

    /** Tx createEscrowMsg. */
    public createEscrowMsg?: escrow.ICreateEscrowMsg | null;

    /** Tx releaseEscrowMsg. */
    public releaseEscrowMsg?: escrow.IReleaseEscrowMsg | null;

    /** Tx returnEscrowMsg. */
    public returnEscrowMsg?: escrow.IReturnEscrowMsg | null;

    /** Tx updateEscrowMsg. */
    public updateEscrowMsg?: escrow.IUpdateEscrowPartiesMsg | null;

    /** Tx createContractMsg. */
    public createContractMsg?: multisig.ICreateContractMsg | null;

    /** Tx updateContractMsg. */
    public updateContractMsg?: multisig.IUpdateContractMsg | null;

    /** Tx setValidatorsMsg. */
    public setValidatorsMsg?: validators.ISetValidatorsMsg | null;

    /** Tx addApprovalMsg. */
    public addApprovalMsg?: nft.IAddApprovalMsg | null;

    /** Tx removeApprovalMsg. */
    public removeApprovalMsg?: nft.IRemoveApprovalMsg | null;

    /** Tx issueUsernameNftMsg. */
    public issueUsernameNftMsg?: username.IIssueTokenMsg | null;

    /** Tx addUsernameAddressNftMsg. */
    public addUsernameAddressNftMsg?: username.IAddChainAddressMsg | null;

    /** Tx removeUsernameAddressMsg. */
    public removeUsernameAddressMsg?: username.IRemoveChainAddressMsg | null;

    /** Tx issueBlockchainNftMsg. */
    public issueBlockchainNftMsg?: blockchain.IIssueTokenMsg | null;

    /** Tx issueTickerNftMsg. */
    public issueTickerNftMsg?: ticker.IIssueTokenMsg | null;

    /** Tx issueBootstrapNodeNftMsg. */
    public issueBootstrapNodeNftMsg?: bootstrap_node.IIssueTokenMsg | null;

    /** Tx fees. */
    public fees?: cash.IFeeInfo | null;

    /** Tx signatures. */
    public signatures: sigs.IStdSignature[];

    /** Tx preimage. */
    public preimage: Uint8Array;

    /** Tx multisig. */
    public multisig: Uint8Array[];

    /** Tx sum. */
    public sum?:
      | "sendMsg"
      | "newTokenMsg"
      | "setNameMsg"
      | "createEscrowMsg"
      | "releaseEscrowMsg"
      | "returnEscrowMsg"
      | "updateEscrowMsg"
      | "createContractMsg"
      | "updateContractMsg"
      | "setValidatorsMsg"
      | "addApprovalMsg"
      | "removeApprovalMsg"
      | "issueUsernameNftMsg"
      | "addUsernameAddressNftMsg"
      | "removeUsernameAddressMsg"
      | "issueBlockchainNftMsg"
      | "issueTickerNftMsg"
      | "issueBootstrapNodeNftMsg";

    /**
     * Creates a new Tx instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Tx instance
     */
    public static create(properties?: app.ITx): app.Tx;

    /**
     * Encodes the specified Tx message. Does not implicitly {@link app.Tx.verify|verify} messages.
     * @param message Tx message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: app.ITx, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Tx message, length delimited. Does not implicitly {@link app.Tx.verify|verify} messages.
     * @param message Tx message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: app.ITx, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Tx message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Tx
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): app.Tx;

    /**
     * Decodes a Tx message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Tx
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): app.Tx;

    /**
     * Verifies a Tx message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Tx message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Tx
     */
    public static fromObject(object: { [k: string]: any }): app.Tx;

    /**
     * Creates a plain object from a Tx message. Also converts values to other types if specified.
     * @param message Tx
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: app.Tx, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Tx to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** NftType enum. */
  enum NftType {
    Username = 0,
    Ticker = 1,
    Blockchain = 3,
    BootstrapNode = 4,
  }

  /** Properties of a ResultSet. */
  interface IResultSet {
    /** ResultSet results */
    results?: Uint8Array[] | null;
  }

  /** Represents a ResultSet. */
  class ResultSet implements IResultSet {
    /**
     * Constructs a new ResultSet.
     * @param [properties] Properties to set
     */
    constructor(properties?: app.IResultSet);

    /** ResultSet results. */
    public results: Uint8Array[];

    /**
     * Creates a new ResultSet instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ResultSet instance
     */
    public static create(properties?: app.IResultSet): app.ResultSet;

    /**
     * Encodes the specified ResultSet message. Does not implicitly {@link app.ResultSet.verify|verify} messages.
     * @param message ResultSet message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: app.IResultSet, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ResultSet message, length delimited. Does not implicitly {@link app.ResultSet.verify|verify} messages.
     * @param message ResultSet message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: app.IResultSet, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ResultSet message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ResultSet
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): app.ResultSet;

    /**
     * Decodes a ResultSet message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ResultSet
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): app.ResultSet;

    /**
     * Verifies a ResultSet message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a ResultSet message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ResultSet
     */
    public static fromObject(object: { [k: string]: any }): app.ResultSet;

    /**
     * Creates a plain object from a ResultSet message. Also converts values to other types if specified.
     * @param message ResultSet
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: app.ResultSet,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ResultSet to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace crypto. */
export namespace crypto {
  /** Properties of a PublicKey. */
  interface IPublicKey {
    /** PublicKey ed25519 */
    ed25519?: Uint8Array | null;
  }

  /** Represents a PublicKey. */
  class PublicKey implements IPublicKey {
    /**
     * Constructs a new PublicKey.
     * @param [properties] Properties to set
     */
    constructor(properties?: crypto.IPublicKey);

    /** PublicKey ed25519. */
    public ed25519: Uint8Array;

    /** PublicKey pub. */
    public pub?: "ed25519";

    /**
     * Creates a new PublicKey instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PublicKey instance
     */
    public static create(properties?: crypto.IPublicKey): crypto.PublicKey;

    /**
     * Encodes the specified PublicKey message. Does not implicitly {@link crypto.PublicKey.verify|verify} messages.
     * @param message PublicKey message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: crypto.IPublicKey, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PublicKey message, length delimited. Does not implicitly {@link crypto.PublicKey.verify|verify} messages.
     * @param message PublicKey message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: crypto.IPublicKey, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PublicKey message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PublicKey
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): crypto.PublicKey;

    /**
     * Decodes a PublicKey message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PublicKey
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): crypto.PublicKey;

    /**
     * Verifies a PublicKey message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a PublicKey message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PublicKey
     */
    public static fromObject(object: { [k: string]: any }): crypto.PublicKey;

    /**
     * Creates a plain object from a PublicKey message. Also converts values to other types if specified.
     * @param message PublicKey
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: crypto.PublicKey,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this PublicKey to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a PrivateKey. */
  interface IPrivateKey {
    /** PrivateKey ed25519 */
    ed25519?: Uint8Array | null;
  }

  /** Represents a PrivateKey. */
  class PrivateKey implements IPrivateKey {
    /**
     * Constructs a new PrivateKey.
     * @param [properties] Properties to set
     */
    constructor(properties?: crypto.IPrivateKey);

    /** PrivateKey ed25519. */
    public ed25519: Uint8Array;

    /** PrivateKey priv. */
    public priv?: "ed25519";

    /**
     * Creates a new PrivateKey instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PrivateKey instance
     */
    public static create(properties?: crypto.IPrivateKey): crypto.PrivateKey;

    /**
     * Encodes the specified PrivateKey message. Does not implicitly {@link crypto.PrivateKey.verify|verify} messages.
     * @param message PrivateKey message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: crypto.IPrivateKey, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PrivateKey message, length delimited. Does not implicitly {@link crypto.PrivateKey.verify|verify} messages.
     * @param message PrivateKey message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: crypto.IPrivateKey, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PrivateKey message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PrivateKey
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): crypto.PrivateKey;

    /**
     * Decodes a PrivateKey message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PrivateKey
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): crypto.PrivateKey;

    /**
     * Verifies a PrivateKey message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a PrivateKey message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PrivateKey
     */
    public static fromObject(object: { [k: string]: any }): crypto.PrivateKey;

    /**
     * Creates a plain object from a PrivateKey message. Also converts values to other types if specified.
     * @param message PrivateKey
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: crypto.PrivateKey,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this PrivateKey to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a Signature. */
  interface ISignature {
    /** Signature ed25519 */
    ed25519?: Uint8Array | null;
  }

  /** Represents a Signature. */
  class Signature implements ISignature {
    /**
     * Constructs a new Signature.
     * @param [properties] Properties to set
     */
    constructor(properties?: crypto.ISignature);

    /** Signature ed25519. */
    public ed25519: Uint8Array;

    /** Signature sig. */
    public sig?: "ed25519";

    /**
     * Creates a new Signature instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Signature instance
     */
    public static create(properties?: crypto.ISignature): crypto.Signature;

    /**
     * Encodes the specified Signature message. Does not implicitly {@link crypto.Signature.verify|verify} messages.
     * @param message Signature message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: crypto.ISignature, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Signature message, length delimited. Does not implicitly {@link crypto.Signature.verify|verify} messages.
     * @param message Signature message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: crypto.ISignature, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Signature message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Signature
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): crypto.Signature;

    /**
     * Decodes a Signature message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Signature
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): crypto.Signature;

    /**
     * Verifies a Signature message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Signature message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Signature
     */
    public static fromObject(object: { [k: string]: any }): crypto.Signature;

    /**
     * Creates a plain object from a Signature message. Also converts values to other types if specified.
     * @param message Signature
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: crypto.Signature,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Signature to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace orm. */
export namespace orm {
  /** Properties of a MultiRef. */
  interface IMultiRef {
    /** MultiRef refs */
    refs?: Uint8Array[] | null;
  }

  /** Represents a MultiRef. */
  class MultiRef implements IMultiRef {
    /**
     * Constructs a new MultiRef.
     * @param [properties] Properties to set
     */
    constructor(properties?: orm.IMultiRef);

    /** MultiRef refs. */
    public refs: Uint8Array[];

    /**
     * Creates a new MultiRef instance using the specified properties.
     * @param [properties] Properties to set
     * @returns MultiRef instance
     */
    public static create(properties?: orm.IMultiRef): orm.MultiRef;

    /**
     * Encodes the specified MultiRef message. Does not implicitly {@link orm.MultiRef.verify|verify} messages.
     * @param message MultiRef message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: orm.IMultiRef, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified MultiRef message, length delimited. Does not implicitly {@link orm.MultiRef.verify|verify} messages.
     * @param message MultiRef message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: orm.IMultiRef, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a MultiRef message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns MultiRef
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): orm.MultiRef;

    /**
     * Decodes a MultiRef message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns MultiRef
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): orm.MultiRef;

    /**
     * Verifies a MultiRef message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a MultiRef message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns MultiRef
     */
    public static fromObject(object: { [k: string]: any }): orm.MultiRef;

    /**
     * Creates a plain object from a MultiRef message. Also converts values to other types if specified.
     * @param message MultiRef
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: orm.MultiRef,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this MultiRef to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a Counter. */
  interface ICounter {
    /** Counter count */
    count?: number | Long | null;
  }

  /** Represents a Counter. */
  class Counter implements ICounter {
    /**
     * Constructs a new Counter.
     * @param [properties] Properties to set
     */
    constructor(properties?: orm.ICounter);

    /** Counter count. */
    public count: number | Long;

    /**
     * Creates a new Counter instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Counter instance
     */
    public static create(properties?: orm.ICounter): orm.Counter;

    /**
     * Encodes the specified Counter message. Does not implicitly {@link orm.Counter.verify|verify} messages.
     * @param message Counter message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: orm.ICounter, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Counter message, length delimited. Does not implicitly {@link orm.Counter.verify|verify} messages.
     * @param message Counter message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: orm.ICounter, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Counter message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Counter
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): orm.Counter;

    /**
     * Decodes a Counter message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Counter
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): orm.Counter;

    /**
     * Verifies a Counter message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Counter message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Counter
     */
    public static fromObject(object: { [k: string]: any }): orm.Counter;

    /**
     * Creates a plain object from a Counter message. Also converts values to other types if specified.
     * @param message Counter
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: orm.Counter,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Counter to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace namecoin. */
export namespace namecoin {
  /** Properties of a Wallet. */
  interface IWallet {
    /** Wallet coins */
    coins?: x.ICoin[] | null;

    /** Wallet name */
    name?: string | null;
  }

  /** Represents a Wallet. */
  class Wallet implements IWallet {
    /**
     * Constructs a new Wallet.
     * @param [properties] Properties to set
     */
    constructor(properties?: namecoin.IWallet);

    /** Wallet coins. */
    public coins: x.ICoin[];

    /** Wallet name. */
    public name: string;

    /**
     * Creates a new Wallet instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Wallet instance
     */
    public static create(properties?: namecoin.IWallet): namecoin.Wallet;

    /**
     * Encodes the specified Wallet message. Does not implicitly {@link namecoin.Wallet.verify|verify} messages.
     * @param message Wallet message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: namecoin.IWallet, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Wallet message, length delimited. Does not implicitly {@link namecoin.Wallet.verify|verify} messages.
     * @param message Wallet message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: namecoin.IWallet, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Wallet message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Wallet
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): namecoin.Wallet;

    /**
     * Decodes a Wallet message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Wallet
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): namecoin.Wallet;

    /**
     * Verifies a Wallet message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Wallet message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Wallet
     */
    public static fromObject(object: { [k: string]: any }): namecoin.Wallet;

    /**
     * Creates a plain object from a Wallet message. Also converts values to other types if specified.
     * @param message Wallet
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: namecoin.Wallet,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Wallet to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a Token. */
  interface IToken {
    /** Token name */
    name?: string | null;

    /** Token sigFigs */
    sigFigs?: number | null;
  }

  /** Represents a Token. */
  class Token implements IToken {
    /**
     * Constructs a new Token.
     * @param [properties] Properties to set
     */
    constructor(properties?: namecoin.IToken);

    /** Token name. */
    public name: string;

    /** Token sigFigs. */
    public sigFigs: number;

    /**
     * Creates a new Token instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Token instance
     */
    public static create(properties?: namecoin.IToken): namecoin.Token;

    /**
     * Encodes the specified Token message. Does not implicitly {@link namecoin.Token.verify|verify} messages.
     * @param message Token message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: namecoin.IToken, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Token message, length delimited. Does not implicitly {@link namecoin.Token.verify|verify} messages.
     * @param message Token message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: namecoin.IToken, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Token message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Token
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): namecoin.Token;

    /**
     * Decodes a Token message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Token
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): namecoin.Token;

    /**
     * Verifies a Token message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Token message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Token
     */
    public static fromObject(object: { [k: string]: any }): namecoin.Token;

    /**
     * Creates a plain object from a Token message. Also converts values to other types if specified.
     * @param message Token
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: namecoin.Token,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Token to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a NewTokenMsg. */
  interface INewTokenMsg {
    /** NewTokenMsg ticker */
    ticker?: string | null;

    /** NewTokenMsg name */
    name?: string | null;

    /** NewTokenMsg sigFigs */
    sigFigs?: number | null;
  }

  /** Represents a NewTokenMsg. */
  class NewTokenMsg implements INewTokenMsg {
    /**
     * Constructs a new NewTokenMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: namecoin.INewTokenMsg);

    /** NewTokenMsg ticker. */
    public ticker: string;

    /** NewTokenMsg name. */
    public name: string;

    /** NewTokenMsg sigFigs. */
    public sigFigs: number;

    /**
     * Creates a new NewTokenMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns NewTokenMsg instance
     */
    public static create(properties?: namecoin.INewTokenMsg): namecoin.NewTokenMsg;

    /**
     * Encodes the specified NewTokenMsg message. Does not implicitly {@link namecoin.NewTokenMsg.verify|verify} messages.
     * @param message NewTokenMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: namecoin.INewTokenMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified NewTokenMsg message, length delimited. Does not implicitly {@link namecoin.NewTokenMsg.verify|verify} messages.
     * @param message NewTokenMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: namecoin.INewTokenMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a NewTokenMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns NewTokenMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): namecoin.NewTokenMsg;

    /**
     * Decodes a NewTokenMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns NewTokenMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): namecoin.NewTokenMsg;

    /**
     * Verifies a NewTokenMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a NewTokenMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns NewTokenMsg
     */
    public static fromObject(object: { [k: string]: any }): namecoin.NewTokenMsg;

    /**
     * Creates a plain object from a NewTokenMsg message. Also converts values to other types if specified.
     * @param message NewTokenMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: namecoin.NewTokenMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this NewTokenMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a SetWalletNameMsg. */
  interface ISetWalletNameMsg {
    /** SetWalletNameMsg address */
    address?: Uint8Array | null;

    /** SetWalletNameMsg name */
    name?: string | null;
  }

  /** Represents a SetWalletNameMsg. */
  class SetWalletNameMsg implements ISetWalletNameMsg {
    /**
     * Constructs a new SetWalletNameMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: namecoin.ISetWalletNameMsg);

    /** SetWalletNameMsg address. */
    public address: Uint8Array;

    /** SetWalletNameMsg name. */
    public name: string;

    /**
     * Creates a new SetWalletNameMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns SetWalletNameMsg instance
     */
    public static create(properties?: namecoin.ISetWalletNameMsg): namecoin.SetWalletNameMsg;

    /**
     * Encodes the specified SetWalletNameMsg message. Does not implicitly {@link namecoin.SetWalletNameMsg.verify|verify} messages.
     * @param message SetWalletNameMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: namecoin.ISetWalletNameMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified SetWalletNameMsg message, length delimited. Does not implicitly {@link namecoin.SetWalletNameMsg.verify|verify} messages.
     * @param message SetWalletNameMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: namecoin.ISetWalletNameMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a SetWalletNameMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns SetWalletNameMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): namecoin.SetWalletNameMsg;

    /**
     * Decodes a SetWalletNameMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns SetWalletNameMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): namecoin.SetWalletNameMsg;

    /**
     * Verifies a SetWalletNameMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a SetWalletNameMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns SetWalletNameMsg
     */
    public static fromObject(object: { [k: string]: any }): namecoin.SetWalletNameMsg;

    /**
     * Creates a plain object from a SetWalletNameMsg message. Also converts values to other types if specified.
     * @param message SetWalletNameMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: namecoin.SetWalletNameMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this SetWalletNameMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace blockchain. */
export namespace blockchain {
  /** Properties of a BlockchainToken. */
  interface IBlockchainToken {
    /** BlockchainToken base */
    base?: nft.INonFungibleToken | null;

    /** BlockchainToken details */
    details?: blockchain.ITokenDetails | null;
  }

  /** Represents a BlockchainToken. */
  class BlockchainToken implements IBlockchainToken {
    /**
     * Constructs a new BlockchainToken.
     * @param [properties] Properties to set
     */
    constructor(properties?: blockchain.IBlockchainToken);

    /** BlockchainToken base. */
    public base?: nft.INonFungibleToken | null;

    /** BlockchainToken details. */
    public details?: blockchain.ITokenDetails | null;

    /**
     * Creates a new BlockchainToken instance using the specified properties.
     * @param [properties] Properties to set
     * @returns BlockchainToken instance
     */
    public static create(properties?: blockchain.IBlockchainToken): blockchain.BlockchainToken;

    /**
     * Encodes the specified BlockchainToken message. Does not implicitly {@link blockchain.BlockchainToken.verify|verify} messages.
     * @param message BlockchainToken message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: blockchain.IBlockchainToken, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified BlockchainToken message, length delimited. Does not implicitly {@link blockchain.BlockchainToken.verify|verify} messages.
     * @param message BlockchainToken message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: blockchain.IBlockchainToken,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a BlockchainToken message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns BlockchainToken
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): blockchain.BlockchainToken;

    /**
     * Decodes a BlockchainToken message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns BlockchainToken
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): blockchain.BlockchainToken;

    /**
     * Verifies a BlockchainToken message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a BlockchainToken message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns BlockchainToken
     */
    public static fromObject(object: { [k: string]: any }): blockchain.BlockchainToken;

    /**
     * Creates a plain object from a BlockchainToken message. Also converts values to other types if specified.
     * @param message BlockchainToken
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: blockchain.BlockchainToken,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this BlockchainToken to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a TokenDetails. */
  interface ITokenDetails {
    /** TokenDetails chain */
    chain?: blockchain.IChain | null;

    /** TokenDetails iov */
    iov?: blockchain.IIOV | null;
  }

  /** Represents a TokenDetails. */
  class TokenDetails implements ITokenDetails {
    /**
     * Constructs a new TokenDetails.
     * @param [properties] Properties to set
     */
    constructor(properties?: blockchain.ITokenDetails);

    /** TokenDetails chain. */
    public chain?: blockchain.IChain | null;

    /** TokenDetails iov. */
    public iov?: blockchain.IIOV | null;

    /**
     * Creates a new TokenDetails instance using the specified properties.
     * @param [properties] Properties to set
     * @returns TokenDetails instance
     */
    public static create(properties?: blockchain.ITokenDetails): blockchain.TokenDetails;

    /**
     * Encodes the specified TokenDetails message. Does not implicitly {@link blockchain.TokenDetails.verify|verify} messages.
     * @param message TokenDetails message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: blockchain.ITokenDetails, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified TokenDetails message, length delimited. Does not implicitly {@link blockchain.TokenDetails.verify|verify} messages.
     * @param message TokenDetails message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: blockchain.ITokenDetails,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a TokenDetails message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns TokenDetails
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): blockchain.TokenDetails;

    /**
     * Decodes a TokenDetails message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns TokenDetails
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): blockchain.TokenDetails;

    /**
     * Verifies a TokenDetails message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a TokenDetails message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns TokenDetails
     */
    public static fromObject(object: { [k: string]: any }): blockchain.TokenDetails;

    /**
     * Creates a plain object from a TokenDetails message. Also converts values to other types if specified.
     * @param message TokenDetails
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: blockchain.TokenDetails,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this TokenDetails to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a Chain. */
  interface IChain {
    /** Chain chainID */
    chainID?: string | null;

    /** Chain networkID */
    networkID?: string | null;

    /** Chain name */
    name?: string | null;

    /** Chain enabled */
    enabled?: boolean | null;

    /** Chain production */
    production?: boolean | null;

    /** Chain mainTickerID */
    mainTickerID?: Uint8Array | null;
  }

  /** Represents a Chain. */
  class Chain implements IChain {
    /**
     * Constructs a new Chain.
     * @param [properties] Properties to set
     */
    constructor(properties?: blockchain.IChain);

    /** Chain chainID. */
    public chainID: string;

    /** Chain networkID. */
    public networkID: string;

    /** Chain name. */
    public name: string;

    /** Chain enabled. */
    public enabled: boolean;

    /** Chain production. */
    public production: boolean;

    /** Chain mainTickerID. */
    public mainTickerID: Uint8Array;

    /**
     * Creates a new Chain instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Chain instance
     */
    public static create(properties?: blockchain.IChain): blockchain.Chain;

    /**
     * Encodes the specified Chain message. Does not implicitly {@link blockchain.Chain.verify|verify} messages.
     * @param message Chain message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: blockchain.IChain, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Chain message, length delimited. Does not implicitly {@link blockchain.Chain.verify|verify} messages.
     * @param message Chain message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: blockchain.IChain, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Chain message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Chain
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): blockchain.Chain;

    /**
     * Decodes a Chain message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Chain
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): blockchain.Chain;

    /**
     * Verifies a Chain message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Chain message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Chain
     */
    public static fromObject(object: { [k: string]: any }): blockchain.Chain;

    /**
     * Creates a plain object from a Chain message. Also converts values to other types if specified.
     * @param message Chain
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: blockchain.Chain,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Chain to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a IOV. */
  interface IIOV {
    /** IOV codec */
    codec?: string | null;

    /** IOV codecConfig */
    codecConfig?: string | null;
  }

  /** Represents a IOV. */
  class IOV implements IIOV {
    /**
     * Constructs a new IOV.
     * @param [properties] Properties to set
     */
    constructor(properties?: blockchain.IIOV);

    /** IOV codec. */
    public codec: string;

    /** IOV codecConfig. */
    public codecConfig: string;

    /**
     * Creates a new IOV instance using the specified properties.
     * @param [properties] Properties to set
     * @returns IOV instance
     */
    public static create(properties?: blockchain.IIOV): blockchain.IOV;

    /**
     * Encodes the specified IOV message. Does not implicitly {@link blockchain.IOV.verify|verify} messages.
     * @param message IOV message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: blockchain.IIOV, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified IOV message, length delimited. Does not implicitly {@link blockchain.IOV.verify|verify} messages.
     * @param message IOV message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: blockchain.IIOV, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a IOV message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns IOV
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): blockchain.IOV;

    /**
     * Decodes a IOV message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns IOV
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): blockchain.IOV;

    /**
     * Verifies a IOV message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a IOV message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns IOV
     */
    public static fromObject(object: { [k: string]: any }): blockchain.IOV;

    /**
     * Creates a plain object from a IOV message. Also converts values to other types if specified.
     * @param message IOV
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: blockchain.IOV,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this IOV to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a Config. */
  interface IConfig {
    /** Config chain */
    chain?: blockchain.IChain | null;

    /** Config codecConfig */
    codecConfig?: string | null;
  }

  /** Represents a Config. */
  class Config implements IConfig {
    /**
     * Constructs a new Config.
     * @param [properties] Properties to set
     */
    constructor(properties?: blockchain.IConfig);

    /** Config chain. */
    public chain?: blockchain.IChain | null;

    /** Config codecConfig. */
    public codecConfig: string;

    /**
     * Creates a new Config instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Config instance
     */
    public static create(properties?: blockchain.IConfig): blockchain.Config;

    /**
     * Encodes the specified Config message. Does not implicitly {@link blockchain.Config.verify|verify} messages.
     * @param message Config message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: blockchain.IConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Config message, length delimited. Does not implicitly {@link blockchain.Config.verify|verify} messages.
     * @param message Config message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: blockchain.IConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Config message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Config
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): blockchain.Config;

    /**
     * Decodes a Config message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Config
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): blockchain.Config;

    /**
     * Verifies a Config message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Config message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Config
     */
    public static fromObject(object: { [k: string]: any }): blockchain.Config;

    /**
     * Creates a plain object from a Config message. Also converts values to other types if specified.
     * @param message Config
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: blockchain.Config,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Config to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of an IssueTokenMsg. */
  interface IIssueTokenMsg {
    /** IssueTokenMsg owner */
    owner?: Uint8Array | null;

    /** IssueTokenMsg id */
    id?: Uint8Array | null;

    /** IssueTokenMsg details */
    details?: blockchain.ITokenDetails | null;

    /** IssueTokenMsg approvals */
    approvals?: nft.IActionApprovals[] | null;
  }

  /** Represents an IssueTokenMsg. */
  class IssueTokenMsg implements IIssueTokenMsg {
    /**
     * Constructs a new IssueTokenMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: blockchain.IIssueTokenMsg);

    /** IssueTokenMsg owner. */
    public owner: Uint8Array;

    /** IssueTokenMsg id. */
    public id: Uint8Array;

    /** IssueTokenMsg details. */
    public details?: blockchain.ITokenDetails | null;

    /** IssueTokenMsg approvals. */
    public approvals: nft.IActionApprovals[];

    /**
     * Creates a new IssueTokenMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns IssueTokenMsg instance
     */
    public static create(properties?: blockchain.IIssueTokenMsg): blockchain.IssueTokenMsg;

    /**
     * Encodes the specified IssueTokenMsg message. Does not implicitly {@link blockchain.IssueTokenMsg.verify|verify} messages.
     * @param message IssueTokenMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: blockchain.IIssueTokenMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified IssueTokenMsg message, length delimited. Does not implicitly {@link blockchain.IssueTokenMsg.verify|verify} messages.
     * @param message IssueTokenMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: blockchain.IIssueTokenMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes an IssueTokenMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns IssueTokenMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): blockchain.IssueTokenMsg;

    /**
     * Decodes an IssueTokenMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns IssueTokenMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): blockchain.IssueTokenMsg;

    /**
     * Verifies an IssueTokenMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an IssueTokenMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns IssueTokenMsg
     */
    public static fromObject(object: { [k: string]: any }): blockchain.IssueTokenMsg;

    /**
     * Creates a plain object from an IssueTokenMsg message. Also converts values to other types if specified.
     * @param message IssueTokenMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: blockchain.IssueTokenMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this IssueTokenMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace ticker. */
export namespace ticker {
  /** Properties of a TickerToken. */
  interface ITickerToken {
    /** TickerToken base */
    base?: nft.INonFungibleToken | null;

    /** TickerToken details */
    details?: ticker.ITokenDetails | null;
  }

  /** Represents a TickerToken. */
  class TickerToken implements ITickerToken {
    /**
     * Constructs a new TickerToken.
     * @param [properties] Properties to set
     */
    constructor(properties?: ticker.ITickerToken);

    /** TickerToken base. */
    public base?: nft.INonFungibleToken | null;

    /** TickerToken details. */
    public details?: ticker.ITokenDetails | null;

    /**
     * Creates a new TickerToken instance using the specified properties.
     * @param [properties] Properties to set
     * @returns TickerToken instance
     */
    public static create(properties?: ticker.ITickerToken): ticker.TickerToken;

    /**
     * Encodes the specified TickerToken message. Does not implicitly {@link ticker.TickerToken.verify|verify} messages.
     * @param message TickerToken message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ticker.ITickerToken, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified TickerToken message, length delimited. Does not implicitly {@link ticker.TickerToken.verify|verify} messages.
     * @param message TickerToken message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ticker.ITickerToken, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a TickerToken message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns TickerToken
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): ticker.TickerToken;

    /**
     * Decodes a TickerToken message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns TickerToken
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): ticker.TickerToken;

    /**
     * Verifies a TickerToken message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a TickerToken message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns TickerToken
     */
    public static fromObject(object: { [k: string]: any }): ticker.TickerToken;

    /**
     * Creates a plain object from a TickerToken message. Also converts values to other types if specified.
     * @param message TickerToken
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: ticker.TickerToken,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this TickerToken to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a TokenDetails. */
  interface ITokenDetails {
    /** TokenDetails blockchainID */
    blockchainID?: Uint8Array | null;
  }

  /** Represents a TokenDetails. */
  class TokenDetails implements ITokenDetails {
    /**
     * Constructs a new TokenDetails.
     * @param [properties] Properties to set
     */
    constructor(properties?: ticker.ITokenDetails);

    /** TokenDetails blockchainID. */
    public blockchainID: Uint8Array;

    /**
     * Creates a new TokenDetails instance using the specified properties.
     * @param [properties] Properties to set
     * @returns TokenDetails instance
     */
    public static create(properties?: ticker.ITokenDetails): ticker.TokenDetails;

    /**
     * Encodes the specified TokenDetails message. Does not implicitly {@link ticker.TokenDetails.verify|verify} messages.
     * @param message TokenDetails message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ticker.ITokenDetails, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified TokenDetails message, length delimited. Does not implicitly {@link ticker.TokenDetails.verify|verify} messages.
     * @param message TokenDetails message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ticker.ITokenDetails, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a TokenDetails message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns TokenDetails
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): ticker.TokenDetails;

    /**
     * Decodes a TokenDetails message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns TokenDetails
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): ticker.TokenDetails;

    /**
     * Verifies a TokenDetails message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a TokenDetails message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns TokenDetails
     */
    public static fromObject(object: { [k: string]: any }): ticker.TokenDetails;

    /**
     * Creates a plain object from a TokenDetails message. Also converts values to other types if specified.
     * @param message TokenDetails
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: ticker.TokenDetails,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this TokenDetails to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of an IssueTokenMsg. */
  interface IIssueTokenMsg {
    /** IssueTokenMsg owner */
    owner?: Uint8Array | null;

    /** IssueTokenMsg id */
    id?: Uint8Array | null;

    /** IssueTokenMsg details */
    details?: ticker.ITokenDetails | null;

    /** IssueTokenMsg approvals */
    approvals?: nft.IActionApprovals[] | null;
  }

  /** Represents an IssueTokenMsg. */
  class IssueTokenMsg implements IIssueTokenMsg {
    /**
     * Constructs a new IssueTokenMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: ticker.IIssueTokenMsg);

    /** IssueTokenMsg owner. */
    public owner: Uint8Array;

    /** IssueTokenMsg id. */
    public id: Uint8Array;

    /** IssueTokenMsg details. */
    public details?: ticker.ITokenDetails | null;

    /** IssueTokenMsg approvals. */
    public approvals: nft.IActionApprovals[];

    /**
     * Creates a new IssueTokenMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns IssueTokenMsg instance
     */
    public static create(properties?: ticker.IIssueTokenMsg): ticker.IssueTokenMsg;

    /**
     * Encodes the specified IssueTokenMsg message. Does not implicitly {@link ticker.IssueTokenMsg.verify|verify} messages.
     * @param message IssueTokenMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ticker.IIssueTokenMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified IssueTokenMsg message, length delimited. Does not implicitly {@link ticker.IssueTokenMsg.verify|verify} messages.
     * @param message IssueTokenMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: ticker.IIssueTokenMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes an IssueTokenMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns IssueTokenMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): ticker.IssueTokenMsg;

    /**
     * Decodes an IssueTokenMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns IssueTokenMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): ticker.IssueTokenMsg;

    /**
     * Verifies an IssueTokenMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an IssueTokenMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns IssueTokenMsg
     */
    public static fromObject(object: { [k: string]: any }): ticker.IssueTokenMsg;

    /**
     * Creates a plain object from an IssueTokenMsg message. Also converts values to other types if specified.
     * @param message IssueTokenMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: ticker.IssueTokenMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this IssueTokenMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace bootstrap_node. */
export namespace bootstrap_node {
  /** Properties of a BootstrapNodeToken. */
  interface IBootstrapNodeToken {
    /** BootstrapNodeToken base */
    base?: nft.INonFungibleToken | null;

    /** BootstrapNodeToken details */
    details?: bootstrap_node.ITokenDetails | null;
  }

  /** Represents a BootstrapNodeToken. */
  class BootstrapNodeToken implements IBootstrapNodeToken {
    /**
     * Constructs a new BootstrapNodeToken.
     * @param [properties] Properties to set
     */
    constructor(properties?: bootstrap_node.IBootstrapNodeToken);

    /** BootstrapNodeToken base. */
    public base?: nft.INonFungibleToken | null;

    /** BootstrapNodeToken details. */
    public details?: bootstrap_node.ITokenDetails | null;

    /**
     * Creates a new BootstrapNodeToken instance using the specified properties.
     * @param [properties] Properties to set
     * @returns BootstrapNodeToken instance
     */
    public static create(properties?: bootstrap_node.IBootstrapNodeToken): bootstrap_node.BootstrapNodeToken;

    /**
     * Encodes the specified BootstrapNodeToken message. Does not implicitly {@link bootstrap_node.BootstrapNodeToken.verify|verify} messages.
     * @param message BootstrapNodeToken message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(
      message: bootstrap_node.IBootstrapNodeToken,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified BootstrapNodeToken message, length delimited. Does not implicitly {@link bootstrap_node.BootstrapNodeToken.verify|verify} messages.
     * @param message BootstrapNodeToken message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: bootstrap_node.IBootstrapNodeToken,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a BootstrapNodeToken message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns BootstrapNodeToken
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): bootstrap_node.BootstrapNodeToken;

    /**
     * Decodes a BootstrapNodeToken message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns BootstrapNodeToken
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): bootstrap_node.BootstrapNodeToken;

    /**
     * Verifies a BootstrapNodeToken message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a BootstrapNodeToken message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns BootstrapNodeToken
     */
    public static fromObject(object: { [k: string]: any }): bootstrap_node.BootstrapNodeToken;

    /**
     * Creates a plain object from a BootstrapNodeToken message. Also converts values to other types if specified.
     * @param message BootstrapNodeToken
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: bootstrap_node.BootstrapNodeToken,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this BootstrapNodeToken to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a TokenDetails. */
  interface ITokenDetails {
    /** TokenDetails blockchainID */
    blockchainID?: Uint8Array | null;

    /** TokenDetails uri */
    uri?: bootstrap_node.IURI | null;
  }

  /** Represents a TokenDetails. */
  class TokenDetails implements ITokenDetails {
    /**
     * Constructs a new TokenDetails.
     * @param [properties] Properties to set
     */
    constructor(properties?: bootstrap_node.ITokenDetails);

    /** TokenDetails blockchainID. */
    public blockchainID: Uint8Array;

    /** TokenDetails uri. */
    public uri?: bootstrap_node.IURI | null;

    /**
     * Creates a new TokenDetails instance using the specified properties.
     * @param [properties] Properties to set
     * @returns TokenDetails instance
     */
    public static create(properties?: bootstrap_node.ITokenDetails): bootstrap_node.TokenDetails;

    /**
     * Encodes the specified TokenDetails message. Does not implicitly {@link bootstrap_node.TokenDetails.verify|verify} messages.
     * @param message TokenDetails message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: bootstrap_node.ITokenDetails, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified TokenDetails message, length delimited. Does not implicitly {@link bootstrap_node.TokenDetails.verify|verify} messages.
     * @param message TokenDetails message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: bootstrap_node.ITokenDetails,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a TokenDetails message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns TokenDetails
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): bootstrap_node.TokenDetails;

    /**
     * Decodes a TokenDetails message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns TokenDetails
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): bootstrap_node.TokenDetails;

    /**
     * Verifies a TokenDetails message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a TokenDetails message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns TokenDetails
     */
    public static fromObject(object: { [k: string]: any }): bootstrap_node.TokenDetails;

    /**
     * Creates a plain object from a TokenDetails message. Also converts values to other types if specified.
     * @param message TokenDetails
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: bootstrap_node.TokenDetails,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this TokenDetails to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a URI. */
  interface IURI {
    /** URI host */
    host?: string | null;

    /** URI port */
    port?: number | null;

    /** URI protocol */
    protocol?: string | null;

    /** URI pubKey */
    pubKey?: string | null;
  }

  /** Represents a URI. */
  class URI implements IURI {
    /**
     * Constructs a new URI.
     * @param [properties] Properties to set
     */
    constructor(properties?: bootstrap_node.IURI);

    /** URI host. */
    public host: string;

    /** URI port. */
    public port: number;

    /** URI protocol. */
    public protocol: string;

    /** URI pubKey. */
    public pubKey: string;

    /**
     * Creates a new URI instance using the specified properties.
     * @param [properties] Properties to set
     * @returns URI instance
     */
    public static create(properties?: bootstrap_node.IURI): bootstrap_node.URI;

    /**
     * Encodes the specified URI message. Does not implicitly {@link bootstrap_node.URI.verify|verify} messages.
     * @param message URI message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: bootstrap_node.IURI, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified URI message, length delimited. Does not implicitly {@link bootstrap_node.URI.verify|verify} messages.
     * @param message URI message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: bootstrap_node.IURI, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a URI message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns URI
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): bootstrap_node.URI;

    /**
     * Decodes a URI message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns URI
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): bootstrap_node.URI;

    /**
     * Verifies a URI message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a URI message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns URI
     */
    public static fromObject(object: { [k: string]: any }): bootstrap_node.URI;

    /**
     * Creates a plain object from a URI message. Also converts values to other types if specified.
     * @param message URI
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: bootstrap_node.URI,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this URI to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of an IssueTokenMsg. */
  interface IIssueTokenMsg {
    /** IssueTokenMsg owner */
    owner?: Uint8Array | null;

    /** IssueTokenMsg id */
    id?: Uint8Array | null;

    /** IssueTokenMsg details */
    details?: bootstrap_node.ITokenDetails | null;

    /** IssueTokenMsg approvals */
    approvals?: nft.IActionApprovals[] | null;
  }

  /** Represents an IssueTokenMsg. */
  class IssueTokenMsg implements IIssueTokenMsg {
    /**
     * Constructs a new IssueTokenMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: bootstrap_node.IIssueTokenMsg);

    /** IssueTokenMsg owner. */
    public owner: Uint8Array;

    /** IssueTokenMsg id. */
    public id: Uint8Array;

    /** IssueTokenMsg details. */
    public details?: bootstrap_node.ITokenDetails | null;

    /** IssueTokenMsg approvals. */
    public approvals: nft.IActionApprovals[];

    /**
     * Creates a new IssueTokenMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns IssueTokenMsg instance
     */
    public static create(properties?: bootstrap_node.IIssueTokenMsg): bootstrap_node.IssueTokenMsg;

    /**
     * Encodes the specified IssueTokenMsg message. Does not implicitly {@link bootstrap_node.IssueTokenMsg.verify|verify} messages.
     * @param message IssueTokenMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: bootstrap_node.IIssueTokenMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified IssueTokenMsg message, length delimited. Does not implicitly {@link bootstrap_node.IssueTokenMsg.verify|verify} messages.
     * @param message IssueTokenMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: bootstrap_node.IIssueTokenMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes an IssueTokenMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns IssueTokenMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): bootstrap_node.IssueTokenMsg;

    /**
     * Decodes an IssueTokenMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns IssueTokenMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): bootstrap_node.IssueTokenMsg;

    /**
     * Verifies an IssueTokenMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an IssueTokenMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns IssueTokenMsg
     */
    public static fromObject(object: { [k: string]: any }): bootstrap_node.IssueTokenMsg;

    /**
     * Creates a plain object from an IssueTokenMsg message. Also converts values to other types if specified.
     * @param message IssueTokenMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: bootstrap_node.IssueTokenMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this IssueTokenMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace nft. */
export namespace nft {
  /** Properties of a NonFungibleToken. */
  interface INonFungibleToken {
    /** NonFungibleToken id */
    id?: Uint8Array | null;

    /** NonFungibleToken owner */
    owner?: Uint8Array | null;

    /** NonFungibleToken actionApprovals */
    actionApprovals?: nft.IActionApprovals[] | null;
  }

  /** Represents a NonFungibleToken. */
  class NonFungibleToken implements INonFungibleToken {
    /**
     * Constructs a new NonFungibleToken.
     * @param [properties] Properties to set
     */
    constructor(properties?: nft.INonFungibleToken);

    /** NonFungibleToken id. */
    public id: Uint8Array;

    /** NonFungibleToken owner. */
    public owner: Uint8Array;

    /** NonFungibleToken actionApprovals. */
    public actionApprovals: nft.IActionApprovals[];

    /**
     * Creates a new NonFungibleToken instance using the specified properties.
     * @param [properties] Properties to set
     * @returns NonFungibleToken instance
     */
    public static create(properties?: nft.INonFungibleToken): nft.NonFungibleToken;

    /**
     * Encodes the specified NonFungibleToken message. Does not implicitly {@link nft.NonFungibleToken.verify|verify} messages.
     * @param message NonFungibleToken message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: nft.INonFungibleToken, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified NonFungibleToken message, length delimited. Does not implicitly {@link nft.NonFungibleToken.verify|verify} messages.
     * @param message NonFungibleToken message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: nft.INonFungibleToken,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a NonFungibleToken message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns NonFungibleToken
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): nft.NonFungibleToken;

    /**
     * Decodes a NonFungibleToken message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns NonFungibleToken
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): nft.NonFungibleToken;

    /**
     * Verifies a NonFungibleToken message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a NonFungibleToken message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns NonFungibleToken
     */
    public static fromObject(object: { [k: string]: any }): nft.NonFungibleToken;

    /**
     * Creates a plain object from a NonFungibleToken message. Also converts values to other types if specified.
     * @param message NonFungibleToken
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: nft.NonFungibleToken,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this NonFungibleToken to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of an ActionApprovals. */
  interface IActionApprovals {
    /** ActionApprovals action */
    action?: string | null;

    /** ActionApprovals approvals */
    approvals?: nft.IApproval[] | null;
  }

  /** Represents an ActionApprovals. */
  class ActionApprovals implements IActionApprovals {
    /**
     * Constructs a new ActionApprovals.
     * @param [properties] Properties to set
     */
    constructor(properties?: nft.IActionApprovals);

    /** ActionApprovals action. */
    public action: string;

    /** ActionApprovals approvals. */
    public approvals: nft.IApproval[];

    /**
     * Creates a new ActionApprovals instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ActionApprovals instance
     */
    public static create(properties?: nft.IActionApprovals): nft.ActionApprovals;

    /**
     * Encodes the specified ActionApprovals message. Does not implicitly {@link nft.ActionApprovals.verify|verify} messages.
     * @param message ActionApprovals message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: nft.IActionApprovals, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ActionApprovals message, length delimited. Does not implicitly {@link nft.ActionApprovals.verify|verify} messages.
     * @param message ActionApprovals message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: nft.IActionApprovals, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an ActionApprovals message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ActionApprovals
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): nft.ActionApprovals;

    /**
     * Decodes an ActionApprovals message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ActionApprovals
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): nft.ActionApprovals;

    /**
     * Verifies an ActionApprovals message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an ActionApprovals message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ActionApprovals
     */
    public static fromObject(object: { [k: string]: any }): nft.ActionApprovals;

    /**
     * Creates a plain object from an ActionApprovals message. Also converts values to other types if specified.
     * @param message ActionApprovals
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: nft.ActionApprovals,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ActionApprovals to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of an Approval. */
  interface IApproval {
    /** Approval address */
    address?: Uint8Array | null;

    /** Approval options */
    options?: nft.IApprovalOptions | null;
  }

  /** Represents an Approval. */
  class Approval implements IApproval {
    /**
     * Constructs a new Approval.
     * @param [properties] Properties to set
     */
    constructor(properties?: nft.IApproval);

    /** Approval address. */
    public address: Uint8Array;

    /** Approval options. */
    public options?: nft.IApprovalOptions | null;

    /**
     * Creates a new Approval instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Approval instance
     */
    public static create(properties?: nft.IApproval): nft.Approval;

    /**
     * Encodes the specified Approval message. Does not implicitly {@link nft.Approval.verify|verify} messages.
     * @param message Approval message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: nft.IApproval, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Approval message, length delimited. Does not implicitly {@link nft.Approval.verify|verify} messages.
     * @param message Approval message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: nft.IApproval, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an Approval message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Approval
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): nft.Approval;

    /**
     * Decodes an Approval message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Approval
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): nft.Approval;

    /**
     * Verifies an Approval message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an Approval message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Approval
     */
    public static fromObject(object: { [k: string]: any }): nft.Approval;

    /**
     * Creates a plain object from an Approval message. Also converts values to other types if specified.
     * @param message Approval
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: nft.Approval,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Approval to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of an ApprovalOptions. */
  interface IApprovalOptions {
    /** ApprovalOptions untilBlockHeight */
    untilBlockHeight?: number | Long | null;

    /** ApprovalOptions count */
    count?: number | Long | null;

    /** ApprovalOptions immutable */
    immutable?: boolean | null;
  }

  /** Represents an ApprovalOptions. */
  class ApprovalOptions implements IApprovalOptions {
    /**
     * Constructs a new ApprovalOptions.
     * @param [properties] Properties to set
     */
    constructor(properties?: nft.IApprovalOptions);

    /** ApprovalOptions untilBlockHeight. */
    public untilBlockHeight: number | Long;

    /** ApprovalOptions count. */
    public count: number | Long;

    /** ApprovalOptions immutable. */
    public immutable: boolean;

    /**
     * Creates a new ApprovalOptions instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ApprovalOptions instance
     */
    public static create(properties?: nft.IApprovalOptions): nft.ApprovalOptions;

    /**
     * Encodes the specified ApprovalOptions message. Does not implicitly {@link nft.ApprovalOptions.verify|verify} messages.
     * @param message ApprovalOptions message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: nft.IApprovalOptions, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ApprovalOptions message, length delimited. Does not implicitly {@link nft.ApprovalOptions.verify|verify} messages.
     * @param message ApprovalOptions message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: nft.IApprovalOptions, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an ApprovalOptions message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ApprovalOptions
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): nft.ApprovalOptions;

    /**
     * Decodes an ApprovalOptions message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ApprovalOptions
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): nft.ApprovalOptions;

    /**
     * Verifies an ApprovalOptions message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an ApprovalOptions message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ApprovalOptions
     */
    public static fromObject(object: { [k: string]: any }): nft.ApprovalOptions;

    /**
     * Creates a plain object from an ApprovalOptions message. Also converts values to other types if specified.
     * @param message ApprovalOptions
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: nft.ApprovalOptions,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ApprovalOptions to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of an AddApprovalMsg. */
  interface IAddApprovalMsg {
    /** AddApprovalMsg id */
    id?: Uint8Array | null;

    /** AddApprovalMsg address */
    address?: Uint8Array | null;

    /** AddApprovalMsg action */
    action?: string | null;

    /** AddApprovalMsg options */
    options?: nft.IApprovalOptions | null;

    /** AddApprovalMsg t */
    t?: string | null;
  }

  /** Represents an AddApprovalMsg. */
  class AddApprovalMsg implements IAddApprovalMsg {
    /**
     * Constructs a new AddApprovalMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: nft.IAddApprovalMsg);

    /** AddApprovalMsg id. */
    public id: Uint8Array;

    /** AddApprovalMsg address. */
    public address: Uint8Array;

    /** AddApprovalMsg action. */
    public action: string;

    /** AddApprovalMsg options. */
    public options?: nft.IApprovalOptions | null;

    /** AddApprovalMsg t. */
    public t: string;

    /**
     * Creates a new AddApprovalMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns AddApprovalMsg instance
     */
    public static create(properties?: nft.IAddApprovalMsg): nft.AddApprovalMsg;

    /**
     * Encodes the specified AddApprovalMsg message. Does not implicitly {@link nft.AddApprovalMsg.verify|verify} messages.
     * @param message AddApprovalMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: nft.IAddApprovalMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified AddApprovalMsg message, length delimited. Does not implicitly {@link nft.AddApprovalMsg.verify|verify} messages.
     * @param message AddApprovalMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: nft.IAddApprovalMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an AddApprovalMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns AddApprovalMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): nft.AddApprovalMsg;

    /**
     * Decodes an AddApprovalMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns AddApprovalMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): nft.AddApprovalMsg;

    /**
     * Verifies an AddApprovalMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an AddApprovalMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns AddApprovalMsg
     */
    public static fromObject(object: { [k: string]: any }): nft.AddApprovalMsg;

    /**
     * Creates a plain object from an AddApprovalMsg message. Also converts values to other types if specified.
     * @param message AddApprovalMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: nft.AddApprovalMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this AddApprovalMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a RemoveApprovalMsg. */
  interface IRemoveApprovalMsg {
    /** RemoveApprovalMsg id */
    id?: Uint8Array | null;

    /** RemoveApprovalMsg address */
    address?: Uint8Array | null;

    /** RemoveApprovalMsg action */
    action?: string | null;

    /** RemoveApprovalMsg t */
    t?: string | null;
  }

  /** Represents a RemoveApprovalMsg. */
  class RemoveApprovalMsg implements IRemoveApprovalMsg {
    /**
     * Constructs a new RemoveApprovalMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: nft.IRemoveApprovalMsg);

    /** RemoveApprovalMsg id. */
    public id: Uint8Array;

    /** RemoveApprovalMsg address. */
    public address: Uint8Array;

    /** RemoveApprovalMsg action. */
    public action: string;

    /** RemoveApprovalMsg t. */
    public t: string;

    /**
     * Creates a new RemoveApprovalMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns RemoveApprovalMsg instance
     */
    public static create(properties?: nft.IRemoveApprovalMsg): nft.RemoveApprovalMsg;

    /**
     * Encodes the specified RemoveApprovalMsg message. Does not implicitly {@link nft.RemoveApprovalMsg.verify|verify} messages.
     * @param message RemoveApprovalMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: nft.IRemoveApprovalMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified RemoveApprovalMsg message, length delimited. Does not implicitly {@link nft.RemoveApprovalMsg.verify|verify} messages.
     * @param message RemoveApprovalMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: nft.IRemoveApprovalMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a RemoveApprovalMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns RemoveApprovalMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): nft.RemoveApprovalMsg;

    /**
     * Decodes a RemoveApprovalMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns RemoveApprovalMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): nft.RemoveApprovalMsg;

    /**
     * Verifies a RemoveApprovalMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a RemoveApprovalMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns RemoveApprovalMsg
     */
    public static fromObject(object: { [k: string]: any }): nft.RemoveApprovalMsg;

    /**
     * Creates a plain object from a RemoveApprovalMsg message. Also converts values to other types if specified.
     * @param message RemoveApprovalMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: nft.RemoveApprovalMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this RemoveApprovalMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Action enum. */
  enum Action {
    ActionUpdateDetails = 0,
    ActionTransfer = 1,
    ActionUpdateApprovals = 2,
  }
}

/** Namespace username. */
export namespace username {
  /** Properties of a UsernameToken. */
  interface IUsernameToken {
    /** UsernameToken base */
    base?: nft.INonFungibleToken | null;

    /** UsernameToken details */
    details?: username.ITokenDetails | null;
  }

  /** Represents a UsernameToken. */
  class UsernameToken implements IUsernameToken {
    /**
     * Constructs a new UsernameToken.
     * @param [properties] Properties to set
     */
    constructor(properties?: username.IUsernameToken);

    /** UsernameToken base. */
    public base?: nft.INonFungibleToken | null;

    /** UsernameToken details. */
    public details?: username.ITokenDetails | null;

    /**
     * Creates a new UsernameToken instance using the specified properties.
     * @param [properties] Properties to set
     * @returns UsernameToken instance
     */
    public static create(properties?: username.IUsernameToken): username.UsernameToken;

    /**
     * Encodes the specified UsernameToken message. Does not implicitly {@link username.UsernameToken.verify|verify} messages.
     * @param message UsernameToken message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: username.IUsernameToken, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified UsernameToken message, length delimited. Does not implicitly {@link username.UsernameToken.verify|verify} messages.
     * @param message UsernameToken message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: username.IUsernameToken,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a UsernameToken message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns UsernameToken
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): username.UsernameToken;

    /**
     * Decodes a UsernameToken message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns UsernameToken
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): username.UsernameToken;

    /**
     * Verifies a UsernameToken message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a UsernameToken message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns UsernameToken
     */
    public static fromObject(object: { [k: string]: any }): username.UsernameToken;

    /**
     * Creates a plain object from a UsernameToken message. Also converts values to other types if specified.
     * @param message UsernameToken
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: username.UsernameToken,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this UsernameToken to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a TokenDetails. */
  interface ITokenDetails {
    /** TokenDetails addresses */
    addresses?: username.IChainAddress[] | null;
  }

  /** Represents a TokenDetails. */
  class TokenDetails implements ITokenDetails {
    /**
     * Constructs a new TokenDetails.
     * @param [properties] Properties to set
     */
    constructor(properties?: username.ITokenDetails);

    /** TokenDetails addresses. */
    public addresses: username.IChainAddress[];

    /**
     * Creates a new TokenDetails instance using the specified properties.
     * @param [properties] Properties to set
     * @returns TokenDetails instance
     */
    public static create(properties?: username.ITokenDetails): username.TokenDetails;

    /**
     * Encodes the specified TokenDetails message. Does not implicitly {@link username.TokenDetails.verify|verify} messages.
     * @param message TokenDetails message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: username.ITokenDetails, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified TokenDetails message, length delimited. Does not implicitly {@link username.TokenDetails.verify|verify} messages.
     * @param message TokenDetails message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: username.ITokenDetails,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a TokenDetails message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns TokenDetails
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): username.TokenDetails;

    /**
     * Decodes a TokenDetails message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns TokenDetails
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): username.TokenDetails;

    /**
     * Verifies a TokenDetails message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a TokenDetails message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns TokenDetails
     */
    public static fromObject(object: { [k: string]: any }): username.TokenDetails;

    /**
     * Creates a plain object from a TokenDetails message. Also converts values to other types if specified.
     * @param message TokenDetails
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: username.TokenDetails,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this TokenDetails to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a ChainAddress. */
  interface IChainAddress {
    /** ChainAddress chainID */
    chainID?: Uint8Array | null;

    /** ChainAddress address */
    address?: Uint8Array | null;
  }

  /** Represents a ChainAddress. */
  class ChainAddress implements IChainAddress {
    /**
     * Constructs a new ChainAddress.
     * @param [properties] Properties to set
     */
    constructor(properties?: username.IChainAddress);

    /** ChainAddress chainID. */
    public chainID: Uint8Array;

    /** ChainAddress address. */
    public address: Uint8Array;

    /**
     * Creates a new ChainAddress instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ChainAddress instance
     */
    public static create(properties?: username.IChainAddress): username.ChainAddress;

    /**
     * Encodes the specified ChainAddress message. Does not implicitly {@link username.ChainAddress.verify|verify} messages.
     * @param message ChainAddress message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: username.IChainAddress, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ChainAddress message, length delimited. Does not implicitly {@link username.ChainAddress.verify|verify} messages.
     * @param message ChainAddress message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: username.IChainAddress,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a ChainAddress message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ChainAddress
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): username.ChainAddress;

    /**
     * Decodes a ChainAddress message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ChainAddress
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): username.ChainAddress;

    /**
     * Verifies a ChainAddress message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a ChainAddress message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ChainAddress
     */
    public static fromObject(object: { [k: string]: any }): username.ChainAddress;

    /**
     * Creates a plain object from a ChainAddress message. Also converts values to other types if specified.
     * @param message ChainAddress
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: username.ChainAddress,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ChainAddress to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of an IssueTokenMsg. */
  interface IIssueTokenMsg {
    /** IssueTokenMsg id */
    id?: Uint8Array | null;

    /** IssueTokenMsg owner */
    owner?: Uint8Array | null;

    /** IssueTokenMsg approvals */
    approvals?: nft.IActionApprovals[] | null;

    /** IssueTokenMsg details */
    details?: username.ITokenDetails | null;
  }

  /** Represents an IssueTokenMsg. */
  class IssueTokenMsg implements IIssueTokenMsg {
    /**
     * Constructs a new IssueTokenMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: username.IIssueTokenMsg);

    /** IssueTokenMsg id. */
    public id: Uint8Array;

    /** IssueTokenMsg owner. */
    public owner: Uint8Array;

    /** IssueTokenMsg approvals. */
    public approvals: nft.IActionApprovals[];

    /** IssueTokenMsg details. */
    public details?: username.ITokenDetails | null;

    /**
     * Creates a new IssueTokenMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns IssueTokenMsg instance
     */
    public static create(properties?: username.IIssueTokenMsg): username.IssueTokenMsg;

    /**
     * Encodes the specified IssueTokenMsg message. Does not implicitly {@link username.IssueTokenMsg.verify|verify} messages.
     * @param message IssueTokenMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: username.IIssueTokenMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified IssueTokenMsg message, length delimited. Does not implicitly {@link username.IssueTokenMsg.verify|verify} messages.
     * @param message IssueTokenMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: username.IIssueTokenMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes an IssueTokenMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns IssueTokenMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): username.IssueTokenMsg;

    /**
     * Decodes an IssueTokenMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns IssueTokenMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): username.IssueTokenMsg;

    /**
     * Verifies an IssueTokenMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an IssueTokenMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns IssueTokenMsg
     */
    public static fromObject(object: { [k: string]: any }): username.IssueTokenMsg;

    /**
     * Creates a plain object from an IssueTokenMsg message. Also converts values to other types if specified.
     * @param message IssueTokenMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: username.IssueTokenMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this IssueTokenMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of an AddChainAddressMsg. */
  interface IAddChainAddressMsg {
    /** AddChainAddressMsg id */
    id?: Uint8Array | null;

    /** AddChainAddressMsg chainID */
    chainID?: Uint8Array | null;

    /** AddChainAddressMsg address */
    address?: Uint8Array | null;
  }

  /** Represents an AddChainAddressMsg. */
  class AddChainAddressMsg implements IAddChainAddressMsg {
    /**
     * Constructs a new AddChainAddressMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: username.IAddChainAddressMsg);

    /** AddChainAddressMsg id. */
    public id: Uint8Array;

    /** AddChainAddressMsg chainID. */
    public chainID: Uint8Array;

    /** AddChainAddressMsg address. */
    public address: Uint8Array;

    /**
     * Creates a new AddChainAddressMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns AddChainAddressMsg instance
     */
    public static create(properties?: username.IAddChainAddressMsg): username.AddChainAddressMsg;

    /**
     * Encodes the specified AddChainAddressMsg message. Does not implicitly {@link username.AddChainAddressMsg.verify|verify} messages.
     * @param message AddChainAddressMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: username.IAddChainAddressMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified AddChainAddressMsg message, length delimited. Does not implicitly {@link username.AddChainAddressMsg.verify|verify} messages.
     * @param message AddChainAddressMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: username.IAddChainAddressMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes an AddChainAddressMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns AddChainAddressMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): username.AddChainAddressMsg;

    /**
     * Decodes an AddChainAddressMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns AddChainAddressMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): username.AddChainAddressMsg;

    /**
     * Verifies an AddChainAddressMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an AddChainAddressMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns AddChainAddressMsg
     */
    public static fromObject(object: { [k: string]: any }): username.AddChainAddressMsg;

    /**
     * Creates a plain object from an AddChainAddressMsg message. Also converts values to other types if specified.
     * @param message AddChainAddressMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: username.AddChainAddressMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this AddChainAddressMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a RemoveChainAddressMsg. */
  interface IRemoveChainAddressMsg {
    /** RemoveChainAddressMsg id */
    id?: Uint8Array | null;

    /** RemoveChainAddressMsg chainID */
    chainID?: Uint8Array | null;

    /** RemoveChainAddressMsg address */
    address?: Uint8Array | null;
  }

  /** Represents a RemoveChainAddressMsg. */
  class RemoveChainAddressMsg implements IRemoveChainAddressMsg {
    /**
     * Constructs a new RemoveChainAddressMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: username.IRemoveChainAddressMsg);

    /** RemoveChainAddressMsg id. */
    public id: Uint8Array;

    /** RemoveChainAddressMsg chainID. */
    public chainID: Uint8Array;

    /** RemoveChainAddressMsg address. */
    public address: Uint8Array;

    /**
     * Creates a new RemoveChainAddressMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns RemoveChainAddressMsg instance
     */
    public static create(properties?: username.IRemoveChainAddressMsg): username.RemoveChainAddressMsg;

    /**
     * Encodes the specified RemoveChainAddressMsg message. Does not implicitly {@link username.RemoveChainAddressMsg.verify|verify} messages.
     * @param message RemoveChainAddressMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(
      message: username.IRemoveChainAddressMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified RemoveChainAddressMsg message, length delimited. Does not implicitly {@link username.RemoveChainAddressMsg.verify|verify} messages.
     * @param message RemoveChainAddressMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: username.IRemoveChainAddressMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a RemoveChainAddressMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns RemoveChainAddressMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): username.RemoveChainAddressMsg;

    /**
     * Decodes a RemoveChainAddressMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns RemoveChainAddressMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): username.RemoveChainAddressMsg;

    /**
     * Verifies a RemoveChainAddressMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a RemoveChainAddressMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns RemoveChainAddressMsg
     */
    public static fromObject(object: { [k: string]: any }): username.RemoveChainAddressMsg;

    /**
     * Creates a plain object from a RemoveChainAddressMsg message. Also converts values to other types if specified.
     * @param message RemoveChainAddressMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: username.RemoveChainAddressMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this RemoveChainAddressMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace cash. */
export namespace cash {
  /** Properties of a Set. */
  interface ISet {
    /** Set coins */
    coins?: x.ICoin[] | null;
  }

  /** Represents a Set. */
  class Set implements ISet {
    /**
     * Constructs a new Set.
     * @param [properties] Properties to set
     */
    constructor(properties?: cash.ISet);

    /** Set coins. */
    public coins: x.ICoin[];

    /**
     * Creates a new Set instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Set instance
     */
    public static create(properties?: cash.ISet): cash.Set;

    /**
     * Encodes the specified Set message. Does not implicitly {@link cash.Set.verify|verify} messages.
     * @param message Set message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: cash.ISet, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Set message, length delimited. Does not implicitly {@link cash.Set.verify|verify} messages.
     * @param message Set message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: cash.ISet, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Set message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Set
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): cash.Set;

    /**
     * Decodes a Set message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Set
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): cash.Set;

    /**
     * Verifies a Set message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Set message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Set
     */
    public static fromObject(object: { [k: string]: any }): cash.Set;

    /**
     * Creates a plain object from a Set message. Also converts values to other types if specified.
     * @param message Set
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: cash.Set, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Set to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a SendMsg. */
  interface ISendMsg {
    /** SendMsg src */
    src?: Uint8Array | null;

    /** SendMsg dest */
    dest?: Uint8Array | null;

    /** SendMsg amount */
    amount?: x.ICoin | null;

    /** SendMsg memo */
    memo?: string | null;

    /** SendMsg ref */
    ref?: Uint8Array | null;
  }

  /** Represents a SendMsg. */
  class SendMsg implements ISendMsg {
    /**
     * Constructs a new SendMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: cash.ISendMsg);

    /** SendMsg src. */
    public src: Uint8Array;

    /** SendMsg dest. */
    public dest: Uint8Array;

    /** SendMsg amount. */
    public amount?: x.ICoin | null;

    /** SendMsg memo. */
    public memo: string;

    /** SendMsg ref. */
    public ref: Uint8Array;

    /**
     * Creates a new SendMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns SendMsg instance
     */
    public static create(properties?: cash.ISendMsg): cash.SendMsg;

    /**
     * Encodes the specified SendMsg message. Does not implicitly {@link cash.SendMsg.verify|verify} messages.
     * @param message SendMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: cash.ISendMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified SendMsg message, length delimited. Does not implicitly {@link cash.SendMsg.verify|verify} messages.
     * @param message SendMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: cash.ISendMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a SendMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns SendMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): cash.SendMsg;

    /**
     * Decodes a SendMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns SendMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): cash.SendMsg;

    /**
     * Verifies a SendMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a SendMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns SendMsg
     */
    public static fromObject(object: { [k: string]: any }): cash.SendMsg;

    /**
     * Creates a plain object from a SendMsg message. Also converts values to other types if specified.
     * @param message SendMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: cash.SendMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this SendMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a FeeInfo. */
  interface IFeeInfo {
    /** FeeInfo payer */
    payer?: Uint8Array | null;

    /** FeeInfo fees */
    fees?: x.ICoin | null;
  }

  /** Represents a FeeInfo. */
  class FeeInfo implements IFeeInfo {
    /**
     * Constructs a new FeeInfo.
     * @param [properties] Properties to set
     */
    constructor(properties?: cash.IFeeInfo);

    /** FeeInfo payer. */
    public payer: Uint8Array;

    /** FeeInfo fees. */
    public fees?: x.ICoin | null;

    /**
     * Creates a new FeeInfo instance using the specified properties.
     * @param [properties] Properties to set
     * @returns FeeInfo instance
     */
    public static create(properties?: cash.IFeeInfo): cash.FeeInfo;

    /**
     * Encodes the specified FeeInfo message. Does not implicitly {@link cash.FeeInfo.verify|verify} messages.
     * @param message FeeInfo message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: cash.IFeeInfo, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified FeeInfo message, length delimited. Does not implicitly {@link cash.FeeInfo.verify|verify} messages.
     * @param message FeeInfo message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: cash.IFeeInfo, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a FeeInfo message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns FeeInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): cash.FeeInfo;

    /**
     * Decodes a FeeInfo message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns FeeInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): cash.FeeInfo;

    /**
     * Verifies a FeeInfo message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a FeeInfo message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns FeeInfo
     */
    public static fromObject(object: { [k: string]: any }): cash.FeeInfo;

    /**
     * Creates a plain object from a FeeInfo message. Also converts values to other types if specified.
     * @param message FeeInfo
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: cash.FeeInfo,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this FeeInfo to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace multisig. */
export namespace multisig {
  /** Properties of a Contract. */
  interface IContract {
    /** Contract sigs */
    sigs?: Uint8Array[] | null;

    /** Contract activationThreshold */
    activationThreshold?: number | Long | null;

    /** Contract adminThreshold */
    adminThreshold?: number | Long | null;
  }

  /** Represents a Contract. */
  class Contract implements IContract {
    /**
     * Constructs a new Contract.
     * @param [properties] Properties to set
     */
    constructor(properties?: multisig.IContract);

    /** Contract sigs. */
    public sigs: Uint8Array[];

    /** Contract activationThreshold. */
    public activationThreshold: number | Long;

    /** Contract adminThreshold. */
    public adminThreshold: number | Long;

    /**
     * Creates a new Contract instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Contract instance
     */
    public static create(properties?: multisig.IContract): multisig.Contract;

    /**
     * Encodes the specified Contract message. Does not implicitly {@link multisig.Contract.verify|verify} messages.
     * @param message Contract message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: multisig.IContract, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Contract message, length delimited. Does not implicitly {@link multisig.Contract.verify|verify} messages.
     * @param message Contract message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: multisig.IContract, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Contract message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Contract
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): multisig.Contract;

    /**
     * Decodes a Contract message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Contract
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): multisig.Contract;

    /**
     * Verifies a Contract message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Contract message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Contract
     */
    public static fromObject(object: { [k: string]: any }): multisig.Contract;

    /**
     * Creates a plain object from a Contract message. Also converts values to other types if specified.
     * @param message Contract
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: multisig.Contract,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Contract to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a CreateContractMsg. */
  interface ICreateContractMsg {
    /** CreateContractMsg sigs */
    sigs?: Uint8Array[] | null;

    /** CreateContractMsg activationThreshold */
    activationThreshold?: number | Long | null;

    /** CreateContractMsg adminThreshold */
    adminThreshold?: number | Long | null;
  }

  /** Represents a CreateContractMsg. */
  class CreateContractMsg implements ICreateContractMsg {
    /**
     * Constructs a new CreateContractMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: multisig.ICreateContractMsg);

    /** CreateContractMsg sigs. */
    public sigs: Uint8Array[];

    /** CreateContractMsg activationThreshold. */
    public activationThreshold: number | Long;

    /** CreateContractMsg adminThreshold. */
    public adminThreshold: number | Long;

    /**
     * Creates a new CreateContractMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CreateContractMsg instance
     */
    public static create(properties?: multisig.ICreateContractMsg): multisig.CreateContractMsg;

    /**
     * Encodes the specified CreateContractMsg message. Does not implicitly {@link multisig.CreateContractMsg.verify|verify} messages.
     * @param message CreateContractMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: multisig.ICreateContractMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified CreateContractMsg message, length delimited. Does not implicitly {@link multisig.CreateContractMsg.verify|verify} messages.
     * @param message CreateContractMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: multisig.ICreateContractMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a CreateContractMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CreateContractMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): multisig.CreateContractMsg;

    /**
     * Decodes a CreateContractMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CreateContractMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): multisig.CreateContractMsg;

    /**
     * Verifies a CreateContractMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a CreateContractMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CreateContractMsg
     */
    public static fromObject(object: { [k: string]: any }): multisig.CreateContractMsg;

    /**
     * Creates a plain object from a CreateContractMsg message. Also converts values to other types if specified.
     * @param message CreateContractMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: multisig.CreateContractMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this CreateContractMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of an UpdateContractMsg. */
  interface IUpdateContractMsg {
    /** UpdateContractMsg id */
    id?: Uint8Array | null;

    /** UpdateContractMsg sigs */
    sigs?: Uint8Array[] | null;

    /** UpdateContractMsg activationThreshold */
    activationThreshold?: number | Long | null;

    /** UpdateContractMsg adminThreshold */
    adminThreshold?: number | Long | null;
  }

  /** Represents an UpdateContractMsg. */
  class UpdateContractMsg implements IUpdateContractMsg {
    /**
     * Constructs a new UpdateContractMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: multisig.IUpdateContractMsg);

    /** UpdateContractMsg id. */
    public id: Uint8Array;

    /** UpdateContractMsg sigs. */
    public sigs: Uint8Array[];

    /** UpdateContractMsg activationThreshold. */
    public activationThreshold: number | Long;

    /** UpdateContractMsg adminThreshold. */
    public adminThreshold: number | Long;

    /**
     * Creates a new UpdateContractMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns UpdateContractMsg instance
     */
    public static create(properties?: multisig.IUpdateContractMsg): multisig.UpdateContractMsg;

    /**
     * Encodes the specified UpdateContractMsg message. Does not implicitly {@link multisig.UpdateContractMsg.verify|verify} messages.
     * @param message UpdateContractMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: multisig.IUpdateContractMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified UpdateContractMsg message, length delimited. Does not implicitly {@link multisig.UpdateContractMsg.verify|verify} messages.
     * @param message UpdateContractMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: multisig.IUpdateContractMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes an UpdateContractMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns UpdateContractMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): multisig.UpdateContractMsg;

    /**
     * Decodes an UpdateContractMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns UpdateContractMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): multisig.UpdateContractMsg;

    /**
     * Verifies an UpdateContractMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an UpdateContractMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns UpdateContractMsg
     */
    public static fromObject(object: { [k: string]: any }): multisig.UpdateContractMsg;

    /**
     * Creates a plain object from an UpdateContractMsg message. Also converts values to other types if specified.
     * @param message UpdateContractMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: multisig.UpdateContractMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this UpdateContractMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace escrow. */
export namespace escrow {
  /** Properties of an Escrow. */
  interface IEscrow {
    /** Escrow sender */
    sender?: Uint8Array | null;

    /** Escrow arbiter */
    arbiter?: Uint8Array | null;

    /** Escrow recipient */
    recipient?: Uint8Array | null;

    /** Escrow amount */
    amount?: x.ICoin[] | null;

    /** Escrow timeout */
    timeout?: number | Long | null;

    /** Escrow memo */
    memo?: string | null;
  }

  /** Represents an Escrow. */
  class Escrow implements IEscrow {
    /**
     * Constructs a new Escrow.
     * @param [properties] Properties to set
     */
    constructor(properties?: escrow.IEscrow);

    /** Escrow sender. */
    public sender: Uint8Array;

    /** Escrow arbiter. */
    public arbiter: Uint8Array;

    /** Escrow recipient. */
    public recipient: Uint8Array;

    /** Escrow amount. */
    public amount: x.ICoin[];

    /** Escrow timeout. */
    public timeout: number | Long;

    /** Escrow memo. */
    public memo: string;

    /**
     * Creates a new Escrow instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Escrow instance
     */
    public static create(properties?: escrow.IEscrow): escrow.Escrow;

    /**
     * Encodes the specified Escrow message. Does not implicitly {@link escrow.Escrow.verify|verify} messages.
     * @param message Escrow message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: escrow.IEscrow, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Escrow message, length delimited. Does not implicitly {@link escrow.Escrow.verify|verify} messages.
     * @param message Escrow message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: escrow.IEscrow, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an Escrow message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Escrow
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): escrow.Escrow;

    /**
     * Decodes an Escrow message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Escrow
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): escrow.Escrow;

    /**
     * Verifies an Escrow message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an Escrow message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Escrow
     */
    public static fromObject(object: { [k: string]: any }): escrow.Escrow;

    /**
     * Creates a plain object from an Escrow message. Also converts values to other types if specified.
     * @param message Escrow
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: escrow.Escrow,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Escrow to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a CreateEscrowMsg. */
  interface ICreateEscrowMsg {
    /** CreateEscrowMsg src */
    src?: Uint8Array | null;

    /** CreateEscrowMsg arbiter */
    arbiter?: Uint8Array | null;

    /** CreateEscrowMsg recipient */
    recipient?: Uint8Array | null;

    /** CreateEscrowMsg amount */
    amount?: x.ICoin[] | null;

    /** CreateEscrowMsg timeout */
    timeout?: number | Long | null;

    /** CreateEscrowMsg memo */
    memo?: string | null;
  }

  /** Represents a CreateEscrowMsg. */
  class CreateEscrowMsg implements ICreateEscrowMsg {
    /**
     * Constructs a new CreateEscrowMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: escrow.ICreateEscrowMsg);

    /** CreateEscrowMsg src. */
    public src: Uint8Array;

    /** CreateEscrowMsg arbiter. */
    public arbiter: Uint8Array;

    /** CreateEscrowMsg recipient. */
    public recipient: Uint8Array;

    /** CreateEscrowMsg amount. */
    public amount: x.ICoin[];

    /** CreateEscrowMsg timeout. */
    public timeout: number | Long;

    /** CreateEscrowMsg memo. */
    public memo: string;

    /**
     * Creates a new CreateEscrowMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CreateEscrowMsg instance
     */
    public static create(properties?: escrow.ICreateEscrowMsg): escrow.CreateEscrowMsg;

    /**
     * Encodes the specified CreateEscrowMsg message. Does not implicitly {@link escrow.CreateEscrowMsg.verify|verify} messages.
     * @param message CreateEscrowMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: escrow.ICreateEscrowMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified CreateEscrowMsg message, length delimited. Does not implicitly {@link escrow.CreateEscrowMsg.verify|verify} messages.
     * @param message CreateEscrowMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: escrow.ICreateEscrowMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a CreateEscrowMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CreateEscrowMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): escrow.CreateEscrowMsg;

    /**
     * Decodes a CreateEscrowMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CreateEscrowMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): escrow.CreateEscrowMsg;

    /**
     * Verifies a CreateEscrowMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a CreateEscrowMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CreateEscrowMsg
     */
    public static fromObject(object: { [k: string]: any }): escrow.CreateEscrowMsg;

    /**
     * Creates a plain object from a CreateEscrowMsg message. Also converts values to other types if specified.
     * @param message CreateEscrowMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: escrow.CreateEscrowMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this CreateEscrowMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a ReleaseEscrowMsg. */
  interface IReleaseEscrowMsg {
    /** ReleaseEscrowMsg escrowId */
    escrowId?: Uint8Array | null;

    /** ReleaseEscrowMsg amount */
    amount?: x.ICoin[] | null;
  }

  /** Represents a ReleaseEscrowMsg. */
  class ReleaseEscrowMsg implements IReleaseEscrowMsg {
    /**
     * Constructs a new ReleaseEscrowMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: escrow.IReleaseEscrowMsg);

    /** ReleaseEscrowMsg escrowId. */
    public escrowId: Uint8Array;

    /** ReleaseEscrowMsg amount. */
    public amount: x.ICoin[];

    /**
     * Creates a new ReleaseEscrowMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ReleaseEscrowMsg instance
     */
    public static create(properties?: escrow.IReleaseEscrowMsg): escrow.ReleaseEscrowMsg;

    /**
     * Encodes the specified ReleaseEscrowMsg message. Does not implicitly {@link escrow.ReleaseEscrowMsg.verify|verify} messages.
     * @param message ReleaseEscrowMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: escrow.IReleaseEscrowMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ReleaseEscrowMsg message, length delimited. Does not implicitly {@link escrow.ReleaseEscrowMsg.verify|verify} messages.
     * @param message ReleaseEscrowMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: escrow.IReleaseEscrowMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a ReleaseEscrowMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ReleaseEscrowMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): escrow.ReleaseEscrowMsg;

    /**
     * Decodes a ReleaseEscrowMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ReleaseEscrowMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): escrow.ReleaseEscrowMsg;

    /**
     * Verifies a ReleaseEscrowMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a ReleaseEscrowMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ReleaseEscrowMsg
     */
    public static fromObject(object: { [k: string]: any }): escrow.ReleaseEscrowMsg;

    /**
     * Creates a plain object from a ReleaseEscrowMsg message. Also converts values to other types if specified.
     * @param message ReleaseEscrowMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: escrow.ReleaseEscrowMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ReleaseEscrowMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a ReturnEscrowMsg. */
  interface IReturnEscrowMsg {
    /** ReturnEscrowMsg escrowId */
    escrowId?: Uint8Array | null;
  }

  /** Represents a ReturnEscrowMsg. */
  class ReturnEscrowMsg implements IReturnEscrowMsg {
    /**
     * Constructs a new ReturnEscrowMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: escrow.IReturnEscrowMsg);

    /** ReturnEscrowMsg escrowId. */
    public escrowId: Uint8Array;

    /**
     * Creates a new ReturnEscrowMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ReturnEscrowMsg instance
     */
    public static create(properties?: escrow.IReturnEscrowMsg): escrow.ReturnEscrowMsg;

    /**
     * Encodes the specified ReturnEscrowMsg message. Does not implicitly {@link escrow.ReturnEscrowMsg.verify|verify} messages.
     * @param message ReturnEscrowMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: escrow.IReturnEscrowMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ReturnEscrowMsg message, length delimited. Does not implicitly {@link escrow.ReturnEscrowMsg.verify|verify} messages.
     * @param message ReturnEscrowMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: escrow.IReturnEscrowMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a ReturnEscrowMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ReturnEscrowMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): escrow.ReturnEscrowMsg;

    /**
     * Decodes a ReturnEscrowMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ReturnEscrowMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): escrow.ReturnEscrowMsg;

    /**
     * Verifies a ReturnEscrowMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a ReturnEscrowMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ReturnEscrowMsg
     */
    public static fromObject(object: { [k: string]: any }): escrow.ReturnEscrowMsg;

    /**
     * Creates a plain object from a ReturnEscrowMsg message. Also converts values to other types if specified.
     * @param message ReturnEscrowMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: escrow.ReturnEscrowMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ReturnEscrowMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of an UpdateEscrowPartiesMsg. */
  interface IUpdateEscrowPartiesMsg {
    /** UpdateEscrowPartiesMsg escrowId */
    escrowId?: Uint8Array | null;

    /** UpdateEscrowPartiesMsg sender */
    sender?: Uint8Array | null;

    /** UpdateEscrowPartiesMsg arbiter */
    arbiter?: Uint8Array | null;

    /** UpdateEscrowPartiesMsg recipient */
    recipient?: Uint8Array | null;
  }

  /** Represents an UpdateEscrowPartiesMsg. */
  class UpdateEscrowPartiesMsg implements IUpdateEscrowPartiesMsg {
    /**
     * Constructs a new UpdateEscrowPartiesMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: escrow.IUpdateEscrowPartiesMsg);

    /** UpdateEscrowPartiesMsg escrowId. */
    public escrowId: Uint8Array;

    /** UpdateEscrowPartiesMsg sender. */
    public sender: Uint8Array;

    /** UpdateEscrowPartiesMsg arbiter. */
    public arbiter: Uint8Array;

    /** UpdateEscrowPartiesMsg recipient. */
    public recipient: Uint8Array;

    /**
     * Creates a new UpdateEscrowPartiesMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns UpdateEscrowPartiesMsg instance
     */
    public static create(properties?: escrow.IUpdateEscrowPartiesMsg): escrow.UpdateEscrowPartiesMsg;

    /**
     * Encodes the specified UpdateEscrowPartiesMsg message. Does not implicitly {@link escrow.UpdateEscrowPartiesMsg.verify|verify} messages.
     * @param message UpdateEscrowPartiesMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(
      message: escrow.IUpdateEscrowPartiesMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified UpdateEscrowPartiesMsg message, length delimited. Does not implicitly {@link escrow.UpdateEscrowPartiesMsg.verify|verify} messages.
     * @param message UpdateEscrowPartiesMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: escrow.IUpdateEscrowPartiesMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes an UpdateEscrowPartiesMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns UpdateEscrowPartiesMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): escrow.UpdateEscrowPartiesMsg;

    /**
     * Decodes an UpdateEscrowPartiesMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns UpdateEscrowPartiesMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): escrow.UpdateEscrowPartiesMsg;

    /**
     * Verifies an UpdateEscrowPartiesMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an UpdateEscrowPartiesMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns UpdateEscrowPartiesMsg
     */
    public static fromObject(object: { [k: string]: any }): escrow.UpdateEscrowPartiesMsg;

    /**
     * Creates a plain object from an UpdateEscrowPartiesMsg message. Also converts values to other types if specified.
     * @param message UpdateEscrowPartiesMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: escrow.UpdateEscrowPartiesMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this UpdateEscrowPartiesMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace validators. */
export namespace validators {
  /** Properties of a ValidatorUpdate. */
  interface IValidatorUpdate {
    /** ValidatorUpdate pubkey */
    pubkey?: validators.IPubkey | null;

    /** ValidatorUpdate power */
    power?: number | Long | null;
  }

  /** Represents a ValidatorUpdate. */
  class ValidatorUpdate implements IValidatorUpdate {
    /**
     * Constructs a new ValidatorUpdate.
     * @param [properties] Properties to set
     */
    constructor(properties?: validators.IValidatorUpdate);

    /** ValidatorUpdate pubkey. */
    public pubkey?: validators.IPubkey | null;

    /** ValidatorUpdate power. */
    public power: number | Long;

    /**
     * Creates a new ValidatorUpdate instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ValidatorUpdate instance
     */
    public static create(properties?: validators.IValidatorUpdate): validators.ValidatorUpdate;

    /**
     * Encodes the specified ValidatorUpdate message. Does not implicitly {@link validators.ValidatorUpdate.verify|verify} messages.
     * @param message ValidatorUpdate message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: validators.IValidatorUpdate, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ValidatorUpdate message, length delimited. Does not implicitly {@link validators.ValidatorUpdate.verify|verify} messages.
     * @param message ValidatorUpdate message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: validators.IValidatorUpdate,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a ValidatorUpdate message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ValidatorUpdate
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): validators.ValidatorUpdate;

    /**
     * Decodes a ValidatorUpdate message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ValidatorUpdate
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): validators.ValidatorUpdate;

    /**
     * Verifies a ValidatorUpdate message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a ValidatorUpdate message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ValidatorUpdate
     */
    public static fromObject(object: { [k: string]: any }): validators.ValidatorUpdate;

    /**
     * Creates a plain object from a ValidatorUpdate message. Also converts values to other types if specified.
     * @param message ValidatorUpdate
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: validators.ValidatorUpdate,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ValidatorUpdate to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a Pubkey. */
  interface IPubkey {
    /** Pubkey type */
    type?: string | null;

    /** Pubkey data */
    data?: Uint8Array | null;
  }

  /** Represents a Pubkey. */
  class Pubkey implements IPubkey {
    /**
     * Constructs a new Pubkey.
     * @param [properties] Properties to set
     */
    constructor(properties?: validators.IPubkey);

    /** Pubkey type. */
    public type: string;

    /** Pubkey data. */
    public data: Uint8Array;

    /**
     * Creates a new Pubkey instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Pubkey instance
     */
    public static create(properties?: validators.IPubkey): validators.Pubkey;

    /**
     * Encodes the specified Pubkey message. Does not implicitly {@link validators.Pubkey.verify|verify} messages.
     * @param message Pubkey message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: validators.IPubkey, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Pubkey message, length delimited. Does not implicitly {@link validators.Pubkey.verify|verify} messages.
     * @param message Pubkey message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: validators.IPubkey, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Pubkey message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Pubkey
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): validators.Pubkey;

    /**
     * Decodes a Pubkey message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Pubkey
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): validators.Pubkey;

    /**
     * Verifies a Pubkey message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Pubkey message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Pubkey
     */
    public static fromObject(object: { [k: string]: any }): validators.Pubkey;

    /**
     * Creates a plain object from a Pubkey message. Also converts values to other types if specified.
     * @param message Pubkey
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: validators.Pubkey,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Pubkey to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a SetValidatorsMsg. */
  interface ISetValidatorsMsg {
    /** SetValidatorsMsg validatorUpdates */
    validatorUpdates?: validators.IValidatorUpdate[] | null;
  }

  /** Represents a SetValidatorsMsg. */
  class SetValidatorsMsg implements ISetValidatorsMsg {
    /**
     * Constructs a new SetValidatorsMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: validators.ISetValidatorsMsg);

    /** SetValidatorsMsg validatorUpdates. */
    public validatorUpdates: validators.IValidatorUpdate[];

    /**
     * Creates a new SetValidatorsMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns SetValidatorsMsg instance
     */
    public static create(properties?: validators.ISetValidatorsMsg): validators.SetValidatorsMsg;

    /**
     * Encodes the specified SetValidatorsMsg message. Does not implicitly {@link validators.SetValidatorsMsg.verify|verify} messages.
     * @param message SetValidatorsMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: validators.ISetValidatorsMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified SetValidatorsMsg message, length delimited. Does not implicitly {@link validators.SetValidatorsMsg.verify|verify} messages.
     * @param message SetValidatorsMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: validators.ISetValidatorsMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a SetValidatorsMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns SetValidatorsMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): validators.SetValidatorsMsg;

    /**
     * Decodes a SetValidatorsMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns SetValidatorsMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): validators.SetValidatorsMsg;

    /**
     * Verifies a SetValidatorsMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a SetValidatorsMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns SetValidatorsMsg
     */
    public static fromObject(object: { [k: string]: any }): validators.SetValidatorsMsg;

    /**
     * Creates a plain object from a SetValidatorsMsg message. Also converts values to other types if specified.
     * @param message SetValidatorsMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: validators.SetValidatorsMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this SetValidatorsMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of an Accounts. */
  interface IAccounts {
    /** Accounts addresses */
    addresses?: Uint8Array[] | null;
  }

  /** Represents an Accounts. */
  class Accounts implements IAccounts {
    /**
     * Constructs a new Accounts.
     * @param [properties] Properties to set
     */
    constructor(properties?: validators.IAccounts);

    /** Accounts addresses. */
    public addresses: Uint8Array[];

    /**
     * Creates a new Accounts instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Accounts instance
     */
    public static create(properties?: validators.IAccounts): validators.Accounts;

    /**
     * Encodes the specified Accounts message. Does not implicitly {@link validators.Accounts.verify|verify} messages.
     * @param message Accounts message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: validators.IAccounts, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Accounts message, length delimited. Does not implicitly {@link validators.Accounts.verify|verify} messages.
     * @param message Accounts message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: validators.IAccounts, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an Accounts message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Accounts
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): validators.Accounts;

    /**
     * Decodes an Accounts message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Accounts
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): validators.Accounts;

    /**
     * Verifies an Accounts message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an Accounts message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Accounts
     */
    public static fromObject(object: { [k: string]: any }): validators.Accounts;

    /**
     * Creates a plain object from an Accounts message. Also converts values to other types if specified.
     * @param message Accounts
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: validators.Accounts,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Accounts to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace x. */
export namespace x {
  /** Properties of a Coin. */
  interface ICoin {
    /** Coin whole */
    whole?: number | Long | null;

    /** Coin fractional */
    fractional?: number | Long | null;

    /** Coin ticker */
    ticker?: string | null;

    /** Coin issuer */
    issuer?: string | null;
  }

  /** Represents a Coin. */
  class Coin implements ICoin {
    /**
     * Constructs a new Coin.
     * @param [properties] Properties to set
     */
    constructor(properties?: x.ICoin);

    /** Coin whole. */
    public whole: number | Long;

    /** Coin fractional. */
    public fractional: number | Long;

    /** Coin ticker. */
    public ticker: string;

    /** Coin issuer. */
    public issuer: string;

    /**
     * Creates a new Coin instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Coin instance
     */
    public static create(properties?: x.ICoin): x.Coin;

    /**
     * Encodes the specified Coin message. Does not implicitly {@link x.Coin.verify|verify} messages.
     * @param message Coin message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: x.ICoin, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Coin message, length delimited. Does not implicitly {@link x.Coin.verify|verify} messages.
     * @param message Coin message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: x.ICoin, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Coin message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Coin
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): x.Coin;

    /**
     * Decodes a Coin message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Coin
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): x.Coin;

    /**
     * Verifies a Coin message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Coin message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Coin
     */
    public static fromObject(object: { [k: string]: any }): x.Coin;

    /**
     * Creates a plain object from a Coin message. Also converts values to other types if specified.
     * @param message Coin
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: x.Coin, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Coin to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace paychan. */
export namespace paychan {
  /** Properties of a PaymentChannel. */
  interface IPaymentChannel {
    /** PaymentChannel src */
    src?: Uint8Array | null;

    /** PaymentChannel senderPubkey */
    senderPubkey?: crypto.IPublicKey | null;

    /** PaymentChannel recipient */
    recipient?: Uint8Array | null;

    /** PaymentChannel total */
    total?: x.ICoin | null;

    /** PaymentChannel timeout */
    timeout?: number | Long | null;

    /** PaymentChannel memo */
    memo?: string | null;

    /** PaymentChannel transferred */
    transferred?: x.ICoin | null;
  }

  /** Represents a PaymentChannel. */
  class PaymentChannel implements IPaymentChannel {
    /**
     * Constructs a new PaymentChannel.
     * @param [properties] Properties to set
     */
    constructor(properties?: paychan.IPaymentChannel);

    /** PaymentChannel src. */
    public src: Uint8Array;

    /** PaymentChannel senderPubkey. */
    public senderPubkey?: crypto.IPublicKey | null;

    /** PaymentChannel recipient. */
    public recipient: Uint8Array;

    /** PaymentChannel total. */
    public total?: x.ICoin | null;

    /** PaymentChannel timeout. */
    public timeout: number | Long;

    /** PaymentChannel memo. */
    public memo: string;

    /** PaymentChannel transferred. */
    public transferred?: x.ICoin | null;

    /**
     * Creates a new PaymentChannel instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PaymentChannel instance
     */
    public static create(properties?: paychan.IPaymentChannel): paychan.PaymentChannel;

    /**
     * Encodes the specified PaymentChannel message. Does not implicitly {@link paychan.PaymentChannel.verify|verify} messages.
     * @param message PaymentChannel message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: paychan.IPaymentChannel, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PaymentChannel message, length delimited. Does not implicitly {@link paychan.PaymentChannel.verify|verify} messages.
     * @param message PaymentChannel message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: paychan.IPaymentChannel,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a PaymentChannel message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PaymentChannel
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): paychan.PaymentChannel;

    /**
     * Decodes a PaymentChannel message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PaymentChannel
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): paychan.PaymentChannel;

    /**
     * Verifies a PaymentChannel message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a PaymentChannel message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PaymentChannel
     */
    public static fromObject(object: { [k: string]: any }): paychan.PaymentChannel;

    /**
     * Creates a plain object from a PaymentChannel message. Also converts values to other types if specified.
     * @param message PaymentChannel
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: paychan.PaymentChannel,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this PaymentChannel to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a CreatePaymentChannelMsg. */
  interface ICreatePaymentChannelMsg {
    /** CreatePaymentChannelMsg src */
    src?: Uint8Array | null;

    /** CreatePaymentChannelMsg senderPubkey */
    senderPubkey?: crypto.IPublicKey | null;

    /** CreatePaymentChannelMsg recipient */
    recipient?: Uint8Array | null;

    /** CreatePaymentChannelMsg total */
    total?: x.ICoin | null;

    /** CreatePaymentChannelMsg timeout */
    timeout?: number | Long | null;

    /** CreatePaymentChannelMsg memo */
    memo?: string | null;
  }

  /** Represents a CreatePaymentChannelMsg. */
  class CreatePaymentChannelMsg implements ICreatePaymentChannelMsg {
    /**
     * Constructs a new CreatePaymentChannelMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: paychan.ICreatePaymentChannelMsg);

    /** CreatePaymentChannelMsg src. */
    public src: Uint8Array;

    /** CreatePaymentChannelMsg senderPubkey. */
    public senderPubkey?: crypto.IPublicKey | null;

    /** CreatePaymentChannelMsg recipient. */
    public recipient: Uint8Array;

    /** CreatePaymentChannelMsg total. */
    public total?: x.ICoin | null;

    /** CreatePaymentChannelMsg timeout. */
    public timeout: number | Long;

    /** CreatePaymentChannelMsg memo. */
    public memo: string;

    /**
     * Creates a new CreatePaymentChannelMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CreatePaymentChannelMsg instance
     */
    public static create(properties?: paychan.ICreatePaymentChannelMsg): paychan.CreatePaymentChannelMsg;

    /**
     * Encodes the specified CreatePaymentChannelMsg message. Does not implicitly {@link paychan.CreatePaymentChannelMsg.verify|verify} messages.
     * @param message CreatePaymentChannelMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(
      message: paychan.ICreatePaymentChannelMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified CreatePaymentChannelMsg message, length delimited. Does not implicitly {@link paychan.CreatePaymentChannelMsg.verify|verify} messages.
     * @param message CreatePaymentChannelMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: paychan.ICreatePaymentChannelMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a CreatePaymentChannelMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CreatePaymentChannelMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): paychan.CreatePaymentChannelMsg;

    /**
     * Decodes a CreatePaymentChannelMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CreatePaymentChannelMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): paychan.CreatePaymentChannelMsg;

    /**
     * Verifies a CreatePaymentChannelMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a CreatePaymentChannelMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CreatePaymentChannelMsg
     */
    public static fromObject(object: { [k: string]: any }): paychan.CreatePaymentChannelMsg;

    /**
     * Creates a plain object from a CreatePaymentChannelMsg message. Also converts values to other types if specified.
     * @param message CreatePaymentChannelMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: paychan.CreatePaymentChannelMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this CreatePaymentChannelMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a Payment. */
  interface IPayment {
    /** Payment chainId */
    chainId?: string | null;

    /** Payment channelId */
    channelId?: Uint8Array | null;

    /** Payment amount */
    amount?: x.ICoin | null;

    /** Payment memo */
    memo?: string | null;
  }

  /** Represents a Payment. */
  class Payment implements IPayment {
    /**
     * Constructs a new Payment.
     * @param [properties] Properties to set
     */
    constructor(properties?: paychan.IPayment);

    /** Payment chainId. */
    public chainId: string;

    /** Payment channelId. */
    public channelId: Uint8Array;

    /** Payment amount. */
    public amount?: x.ICoin | null;

    /** Payment memo. */
    public memo: string;

    /**
     * Creates a new Payment instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Payment instance
     */
    public static create(properties?: paychan.IPayment): paychan.Payment;

    /**
     * Encodes the specified Payment message. Does not implicitly {@link paychan.Payment.verify|verify} messages.
     * @param message Payment message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: paychan.IPayment, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Payment message, length delimited. Does not implicitly {@link paychan.Payment.verify|verify} messages.
     * @param message Payment message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: paychan.IPayment, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Payment message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Payment
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): paychan.Payment;

    /**
     * Decodes a Payment message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Payment
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): paychan.Payment;

    /**
     * Verifies a Payment message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Payment message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Payment
     */
    public static fromObject(object: { [k: string]: any }): paychan.Payment;

    /**
     * Creates a plain object from a Payment message. Also converts values to other types if specified.
     * @param message Payment
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: paychan.Payment,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Payment to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a TransferPaymentChannelMsg. */
  interface ITransferPaymentChannelMsg {
    /** TransferPaymentChannelMsg payment */
    payment?: paychan.IPayment | null;

    /** TransferPaymentChannelMsg signature */
    signature?: crypto.ISignature | null;
  }

  /** Represents a TransferPaymentChannelMsg. */
  class TransferPaymentChannelMsg implements ITransferPaymentChannelMsg {
    /**
     * Constructs a new TransferPaymentChannelMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: paychan.ITransferPaymentChannelMsg);

    /** TransferPaymentChannelMsg payment. */
    public payment?: paychan.IPayment | null;

    /** TransferPaymentChannelMsg signature. */
    public signature?: crypto.ISignature | null;

    /**
     * Creates a new TransferPaymentChannelMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns TransferPaymentChannelMsg instance
     */
    public static create(properties?: paychan.ITransferPaymentChannelMsg): paychan.TransferPaymentChannelMsg;

    /**
     * Encodes the specified TransferPaymentChannelMsg message. Does not implicitly {@link paychan.TransferPaymentChannelMsg.verify|verify} messages.
     * @param message TransferPaymentChannelMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(
      message: paychan.ITransferPaymentChannelMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified TransferPaymentChannelMsg message, length delimited. Does not implicitly {@link paychan.TransferPaymentChannelMsg.verify|verify} messages.
     * @param message TransferPaymentChannelMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: paychan.ITransferPaymentChannelMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a TransferPaymentChannelMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns TransferPaymentChannelMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): paychan.TransferPaymentChannelMsg;

    /**
     * Decodes a TransferPaymentChannelMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns TransferPaymentChannelMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): paychan.TransferPaymentChannelMsg;

    /**
     * Verifies a TransferPaymentChannelMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a TransferPaymentChannelMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns TransferPaymentChannelMsg
     */
    public static fromObject(object: { [k: string]: any }): paychan.TransferPaymentChannelMsg;

    /**
     * Creates a plain object from a TransferPaymentChannelMsg message. Also converts values to other types if specified.
     * @param message TransferPaymentChannelMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: paychan.TransferPaymentChannelMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this TransferPaymentChannelMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a ClosePaymentChannelMsg. */
  interface IClosePaymentChannelMsg {
    /** ClosePaymentChannelMsg channelId */
    channelId?: Uint8Array | null;

    /** ClosePaymentChannelMsg memo */
    memo?: string | null;
  }

  /** Represents a ClosePaymentChannelMsg. */
  class ClosePaymentChannelMsg implements IClosePaymentChannelMsg {
    /**
     * Constructs a new ClosePaymentChannelMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: paychan.IClosePaymentChannelMsg);

    /** ClosePaymentChannelMsg channelId. */
    public channelId: Uint8Array;

    /** ClosePaymentChannelMsg memo. */
    public memo: string;

    /**
     * Creates a new ClosePaymentChannelMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ClosePaymentChannelMsg instance
     */
    public static create(properties?: paychan.IClosePaymentChannelMsg): paychan.ClosePaymentChannelMsg;

    /**
     * Encodes the specified ClosePaymentChannelMsg message. Does not implicitly {@link paychan.ClosePaymentChannelMsg.verify|verify} messages.
     * @param message ClosePaymentChannelMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(
      message: paychan.IClosePaymentChannelMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified ClosePaymentChannelMsg message, length delimited. Does not implicitly {@link paychan.ClosePaymentChannelMsg.verify|verify} messages.
     * @param message ClosePaymentChannelMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: paychan.IClosePaymentChannelMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a ClosePaymentChannelMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ClosePaymentChannelMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): paychan.ClosePaymentChannelMsg;

    /**
     * Decodes a ClosePaymentChannelMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ClosePaymentChannelMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): paychan.ClosePaymentChannelMsg;

    /**
     * Verifies a ClosePaymentChannelMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a ClosePaymentChannelMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ClosePaymentChannelMsg
     */
    public static fromObject(object: { [k: string]: any }): paychan.ClosePaymentChannelMsg;

    /**
     * Creates a plain object from a ClosePaymentChannelMsg message. Also converts values to other types if specified.
     * @param message ClosePaymentChannelMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: paychan.ClosePaymentChannelMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ClosePaymentChannelMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace sigs. */
export namespace sigs {
  /** Properties of a UserData. */
  interface IUserData {
    /** UserData pubkey */
    pubkey?: crypto.IPublicKey | null;

    /** UserData sequence */
    sequence?: number | Long | null;
  }

  /** Represents a UserData. */
  class UserData implements IUserData {
    /**
     * Constructs a new UserData.
     * @param [properties] Properties to set
     */
    constructor(properties?: sigs.IUserData);

    /** UserData pubkey. */
    public pubkey?: crypto.IPublicKey | null;

    /** UserData sequence. */
    public sequence: number | Long;

    /**
     * Creates a new UserData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns UserData instance
     */
    public static create(properties?: sigs.IUserData): sigs.UserData;

    /**
     * Encodes the specified UserData message. Does not implicitly {@link sigs.UserData.verify|verify} messages.
     * @param message UserData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: sigs.IUserData, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified UserData message, length delimited. Does not implicitly {@link sigs.UserData.verify|verify} messages.
     * @param message UserData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: sigs.IUserData, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a UserData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns UserData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): sigs.UserData;

    /**
     * Decodes a UserData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns UserData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): sigs.UserData;

    /**
     * Verifies a UserData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a UserData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns UserData
     */
    public static fromObject(object: { [k: string]: any }): sigs.UserData;

    /**
     * Creates a plain object from a UserData message. Also converts values to other types if specified.
     * @param message UserData
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: sigs.UserData,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this UserData to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a StdSignature. */
  interface IStdSignature {
    /** StdSignature sequence */
    sequence?: number | Long | null;

    /** StdSignature pubkey */
    pubkey?: crypto.IPublicKey | null;

    /** StdSignature signature */
    signature?: crypto.ISignature | null;
  }

  /** Represents a StdSignature. */
  class StdSignature implements IStdSignature {
    /**
     * Constructs a new StdSignature.
     * @param [properties] Properties to set
     */
    constructor(properties?: sigs.IStdSignature);

    /** StdSignature sequence. */
    public sequence: number | Long;

    /** StdSignature pubkey. */
    public pubkey?: crypto.IPublicKey | null;

    /** StdSignature signature. */
    public signature?: crypto.ISignature | null;

    /**
     * Creates a new StdSignature instance using the specified properties.
     * @param [properties] Properties to set
     * @returns StdSignature instance
     */
    public static create(properties?: sigs.IStdSignature): sigs.StdSignature;

    /**
     * Encodes the specified StdSignature message. Does not implicitly {@link sigs.StdSignature.verify|verify} messages.
     * @param message StdSignature message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: sigs.IStdSignature, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified StdSignature message, length delimited. Does not implicitly {@link sigs.StdSignature.verify|verify} messages.
     * @param message StdSignature message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: sigs.IStdSignature, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a StdSignature message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns StdSignature
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): sigs.StdSignature;

    /**
     * Decodes a StdSignature message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns StdSignature
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): sigs.StdSignature;

    /**
     * Verifies a StdSignature message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a StdSignature message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns StdSignature
     */
    public static fromObject(object: { [k: string]: any }): sigs.StdSignature;

    /**
     * Creates a plain object from a StdSignature message. Also converts values to other types if specified.
     * @param message StdSignature
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: sigs.StdSignature,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this StdSignature to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

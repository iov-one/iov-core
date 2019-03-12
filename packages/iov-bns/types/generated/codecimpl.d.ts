import * as $protobuf from "protobufjs";
/** Namespace app. */
export namespace app {
  /** Properties of a ResultSet. */
  interface IResultSet {
    /** ResultSet results */
    results?: Uint8Array[] | null;
  }

  /** ResultSet contains a list of keys or values */
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

  /** Properties of a Tx. */
  interface ITx {
    /** Tx fees */
    fees?: cash.IFeeInfo | null;

    /** Tx signatures */
    signatures?: sigs.IStdSignature[] | null;

    /** Preimage for hashlock. */
    preimage?: Uint8Array | null;

    /** ID of a multisig contract. */
    multisig?: Uint8Array[] | null;

    /** Tx sendMsg */
    sendMsg?: cash.ISendMsg | null;

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

    /** Tx newTokenInfoMsg */
    newTokenInfoMsg?: currency.INewTokenInfoMsg | null;

    /** BatchMsg batch_msg = 60; */
    addApprovalMsg?: nft.IAddApprovalMsg | null;

    /** Tx removeApprovalMsg */
    removeApprovalMsg?: nft.IRemoveApprovalMsg | null;

    /** Tx issueUsernameNftMsg */
    issueUsernameNftMsg?: username.IIssueTokenMsg | null;

    /** Tx addUsernameAddressNftMsg */
    addUsernameAddressNftMsg?: username.IAddChainAddressMsg | null;

    /** Tx removeUsernameAddressMsg */
    removeUsernameAddressMsg?: username.IRemoveChainAddressMsg | null;

    /** Tx newRevenueMsg */
    newRevenueMsg?: distribution.INewRevenueMsg | null;

    /** Tx distributeMsg */
    distributeMsg?: distribution.IDistributeMsg | null;

    /** Tx resetRevenueMsg */
    resetRevenueMsg?: distribution.IResetRevenueMsg | null;
  }

  /** clarity). */
  class Tx implements ITx {
    /**
     * Constructs a new Tx.
     * @param [properties] Properties to set
     */
    constructor(properties?: app.ITx);

    /** Tx fees. */
    public fees?: cash.IFeeInfo | null;

    /** Tx signatures. */
    public signatures: sigs.IStdSignature[];

    /** Preimage for hashlock. */
    public preimage: Uint8Array;

    /** ID of a multisig contract. */
    public multisig: Uint8Array[];

    /** Tx sendMsg. */
    public sendMsg?: cash.ISendMsg | null;

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

    /** Tx newTokenInfoMsg. */
    public newTokenInfoMsg?: currency.INewTokenInfoMsg | null;

    /** BatchMsg batch_msg = 60; */
    public addApprovalMsg?: nft.IAddApprovalMsg | null;

    /** Tx removeApprovalMsg. */
    public removeApprovalMsg?: nft.IRemoveApprovalMsg | null;

    /** Tx issueUsernameNftMsg. */
    public issueUsernameNftMsg?: username.IIssueTokenMsg | null;

    /** Tx addUsernameAddressNftMsg. */
    public addUsernameAddressNftMsg?: username.IAddChainAddressMsg | null;

    /** Tx removeUsernameAddressMsg. */
    public removeUsernameAddressMsg?: username.IRemoveChainAddressMsg | null;

    /** Tx newRevenueMsg. */
    public newRevenueMsg?: distribution.INewRevenueMsg | null;

    /** Tx distributeMsg. */
    public distributeMsg?: distribution.IDistributeMsg | null;

    /** Tx resetRevenueMsg. */
    public resetRevenueMsg?: distribution.IResetRevenueMsg | null;

    /** msg is a sum type over all allowed messages on this chain. */
    public sum?:
      | "sendMsg"
      | "createEscrowMsg"
      | "releaseEscrowMsg"
      | "returnEscrowMsg"
      | "updateEscrowMsg"
      | "createContractMsg"
      | "updateContractMsg"
      | "setValidatorsMsg"
      | "newTokenInfoMsg"
      | "addApprovalMsg"
      | "removeApprovalMsg"
      | "issueUsernameNftMsg"
      | "addUsernameAddressNftMsg"
      | "removeUsernameAddressMsg"
      | "newRevenueMsg"
      | "distributeMsg"
      | "resetRevenueMsg";

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
    /** validating it. */
    blockchainId?: Uint8Array | null;

    /** blockchain. */
    address?: string | null;
  }

  /** ChainAddress is an address bind to a specific blockchain chain. */
  class ChainAddress implements IChainAddress {
    /**
     * Constructs a new ChainAddress.
     * @param [properties] Properties to set
     */
    constructor(properties?: username.IChainAddress);

    /** validating it. */
    public blockchainId: Uint8Array;

    /** blockchain. */
    public address: string;

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
    /** AddChainAddressMsg usernameId */
    usernameId?: Uint8Array | null;

    /** AddChainAddressMsg blockchainId */
    blockchainId?: Uint8Array | null;

    /** AddChainAddressMsg address */
    address?: string | null;
  }

  /** Represents an AddChainAddressMsg. */
  class AddChainAddressMsg implements IAddChainAddressMsg {
    /**
     * Constructs a new AddChainAddressMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: username.IAddChainAddressMsg);

    /** AddChainAddressMsg usernameId. */
    public usernameId: Uint8Array;

    /** AddChainAddressMsg blockchainId. */
    public blockchainId: Uint8Array;

    /** AddChainAddressMsg address. */
    public address: string;

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
    /** RemoveChainAddressMsg usernameId */
    usernameId?: Uint8Array | null;

    /** RemoveChainAddressMsg blockchainId */
    blockchainId?: Uint8Array | null;

    /** RemoveChainAddressMsg address */
    address?: string | null;
  }

  /** Represents a RemoveChainAddressMsg. */
  class RemoveChainAddressMsg implements IRemoveChainAddressMsg {
    /**
     * Constructs a new RemoveChainAddressMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: username.IRemoveChainAddressMsg);

    /** RemoveChainAddressMsg usernameId. */
    public usernameId: Uint8Array;

    /** RemoveChainAddressMsg blockchainId. */
    public blockchainId: Uint8Array;

    /** RemoveChainAddressMsg address. */
    public address: string;

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

/** Namespace coin. */
export namespace coin {
  /** Properties of a Coin. */
  interface ICoin {
    /** Whole coins, -10^15 < integer < 10^15 */
    whole?: number | Long | null;

    /** If fractional != 0, must have same sign as integer */
    fractional?: number | Long | null;

    /** all Coins of the same currency can be combined */
    ticker?: string | null;
  }

  /** own type, possibly borrowing from this code. */
  class Coin implements ICoin {
    /**
     * Constructs a new Coin.
     * @param [properties] Properties to set
     */
    constructor(properties?: coin.ICoin);

    /** Whole coins, -10^15 < integer < 10^15 */
    public whole: number | Long;

    /** If fractional != 0, must have same sign as integer */
    public fractional: number | Long;

    /** all Coins of the same currency can be combined */
    public ticker: string;

    /**
     * Creates a new Coin instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Coin instance
     */
    public static create(properties?: coin.ICoin): coin.Coin;

    /**
     * Encodes the specified Coin message. Does not implicitly {@link coin.Coin.verify|verify} messages.
     * @param message Coin message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: coin.ICoin, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Coin message, length delimited. Does not implicitly {@link coin.Coin.verify|verify} messages.
     * @param message Coin message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: coin.ICoin, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Coin message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Coin
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): coin.Coin;

    /**
     * Decodes a Coin message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Coin
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): coin.Coin;

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
    public static fromObject(object: { [k: string]: any }): coin.Coin;

    /**
     * Creates a plain object from a Coin message. Also converts values to other types if specified.
     * @param message Coin
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: coin.Coin, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Coin to JSON.
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

  /** MultiRef contains a list of references to pks */
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

  /** Counter could be used for sequence, but mainly just for test */
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

/** Namespace batch. */
export namespace batch {
  /** Properties of a ByteArrayList. */
  interface IByteArrayList {
    /** ByteArrayList elements */
    elements?: Uint8Array[] | null;
  }

  /** Represents a ByteArrayList. */
  class ByteArrayList implements IByteArrayList {
    /**
     * Constructs a new ByteArrayList.
     * @param [properties] Properties to set
     */
    constructor(properties?: batch.IByteArrayList);

    /** ByteArrayList elements. */
    public elements: Uint8Array[];

    /**
     * Creates a new ByteArrayList instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ByteArrayList instance
     */
    public static create(properties?: batch.IByteArrayList): batch.ByteArrayList;

    /**
     * Encodes the specified ByteArrayList message. Does not implicitly {@link batch.ByteArrayList.verify|verify} messages.
     * @param message ByteArrayList message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: batch.IByteArrayList, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ByteArrayList message, length delimited. Does not implicitly {@link batch.ByteArrayList.verify|verify} messages.
     * @param message ByteArrayList message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: batch.IByteArrayList, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ByteArrayList message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ByteArrayList
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): batch.ByteArrayList;

    /**
     * Decodes a ByteArrayList message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ByteArrayList
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): batch.ByteArrayList;

    /**
     * Verifies a ByteArrayList message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a ByteArrayList message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ByteArrayList
     */
    public static fromObject(object: { [k: string]: any }): batch.ByteArrayList;

    /**
     * Creates a plain object from a ByteArrayList message. Also converts values to other types if specified.
     * @param message ByteArrayList
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: batch.ByteArrayList,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ByteArrayList to JSON.
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
    coins?: coin.ICoin[] | null;
  }

  /** It handles adding and subtracting sets of currencies. */
  class Set implements ISet {
    /**
     * Constructs a new Set.
     * @param [properties] Properties to set
     */
    constructor(properties?: cash.ISet);

    /** Set coins. */
    public coins: coin.ICoin[];

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
    amount?: coin.ICoin | null;

    /** max length 128 character */
    memo?: string | null;

    /** max length 64 bytes */
    ref?: Uint8Array | null;
  }

  /** eg. tx hash */
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
    public amount?: coin.ICoin | null;

    /** max length 128 character */
    public memo: string;

    /** max length 64 bytes */
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
    fees?: coin.ICoin | null;
  }

  /** message processed */
  class FeeInfo implements IFeeInfo {
    /**
     * Constructs a new FeeInfo.
     * @param [properties] Properties to set
     */
    constructor(properties?: cash.IFeeInfo);

    /** FeeInfo payer. */
    public payer: Uint8Array;

    /** FeeInfo fees. */
    public fees?: coin.ICoin | null;

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

/** Namespace currency. */
export namespace currency {
  /** Properties of a TokenInfo. */
  interface ITokenInfo {
    /** TokenInfo name */
    name?: string | null;
  }

  /** alternative solution to hardcoding supported currencies information. */
  class TokenInfo implements ITokenInfo {
    /**
     * Constructs a new TokenInfo.
     * @param [properties] Properties to set
     */
    constructor(properties?: currency.ITokenInfo);

    /** TokenInfo name. */
    public name: string;

    /**
     * Creates a new TokenInfo instance using the specified properties.
     * @param [properties] Properties to set
     * @returns TokenInfo instance
     */
    public static create(properties?: currency.ITokenInfo): currency.TokenInfo;

    /**
     * Encodes the specified TokenInfo message. Does not implicitly {@link currency.TokenInfo.verify|verify} messages.
     * @param message TokenInfo message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: currency.ITokenInfo, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified TokenInfo message, length delimited. Does not implicitly {@link currency.TokenInfo.verify|verify} messages.
     * @param message TokenInfo message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: currency.ITokenInfo, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a TokenInfo message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns TokenInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): currency.TokenInfo;

    /**
     * Decodes a TokenInfo message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns TokenInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): currency.TokenInfo;

    /**
     * Verifies a TokenInfo message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a TokenInfo message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns TokenInfo
     */
    public static fromObject(object: { [k: string]: any }): currency.TokenInfo;

    /**
     * Creates a plain object from a TokenInfo message. Also converts values to other types if specified.
     * @param message TokenInfo
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: currency.TokenInfo,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this TokenInfo to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a NewTokenInfoMsg. */
  interface INewTokenInfoMsg {
    /** NewTokenInfoMsg ticker */
    ticker?: string | null;

    /** NewTokenInfoMsg name */
    name?: string | null;
  }

  /** be registered only once. */
  class NewTokenInfoMsg implements INewTokenInfoMsg {
    /**
     * Constructs a new NewTokenInfoMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: currency.INewTokenInfoMsg);

    /** NewTokenInfoMsg ticker. */
    public ticker: string;

    /** NewTokenInfoMsg name. */
    public name: string;

    /**
     * Creates a new NewTokenInfoMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns NewTokenInfoMsg instance
     */
    public static create(properties?: currency.INewTokenInfoMsg): currency.NewTokenInfoMsg;

    /**
     * Encodes the specified NewTokenInfoMsg message. Does not implicitly {@link currency.NewTokenInfoMsg.verify|verify} messages.
     * @param message NewTokenInfoMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: currency.INewTokenInfoMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified NewTokenInfoMsg message, length delimited. Does not implicitly {@link currency.NewTokenInfoMsg.verify|verify} messages.
     * @param message NewTokenInfoMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: currency.INewTokenInfoMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a NewTokenInfoMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns NewTokenInfoMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): currency.NewTokenInfoMsg;

    /**
     * Decodes a NewTokenInfoMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns NewTokenInfoMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): currency.NewTokenInfoMsg;

    /**
     * Verifies a NewTokenInfoMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a NewTokenInfoMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns NewTokenInfoMsg
     */
    public static fromObject(object: { [k: string]: any }): currency.NewTokenInfoMsg;

    /**
     * Creates a plain object from a NewTokenInfoMsg message. Also converts values to other types if specified.
     * @param message NewTokenInfoMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: currency.NewTokenInfoMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this NewTokenInfoMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace distribution. */
export namespace distribution {
  /** Properties of a Revenue. */
  interface IRevenue {
    /** While not enforced it is best to use a multisig contract here. */
    admin?: Uint8Array | null;

    /** distributed to. Must be at least one. */
    recipients?: distribution.IRecipient[] | null;
  }

  /** the owners. */
  class Revenue implements IRevenue {
    /**
     * Constructs a new Revenue.
     * @param [properties] Properties to set
     */
    constructor(properties?: distribution.IRevenue);

    /** While not enforced it is best to use a multisig contract here. */
    public admin: Uint8Array;

    /** distributed to. Must be at least one. */
    public recipients: distribution.IRecipient[];

    /**
     * Creates a new Revenue instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Revenue instance
     */
    public static create(properties?: distribution.IRevenue): distribution.Revenue;

    /**
     * Encodes the specified Revenue message. Does not implicitly {@link distribution.Revenue.verify|verify} messages.
     * @param message Revenue message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: distribution.IRevenue, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Revenue message, length delimited. Does not implicitly {@link distribution.Revenue.verify|verify} messages.
     * @param message Revenue message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: distribution.IRevenue,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a Revenue message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Revenue
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): distribution.Revenue;

    /**
     * Decodes a Revenue message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Revenue
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): distribution.Revenue;

    /**
     * Verifies a Revenue message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Revenue message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Revenue
     */
    public static fromObject(object: { [k: string]: any }): distribution.Revenue;

    /**
     * Creates a plain object from a Revenue message. Also converts values to other types if specified.
     * @param message Revenue
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: distribution.Revenue,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Revenue to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a Recipient. */
  interface IRecipient {
    /** of the validators. */
    address?: Uint8Array | null;

    /** second one. */
    weight?: number | null;
  }

  /** Represents a Recipient. */
  class Recipient implements IRecipient {
    /**
     * Constructs a new Recipient.
     * @param [properties] Properties to set
     */
    constructor(properties?: distribution.IRecipient);

    /** of the validators. */
    public address: Uint8Array;

    /** second one. */
    public weight: number;

    /**
     * Creates a new Recipient instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Recipient instance
     */
    public static create(properties?: distribution.IRecipient): distribution.Recipient;

    /**
     * Encodes the specified Recipient message. Does not implicitly {@link distribution.Recipient.verify|verify} messages.
     * @param message Recipient message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: distribution.IRecipient, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Recipient message, length delimited. Does not implicitly {@link distribution.Recipient.verify|verify} messages.
     * @param message Recipient message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: distribution.IRecipient,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a Recipient message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Recipient
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): distribution.Recipient;

    /**
     * Decodes a Recipient message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Recipient
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): distribution.Recipient;

    /**
     * Verifies a Recipient message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Recipient message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Recipient
     */
    public static fromObject(object: { [k: string]: any }): distribution.Recipient;

    /**
     * Creates a plain object from a Recipient message. Also converts values to other types if specified.
     * @param message Recipient
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: distribution.Recipient,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Recipient to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a NewRevenueMsg. */
  interface INewRevenueMsg {
    /** While not enforced it is best to use a multisig contract here. */
    admin?: Uint8Array | null;

    /** distributed to. Must be at least one. */
    recipients?: distribution.IRecipient[] | null;
  }

  /** NewRevenueMsg is issuing the creation of a new revenue stream instance. */
  class NewRevenueMsg implements INewRevenueMsg {
    /**
     * Constructs a new NewRevenueMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: distribution.INewRevenueMsg);

    /** While not enforced it is best to use a multisig contract here. */
    public admin: Uint8Array;

    /** distributed to. Must be at least one. */
    public recipients: distribution.IRecipient[];

    /**
     * Creates a new NewRevenueMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns NewRevenueMsg instance
     */
    public static create(properties?: distribution.INewRevenueMsg): distribution.NewRevenueMsg;

    /**
     * Encodes the specified NewRevenueMsg message. Does not implicitly {@link distribution.NewRevenueMsg.verify|verify} messages.
     * @param message NewRevenueMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: distribution.INewRevenueMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified NewRevenueMsg message, length delimited. Does not implicitly {@link distribution.NewRevenueMsg.verify|verify} messages.
     * @param message NewRevenueMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: distribution.INewRevenueMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a NewRevenueMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns NewRevenueMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): distribution.NewRevenueMsg;

    /**
     * Decodes a NewRevenueMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns NewRevenueMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): distribution.NewRevenueMsg;

    /**
     * Verifies a NewRevenueMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a NewRevenueMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns NewRevenueMsg
     */
    public static fromObject(object: { [k: string]: any }): distribution.NewRevenueMsg;

    /**
     * Creates a plain object from a NewRevenueMsg message. Also converts values to other types if specified.
     * @param message NewRevenueMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: distribution.NewRevenueMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this NewRevenueMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a DistributeMsg. */
  interface IDistributeMsg {
    /** should be distributed between recipients. */
    revenueId?: Uint8Array | null;
  }

  /** signed using admin key. */
  class DistributeMsg implements IDistributeMsg {
    /**
     * Constructs a new DistributeMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: distribution.IDistributeMsg);

    /** should be distributed between recipients. */
    public revenueId: Uint8Array;

    /**
     * Creates a new DistributeMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns DistributeMsg instance
     */
    public static create(properties?: distribution.IDistributeMsg): distribution.DistributeMsg;

    /**
     * Encodes the specified DistributeMsg message. Does not implicitly {@link distribution.DistributeMsg.verify|verify} messages.
     * @param message DistributeMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: distribution.IDistributeMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified DistributeMsg message, length delimited. Does not implicitly {@link distribution.DistributeMsg.verify|verify} messages.
     * @param message DistributeMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: distribution.IDistributeMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a DistributeMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns DistributeMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): distribution.DistributeMsg;

    /**
     * Decodes a DistributeMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns DistributeMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): distribution.DistributeMsg;

    /**
     * Verifies a DistributeMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a DistributeMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns DistributeMsg
     */
    public static fromObject(object: { [k: string]: any }): distribution.DistributeMsg;

    /**
     * Creates a plain object from a DistributeMsg message. Also converts values to other types if specified.
     * @param message DistributeMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: distribution.DistributeMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this DistributeMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a ResetRevenueMsg. */
  interface IResetRevenueMsg {
    /** Revenue ID reference an ID of a revenue instance that is updated. */
    revenueId?: Uint8Array | null;

    /** distributed to. Must be at least one. */
    recipients?: distribution.IRecipient[] | null;
  }

  /** collected revenue amount is equal to zero the change is applied. */
  class ResetRevenueMsg implements IResetRevenueMsg {
    /**
     * Constructs a new ResetRevenueMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: distribution.IResetRevenueMsg);

    /** Revenue ID reference an ID of a revenue instance that is updated. */
    public revenueId: Uint8Array;

    /** distributed to. Must be at least one. */
    public recipients: distribution.IRecipient[];

    /**
     * Creates a new ResetRevenueMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ResetRevenueMsg instance
     */
    public static create(properties?: distribution.IResetRevenueMsg): distribution.ResetRevenueMsg;

    /**
     * Encodes the specified ResetRevenueMsg message. Does not implicitly {@link distribution.ResetRevenueMsg.verify|verify} messages.
     * @param message ResetRevenueMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: distribution.IResetRevenueMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ResetRevenueMsg message, length delimited. Does not implicitly {@link distribution.ResetRevenueMsg.verify|verify} messages.
     * @param message ResetRevenueMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: distribution.IResetRevenueMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a ResetRevenueMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ResetRevenueMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): distribution.ResetRevenueMsg;

    /**
     * Decodes a ResetRevenueMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ResetRevenueMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): distribution.ResetRevenueMsg;

    /**
     * Verifies a ResetRevenueMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a ResetRevenueMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ResetRevenueMsg
     */
    public static fromObject(object: { [k: string]: any }): distribution.ResetRevenueMsg;

    /**
     * Creates a plain object from a ResetRevenueMsg message. Also converts values to other types if specified.
     * @param message ResetRevenueMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: distribution.ResetRevenueMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ResetRevenueMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace escrow. */
export namespace escrow {
  /** Properties of an Escrow. */
  interface IEscrow {
    /** Sender, Arbiter, Recipient are all weave.Permission */
    sender?: Uint8Array | null;

    /** Escrow arbiter */
    arbiter?: Uint8Array | null;

    /** Escrow recipient */
    recipient?: Uint8Array | null;

    /** timeout stored here is absolute block height */
    timeout?: number | Long | null;

    /** max length 128 character */
    memo?: string | null;
  }

  /** an HTLC ;) */
  class Escrow implements IEscrow {
    /**
     * Constructs a new Escrow.
     * @param [properties] Properties to set
     */
    constructor(properties?: escrow.IEscrow);

    /** Sender, Arbiter, Recipient are all weave.Permission */
    public sender: Uint8Array;

    /** Escrow arbiter. */
    public arbiter: Uint8Array;

    /** Escrow recipient. */
    public recipient: Uint8Array;

    /** timeout stored here is absolute block height */
    public timeout: number | Long;

    /** max length 128 character */
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
    /** Sender, Arbiter, Recipient are all weave.Permission */
    src?: Uint8Array | null;

    /** CreateEscrowMsg arbiter */
    arbiter?: Uint8Array | null;

    /** CreateEscrowMsg recipient */
    recipient?: Uint8Array | null;

    /** amount may contain multiple token types */
    amount?: coin.ICoin[] | null;

    /** if unreleased before timeout, will return to sender */
    timeout?: number | Long | null;

    /** max length 128 character */
    memo?: string | null;
  }

  /** The rest must be defined */
  class CreateEscrowMsg implements ICreateEscrowMsg {
    /**
     * Constructs a new CreateEscrowMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: escrow.ICreateEscrowMsg);

    /** Sender, Arbiter, Recipient are all weave.Permission */
    public src: Uint8Array;

    /** CreateEscrowMsg arbiter. */
    public arbiter: Uint8Array;

    /** CreateEscrowMsg recipient. */
    public recipient: Uint8Array;

    /** amount may contain multiple token types */
    public amount: coin.ICoin[];

    /** if unreleased before timeout, will return to sender */
    public timeout: number | Long;

    /** max length 128 character */
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
    amount?: coin.ICoin[] | null;
  }

  /** May be a subset of the current balance. */
  class ReleaseEscrowMsg implements IReleaseEscrowMsg {
    /**
     * Constructs a new ReleaseEscrowMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: escrow.IReleaseEscrowMsg);

    /** ReleaseEscrowMsg escrowId. */
    public escrowId: Uint8Array;

    /** ReleaseEscrowMsg amount. */
    public amount: coin.ICoin[];

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

  /** Must be authorized by the sender or an expired timeout */
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

  /** Represents delegating responsibility */
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

/** Namespace msgfee. */
export namespace msgfee {
  /** Properties of a MsgFee. */
  interface IMsgFee {
    /** MsgFee msgPath */
    msgPath?: string | null;

    /** MsgFee fee */
    fee?: coin.ICoin | null;
  }

  /** the message to be processed. */
  class MsgFee implements IMsgFee {
    /**
     * Constructs a new MsgFee.
     * @param [properties] Properties to set
     */
    constructor(properties?: msgfee.IMsgFee);

    /** MsgFee msgPath. */
    public msgPath: string;

    /** MsgFee fee. */
    public fee?: coin.ICoin | null;

    /**
     * Creates a new MsgFee instance using the specified properties.
     * @param [properties] Properties to set
     * @returns MsgFee instance
     */
    public static create(properties?: msgfee.IMsgFee): msgfee.MsgFee;

    /**
     * Encodes the specified MsgFee message. Does not implicitly {@link msgfee.MsgFee.verify|verify} messages.
     * @param message MsgFee message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: msgfee.IMsgFee, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified MsgFee message, length delimited. Does not implicitly {@link msgfee.MsgFee.verify|verify} messages.
     * @param message MsgFee message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: msgfee.IMsgFee, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a MsgFee message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns MsgFee
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): msgfee.MsgFee;

    /**
     * Decodes a MsgFee message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns MsgFee
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): msgfee.MsgFee;

    /**
     * Verifies a MsgFee message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a MsgFee message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns MsgFee
     */
    public static fromObject(object: { [k: string]: any }): msgfee.MsgFee;

    /**
     * Creates a plain object from a MsgFee message. Also converts values to other types if specified.
     * @param message MsgFee
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: msgfee.MsgFee,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this MsgFee to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace multisig. */
export namespace multisig {
  /** Properties of a Contract. */
  interface IContract {
    /** addresses to control it */
    sigs?: Uint8Array[] | null;

    /** threshold needed to sign to activate it */
    activationThreshold?: number | Long | null;

    /** threshold needed to sign to change it */
    adminThreshold?: number | Long | null;
  }

  /** Represents a Contract. */
  class Contract implements IContract {
    /**
     * Constructs a new Contract.
     * @param [properties] Properties to set
     */
    constructor(properties?: multisig.IContract);

    /** addresses to control it */
    public sigs: Uint8Array[];

    /** threshold needed to sign to activate it */
    public activationThreshold: number | Long;

    /** threshold needed to sign to change it */
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
    /** addresses to control it */
    sigs?: Uint8Array[] | null;

    /** threshold needed to sign to activate it */
    activationThreshold?: number | Long | null;

    /** threshold needed to sign to change it */
    adminThreshold?: number | Long | null;
  }

  /** Represents a CreateContractMsg. */
  class CreateContractMsg implements ICreateContractMsg {
    /**
     * Constructs a new CreateContractMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: multisig.ICreateContractMsg);

    /** addresses to control it */
    public sigs: Uint8Array[];

    /** threshold needed to sign to activate it */
    public activationThreshold: number | Long;

    /** threshold needed to sign to change it */
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
    /** contract id */
    id?: Uint8Array | null;

    /** addresses to control it */
    sigs?: Uint8Array[] | null;

    /** threshold needed to sign to activate it */
    activationThreshold?: number | Long | null;

    /** threshold needed to sign to change it */
    adminThreshold?: number | Long | null;
  }

  /** Represents an UpdateContractMsg. */
  class UpdateContractMsg implements IUpdateContractMsg {
    /**
     * Constructs a new UpdateContractMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: multisig.IUpdateContractMsg);

    /** contract id */
    public id: Uint8Array;

    /** addresses to control it */
    public sigs: Uint8Array[];

    /** threshold needed to sign to activate it */
    public activationThreshold: number | Long;

    /** threshold needed to sign to change it */
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

/** Namespace namecoin. */
export namespace namecoin {
  /** Properties of a Wallet. */
  interface IWallet {
    /** Wallet coins */
    coins?: coin.ICoin[] | null;

    /** Wallet name */
    name?: string | null;
  }

  /** Wallet has a name and a set of coins */
  class Wallet implements IWallet {
    /**
     * Constructs a new Wallet.
     * @param [properties] Properties to set
     */
    constructor(properties?: namecoin.IWallet);

    /** Wallet coins. */
    public coins: coin.ICoin[];

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

  /** Token contains information about a registered currency */
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

  /** and should be limited to privledged users. */
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

  /** wallet. Can only be performed if the wallet name is empty. */
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

/** Namespace nft. */
export namespace nft {
  /** Properties of a NonFungibleToken. */
  interface INonFungibleToken {
    /** ID is the address of this token. */
    id?: Uint8Array | null;

    /** Owner is the address of the token owner. */
    owner?: Uint8Array | null;

    /** succeed, all action approvals validation must pass. */
    actionApprovals?: nft.IActionApprovals[] | null;
  }

  /** implementation. Usually it is the first attirbute called `base`. */
  class NonFungibleToken implements INonFungibleToken {
    /**
     * Constructs a new NonFungibleToken.
     * @param [properties] Properties to set
     */
    constructor(properties?: nft.INonFungibleToken);

    /** ID is the address of this token. */
    public id: Uint8Array;

    /** Owner is the address of the token owner. */
    public owner: Uint8Array;

    /** succeed, all action approvals validation must pass. */
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

  /** execute given operation. */
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
    /** approval is valid. This can be used to define an approval expiration. */
    untilBlockHeight?: number | Long | null;

    /** Use -1 to bypass count expiration. */
    count?: number | Long | null;

    /** changed. */
    immutable?: boolean | null;
  }

  /** Represents an ApprovalOptions. */
  class ApprovalOptions implements IApprovalOptions {
    /**
     * Constructs a new ApprovalOptions.
     * @param [properties] Properties to set
     */
    constructor(properties?: nft.IApprovalOptions);

    /** approval is valid. This can be used to define an approval expiration. */
    public untilBlockHeight: number | Long;

    /** Use -1 to bypass count expiration. */
    public count: number | Long;

    /** changed. */
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
}

/** Namespace paychan. */
export namespace paychan {
  /** Properties of a PaymentChannel. */
  interface IPaymentChannel {
    /** Sender is the source that the founds are allocated from (weave.Address). */
    src?: Uint8Array | null;

    /** to the recipient. Signature prevents from altering transfer message. */
    senderPubkey?: crypto.IPublicKey | null;

    /** (weave.Address). */
    recipient?: Uint8Array | null;

    /** payment channel. */
    total?: coin.ICoin | null;

    /** sender. */
    timeout?: number | Long | null;

    /** Max length 128 character. */
    memo?: string | null;

    /** (total) value. Transferred must never exceed total value. */
    transferred?: coin.ICoin | null;
  }

  /** PaymentChannel holds the state of a payment channel during its lifetime. */
  class PaymentChannel implements IPaymentChannel {
    /**
     * Constructs a new PaymentChannel.
     * @param [properties] Properties to set
     */
    constructor(properties?: paychan.IPaymentChannel);

    /** Sender is the source that the founds are allocated from (weave.Address). */
    public src: Uint8Array;

    /** to the recipient. Signature prevents from altering transfer message. */
    public senderPubkey?: crypto.IPublicKey | null;

    /** (weave.Address). */
    public recipient: Uint8Array;

    /** payment channel. */
    public total?: coin.ICoin | null;

    /** sender. */
    public timeout: number | Long;

    /** Max length 128 character. */
    public memo: string;

    /** (total) value. Transferred must never exceed total value. */
    public transferred?: coin.ICoin | null;

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
    /** Sender address (weave.Address). */
    src?: Uint8Array | null;

    /** Sender public key is for validating transfer message signature. */
    senderPubkey?: crypto.IPublicKey | null;

    /** Recipient address  (weave.Address). */
    recipient?: Uint8Array | null;

    /** Maximum amount that can be transferred via this channel. */
    total?: coin.ICoin | null;

    /** anyone. */
    timeout?: number | Long | null;

    /** Max length 128 character. */
    memo?: string | null;
  }

  /** in the transactions done via created payment channel. */
  class CreatePaymentChannelMsg implements ICreatePaymentChannelMsg {
    /**
     * Constructs a new CreatePaymentChannelMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: paychan.ICreatePaymentChannelMsg);

    /** Sender address (weave.Address). */
    public src: Uint8Array;

    /** Sender public key is for validating transfer message signature. */
    public senderPubkey?: crypto.IPublicKey | null;

    /** Recipient address  (weave.Address). */
    public recipient: Uint8Array;

    /** Maximum amount that can be transferred via this channel. */
    public total?: coin.ICoin | null;

    /** anyone. */
    public timeout: number | Long;

    /** Max length 128 character. */
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
    amount?: coin.ICoin | null;

    /** Max length 128 character. */
    memo?: string | null;
  }

  /** Each Payment should be created with amount greater than the previous one. */
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
    public amount?: coin.ICoin | null;

    /** Max length 128 character. */
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

  /** Signature is there to ensure that payment message was not altered. */
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

    /** Max length 128 character. */
    memo?: string | null;
  }

  /** Sender can close channel only if the timeout chain height was reached. */
  class ClosePaymentChannelMsg implements IClosePaymentChannelMsg {
    /**
     * Constructs a new ClosePaymentChannelMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: paychan.IClosePaymentChannelMsg);

    /** ClosePaymentChannelMsg channelId. */
    public channelId: Uint8Array;

    /** Max length 128 character. */
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

  /** User is the entry point you want */
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

    /** Removed Address, Pubkey is more powerful */
    signature?: crypto.ISignature | null;
  }

  /** increasing by 1 each time (starting at 0) */
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

    /** Removed Address, Pubkey is more powerful */
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

/** Namespace validators. */
export namespace validators {
  /** Properties of a ValidatorUpdate. */
  interface IValidatorUpdate {
    /** ValidatorUpdate pubkey */
    pubkey?: validators.IPubkey | null;

    /** ValidatorUpdate power */
    power?: number | Long | null;
  }

  /** ValidatorUpdate */
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

  /** This message is designed to update validator power */
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

  /** Accounts is a list of accounts allowed to update validators */
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

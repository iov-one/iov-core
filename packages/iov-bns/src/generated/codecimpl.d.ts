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
}

/** Namespace bnsd. */
export namespace bnsd {
  /** Properties of a Tx. */
  interface ITx {
    /** Tx fees */
    fees?: cash.IFeeInfo | null;

    /** Tx signatures */
    signatures?: sigs.IStdSignature[] | null;

    /** ID of a multisig contract. */
    multisig?: Uint8Array[] | null;

    /** Tx cashSendMsg */
    cashSendMsg?: cash.ISendMsg | null;

    /** Tx escrowCreateMsg */
    escrowCreateMsg?: escrow.ICreateMsg | null;

    /** Tx escrowReleaseMsg */
    escrowReleaseMsg?: escrow.IReleaseMsg | null;

    /** Tx escrowReturnMsg */
    escrowReturnMsg?: escrow.IReturnMsg | null;

    /** Tx escrowUpdatePartiesMsg */
    escrowUpdatePartiesMsg?: escrow.IUpdatePartiesMsg | null;

    /** Tx multisigCreateMsg */
    multisigCreateMsg?: multisig.ICreateMsg | null;

    /** Tx multisigUpdateMsg */
    multisigUpdateMsg?: multisig.IUpdateMsg | null;

    /** Tx validatorsApplyDiffMsg */
    validatorsApplyDiffMsg?: validators.IApplyDiffMsg | null;

    /** Tx currencyCreateMsg */
    currencyCreateMsg?: currency.ICreateMsg | null;

    /** Tx executeBatchMsg */
    executeBatchMsg?: bnsd.IExecuteBatchMsg | null;

    /** Tx usernameRegisterTokenMsg */
    usernameRegisterTokenMsg?: username.IRegisterTokenMsg | null;

    /** Tx usernameTransferTokenMsg */
    usernameTransferTokenMsg?: username.ITransferTokenMsg | null;

    /** Tx usernameChangeTokenTargetsMsg */
    usernameChangeTokenTargetsMsg?: username.IChangeTokenTargetsMsg | null;

    /** Tx distributionCreateMsg */
    distributionCreateMsg?: distribution.ICreateMsg | null;

    /** Tx distributionMsg */
    distributionMsg?: distribution.IDistributeMsg | null;

    /** Tx distributionResetMsg */
    distributionResetMsg?: distribution.IResetMsg | null;

    /** Tx migrationUpgradeSchemaMsg */
    migrationUpgradeSchemaMsg?: migration.IUpgradeSchemaMsg | null;

    /** Tx aswapCreateMsg */
    aswapCreateMsg?: aswap.ICreateMsg | null;

    /** Tx aswapReleaseMsg */
    aswapReleaseMsg?: aswap.IReleaseMsg | null;

    /** Tx aswapReturnMsg */
    aswapReturnMsg?: aswap.IReturnMsg | null;

    /** Tx govCreateProposalMsg */
    govCreateProposalMsg?: gov.ICreateProposalMsg | null;

    /** Tx govDeleteProposalMsg */
    govDeleteProposalMsg?: gov.IDeleteProposalMsg | null;

    /** Tx govVoteMsg */
    govVoteMsg?: gov.IVoteMsg | null;

    /** gov.TallyMsg gov_tally_msg = 76; */
    govUpdateElectorateMsg?: gov.IUpdateElectorateMsg | null;

    /** Tx govUpdateElectionRuleMsg */
    govUpdateElectionRuleMsg?: gov.IUpdateElectionRuleMsg | null;
  }

  /** old fields got deprecated. This is done to maintain binary compatibility. */
  class Tx implements ITx {
    /**
     * Constructs a new Tx.
     * @param [properties] Properties to set
     */
    constructor(properties?: bnsd.ITx);

    /** Tx fees. */
    public fees?: cash.IFeeInfo | null;

    /** Tx signatures. */
    public signatures: sigs.IStdSignature[];

    /** ID of a multisig contract. */
    public multisig: Uint8Array[];

    /** Tx cashSendMsg. */
    public cashSendMsg?: cash.ISendMsg | null;

    /** Tx escrowCreateMsg. */
    public escrowCreateMsg?: escrow.ICreateMsg | null;

    /** Tx escrowReleaseMsg. */
    public escrowReleaseMsg?: escrow.IReleaseMsg | null;

    /** Tx escrowReturnMsg. */
    public escrowReturnMsg?: escrow.IReturnMsg | null;

    /** Tx escrowUpdatePartiesMsg. */
    public escrowUpdatePartiesMsg?: escrow.IUpdatePartiesMsg | null;

    /** Tx multisigCreateMsg. */
    public multisigCreateMsg?: multisig.ICreateMsg | null;

    /** Tx multisigUpdateMsg. */
    public multisigUpdateMsg?: multisig.IUpdateMsg | null;

    /** Tx validatorsApplyDiffMsg. */
    public validatorsApplyDiffMsg?: validators.IApplyDiffMsg | null;

    /** Tx currencyCreateMsg. */
    public currencyCreateMsg?: currency.ICreateMsg | null;

    /** Tx executeBatchMsg. */
    public executeBatchMsg?: bnsd.IExecuteBatchMsg | null;

    /** Tx usernameRegisterTokenMsg. */
    public usernameRegisterTokenMsg?: username.IRegisterTokenMsg | null;

    /** Tx usernameTransferTokenMsg. */
    public usernameTransferTokenMsg?: username.ITransferTokenMsg | null;

    /** Tx usernameChangeTokenTargetsMsg. */
    public usernameChangeTokenTargetsMsg?: username.IChangeTokenTargetsMsg | null;

    /** Tx distributionCreateMsg. */
    public distributionCreateMsg?: distribution.ICreateMsg | null;

    /** Tx distributionMsg. */
    public distributionMsg?: distribution.IDistributeMsg | null;

    /** Tx distributionResetMsg. */
    public distributionResetMsg?: distribution.IResetMsg | null;

    /** Tx migrationUpgradeSchemaMsg. */
    public migrationUpgradeSchemaMsg?: migration.IUpgradeSchemaMsg | null;

    /** Tx aswapCreateMsg. */
    public aswapCreateMsg?: aswap.ICreateMsg | null;

    /** Tx aswapReleaseMsg. */
    public aswapReleaseMsg?: aswap.IReleaseMsg | null;

    /** Tx aswapReturnMsg. */
    public aswapReturnMsg?: aswap.IReturnMsg | null;

    /** Tx govCreateProposalMsg. */
    public govCreateProposalMsg?: gov.ICreateProposalMsg | null;

    /** Tx govDeleteProposalMsg. */
    public govDeleteProposalMsg?: gov.IDeleteProposalMsg | null;

    /** Tx govVoteMsg. */
    public govVoteMsg?: gov.IVoteMsg | null;

    /** gov.TallyMsg gov_tally_msg = 76; */
    public govUpdateElectorateMsg?: gov.IUpdateElectorateMsg | null;

    /** Tx govUpdateElectionRuleMsg. */
    public govUpdateElectionRuleMsg?: gov.IUpdateElectionRuleMsg | null;

    /** msg is a sum type over all allowed messages on this chain. */
    public sum?:
      | "cashSendMsg"
      | "escrowCreateMsg"
      | "escrowReleaseMsg"
      | "escrowReturnMsg"
      | "escrowUpdatePartiesMsg"
      | "multisigCreateMsg"
      | "multisigUpdateMsg"
      | "validatorsApplyDiffMsg"
      | "currencyCreateMsg"
      | "executeBatchMsg"
      | "usernameRegisterTokenMsg"
      | "usernameTransferTokenMsg"
      | "usernameChangeTokenTargetsMsg"
      | "distributionCreateMsg"
      | "distributionMsg"
      | "distributionResetMsg"
      | "migrationUpgradeSchemaMsg"
      | "aswapCreateMsg"
      | "aswapReleaseMsg"
      | "aswapReturnMsg"
      | "govCreateProposalMsg"
      | "govDeleteProposalMsg"
      | "govVoteMsg"
      | "govUpdateElectorateMsg"
      | "govUpdateElectionRuleMsg";

    /**
     * Creates a new Tx instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Tx instance
     */
    public static create(properties?: bnsd.ITx): bnsd.Tx;

    /**
     * Encodes the specified Tx message. Does not implicitly {@link bnsd.Tx.verify|verify} messages.
     * @param message Tx message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: bnsd.ITx, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Tx message, length delimited. Does not implicitly {@link bnsd.Tx.verify|verify} messages.
     * @param message Tx message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: bnsd.ITx, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Tx message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Tx
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): bnsd.Tx;

    /**
     * Decodes a Tx message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Tx
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): bnsd.Tx;

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
    public static fromObject(object: { [k: string]: any }): bnsd.Tx;

    /**
     * Creates a plain object from a Tx message. Also converts values to other types if specified.
     * @param message Tx
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: bnsd.Tx, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Tx to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of an ExecuteBatchMsg. */
  interface IExecuteBatchMsg {
    /** ExecuteBatchMsg messages */
    messages?: bnsd.ExecuteBatchMsg.IUnion[] | null;
  }

  /** ExecuteBatchMsg encapsulates multiple messages to support batch transaction */
  class ExecuteBatchMsg implements IExecuteBatchMsg {
    /**
     * Constructs a new ExecuteBatchMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: bnsd.IExecuteBatchMsg);

    /** ExecuteBatchMsg messages. */
    public messages: bnsd.ExecuteBatchMsg.IUnion[];

    /**
     * Creates a new ExecuteBatchMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ExecuteBatchMsg instance
     */
    public static create(properties?: bnsd.IExecuteBatchMsg): bnsd.ExecuteBatchMsg;

    /**
     * Encodes the specified ExecuteBatchMsg message. Does not implicitly {@link bnsd.ExecuteBatchMsg.verify|verify} messages.
     * @param message ExecuteBatchMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: bnsd.IExecuteBatchMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ExecuteBatchMsg message, length delimited. Does not implicitly {@link bnsd.ExecuteBatchMsg.verify|verify} messages.
     * @param message ExecuteBatchMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: bnsd.IExecuteBatchMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes an ExecuteBatchMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ExecuteBatchMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): bnsd.ExecuteBatchMsg;

    /**
     * Decodes an ExecuteBatchMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ExecuteBatchMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): bnsd.ExecuteBatchMsg;

    /**
     * Verifies an ExecuteBatchMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an ExecuteBatchMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ExecuteBatchMsg
     */
    public static fromObject(object: { [k: string]: any }): bnsd.ExecuteBatchMsg;

    /**
     * Creates a plain object from an ExecuteBatchMsg message. Also converts values to other types if specified.
     * @param message ExecuteBatchMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: bnsd.ExecuteBatchMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ExecuteBatchMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  namespace ExecuteBatchMsg {
    /** Properties of an Union. */
    interface IUnion {
      /** Union cashSendMsg */
      cashSendMsg?: cash.ISendMsg | null;

      /** Union escrowCreateMsg */
      escrowCreateMsg?: escrow.ICreateMsg | null;

      /** Union escrowReleaseMsg */
      escrowReleaseMsg?: escrow.IReleaseMsg | null;

      /** Union escrowReturnMsg */
      escrowReturnMsg?: escrow.IReturnMsg | null;

      /** Union escrowUpdatePartiesMsg */
      escrowUpdatePartiesMsg?: escrow.IUpdatePartiesMsg | null;

      /** Union multisigCreateMsg */
      multisigCreateMsg?: multisig.ICreateMsg | null;

      /** Union multisigUpdateMsg */
      multisigUpdateMsg?: multisig.IUpdateMsg | null;

      /** Union validatorsApplyDiffMsg */
      validatorsApplyDiffMsg?: validators.IApplyDiffMsg | null;

      /** Union currencyCreateMsg */
      currencyCreateMsg?: currency.ICreateMsg | null;

      /** No recursive batches! */
      usernameRegisterTokenMsg?: username.IRegisterTokenMsg | null;

      /** Union usernameTransferTokenMsg */
      usernameTransferTokenMsg?: username.ITransferTokenMsg | null;

      /** Union usernameChangeTokenTargetsMsg */
      usernameChangeTokenTargetsMsg?: username.IChangeTokenTargetsMsg | null;

      /** Union distributionCreateMsg */
      distributionCreateMsg?: distribution.ICreateMsg | null;

      /** Union distributionMsg */
      distributionMsg?: distribution.IDistributeMsg | null;

      /** Union distributionResetMsg */
      distributionResetMsg?: distribution.IResetMsg | null;
    }

    /** Represents an Union. */
    class Union implements IUnion {
      /**
       * Constructs a new Union.
       * @param [properties] Properties to set
       */
      constructor(properties?: bnsd.ExecuteBatchMsg.IUnion);

      /** Union cashSendMsg. */
      public cashSendMsg?: cash.ISendMsg | null;

      /** Union escrowCreateMsg. */
      public escrowCreateMsg?: escrow.ICreateMsg | null;

      /** Union escrowReleaseMsg. */
      public escrowReleaseMsg?: escrow.IReleaseMsg | null;

      /** Union escrowReturnMsg. */
      public escrowReturnMsg?: escrow.IReturnMsg | null;

      /** Union escrowUpdatePartiesMsg. */
      public escrowUpdatePartiesMsg?: escrow.IUpdatePartiesMsg | null;

      /** Union multisigCreateMsg. */
      public multisigCreateMsg?: multisig.ICreateMsg | null;

      /** Union multisigUpdateMsg. */
      public multisigUpdateMsg?: multisig.IUpdateMsg | null;

      /** Union validatorsApplyDiffMsg. */
      public validatorsApplyDiffMsg?: validators.IApplyDiffMsg | null;

      /** Union currencyCreateMsg. */
      public currencyCreateMsg?: currency.ICreateMsg | null;

      /** No recursive batches! */
      public usernameRegisterTokenMsg?: username.IRegisterTokenMsg | null;

      /** Union usernameTransferTokenMsg. */
      public usernameTransferTokenMsg?: username.ITransferTokenMsg | null;

      /** Union usernameChangeTokenTargetsMsg. */
      public usernameChangeTokenTargetsMsg?: username.IChangeTokenTargetsMsg | null;

      /** Union distributionCreateMsg. */
      public distributionCreateMsg?: distribution.ICreateMsg | null;

      /** Union distributionMsg. */
      public distributionMsg?: distribution.IDistributeMsg | null;

      /** Union distributionResetMsg. */
      public distributionResetMsg?: distribution.IResetMsg | null;

      /** Union sum. */
      public sum?:
        | "cashSendMsg"
        | "escrowCreateMsg"
        | "escrowReleaseMsg"
        | "escrowReturnMsg"
        | "escrowUpdatePartiesMsg"
        | "multisigCreateMsg"
        | "multisigUpdateMsg"
        | "validatorsApplyDiffMsg"
        | "currencyCreateMsg"
        | "usernameRegisterTokenMsg"
        | "usernameTransferTokenMsg"
        | "usernameChangeTokenTargetsMsg"
        | "distributionCreateMsg"
        | "distributionMsg"
        | "distributionResetMsg";

      /**
       * Creates a new Union instance using the specified properties.
       * @param [properties] Properties to set
       * @returns Union instance
       */
      public static create(properties?: bnsd.ExecuteBatchMsg.IUnion): bnsd.ExecuteBatchMsg.Union;

      /**
       * Encodes the specified Union message. Does not implicitly {@link bnsd.ExecuteBatchMsg.Union.verify|verify} messages.
       * @param message Union message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(message: bnsd.ExecuteBatchMsg.IUnion, writer?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Encodes the specified Union message, length delimited. Does not implicitly {@link bnsd.ExecuteBatchMsg.Union.verify|verify} messages.
       * @param message Union message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: bnsd.ExecuteBatchMsg.IUnion,
        writer?: $protobuf.Writer,
      ): $protobuf.Writer;

      /**
       * Decodes an Union message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns Union
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number,
      ): bnsd.ExecuteBatchMsg.Union;

      /**
       * Decodes an Union message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns Union
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): bnsd.ExecuteBatchMsg.Union;

      /**
       * Verifies an Union message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates an Union message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns Union
       */
      public static fromObject(object: { [k: string]: any }): bnsd.ExecuteBatchMsg.Union;

      /**
       * Creates a plain object from an Union message. Also converts values to other types if specified.
       * @param message Union
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: bnsd.ExecuteBatchMsg.Union,
        options?: $protobuf.IConversionOptions,
      ): { [k: string]: any };

      /**
       * Converts this Union to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }
  }

  /** Properties of a ProposalOptions. */
  interface IProposalOptions {
    /** ProposalOptions cashSendMsg */
    cashSendMsg?: cash.ISendMsg | null;

    /** ProposalOptions escrowReleaseMsg */
    escrowReleaseMsg?: escrow.IReleaseMsg | null;

    /** ProposalOptions updateEscrowPartiesMsg */
    updateEscrowPartiesMsg?: escrow.IUpdatePartiesMsg | null;

    /** ProposalOptions multisigUpdateMsg */
    multisigUpdateMsg?: multisig.IUpdateMsg | null;

    /** ProposalOptions validatorsApplyDiffMsg */
    validatorsApplyDiffMsg?: validators.IApplyDiffMsg | null;

    /** ProposalOptions currencyCreateMsg */
    currencyCreateMsg?: currency.ICreateMsg | null;

    /** ProposalOptions executeProposalBatchMsg */
    executeProposalBatchMsg?: bnsd.IExecuteProposalBatchMsg | null;

    /** ProposalOptions usernameRegisterTokenMsg */
    usernameRegisterTokenMsg?: username.IRegisterTokenMsg | null;

    /** ProposalOptions usernameTransferTokenMsg */
    usernameTransferTokenMsg?: username.ITransferTokenMsg | null;

    /** ProposalOptions usernameChangeTokenTargetsMsg */
    usernameChangeTokenTargetsMsg?: username.IChangeTokenTargetsMsg | null;

    /** ProposalOptions distributionCreateMsg */
    distributionCreateMsg?: distribution.ICreateMsg | null;

    /** ProposalOptions distributionMsg */
    distributionMsg?: distribution.IDistributeMsg | null;

    /** ProposalOptions distributionResetMsg */
    distributionResetMsg?: distribution.IResetMsg | null;

    /** ProposalOptions migrationUpgradeSchemaMsg */
    migrationUpgradeSchemaMsg?: migration.IUpgradeSchemaMsg | null;

    /** ProposalOptions govUpdateElectorateMsg */
    govUpdateElectorateMsg?: gov.IUpdateElectorateMsg | null;

    /** ProposalOptions govUpdateElectionRuleMsg */
    govUpdateElectionRuleMsg?: gov.IUpdateElectionRuleMsg | null;

    /** ProposalOptions govCreateTextResolutionMsg */
    govCreateTextResolutionMsg?: gov.ICreateTextResolutionMsg | null;
  }

  /** Trimmed down somewhat arbitrary to what is believed to be reasonable */
  class ProposalOptions implements IProposalOptions {
    /**
     * Constructs a new ProposalOptions.
     * @param [properties] Properties to set
     */
    constructor(properties?: bnsd.IProposalOptions);

    /** ProposalOptions cashSendMsg. */
    public cashSendMsg?: cash.ISendMsg | null;

    /** ProposalOptions escrowReleaseMsg. */
    public escrowReleaseMsg?: escrow.IReleaseMsg | null;

    /** ProposalOptions updateEscrowPartiesMsg. */
    public updateEscrowPartiesMsg?: escrow.IUpdatePartiesMsg | null;

    /** ProposalOptions multisigUpdateMsg. */
    public multisigUpdateMsg?: multisig.IUpdateMsg | null;

    /** ProposalOptions validatorsApplyDiffMsg. */
    public validatorsApplyDiffMsg?: validators.IApplyDiffMsg | null;

    /** ProposalOptions currencyCreateMsg. */
    public currencyCreateMsg?: currency.ICreateMsg | null;

    /** ProposalOptions executeProposalBatchMsg. */
    public executeProposalBatchMsg?: bnsd.IExecuteProposalBatchMsg | null;

    /** ProposalOptions usernameRegisterTokenMsg. */
    public usernameRegisterTokenMsg?: username.IRegisterTokenMsg | null;

    /** ProposalOptions usernameTransferTokenMsg. */
    public usernameTransferTokenMsg?: username.ITransferTokenMsg | null;

    /** ProposalOptions usernameChangeTokenTargetsMsg. */
    public usernameChangeTokenTargetsMsg?: username.IChangeTokenTargetsMsg | null;

    /** ProposalOptions distributionCreateMsg. */
    public distributionCreateMsg?: distribution.ICreateMsg | null;

    /** ProposalOptions distributionMsg. */
    public distributionMsg?: distribution.IDistributeMsg | null;

    /** ProposalOptions distributionResetMsg. */
    public distributionResetMsg?: distribution.IResetMsg | null;

    /** ProposalOptions migrationUpgradeSchemaMsg. */
    public migrationUpgradeSchemaMsg?: migration.IUpgradeSchemaMsg | null;

    /** ProposalOptions govUpdateElectorateMsg. */
    public govUpdateElectorateMsg?: gov.IUpdateElectorateMsg | null;

    /** ProposalOptions govUpdateElectionRuleMsg. */
    public govUpdateElectionRuleMsg?: gov.IUpdateElectionRuleMsg | null;

    /** ProposalOptions govCreateTextResolutionMsg. */
    public govCreateTextResolutionMsg?: gov.ICreateTextResolutionMsg | null;

    /** ProposalOptions option. */
    public option?:
      | "cashSendMsg"
      | "escrowReleaseMsg"
      | "updateEscrowPartiesMsg"
      | "multisigUpdateMsg"
      | "validatorsApplyDiffMsg"
      | "currencyCreateMsg"
      | "executeProposalBatchMsg"
      | "usernameRegisterTokenMsg"
      | "usernameTransferTokenMsg"
      | "usernameChangeTokenTargetsMsg"
      | "distributionCreateMsg"
      | "distributionMsg"
      | "distributionResetMsg"
      | "migrationUpgradeSchemaMsg"
      | "govUpdateElectorateMsg"
      | "govUpdateElectionRuleMsg"
      | "govCreateTextResolutionMsg";

    /**
     * Creates a new ProposalOptions instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ProposalOptions instance
     */
    public static create(properties?: bnsd.IProposalOptions): bnsd.ProposalOptions;

    /**
     * Encodes the specified ProposalOptions message. Does not implicitly {@link bnsd.ProposalOptions.verify|verify} messages.
     * @param message ProposalOptions message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: bnsd.IProposalOptions, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ProposalOptions message, length delimited. Does not implicitly {@link bnsd.ProposalOptions.verify|verify} messages.
     * @param message ProposalOptions message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: bnsd.IProposalOptions,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a ProposalOptions message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ProposalOptions
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): bnsd.ProposalOptions;

    /**
     * Decodes a ProposalOptions message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ProposalOptions
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): bnsd.ProposalOptions;

    /**
     * Verifies a ProposalOptions message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a ProposalOptions message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ProposalOptions
     */
    public static fromObject(object: { [k: string]: any }): bnsd.ProposalOptions;

    /**
     * Creates a plain object from a ProposalOptions message. Also converts values to other types if specified.
     * @param message ProposalOptions
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: bnsd.ProposalOptions,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ProposalOptions to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of an ExecuteProposalBatchMsg. */
  interface IExecuteProposalBatchMsg {
    /** ExecuteProposalBatchMsg messages */
    messages?: bnsd.ExecuteProposalBatchMsg.IUnion[] | null;
  }

  /** Represents an ExecuteProposalBatchMsg. */
  class ExecuteProposalBatchMsg implements IExecuteProposalBatchMsg {
    /**
     * Constructs a new ExecuteProposalBatchMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: bnsd.IExecuteProposalBatchMsg);

    /** ExecuteProposalBatchMsg messages. */
    public messages: bnsd.ExecuteProposalBatchMsg.IUnion[];

    /**
     * Creates a new ExecuteProposalBatchMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ExecuteProposalBatchMsg instance
     */
    public static create(properties?: bnsd.IExecuteProposalBatchMsg): bnsd.ExecuteProposalBatchMsg;

    /**
     * Encodes the specified ExecuteProposalBatchMsg message. Does not implicitly {@link bnsd.ExecuteProposalBatchMsg.verify|verify} messages.
     * @param message ExecuteProposalBatchMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: bnsd.IExecuteProposalBatchMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ExecuteProposalBatchMsg message, length delimited. Does not implicitly {@link bnsd.ExecuteProposalBatchMsg.verify|verify} messages.
     * @param message ExecuteProposalBatchMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: bnsd.IExecuteProposalBatchMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes an ExecuteProposalBatchMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ExecuteProposalBatchMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): bnsd.ExecuteProposalBatchMsg;

    /**
     * Decodes an ExecuteProposalBatchMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ExecuteProposalBatchMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): bnsd.ExecuteProposalBatchMsg;

    /**
     * Verifies an ExecuteProposalBatchMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an ExecuteProposalBatchMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ExecuteProposalBatchMsg
     */
    public static fromObject(object: { [k: string]: any }): bnsd.ExecuteProposalBatchMsg;

    /**
     * Creates a plain object from an ExecuteProposalBatchMsg message. Also converts values to other types if specified.
     * @param message ExecuteProposalBatchMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: bnsd.ExecuteProposalBatchMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ExecuteProposalBatchMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  namespace ExecuteProposalBatchMsg {
    /** Properties of an Union. */
    interface IUnion {
      /** Union sendMsg */
      sendMsg?: cash.ISendMsg | null;

      /** Union escrowReleaseMsg */
      escrowReleaseMsg?: escrow.IReleaseMsg | null;

      /** Union updateEscrowPartiesMsg */
      updateEscrowPartiesMsg?: escrow.IUpdatePartiesMsg | null;

      /** Union multisigUpdateMsg */
      multisigUpdateMsg?: multisig.IUpdateMsg | null;

      /** Union validatorsApplyDiffMsg */
      validatorsApplyDiffMsg?: validators.IApplyDiffMsg | null;

      /** no recursive batches */
      usernameRegisterTokenMsg?: username.IRegisterTokenMsg | null;

      /** Union usernameTransferTokenMsg */
      usernameTransferTokenMsg?: username.ITransferTokenMsg | null;

      /** Union usernameChangeTokenTargetsMsg */
      usernameChangeTokenTargetsMsg?: username.IChangeTokenTargetsMsg | null;

      /** Union distributionCreateMsg */
      distributionCreateMsg?: distribution.ICreateMsg | null;

      /** Union distributionMsg */
      distributionMsg?: distribution.IDistributeMsg | null;

      /** Union distributionResetMsg */
      distributionResetMsg?: distribution.IResetMsg | null;

      /** don't allow UpgradeSchema as part of a batch, as effects are too confusing */
      govUpdateElectorateMsg?: gov.IUpdateElectorateMsg | null;

      /** Union govUpdateElectionRuleMsg */
      govUpdateElectionRuleMsg?: gov.IUpdateElectionRuleMsg | null;

      /** Union govCreateTextResolutionMsg */
      govCreateTextResolutionMsg?: gov.ICreateTextResolutionMsg | null;
    }

    /** Represents an Union. */
    class Union implements IUnion {
      /**
       * Constructs a new Union.
       * @param [properties] Properties to set
       */
      constructor(properties?: bnsd.ExecuteProposalBatchMsg.IUnion);

      /** Union sendMsg. */
      public sendMsg?: cash.ISendMsg | null;

      /** Union escrowReleaseMsg. */
      public escrowReleaseMsg?: escrow.IReleaseMsg | null;

      /** Union updateEscrowPartiesMsg. */
      public updateEscrowPartiesMsg?: escrow.IUpdatePartiesMsg | null;

      /** Union multisigUpdateMsg. */
      public multisigUpdateMsg?: multisig.IUpdateMsg | null;

      /** Union validatorsApplyDiffMsg. */
      public validatorsApplyDiffMsg?: validators.IApplyDiffMsg | null;

      /** no recursive batches */
      public usernameRegisterTokenMsg?: username.IRegisterTokenMsg | null;

      /** Union usernameTransferTokenMsg. */
      public usernameTransferTokenMsg?: username.ITransferTokenMsg | null;

      /** Union usernameChangeTokenTargetsMsg. */
      public usernameChangeTokenTargetsMsg?: username.IChangeTokenTargetsMsg | null;

      /** Union distributionCreateMsg. */
      public distributionCreateMsg?: distribution.ICreateMsg | null;

      /** Union distributionMsg. */
      public distributionMsg?: distribution.IDistributeMsg | null;

      /** Union distributionResetMsg. */
      public distributionResetMsg?: distribution.IResetMsg | null;

      /** don't allow UpgradeSchema as part of a batch, as effects are too confusing */
      public govUpdateElectorateMsg?: gov.IUpdateElectorateMsg | null;

      /** Union govUpdateElectionRuleMsg. */
      public govUpdateElectionRuleMsg?: gov.IUpdateElectionRuleMsg | null;

      /** Union govCreateTextResolutionMsg. */
      public govCreateTextResolutionMsg?: gov.ICreateTextResolutionMsg | null;

      /** Union sum. */
      public sum?:
        | "sendMsg"
        | "escrowReleaseMsg"
        | "updateEscrowPartiesMsg"
        | "multisigUpdateMsg"
        | "validatorsApplyDiffMsg"
        | "usernameRegisterTokenMsg"
        | "usernameTransferTokenMsg"
        | "usernameChangeTokenTargetsMsg"
        | "distributionCreateMsg"
        | "distributionMsg"
        | "distributionResetMsg"
        | "govUpdateElectorateMsg"
        | "govUpdateElectionRuleMsg"
        | "govCreateTextResolutionMsg";

      /**
       * Creates a new Union instance using the specified properties.
       * @param [properties] Properties to set
       * @returns Union instance
       */
      public static create(
        properties?: bnsd.ExecuteProposalBatchMsg.IUnion,
      ): bnsd.ExecuteProposalBatchMsg.Union;

      /**
       * Encodes the specified Union message. Does not implicitly {@link bnsd.ExecuteProposalBatchMsg.Union.verify|verify} messages.
       * @param message Union message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: bnsd.ExecuteProposalBatchMsg.IUnion,
        writer?: $protobuf.Writer,
      ): $protobuf.Writer;

      /**
       * Encodes the specified Union message, length delimited. Does not implicitly {@link bnsd.ExecuteProposalBatchMsg.Union.verify|verify} messages.
       * @param message Union message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: bnsd.ExecuteProposalBatchMsg.IUnion,
        writer?: $protobuf.Writer,
      ): $protobuf.Writer;

      /**
       * Decodes an Union message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns Union
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number,
      ): bnsd.ExecuteProposalBatchMsg.Union;

      /**
       * Decodes an Union message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns Union
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array,
      ): bnsd.ExecuteProposalBatchMsg.Union;

      /**
       * Verifies an Union message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates an Union message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns Union
       */
      public static fromObject(object: { [k: string]: any }): bnsd.ExecuteProposalBatchMsg.Union;

      /**
       * Creates a plain object from an Union message. Also converts values to other types if specified.
       * @param message Union
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: bnsd.ExecuteProposalBatchMsg.Union,
        options?: $protobuf.IConversionOptions,
      ): { [k: string]: any };

      /**
       * Converts this Union to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }
  }

  /** Properties of a CronTask. */
  interface ICronTask {
    /** conditions required for execution, that will be inserted into the context. */
    authenticators?: Uint8Array[] | null;

    /** CronTask escrowReleaseMsg */
    escrowReleaseMsg?: escrow.IReleaseMsg | null;

    /** CronTask escrowReturnMsg */
    escrowReturnMsg?: escrow.IReturnMsg | null;

    /** CronTask distributionDistributeMsg */
    distributionDistributeMsg?: distribution.IDistributeMsg | null;

    /** CronTask aswapReleaseMsg */
    aswapReleaseMsg?: aswap.IReleaseMsg | null;

    /** CronTask govTallyMsg */
    govTallyMsg?: gov.ITallyMsg | null;
  }

  /** old fields got deprecated. This is done to maintain binary compatibility. */
  class CronTask implements ICronTask {
    /**
     * Constructs a new CronTask.
     * @param [properties] Properties to set
     */
    constructor(properties?: bnsd.ICronTask);

    /** conditions required for execution, that will be inserted into the context. */
    public authenticators: Uint8Array[];

    /** CronTask escrowReleaseMsg. */
    public escrowReleaseMsg?: escrow.IReleaseMsg | null;

    /** CronTask escrowReturnMsg. */
    public escrowReturnMsg?: escrow.IReturnMsg | null;

    /** CronTask distributionDistributeMsg. */
    public distributionDistributeMsg?: distribution.IDistributeMsg | null;

    /** CronTask aswapReleaseMsg. */
    public aswapReleaseMsg?: aswap.IReleaseMsg | null;

    /** CronTask govTallyMsg. */
    public govTallyMsg?: gov.ITallyMsg | null;

    /** Use the same indexes for the messages as the Tx message. */
    public sum?:
      | "escrowReleaseMsg"
      | "escrowReturnMsg"
      | "distributionDistributeMsg"
      | "aswapReleaseMsg"
      | "govTallyMsg";

    /**
     * Creates a new CronTask instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CronTask instance
     */
    public static create(properties?: bnsd.ICronTask): bnsd.CronTask;

    /**
     * Encodes the specified CronTask message. Does not implicitly {@link bnsd.CronTask.verify|verify} messages.
     * @param message CronTask message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: bnsd.ICronTask, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified CronTask message, length delimited. Does not implicitly {@link bnsd.CronTask.verify|verify} messages.
     * @param message CronTask message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: bnsd.ICronTask, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a CronTask message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CronTask
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): bnsd.CronTask;

    /**
     * Decodes a CronTask message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CronTask
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): bnsd.CronTask;

    /**
     * Verifies a CronTask message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a CronTask message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CronTask
     */
    public static fromObject(object: { [k: string]: any }): bnsd.CronTask;

    /**
     * Creates a plain object from a CronTask message. Also converts values to other types if specified.
     * @param message CronTask
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: bnsd.CronTask,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this CronTask to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace username. */
export namespace username {
  /** Properties of a Token. */
  interface IToken {
    /** Token metadata */
    metadata?: weave.IMetadata | null;

    /** least one blockchain address elemenet. */
    targets?: username.IBlockchainAddress[] | null;

    /** modify a username token. */
    owner?: Uint8Array | null;
  }

  /** ourselves to certain patterns. */
  class Token implements IToken {
    /**
     * Constructs a new Token.
     * @param [properties] Properties to set
     */
    constructor(properties?: username.IToken);

    /** Token metadata. */
    public metadata?: weave.IMetadata | null;

    /** least one blockchain address elemenet. */
    public targets: username.IBlockchainAddress[];

    /** modify a username token. */
    public owner: Uint8Array;

    /**
     * Creates a new Token instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Token instance
     */
    public static create(properties?: username.IToken): username.Token;

    /**
     * Encodes the specified Token message. Does not implicitly {@link username.Token.verify|verify} messages.
     * @param message Token message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: username.IToken, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Token message, length delimited. Does not implicitly {@link username.Token.verify|verify} messages.
     * @param message Token message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: username.IToken, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Token message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Token
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): username.Token;

    /**
     * Decodes a Token message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Token
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): username.Token;

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
    public static fromObject(object: { [k: string]: any }): username.Token;

    /**
     * Creates a plain object from a Token message. Also converts values to other types if specified.
     * @param message Token
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: username.Token,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Token to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a BlockchainAddress. */
  interface IBlockchainAddress {
    /** An arbitrary blockchain ID. */
    blockchainId?: string | null;

    /** to use. */
    address?: string | null;
  }

  /** to an address on any blockchain network. */
  class BlockchainAddress implements IBlockchainAddress {
    /**
     * Constructs a new BlockchainAddress.
     * @param [properties] Properties to set
     */
    constructor(properties?: username.IBlockchainAddress);

    /** An arbitrary blockchain ID. */
    public blockchainId: string;

    /** to use. */
    public address: string;

    /**
     * Creates a new BlockchainAddress instance using the specified properties.
     * @param [properties] Properties to set
     * @returns BlockchainAddress instance
     */
    public static create(properties?: username.IBlockchainAddress): username.BlockchainAddress;

    /**
     * Encodes the specified BlockchainAddress message. Does not implicitly {@link username.BlockchainAddress.verify|verify} messages.
     * @param message BlockchainAddress message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: username.IBlockchainAddress, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified BlockchainAddress message, length delimited. Does not implicitly {@link username.BlockchainAddress.verify|verify} messages.
     * @param message BlockchainAddress message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: username.IBlockchainAddress,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a BlockchainAddress message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns BlockchainAddress
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): username.BlockchainAddress;

    /**
     * Decodes a BlockchainAddress message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns BlockchainAddress
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): username.BlockchainAddress;

    /**
     * Verifies a BlockchainAddress message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a BlockchainAddress message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns BlockchainAddress
     */
    public static fromObject(object: { [k: string]: any }): username.BlockchainAddress;

    /**
     * Creates a plain object from a BlockchainAddress message. Also converts values to other types if specified.
     * @param message BlockchainAddress
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: username.BlockchainAddress,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this BlockchainAddress to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a RegisterTokenMsg. */
  interface IRegisterTokenMsg {
    /** RegisterTokenMsg metadata */
    metadata?: weave.IMetadata | null;

    /** Username is the unique name of the token, for example alice*iov */
    username?: string | null;

    /** Targets is a blockchain address list that this token should point to. */
    targets?: username.IBlockchainAddress[] | null;
  }

  /** to the main signer. */
  class RegisterTokenMsg implements IRegisterTokenMsg {
    /**
     * Constructs a new RegisterTokenMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: username.IRegisterTokenMsg);

    /** RegisterTokenMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** Username is the unique name of the token, for example alice*iov */
    public username: string;

    /** Targets is a blockchain address list that this token should point to. */
    public targets: username.IBlockchainAddress[];

    /**
     * Creates a new RegisterTokenMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns RegisterTokenMsg instance
     */
    public static create(properties?: username.IRegisterTokenMsg): username.RegisterTokenMsg;

    /**
     * Encodes the specified RegisterTokenMsg message. Does not implicitly {@link username.RegisterTokenMsg.verify|verify} messages.
     * @param message RegisterTokenMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: username.IRegisterTokenMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified RegisterTokenMsg message, length delimited. Does not implicitly {@link username.RegisterTokenMsg.verify|verify} messages.
     * @param message RegisterTokenMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: username.IRegisterTokenMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a RegisterTokenMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns RegisterTokenMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): username.RegisterTokenMsg;

    /**
     * Decodes a RegisterTokenMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns RegisterTokenMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): username.RegisterTokenMsg;

    /**
     * Verifies a RegisterTokenMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a RegisterTokenMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns RegisterTokenMsg
     */
    public static fromObject(object: { [k: string]: any }): username.RegisterTokenMsg;

    /**
     * Creates a plain object from a RegisterTokenMsg message. Also converts values to other types if specified.
     * @param message RegisterTokenMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: username.RegisterTokenMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this RegisterTokenMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a TransferTokenMsg. */
  interface ITransferTokenMsg {
    /** TransferTokenMsg metadata */
    metadata?: weave.IMetadata | null;

    /** Username is the unique name of the token, for example alice*iov */
    username?: string | null;

    /** Owner is a weave address that will owns this token after the change. */
    newOwner?: Uint8Array | null;
  }

  /** owner is not required in order to succeed. */
  class TransferTokenMsg implements ITransferTokenMsg {
    /**
     * Constructs a new TransferTokenMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: username.ITransferTokenMsg);

    /** TransferTokenMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** Username is the unique name of the token, for example alice*iov */
    public username: string;

    /** Owner is a weave address that will owns this token after the change. */
    public newOwner: Uint8Array;

    /**
     * Creates a new TransferTokenMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns TransferTokenMsg instance
     */
    public static create(properties?: username.ITransferTokenMsg): username.TransferTokenMsg;

    /**
     * Encodes the specified TransferTokenMsg message. Does not implicitly {@link username.TransferTokenMsg.verify|verify} messages.
     * @param message TransferTokenMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: username.ITransferTokenMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified TransferTokenMsg message, length delimited. Does not implicitly {@link username.TransferTokenMsg.verify|verify} messages.
     * @param message TransferTokenMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: username.ITransferTokenMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a TransferTokenMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns TransferTokenMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): username.TransferTokenMsg;

    /**
     * Decodes a TransferTokenMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns TransferTokenMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): username.TransferTokenMsg;

    /**
     * Verifies a TransferTokenMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a TransferTokenMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns TransferTokenMsg
     */
    public static fromObject(object: { [k: string]: any }): username.TransferTokenMsg;

    /**
     * Creates a plain object from a TransferTokenMsg message. Also converts values to other types if specified.
     * @param message TransferTokenMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: username.TransferTokenMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this TransferTokenMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a ChangeTokenTargetsMsg. */
  interface IChangeTokenTargetsMsg {
    /** ChangeTokenTargetsMsg metadata */
    metadata?: weave.IMetadata | null;

    /** Username is the unique name of the token, for example alice*iov */
    username?: string | null;

    /** to after the change. Old list is overwritten with what is provided. */
    newTargets?: username.IBlockchainAddress[] | null;
  }

  /** points to. Only the owner of a token can request this operation. */
  class ChangeTokenTargetsMsg implements IChangeTokenTargetsMsg {
    /**
     * Constructs a new ChangeTokenTargetsMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: username.IChangeTokenTargetsMsg);

    /** ChangeTokenTargetsMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** Username is the unique name of the token, for example alice*iov */
    public username: string;

    /** to after the change. Old list is overwritten with what is provided. */
    public newTargets: username.IBlockchainAddress[];

    /**
     * Creates a new ChangeTokenTargetsMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ChangeTokenTargetsMsg instance
     */
    public static create(properties?: username.IChangeTokenTargetsMsg): username.ChangeTokenTargetsMsg;

    /**
     * Encodes the specified ChangeTokenTargetsMsg message. Does not implicitly {@link username.ChangeTokenTargetsMsg.verify|verify} messages.
     * @param message ChangeTokenTargetsMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(
      message: username.IChangeTokenTargetsMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified ChangeTokenTargetsMsg message, length delimited. Does not implicitly {@link username.ChangeTokenTargetsMsg.verify|verify} messages.
     * @param message ChangeTokenTargetsMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: username.IChangeTokenTargetsMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a ChangeTokenTargetsMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ChangeTokenTargetsMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): username.ChangeTokenTargetsMsg;

    /**
     * Decodes a ChangeTokenTargetsMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ChangeTokenTargetsMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): username.ChangeTokenTargetsMsg;

    /**
     * Verifies a ChangeTokenTargetsMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a ChangeTokenTargetsMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ChangeTokenTargetsMsg
     */
    public static fromObject(object: { [k: string]: any }): username.ChangeTokenTargetsMsg;

    /**
     * Creates a plain object from a ChangeTokenTargetsMsg message. Also converts values to other types if specified.
     * @param message ChangeTokenTargetsMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: username.ChangeTokenTargetsMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ChangeTokenTargetsMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a Configuration. */
  interface IConfiguration {
    /** Configuration metadata */
    metadata?: weave.IMetadata | null;

    /** needed to make use of gconf.NewUpdateConfigurationHandler */
    owner?: Uint8Array | null;

    /** part name must match (a username is <name>*<label>) */
    validUsernameName?: string | null;

    /** namespace label must match (a username is <name>*<label>) */
    validUsernameLabel?: string | null;
  }

  /** the functionality provided by gconf package. */
  class Configuration implements IConfiguration {
    /**
     * Constructs a new Configuration.
     * @param [properties] Properties to set
     */
    constructor(properties?: username.IConfiguration);

    /** Configuration metadata. */
    public metadata?: weave.IMetadata | null;

    /** needed to make use of gconf.NewUpdateConfigurationHandler */
    public owner: Uint8Array;

    /** part name must match (a username is <name>*<label>) */
    public validUsernameName: string;

    /** namespace label must match (a username is <name>*<label>) */
    public validUsernameLabel: string;

    /**
     * Creates a new Configuration instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Configuration instance
     */
    public static create(properties?: username.IConfiguration): username.Configuration;

    /**
     * Encodes the specified Configuration message. Does not implicitly {@link username.Configuration.verify|verify} messages.
     * @param message Configuration message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: username.IConfiguration, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Configuration message, length delimited. Does not implicitly {@link username.Configuration.verify|verify} messages.
     * @param message Configuration message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: username.IConfiguration,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a Configuration message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Configuration
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): username.Configuration;

    /**
     * Decodes a Configuration message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Configuration
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): username.Configuration;

    /**
     * Verifies a Configuration message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Configuration message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Configuration
     */
    public static fromObject(object: { [k: string]: any }): username.Configuration;

    /**
     * Creates a plain object from a Configuration message. Also converts values to other types if specified.
     * @param message Configuration
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: username.Configuration,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Configuration to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of an UpdateConfigurationMsg. */
  interface IUpdateConfigurationMsg {
    /** UpdateConfigurationMsg metadata */
    metadata?: weave.IMetadata | null;

    /** UpdateConfigurationMsg patch */
    patch?: username.IConfiguration | null;
  }

  /** configuration. */
  class UpdateConfigurationMsg implements IUpdateConfigurationMsg {
    /**
     * Constructs a new UpdateConfigurationMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: username.IUpdateConfigurationMsg);

    /** UpdateConfigurationMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** UpdateConfigurationMsg patch. */
    public patch?: username.IConfiguration | null;

    /**
     * Creates a new UpdateConfigurationMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns UpdateConfigurationMsg instance
     */
    public static create(properties?: username.IUpdateConfigurationMsg): username.UpdateConfigurationMsg;

    /**
     * Encodes the specified UpdateConfigurationMsg message. Does not implicitly {@link username.UpdateConfigurationMsg.verify|verify} messages.
     * @param message UpdateConfigurationMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(
      message: username.IUpdateConfigurationMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified UpdateConfigurationMsg message, length delimited. Does not implicitly {@link username.UpdateConfigurationMsg.verify|verify} messages.
     * @param message UpdateConfigurationMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: username.IUpdateConfigurationMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes an UpdateConfigurationMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns UpdateConfigurationMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): username.UpdateConfigurationMsg;

    /**
     * Decodes an UpdateConfigurationMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns UpdateConfigurationMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): username.UpdateConfigurationMsg;

    /**
     * Verifies an UpdateConfigurationMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an UpdateConfigurationMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns UpdateConfigurationMsg
     */
    public static fromObject(object: { [k: string]: any }): username.UpdateConfigurationMsg;

    /**
     * Creates a plain object from an UpdateConfigurationMsg message. Also converts values to other types if specified.
     * @param message UpdateConfigurationMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: username.UpdateConfigurationMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this UpdateConfigurationMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace weave. */
export namespace weave {
  /** Properties of a Metadata. */
  interface IMetadata {
    /** Metadata schema */
    schema?: number | null;
  }

  /** weave.Metadata metadata = 1; */
  class Metadata implements IMetadata {
    /**
     * Constructs a new Metadata.
     * @param [properties] Properties to set
     */
    constructor(properties?: weave.IMetadata);

    /** Metadata schema. */
    public schema: number;

    /**
     * Creates a new Metadata instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Metadata instance
     */
    public static create(properties?: weave.IMetadata): weave.Metadata;

    /**
     * Encodes the specified Metadata message. Does not implicitly {@link weave.Metadata.verify|verify} messages.
     * @param message Metadata message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: weave.IMetadata, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Metadata message, length delimited. Does not implicitly {@link weave.Metadata.verify|verify} messages.
     * @param message Metadata message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: weave.IMetadata, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Metadata message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Metadata
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): weave.Metadata;

    /**
     * Decodes a Metadata message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Metadata
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): weave.Metadata;

    /**
     * Verifies a Metadata message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Metadata message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Metadata
     */
    public static fromObject(object: { [k: string]: any }): weave.Metadata;

    /**
     * Creates a plain object from a Metadata message. Also converts values to other types if specified.
     * @param message Metadata
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: weave.Metadata,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Metadata to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a ValidatorUpdates. */
  interface IValidatorUpdates {
    /** ValidatorUpdates validatorUpdates */
    validatorUpdates?: weave.IValidatorUpdate[] | null;
  }

  /** ValidatorUpdates represents latest validator state, currently used to validate SetValidatorMsg transactions. */
  class ValidatorUpdates implements IValidatorUpdates {
    /**
     * Constructs a new ValidatorUpdates.
     * @param [properties] Properties to set
     */
    constructor(properties?: weave.IValidatorUpdates);

    /** ValidatorUpdates validatorUpdates. */
    public validatorUpdates: weave.IValidatorUpdate[];

    /**
     * Creates a new ValidatorUpdates instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ValidatorUpdates instance
     */
    public static create(properties?: weave.IValidatorUpdates): weave.ValidatorUpdates;

    /**
     * Encodes the specified ValidatorUpdates message. Does not implicitly {@link weave.ValidatorUpdates.verify|verify} messages.
     * @param message ValidatorUpdates message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: weave.IValidatorUpdates, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ValidatorUpdates message, length delimited. Does not implicitly {@link weave.ValidatorUpdates.verify|verify} messages.
     * @param message ValidatorUpdates message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: weave.IValidatorUpdates,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a ValidatorUpdates message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ValidatorUpdates
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): weave.ValidatorUpdates;

    /**
     * Decodes a ValidatorUpdates message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ValidatorUpdates
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): weave.ValidatorUpdates;

    /**
     * Verifies a ValidatorUpdates message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a ValidatorUpdates message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ValidatorUpdates
     */
    public static fromObject(object: { [k: string]: any }): weave.ValidatorUpdates;

    /**
     * Creates a plain object from a ValidatorUpdates message. Also converts values to other types if specified.
     * @param message ValidatorUpdates
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: weave.ValidatorUpdates,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ValidatorUpdates to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a ValidatorUpdate. */
  interface IValidatorUpdate {
    /** ValidatorUpdate pubKey */
    pubKey?: weave.IPubKey | null;

    /** ValidatorUpdate power */
    power?: number | Long | null;
  }

  /** ValidatorUpdate represents an update to validator set. */
  class ValidatorUpdate implements IValidatorUpdate {
    /**
     * Constructs a new ValidatorUpdate.
     * @param [properties] Properties to set
     */
    constructor(properties?: weave.IValidatorUpdate);

    /** ValidatorUpdate pubKey. */
    public pubKey?: weave.IPubKey | null;

    /** ValidatorUpdate power. */
    public power: number | Long;

    /**
     * Creates a new ValidatorUpdate instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ValidatorUpdate instance
     */
    public static create(properties?: weave.IValidatorUpdate): weave.ValidatorUpdate;

    /**
     * Encodes the specified ValidatorUpdate message. Does not implicitly {@link weave.ValidatorUpdate.verify|verify} messages.
     * @param message ValidatorUpdate message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: weave.IValidatorUpdate, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ValidatorUpdate message, length delimited. Does not implicitly {@link weave.ValidatorUpdate.verify|verify} messages.
     * @param message ValidatorUpdate message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: weave.IValidatorUpdate,
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
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): weave.ValidatorUpdate;

    /**
     * Decodes a ValidatorUpdate message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ValidatorUpdate
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): weave.ValidatorUpdate;

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
    public static fromObject(object: { [k: string]: any }): weave.ValidatorUpdate;

    /**
     * Creates a plain object from a ValidatorUpdate message. Also converts values to other types if specified.
     * @param message ValidatorUpdate
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: weave.ValidatorUpdate,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ValidatorUpdate to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a PubKey. */
  interface IPubKey {
    /** PubKey type */
    type?: string | null;

    /** PubKey data */
    data?: Uint8Array | null;
  }

  /** PubKey represents a validator public key. */
  class PubKey implements IPubKey {
    /**
     * Constructs a new PubKey.
     * @param [properties] Properties to set
     */
    constructor(properties?: weave.IPubKey);

    /** PubKey type. */
    public type: string;

    /** PubKey data. */
    public data: Uint8Array;

    /**
     * Creates a new PubKey instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PubKey instance
     */
    public static create(properties?: weave.IPubKey): weave.PubKey;

    /**
     * Encodes the specified PubKey message. Does not implicitly {@link weave.PubKey.verify|verify} messages.
     * @param message PubKey message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: weave.IPubKey, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PubKey message, length delimited. Does not implicitly {@link weave.PubKey.verify|verify} messages.
     * @param message PubKey message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: weave.IPubKey, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PubKey message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PubKey
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): weave.PubKey;

    /**
     * Decodes a PubKey message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PubKey
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): weave.PubKey;

    /**
     * Verifies a PubKey message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a PubKey message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PubKey
     */
    public static fromObject(object: { [k: string]: any }): weave.PubKey;

    /**
     * Creates a plain object from a PubKey message. Also converts values to other types if specified.
     * @param message PubKey
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: weave.PubKey,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this PubKey to JSON.
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

/** Namespace migration. */
export namespace migration {
  /** Properties of a Configuration. */
  interface IConfiguration {
    /** multisig. */
    admin?: Uint8Array | null;
  }

  /** Represents a Configuration. */
  class Configuration implements IConfiguration {
    /**
     * Constructs a new Configuration.
     * @param [properties] Properties to set
     */
    constructor(properties?: migration.IConfiguration);

    /** multisig. */
    public admin: Uint8Array;

    /**
     * Creates a new Configuration instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Configuration instance
     */
    public static create(properties?: migration.IConfiguration): migration.Configuration;

    /**
     * Encodes the specified Configuration message. Does not implicitly {@link migration.Configuration.verify|verify} messages.
     * @param message Configuration message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: migration.IConfiguration, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Configuration message, length delimited. Does not implicitly {@link migration.Configuration.verify|verify} messages.
     * @param message Configuration message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: migration.IConfiguration,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a Configuration message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Configuration
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): migration.Configuration;

    /**
     * Decodes a Configuration message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Configuration
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): migration.Configuration;

    /**
     * Verifies a Configuration message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Configuration message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Configuration
     */
    public static fromObject(object: { [k: string]: any }): migration.Configuration;

    /**
     * Creates a plain object from a Configuration message. Also converts values to other types if specified.
     * @param message Configuration
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: migration.Configuration,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Configuration to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a Schema. */
  interface ISchema {
    /** Schema metadata */
    metadata?: weave.IMetadata | null;

    /** For example, for extension `x/myext` package value is `myext` */
    pkg?: string | null;

    /** Version holds the highest supported schema version. */
    version?: number | null;
  }

  /** Schema declares the maxiumum supported schema version for a package. */
  class Schema implements ISchema {
    /**
     * Constructs a new Schema.
     * @param [properties] Properties to set
     */
    constructor(properties?: migration.ISchema);

    /** Schema metadata. */
    public metadata?: weave.IMetadata | null;

    /** For example, for extension `x/myext` package value is `myext` */
    public pkg: string;

    /** Version holds the highest supported schema version. */
    public version: number;

    /**
     * Creates a new Schema instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Schema instance
     */
    public static create(properties?: migration.ISchema): migration.Schema;

    /**
     * Encodes the specified Schema message. Does not implicitly {@link migration.Schema.verify|verify} messages.
     * @param message Schema message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: migration.ISchema, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Schema message, length delimited. Does not implicitly {@link migration.Schema.verify|verify} messages.
     * @param message Schema message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: migration.ISchema, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Schema message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Schema
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): migration.Schema;

    /**
     * Decodes a Schema message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Schema
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): migration.Schema;

    /**
     * Verifies a Schema message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Schema message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Schema
     */
    public static fromObject(object: { [k: string]: any }): migration.Schema;

    /**
     * Creates a plain object from a Schema message. Also converts values to other types if specified.
     * @param message Schema
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: migration.Schema,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Schema to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of an UpgradeSchemaMsg. */
  interface IUpgradeSchemaMsg {
    /** UpgradeSchemaMsg metadata */
    metadata?: weave.IMetadata | null;

    /** Name of the package that schema version upgrade is made for. */
    pkg?: string | null;
  }

  /** by one version. */
  class UpgradeSchemaMsg implements IUpgradeSchemaMsg {
    /**
     * Constructs a new UpgradeSchemaMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: migration.IUpgradeSchemaMsg);

    /** UpgradeSchemaMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** Name of the package that schema version upgrade is made for. */
    public pkg: string;

    /**
     * Creates a new UpgradeSchemaMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns UpgradeSchemaMsg instance
     */
    public static create(properties?: migration.IUpgradeSchemaMsg): migration.UpgradeSchemaMsg;

    /**
     * Encodes the specified UpgradeSchemaMsg message. Does not implicitly {@link migration.UpgradeSchemaMsg.verify|verify} messages.
     * @param message UpgradeSchemaMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: migration.IUpgradeSchemaMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified UpgradeSchemaMsg message, length delimited. Does not implicitly {@link migration.UpgradeSchemaMsg.verify|verify} messages.
     * @param message UpgradeSchemaMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: migration.IUpgradeSchemaMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes an UpgradeSchemaMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns UpgradeSchemaMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): migration.UpgradeSchemaMsg;

    /**
     * Decodes an UpgradeSchemaMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns UpgradeSchemaMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): migration.UpgradeSchemaMsg;

    /**
     * Verifies an UpgradeSchemaMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an UpgradeSchemaMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns UpgradeSchemaMsg
     */
    public static fromObject(object: { [k: string]: any }): migration.UpgradeSchemaMsg;

    /**
     * Creates a plain object from an UpgradeSchemaMsg message. Also converts values to other types if specified.
     * @param message UpgradeSchemaMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: migration.UpgradeSchemaMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this UpgradeSchemaMsg to JSON.
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

  /** Properties of a VersionedIDRef. */
  interface IVersionedIDRef {
    /** Unique identifier */
    id?: Uint8Array | null;

    /** Document version, starting with 1. */
    version?: number | null;
  }

  /** VersionedID is the combination of document ID and version number. */
  class VersionedIDRef implements IVersionedIDRef {
    /**
     * Constructs a new VersionedIDRef.
     * @param [properties] Properties to set
     */
    constructor(properties?: orm.IVersionedIDRef);

    /** Unique identifier */
    public id: Uint8Array;

    /** Document version, starting with 1. */
    public version: number;

    /**
     * Creates a new VersionedIDRef instance using the specified properties.
     * @param [properties] Properties to set
     * @returns VersionedIDRef instance
     */
    public static create(properties?: orm.IVersionedIDRef): orm.VersionedIDRef;

    /**
     * Encodes the specified VersionedIDRef message. Does not implicitly {@link orm.VersionedIDRef.verify|verify} messages.
     * @param message VersionedIDRef message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: orm.IVersionedIDRef, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified VersionedIDRef message, length delimited. Does not implicitly {@link orm.VersionedIDRef.verify|verify} messages.
     * @param message VersionedIDRef message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: orm.IVersionedIDRef, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a VersionedIDRef message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns VersionedIDRef
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): orm.VersionedIDRef;

    /**
     * Decodes a VersionedIDRef message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns VersionedIDRef
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): orm.VersionedIDRef;

    /**
     * Verifies a VersionedIDRef message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a VersionedIDRef message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns VersionedIDRef
     */
    public static fromObject(object: { [k: string]: any }): orm.VersionedIDRef;

    /**
     * Creates a plain object from a VersionedIDRef message. Also converts values to other types if specified.
     * @param message VersionedIDRef
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: orm.VersionedIDRef,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this VersionedIDRef to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace aswap. */
export namespace aswap {
  /** Properties of a Swap. */
  interface ISwap {
    /** metadata is used for schema versioning support */
    metadata?: weave.IMetadata | null;

    /** sha256 hash of preimage, 32 bytes long */
    preimageHash?: Uint8Array | null;

    /** source is a sender address */
    source?: Uint8Array | null;

    /** destination is an address of destination */
    destination?: Uint8Array | null;

    /** expired: [timeout, infinity) */
    timeout?: number | Long | null;

    /** max length 128 characters */
    memo?: string | null;

    /** Address of this entity. Set during creation and does not change. */
    address?: Uint8Array | null;
  }

  /** Swap is designed to hold some coins for atomic swap, locked by preimage_hash */
  class Swap implements ISwap {
    /**
     * Constructs a new Swap.
     * @param [properties] Properties to set
     */
    constructor(properties?: aswap.ISwap);

    /** metadata is used for schema versioning support */
    public metadata?: weave.IMetadata | null;

    /** sha256 hash of preimage, 32 bytes long */
    public preimageHash: Uint8Array;

    /** source is a sender address */
    public source: Uint8Array;

    /** destination is an address of destination */
    public destination: Uint8Array;

    /** expired: [timeout, infinity) */
    public timeout: number | Long;

    /** max length 128 characters */
    public memo: string;

    /** Address of this entity. Set during creation and does not change. */
    public address: Uint8Array;

    /**
     * Creates a new Swap instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Swap instance
     */
    public static create(properties?: aswap.ISwap): aswap.Swap;

    /**
     * Encodes the specified Swap message. Does not implicitly {@link aswap.Swap.verify|verify} messages.
     * @param message Swap message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: aswap.ISwap, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Swap message, length delimited. Does not implicitly {@link aswap.Swap.verify|verify} messages.
     * @param message Swap message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: aswap.ISwap, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Swap message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Swap
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): aswap.Swap;

    /**
     * Decodes a Swap message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Swap
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): aswap.Swap;

    /**
     * Verifies a Swap message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Swap message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Swap
     */
    public static fromObject(object: { [k: string]: any }): aswap.Swap;

    /**
     * Creates a plain object from a Swap message. Also converts values to other types if specified.
     * @param message Swap
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: aswap.Swap, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Swap to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a CreateMsg. */
  interface ICreateMsg {
    /** CreateMsg metadata */
    metadata?: weave.IMetadata | null;

    /** CreateMsg source */
    source?: Uint8Array | null;

    /** sha256 hash of preimage, 32 bytes long */
    preimageHash?: Uint8Array | null;

    /** CreateMsg destination */
    destination?: Uint8Array | null;

    /** amount may contain multiple token types */
    amount?: coin.ICoin[] | null;

    /** Timeout represents wall clock time. */
    timeout?: number | Long | null;

    /** max length 128 character */
    memo?: string | null;
  }

  /** CreateMsg creates a Swap with some coins. */
  class CreateMsg implements ICreateMsg {
    /**
     * Constructs a new CreateMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: aswap.ICreateMsg);

    /** CreateMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** CreateMsg source. */
    public source: Uint8Array;

    /** sha256 hash of preimage, 32 bytes long */
    public preimageHash: Uint8Array;

    /** CreateMsg destination. */
    public destination: Uint8Array;

    /** amount may contain multiple token types */
    public amount: coin.ICoin[];

    /** Timeout represents wall clock time. */
    public timeout: number | Long;

    /** max length 128 character */
    public memo: string;

    /**
     * Creates a new CreateMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CreateMsg instance
     */
    public static create(properties?: aswap.ICreateMsg): aswap.CreateMsg;

    /**
     * Encodes the specified CreateMsg message. Does not implicitly {@link aswap.CreateMsg.verify|verify} messages.
     * @param message CreateMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: aswap.ICreateMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified CreateMsg message, length delimited. Does not implicitly {@link aswap.CreateMsg.verify|verify} messages.
     * @param message CreateMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: aswap.ICreateMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a CreateMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CreateMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): aswap.CreateMsg;

    /**
     * Decodes a CreateMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CreateMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): aswap.CreateMsg;

    /**
     * Verifies a CreateMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a CreateMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CreateMsg
     */
    public static fromObject(object: { [k: string]: any }): aswap.CreateMsg;

    /**
     * Creates a plain object from a CreateMsg message. Also converts values to other types if specified.
     * @param message CreateMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: aswap.CreateMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this CreateMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a ReleaseMsg. */
  interface IReleaseMsg {
    /** ReleaseMsg metadata */
    metadata?: weave.IMetadata | null;

    /** swap_id to release */
    swapId?: Uint8Array | null;

    /** must be exactly 32 bytes long */
    preimage?: Uint8Array | null;
  }

  /** This operation is authorized by preimage, which is sent raw and then hashed on the backend. */
  class ReleaseMsg implements IReleaseMsg {
    /**
     * Constructs a new ReleaseMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: aswap.IReleaseMsg);

    /** ReleaseMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** swap_id to release */
    public swapId: Uint8Array;

    /** must be exactly 32 bytes long */
    public preimage: Uint8Array;

    /**
     * Creates a new ReleaseMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ReleaseMsg instance
     */
    public static create(properties?: aswap.IReleaseMsg): aswap.ReleaseMsg;

    /**
     * Encodes the specified ReleaseMsg message. Does not implicitly {@link aswap.ReleaseMsg.verify|verify} messages.
     * @param message ReleaseMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: aswap.IReleaseMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ReleaseMsg message, length delimited. Does not implicitly {@link aswap.ReleaseMsg.verify|verify} messages.
     * @param message ReleaseMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: aswap.IReleaseMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ReleaseMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ReleaseMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): aswap.ReleaseMsg;

    /**
     * Decodes a ReleaseMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ReleaseMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): aswap.ReleaseMsg;

    /**
     * Verifies a ReleaseMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a ReleaseMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ReleaseMsg
     */
    public static fromObject(object: { [k: string]: any }): aswap.ReleaseMsg;

    /**
     * Creates a plain object from a ReleaseMsg message. Also converts values to other types if specified.
     * @param message ReleaseMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: aswap.ReleaseMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ReleaseMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a ReturnMsg. */
  interface IReturnMsg {
    /** ReturnMsg metadata */
    metadata?: weave.IMetadata | null;

    /** swap_id to return */
    swapId?: Uint8Array | null;
  }

  /** This operation only works if the Swap is expired. */
  class ReturnMsg implements IReturnMsg {
    /**
     * Constructs a new ReturnMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: aswap.IReturnMsg);

    /** ReturnMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** swap_id to return */
    public swapId: Uint8Array;

    /**
     * Creates a new ReturnMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ReturnMsg instance
     */
    public static create(properties?: aswap.IReturnMsg): aswap.ReturnMsg;

    /**
     * Encodes the specified ReturnMsg message. Does not implicitly {@link aswap.ReturnMsg.verify|verify} messages.
     * @param message ReturnMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: aswap.IReturnMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ReturnMsg message, length delimited. Does not implicitly {@link aswap.ReturnMsg.verify|verify} messages.
     * @param message ReturnMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: aswap.IReturnMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ReturnMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ReturnMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): aswap.ReturnMsg;

    /**
     * Decodes a ReturnMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ReturnMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): aswap.ReturnMsg;

    /**
     * Verifies a ReturnMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a ReturnMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ReturnMsg
     */
    public static fromObject(object: { [k: string]: any }): aswap.ReturnMsg;

    /**
     * Creates a plain object from a ReturnMsg message. Also converts values to other types if specified.
     * @param message ReturnMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: aswap.ReturnMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ReturnMsg to JSON.
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
    /** Set metadata */
    metadata?: weave.IMetadata | null;

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

    /** Set metadata. */
    public metadata?: weave.IMetadata | null;

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
    /** SendMsg metadata */
    metadata?: weave.IMetadata | null;

    /** SendMsg source */
    source?: Uint8Array | null;

    /** SendMsg destination */
    destination?: Uint8Array | null;

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

    /** SendMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** SendMsg source. */
    public source: Uint8Array;

    /** SendMsg destination. */
    public destination: Uint8Array;

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

  /** Properties of a Configuration. */
  interface IConfiguration {
    /** Configuration metadata */
    metadata?: weave.IMetadata | null;

    /** needed to make use of gconf.NewUpdateConfigurationHandler */
    owner?: Uint8Array | null;

    /** Configuration collectorAddress */
    collectorAddress?: Uint8Array | null;

    /** Configuration minimalFee */
    minimalFee?: coin.ICoin | null;
  }

  /** Represents a Configuration. */
  class Configuration implements IConfiguration {
    /**
     * Constructs a new Configuration.
     * @param [properties] Properties to set
     */
    constructor(properties?: cash.IConfiguration);

    /** Configuration metadata. */
    public metadata?: weave.IMetadata | null;

    /** needed to make use of gconf.NewUpdateConfigurationHandler */
    public owner: Uint8Array;

    /** Configuration collectorAddress. */
    public collectorAddress: Uint8Array;

    /** Configuration minimalFee. */
    public minimalFee?: coin.ICoin | null;

    /**
     * Creates a new Configuration instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Configuration instance
     */
    public static create(properties?: cash.IConfiguration): cash.Configuration;

    /**
     * Encodes the specified Configuration message. Does not implicitly {@link cash.Configuration.verify|verify} messages.
     * @param message Configuration message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: cash.IConfiguration, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Configuration message, length delimited. Does not implicitly {@link cash.Configuration.verify|verify} messages.
     * @param message Configuration message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: cash.IConfiguration, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Configuration message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Configuration
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): cash.Configuration;

    /**
     * Decodes a Configuration message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Configuration
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): cash.Configuration;

    /**
     * Verifies a Configuration message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Configuration message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Configuration
     */
    public static fromObject(object: { [k: string]: any }): cash.Configuration;

    /**
     * Creates a plain object from a Configuration message. Also converts values to other types if specified.
     * @param message Configuration
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: cash.Configuration,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Configuration to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of an UpdateConfigurationMsg. */
  interface IUpdateConfigurationMsg {
    /** UpdateConfigurationMsg metadata */
    metadata?: weave.IMetadata | null;

    /** UpdateConfigurationMsg patch */
    patch?: cash.IConfiguration | null;
  }

  /** Represents an UpdateConfigurationMsg. */
  class UpdateConfigurationMsg implements IUpdateConfigurationMsg {
    /**
     * Constructs a new UpdateConfigurationMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: cash.IUpdateConfigurationMsg);

    /** UpdateConfigurationMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** UpdateConfigurationMsg patch. */
    public patch?: cash.IConfiguration | null;

    /**
     * Creates a new UpdateConfigurationMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns UpdateConfigurationMsg instance
     */
    public static create(properties?: cash.IUpdateConfigurationMsg): cash.UpdateConfigurationMsg;

    /**
     * Encodes the specified UpdateConfigurationMsg message. Does not implicitly {@link cash.UpdateConfigurationMsg.verify|verify} messages.
     * @param message UpdateConfigurationMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: cash.IUpdateConfigurationMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified UpdateConfigurationMsg message, length delimited. Does not implicitly {@link cash.UpdateConfigurationMsg.verify|verify} messages.
     * @param message UpdateConfigurationMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: cash.IUpdateConfigurationMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes an UpdateConfigurationMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns UpdateConfigurationMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): cash.UpdateConfigurationMsg;

    /**
     * Decodes an UpdateConfigurationMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns UpdateConfigurationMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): cash.UpdateConfigurationMsg;

    /**
     * Verifies an UpdateConfigurationMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an UpdateConfigurationMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns UpdateConfigurationMsg
     */
    public static fromObject(object: { [k: string]: any }): cash.UpdateConfigurationMsg;

    /**
     * Creates a plain object from an UpdateConfigurationMsg message. Also converts values to other types if specified.
     * @param message UpdateConfigurationMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: cash.UpdateConfigurationMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this UpdateConfigurationMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace cron. */
export namespace cron {
  /** Properties of a TaskResult. */
  interface ITaskResult {
    /** TaskResult metadata */
    metadata?: weave.IMetadata | null;

    /** Successful is set to true if the task was successfully executed. */
    successful?: boolean | null;

    /** about the task execution. */
    info?: string | null;

    /** Exec time hold the information of when the task was executed. */
    execTime?: number | Long | null;

    /** Exec height holds the block height value at the time the task was executed. */
    execHeight?: number | Long | null;
  }

  /** https://github.com/tendermint/tendermint/issues/3665 */
  class TaskResult implements ITaskResult {
    /**
     * Constructs a new TaskResult.
     * @param [properties] Properties to set
     */
    constructor(properties?: cron.ITaskResult);

    /** TaskResult metadata. */
    public metadata?: weave.IMetadata | null;

    /** Successful is set to true if the task was successfully executed. */
    public successful: boolean;

    /** about the task execution. */
    public info: string;

    /** Exec time hold the information of when the task was executed. */
    public execTime: number | Long;

    /** Exec height holds the block height value at the time the task was executed. */
    public execHeight: number | Long;

    /**
     * Creates a new TaskResult instance using the specified properties.
     * @param [properties] Properties to set
     * @returns TaskResult instance
     */
    public static create(properties?: cron.ITaskResult): cron.TaskResult;

    /**
     * Encodes the specified TaskResult message. Does not implicitly {@link cron.TaskResult.verify|verify} messages.
     * @param message TaskResult message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: cron.ITaskResult, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified TaskResult message, length delimited. Does not implicitly {@link cron.TaskResult.verify|verify} messages.
     * @param message TaskResult message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: cron.ITaskResult, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a TaskResult message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns TaskResult
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): cron.TaskResult;

    /**
     * Decodes a TaskResult message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns TaskResult
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): cron.TaskResult;

    /**
     * Verifies a TaskResult message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a TaskResult message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns TaskResult
     */
    public static fromObject(object: { [k: string]: any }): cron.TaskResult;

    /**
     * Creates a plain object from a TaskResult message. Also converts values to other types if specified.
     * @param message TaskResult
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: cron.TaskResult,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this TaskResult to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace currency. */
export namespace currency {
  /** Properties of a TokenInfo. */
  interface ITokenInfo {
    /** TokenInfo metadata */
    metadata?: weave.IMetadata | null;

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

    /** TokenInfo metadata. */
    public metadata?: weave.IMetadata | null;

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

  /** Properties of a CreateMsg. */
  interface ICreateMsg {
    /** CreateMsg metadata */
    metadata?: weave.IMetadata | null;

    /** CreateMsg ticker */
    ticker?: string | null;

    /** CreateMsg name */
    name?: string | null;
  }

  /** be registered only once. */
  class CreateMsg implements ICreateMsg {
    /**
     * Constructs a new CreateMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: currency.ICreateMsg);

    /** CreateMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** CreateMsg ticker. */
    public ticker: string;

    /** CreateMsg name. */
    public name: string;

    /**
     * Creates a new CreateMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CreateMsg instance
     */
    public static create(properties?: currency.ICreateMsg): currency.CreateMsg;

    /**
     * Encodes the specified CreateMsg message. Does not implicitly {@link currency.CreateMsg.verify|verify} messages.
     * @param message CreateMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: currency.ICreateMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified CreateMsg message, length delimited. Does not implicitly {@link currency.CreateMsg.verify|verify} messages.
     * @param message CreateMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: currency.ICreateMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a CreateMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CreateMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): currency.CreateMsg;

    /**
     * Decodes a CreateMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CreateMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): currency.CreateMsg;

    /**
     * Verifies a CreateMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a CreateMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CreateMsg
     */
    public static fromObject(object: { [k: string]: any }): currency.CreateMsg;

    /**
     * Creates a plain object from a CreateMsg message. Also converts values to other types if specified.
     * @param message CreateMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: currency.CreateMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this CreateMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace distribution. */
export namespace distribution {
  /** Properties of a Revenue. */
  interface IRevenue {
    /** Revenue metadata */
    metadata?: weave.IMetadata | null;

    /** While not enforced it is best to use a multisig contract here. */
    admin?: Uint8Array | null;

    /** distributed to. Must be at least one. */
    destinations?: distribution.IDestination[] | null;

    /** Address of this entity. Set during creation and does not change. */
    address?: Uint8Array | null;
  }

  /** the owners. */
  class Revenue implements IRevenue {
    /**
     * Constructs a new Revenue.
     * @param [properties] Properties to set
     */
    constructor(properties?: distribution.IRevenue);

    /** Revenue metadata. */
    public metadata?: weave.IMetadata | null;

    /** While not enforced it is best to use a multisig contract here. */
    public admin: Uint8Array;

    /** distributed to. Must be at least one. */
    public destinations: distribution.IDestination[];

    /** Address of this entity. Set during creation and does not change. */
    public address: Uint8Array;

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

  /** Properties of a Destination. */
  interface IDestination {
    /** of the validators. */
    address?: Uint8Array | null;

    /** second one. */
    weight?: number | null;
  }

  /** Represents a Destination. */
  class Destination implements IDestination {
    /**
     * Constructs a new Destination.
     * @param [properties] Properties to set
     */
    constructor(properties?: distribution.IDestination);

    /** of the validators. */
    public address: Uint8Array;

    /** second one. */
    public weight: number;

    /**
     * Creates a new Destination instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Destination instance
     */
    public static create(properties?: distribution.IDestination): distribution.Destination;

    /**
     * Encodes the specified Destination message. Does not implicitly {@link distribution.Destination.verify|verify} messages.
     * @param message Destination message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: distribution.IDestination, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Destination message, length delimited. Does not implicitly {@link distribution.Destination.verify|verify} messages.
     * @param message Destination message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: distribution.IDestination,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a Destination message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Destination
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): distribution.Destination;

    /**
     * Decodes a Destination message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Destination
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): distribution.Destination;

    /**
     * Verifies a Destination message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Destination message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Destination
     */
    public static fromObject(object: { [k: string]: any }): distribution.Destination;

    /**
     * Creates a plain object from a Destination message. Also converts values to other types if specified.
     * @param message Destination
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: distribution.Destination,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Destination to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a CreateMsg. */
  interface ICreateMsg {
    /** CreateMsg metadata */
    metadata?: weave.IMetadata | null;

    /** While not enforced it is best to use a multisig contract here. */
    admin?: Uint8Array | null;

    /** distributed to. Must be at least one. */
    destinations?: distribution.IDestination[] | null;
  }

  /** CreateMsg is issuing the creation of a new revenue stream instance. */
  class CreateMsg implements ICreateMsg {
    /**
     * Constructs a new CreateMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: distribution.ICreateMsg);

    /** CreateMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** While not enforced it is best to use a multisig contract here. */
    public admin: Uint8Array;

    /** distributed to. Must be at least one. */
    public destinations: distribution.IDestination[];

    /**
     * Creates a new CreateMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CreateMsg instance
     */
    public static create(properties?: distribution.ICreateMsg): distribution.CreateMsg;

    /**
     * Encodes the specified CreateMsg message. Does not implicitly {@link distribution.CreateMsg.verify|verify} messages.
     * @param message CreateMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: distribution.ICreateMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified CreateMsg message, length delimited. Does not implicitly {@link distribution.CreateMsg.verify|verify} messages.
     * @param message CreateMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: distribution.ICreateMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a CreateMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CreateMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): distribution.CreateMsg;

    /**
     * Decodes a CreateMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CreateMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): distribution.CreateMsg;

    /**
     * Verifies a CreateMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a CreateMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CreateMsg
     */
    public static fromObject(object: { [k: string]: any }): distribution.CreateMsg;

    /**
     * Creates a plain object from a CreateMsg message. Also converts values to other types if specified.
     * @param message CreateMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: distribution.CreateMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this CreateMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a DistributeMsg. */
  interface IDistributeMsg {
    /** DistributeMsg metadata */
    metadata?: weave.IMetadata | null;

    /** should be distributed between destinations. */
    revenueId?: Uint8Array | null;
  }

  /** signed using admin key. */
  class DistributeMsg implements IDistributeMsg {
    /**
     * Constructs a new DistributeMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: distribution.IDistributeMsg);

    /** DistributeMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** should be distributed between destinations. */
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

  /** Properties of a ResetMsg. */
  interface IResetMsg {
    /** ResetMsg metadata */
    metadata?: weave.IMetadata | null;

    /** Revenue ID reference an ID of a revenue instance that is updated. */
    revenueId?: Uint8Array | null;

    /** distributed to. Must be at least one. */
    destinations?: distribution.IDestination[] | null;
  }

  /** collected revenue amount is equal to zero the change is applied. */
  class ResetMsg implements IResetMsg {
    /**
     * Constructs a new ResetMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: distribution.IResetMsg);

    /** ResetMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** Revenue ID reference an ID of a revenue instance that is updated. */
    public revenueId: Uint8Array;

    /** distributed to. Must be at least one. */
    public destinations: distribution.IDestination[];

    /**
     * Creates a new ResetMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ResetMsg instance
     */
    public static create(properties?: distribution.IResetMsg): distribution.ResetMsg;

    /**
     * Encodes the specified ResetMsg message. Does not implicitly {@link distribution.ResetMsg.verify|verify} messages.
     * @param message ResetMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: distribution.IResetMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ResetMsg message, length delimited. Does not implicitly {@link distribution.ResetMsg.verify|verify} messages.
     * @param message ResetMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: distribution.IResetMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a ResetMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ResetMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): distribution.ResetMsg;

    /**
     * Decodes a ResetMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ResetMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): distribution.ResetMsg;

    /**
     * Verifies a ResetMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a ResetMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ResetMsg
     */
    public static fromObject(object: { [k: string]: any }): distribution.ResetMsg;

    /**
     * Creates a plain object from a ResetMsg message. Also converts values to other types if specified.
     * @param message ResetMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: distribution.ResetMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ResetMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace escrow. */
export namespace escrow {
  /** Properties of an Escrow. */
  interface IEscrow {
    /** Escrow metadata */
    metadata?: weave.IMetadata | null;

    /** Escrow source */
    source?: Uint8Array | null;

    /** Escrow arbiter */
    arbiter?: Uint8Array | null;

    /** Escrow destination */
    destination?: Uint8Array | null;

    /** expired: [timeout, infinity) */
    timeout?: number | Long | null;

    /** max length 128 character */
    memo?: string | null;

    /** Address of this entity. Set during creation and does not change. */
    address?: Uint8Array | null;
  }

  /** Upon timeout, they will be returned to the source. */
  class Escrow implements IEscrow {
    /**
     * Constructs a new Escrow.
     * @param [properties] Properties to set
     */
    constructor(properties?: escrow.IEscrow);

    /** Escrow metadata. */
    public metadata?: weave.IMetadata | null;

    /** Escrow source. */
    public source: Uint8Array;

    /** Escrow arbiter. */
    public arbiter: Uint8Array;

    /** Escrow destination. */
    public destination: Uint8Array;

    /** expired: [timeout, infinity) */
    public timeout: number | Long;

    /** max length 128 character */
    public memo: string;

    /** Address of this entity. Set during creation and does not change. */
    public address: Uint8Array;

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

  /** Properties of a CreateMsg. */
  interface ICreateMsg {
    /** CreateMsg metadata */
    metadata?: weave.IMetadata | null;

    /** CreateMsg source */
    source?: Uint8Array | null;

    /** CreateMsg arbiter */
    arbiter?: Uint8Array | null;

    /** CreateMsg destination */
    destination?: Uint8Array | null;

    /** amount may contain multiple token types */
    amount?: coin.ICoin[] | null;

    /** Timeout represents wall clock time. */
    timeout?: number | Long | null;

    /** max length 128 character */
    memo?: string | null;
  }

  /** The rest must be defined */
  class CreateMsg implements ICreateMsg {
    /**
     * Constructs a new CreateMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: escrow.ICreateMsg);

    /** CreateMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** CreateMsg source. */
    public source: Uint8Array;

    /** CreateMsg arbiter. */
    public arbiter: Uint8Array;

    /** CreateMsg destination. */
    public destination: Uint8Array;

    /** amount may contain multiple token types */
    public amount: coin.ICoin[];

    /** Timeout represents wall clock time. */
    public timeout: number | Long;

    /** max length 128 character */
    public memo: string;

    /**
     * Creates a new CreateMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CreateMsg instance
     */
    public static create(properties?: escrow.ICreateMsg): escrow.CreateMsg;

    /**
     * Encodes the specified CreateMsg message. Does not implicitly {@link escrow.CreateMsg.verify|verify} messages.
     * @param message CreateMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: escrow.ICreateMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified CreateMsg message, length delimited. Does not implicitly {@link escrow.CreateMsg.verify|verify} messages.
     * @param message CreateMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: escrow.ICreateMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a CreateMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CreateMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): escrow.CreateMsg;

    /**
     * Decodes a CreateMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CreateMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): escrow.CreateMsg;

    /**
     * Verifies a CreateMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a CreateMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CreateMsg
     */
    public static fromObject(object: { [k: string]: any }): escrow.CreateMsg;

    /**
     * Creates a plain object from a CreateMsg message. Also converts values to other types if specified.
     * @param message CreateMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: escrow.CreateMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this CreateMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a ReleaseMsg. */
  interface IReleaseMsg {
    /** ReleaseMsg metadata */
    metadata?: weave.IMetadata | null;

    /** ReleaseMsg escrowId */
    escrowId?: Uint8Array | null;

    /** ReleaseMsg amount */
    amount?: coin.ICoin[] | null;
  }

  /** May be a subset of the current balance. */
  class ReleaseMsg implements IReleaseMsg {
    /**
     * Constructs a new ReleaseMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: escrow.IReleaseMsg);

    /** ReleaseMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** ReleaseMsg escrowId. */
    public escrowId: Uint8Array;

    /** ReleaseMsg amount. */
    public amount: coin.ICoin[];

    /**
     * Creates a new ReleaseMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ReleaseMsg instance
     */
    public static create(properties?: escrow.IReleaseMsg): escrow.ReleaseMsg;

    /**
     * Encodes the specified ReleaseMsg message. Does not implicitly {@link escrow.ReleaseMsg.verify|verify} messages.
     * @param message ReleaseMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: escrow.IReleaseMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ReleaseMsg message, length delimited. Does not implicitly {@link escrow.ReleaseMsg.verify|verify} messages.
     * @param message ReleaseMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: escrow.IReleaseMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ReleaseMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ReleaseMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): escrow.ReleaseMsg;

    /**
     * Decodes a ReleaseMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ReleaseMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): escrow.ReleaseMsg;

    /**
     * Verifies a ReleaseMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a ReleaseMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ReleaseMsg
     */
    public static fromObject(object: { [k: string]: any }): escrow.ReleaseMsg;

    /**
     * Creates a plain object from a ReleaseMsg message. Also converts values to other types if specified.
     * @param message ReleaseMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: escrow.ReleaseMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ReleaseMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a ReturnMsg. */
  interface IReturnMsg {
    /** ReturnMsg metadata */
    metadata?: weave.IMetadata | null;

    /** ReturnMsg escrowId */
    escrowId?: Uint8Array | null;
  }

  /** Must be authorized by the source or an expired timeout */
  class ReturnMsg implements IReturnMsg {
    /**
     * Constructs a new ReturnMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: escrow.IReturnMsg);

    /** ReturnMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** ReturnMsg escrowId. */
    public escrowId: Uint8Array;

    /**
     * Creates a new ReturnMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ReturnMsg instance
     */
    public static create(properties?: escrow.IReturnMsg): escrow.ReturnMsg;

    /**
     * Encodes the specified ReturnMsg message. Does not implicitly {@link escrow.ReturnMsg.verify|verify} messages.
     * @param message ReturnMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: escrow.IReturnMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ReturnMsg message, length delimited. Does not implicitly {@link escrow.ReturnMsg.verify|verify} messages.
     * @param message ReturnMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: escrow.IReturnMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ReturnMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ReturnMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): escrow.ReturnMsg;

    /**
     * Decodes a ReturnMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ReturnMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): escrow.ReturnMsg;

    /**
     * Verifies a ReturnMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a ReturnMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ReturnMsg
     */
    public static fromObject(object: { [k: string]: any }): escrow.ReturnMsg;

    /**
     * Creates a plain object from a ReturnMsg message. Also converts values to other types if specified.
     * @param message ReturnMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: escrow.ReturnMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ReturnMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of an UpdatePartiesMsg. */
  interface IUpdatePartiesMsg {
    /** UpdatePartiesMsg metadata */
    metadata?: weave.IMetadata | null;

    /** UpdatePartiesMsg escrowId */
    escrowId?: Uint8Array | null;

    /** UpdatePartiesMsg source */
    source?: Uint8Array | null;

    /** UpdatePartiesMsg arbiter */
    arbiter?: Uint8Array | null;

    /** UpdatePartiesMsg destination */
    destination?: Uint8Array | null;
  }

  /** Represents delegating responsibility */
  class UpdatePartiesMsg implements IUpdatePartiesMsg {
    /**
     * Constructs a new UpdatePartiesMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: escrow.IUpdatePartiesMsg);

    /** UpdatePartiesMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** UpdatePartiesMsg escrowId. */
    public escrowId: Uint8Array;

    /** UpdatePartiesMsg source. */
    public source: Uint8Array;

    /** UpdatePartiesMsg arbiter. */
    public arbiter: Uint8Array;

    /** UpdatePartiesMsg destination. */
    public destination: Uint8Array;

    /**
     * Creates a new UpdatePartiesMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns UpdatePartiesMsg instance
     */
    public static create(properties?: escrow.IUpdatePartiesMsg): escrow.UpdatePartiesMsg;

    /**
     * Encodes the specified UpdatePartiesMsg message. Does not implicitly {@link escrow.UpdatePartiesMsg.verify|verify} messages.
     * @param message UpdatePartiesMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: escrow.IUpdatePartiesMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified UpdatePartiesMsg message, length delimited. Does not implicitly {@link escrow.UpdatePartiesMsg.verify|verify} messages.
     * @param message UpdatePartiesMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: escrow.IUpdatePartiesMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes an UpdatePartiesMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns UpdatePartiesMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): escrow.UpdatePartiesMsg;

    /**
     * Decodes an UpdatePartiesMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns UpdatePartiesMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): escrow.UpdatePartiesMsg;

    /**
     * Verifies an UpdatePartiesMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an UpdatePartiesMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns UpdatePartiesMsg
     */
    public static fromObject(object: { [k: string]: any }): escrow.UpdatePartiesMsg;

    /**
     * Creates a plain object from an UpdatePartiesMsg message. Also converts values to other types if specified.
     * @param message UpdatePartiesMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: escrow.UpdatePartiesMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this UpdatePartiesMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace gov. */
export namespace gov {
  /** Properties of an Electorate. */
  interface IElectorate {
    /** Electorate metadata */
    metadata?: weave.IMetadata | null;

    /** Document version */
    version?: number | null;

    /** Admin is the address that is allowed ot modify an existing electorate. */
    admin?: Uint8Array | null;

    /** Human readable title. */
    title?: string | null;

    /** Elector defines a list of all signatures that are allowed to participate in a vote */
    electors?: gov.IElector[] | null;

    /** TotalElectorateWeight is the sum of all electors weights. */
    totalElectorateWeight?: number | Long | null;
  }

  /** and is stored for re-use */
  class Electorate implements IElectorate {
    /**
     * Constructs a new Electorate.
     * @param [properties] Properties to set
     */
    constructor(properties?: gov.IElectorate);

    /** Electorate metadata. */
    public metadata?: weave.IMetadata | null;

    /** Document version */
    public version: number;

    /** Admin is the address that is allowed ot modify an existing electorate. */
    public admin: Uint8Array;

    /** Human readable title. */
    public title: string;

    /** Elector defines a list of all signatures that are allowed to participate in a vote */
    public electors: gov.IElector[];

    /** TotalElectorateWeight is the sum of all electors weights. */
    public totalElectorateWeight: number | Long;

    /**
     * Creates a new Electorate instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Electorate instance
     */
    public static create(properties?: gov.IElectorate): gov.Electorate;

    /**
     * Encodes the specified Electorate message. Does not implicitly {@link gov.Electorate.verify|verify} messages.
     * @param message Electorate message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: gov.IElectorate, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Electorate message, length delimited. Does not implicitly {@link gov.Electorate.verify|verify} messages.
     * @param message Electorate message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: gov.IElectorate, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an Electorate message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Electorate
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): gov.Electorate;

    /**
     * Decodes an Electorate message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Electorate
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): gov.Electorate;

    /**
     * Verifies an Electorate message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an Electorate message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Electorate
     */
    public static fromObject(object: { [k: string]: any }): gov.Electorate;

    /**
     * Creates a plain object from an Electorate message. Also converts values to other types if specified.
     * @param message Electorate
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: gov.Electorate,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Electorate to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of an Elector. */
  interface IElector {
    /** The address of the voter. */
    address?: Uint8Array | null;

    /** Weight defines the power of the participants vote. max value is 65535 (2^16-1). */
    weight?: number | null;
  }

  /** the greater the power of a participant. */
  class Elector implements IElector {
    /**
     * Constructs a new Elector.
     * @param [properties] Properties to set
     */
    constructor(properties?: gov.IElector);

    /** The address of the voter. */
    public address: Uint8Array;

    /** Weight defines the power of the participants vote. max value is 65535 (2^16-1). */
    public weight: number;

    /**
     * Creates a new Elector instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Elector instance
     */
    public static create(properties?: gov.IElector): gov.Elector;

    /**
     * Encodes the specified Elector message. Does not implicitly {@link gov.Elector.verify|verify} messages.
     * @param message Elector message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: gov.IElector, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Elector message, length delimited. Does not implicitly {@link gov.Elector.verify|verify} messages.
     * @param message Elector message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: gov.IElector, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an Elector message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Elector
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): gov.Elector;

    /**
     * Decodes an Elector message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Elector
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): gov.Elector;

    /**
     * Verifies an Elector message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an Elector message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Elector
     */
    public static fromObject(object: { [k: string]: any }): gov.Elector;

    /**
     * Creates a plain object from an Elector message. Also converts values to other types if specified.
     * @param message Elector
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: gov.Elector,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Elector to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of an ElectionRule. */
  interface IElectionRule {
    /** ElectionRule metadata */
    metadata?: weave.IMetadata | null;

    /** Document version. */
    version?: number | null;

    /** Admin is the address that is allowed to modify an existing election rule. */
    admin?: Uint8Array | null;

    /** ElectorateID references the electorate using this rule (without version, as changing electorate changes the rule). */
    electorateId?: Uint8Array | null;

    /** Human readable title. */
    title?: string | null;

    /** Duration in seconds of how long the voting period will take place. */
    votingPeriod?: number | null;

    /** of the eligible voters. */
    threshold?: gov.IFraction | null;

    /** of the eligible voters. */
    quorum?: gov.IFraction | null;

    /** Address of this entity. Set during creation and does not change. */
    address?: Uint8Array | null;
  }

  /** Election Rule defines how an election is run. A proposal must be voted upon via a pre-defined ruleset. */
  class ElectionRule implements IElectionRule {
    /**
     * Constructs a new ElectionRule.
     * @param [properties] Properties to set
     */
    constructor(properties?: gov.IElectionRule);

    /** ElectionRule metadata. */
    public metadata?: weave.IMetadata | null;

    /** Document version. */
    public version: number;

    /** Admin is the address that is allowed to modify an existing election rule. */
    public admin: Uint8Array;

    /** ElectorateID references the electorate using this rule (without version, as changing electorate changes the rule). */
    public electorateId: Uint8Array;

    /** Human readable title. */
    public title: string;

    /** Duration in seconds of how long the voting period will take place. */
    public votingPeriod: number;

    /** of the eligible voters. */
    public threshold?: gov.IFraction | null;

    /** of the eligible voters. */
    public quorum?: gov.IFraction | null;

    /** Address of this entity. Set during creation and does not change. */
    public address: Uint8Array;

    /**
     * Creates a new ElectionRule instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ElectionRule instance
     */
    public static create(properties?: gov.IElectionRule): gov.ElectionRule;

    /**
     * Encodes the specified ElectionRule message. Does not implicitly {@link gov.ElectionRule.verify|verify} messages.
     * @param message ElectionRule message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: gov.IElectionRule, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ElectionRule message, length delimited. Does not implicitly {@link gov.ElectionRule.verify|verify} messages.
     * @param message ElectionRule message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: gov.IElectionRule, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an ElectionRule message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ElectionRule
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): gov.ElectionRule;

    /**
     * Decodes an ElectionRule message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ElectionRule
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): gov.ElectionRule;

    /**
     * Verifies an ElectionRule message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an ElectionRule message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ElectionRule
     */
    public static fromObject(object: { [k: string]: any }): gov.ElectionRule;

    /**
     * Creates a plain object from an ElectionRule message. Also converts values to other types if specified.
     * @param message ElectionRule
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: gov.ElectionRule,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ElectionRule to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a Fraction. */
  interface IFraction {
    /** The top number in a fraction. */
    numerator?: number | null;

    /** The bottom number */
    denominator?: number | null;
  }

  /** Valid range of the fraction is 0.5 to 1. */
  class Fraction implements IFraction {
    /**
     * Constructs a new Fraction.
     * @param [properties] Properties to set
     */
    constructor(properties?: gov.IFraction);

    /** The top number in a fraction. */
    public numerator: number;

    /** The bottom number */
    public denominator: number;

    /**
     * Creates a new Fraction instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Fraction instance
     */
    public static create(properties?: gov.IFraction): gov.Fraction;

    /**
     * Encodes the specified Fraction message. Does not implicitly {@link gov.Fraction.verify|verify} messages.
     * @param message Fraction message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: gov.IFraction, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Fraction message, length delimited. Does not implicitly {@link gov.Fraction.verify|verify} messages.
     * @param message Fraction message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: gov.IFraction, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Fraction message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Fraction
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): gov.Fraction;

    /**
     * Decodes a Fraction message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Fraction
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): gov.Fraction;

    /**
     * Verifies a Fraction message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Fraction message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Fraction
     */
    public static fromObject(object: { [k: string]: any }): gov.Fraction;

    /**
     * Creates a plain object from a Fraction message. Also converts values to other types if specified.
     * @param message Fraction
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: gov.Fraction,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Fraction to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a Proposal. */
  interface IProposal {
    /** Proposal metadata */
    metadata?: weave.IMetadata | null;

    /** Human readable title. */
    title?: string | null;

    /** Content of the proposal. Protobuf encoded, app-specific decoded must be passed in constructor */
    rawOption?: Uint8Array | null;

    /** Description of the proposal in text form. */
    description?: string | null;

    /** ElectionRuleRef is a reference to the election rule */
    electionRuleRef?: orm.IVersionedIDRef | null;

    /** Reference to the electorate to define the group of possible voters. */
    electorateRef?: orm.IVersionedIDRef | null;

    /** to this start time. */
    votingStartTime?: number | Long | null;

    /** to be included in the election. */
    votingEndTime?: number | Long | null;

    /** Unix timestamp of the block where the proposal was added to the chain. */
    submissionTime?: number | Long | null;

    /** Address of the author who created the proposal. If not set explicit on creation it will default to the main signer. */
    author?: Uint8Array | null;

    /** Result of the election. Contains intermediate tally results while voting period is open. */
    voteState?: gov.ITallyResult | null;

    /** Status represents the high level position in the life cycle of the proposal. Initial value is Submitted. */
    status?: gov.Proposal.Status | null;

    /** Result is the final result based on the votes and election rule. Initial value is Undefined. */
    result?: gov.Proposal.Result | null;

    /** Result is the final result based on the votes and election rule. Initial value is NotRun. */
    executorResult?: gov.Proposal.ExecutorResult | null;

    /** create the tally once the voting period is over. */
    tallyTaskId?: Uint8Array | null;
  }

  /** (what is being voted on) */
  class Proposal implements IProposal {
    /**
     * Constructs a new Proposal.
     * @param [properties] Properties to set
     */
    constructor(properties?: gov.IProposal);

    /** Proposal metadata. */
    public metadata?: weave.IMetadata | null;

    /** Human readable title. */
    public title: string;

    /** Content of the proposal. Protobuf encoded, app-specific decoded must be passed in constructor */
    public rawOption: Uint8Array;

    /** Description of the proposal in text form. */
    public description: string;

    /** ElectionRuleRef is a reference to the election rule */
    public electionRuleRef?: orm.IVersionedIDRef | null;

    /** Reference to the electorate to define the group of possible voters. */
    public electorateRef?: orm.IVersionedIDRef | null;

    /** to this start time. */
    public votingStartTime: number | Long;

    /** to be included in the election. */
    public votingEndTime: number | Long;

    /** Unix timestamp of the block where the proposal was added to the chain. */
    public submissionTime: number | Long;

    /** Address of the author who created the proposal. If not set explicit on creation it will default to the main signer. */
    public author: Uint8Array;

    /** Result of the election. Contains intermediate tally results while voting period is open. */
    public voteState?: gov.ITallyResult | null;

    /** Status represents the high level position in the life cycle of the proposal. Initial value is Submitted. */
    public status: gov.Proposal.Status;

    /** Result is the final result based on the votes and election rule. Initial value is Undefined. */
    public result: gov.Proposal.Result;

    /** Result is the final result based on the votes and election rule. Initial value is NotRun. */
    public executorResult: gov.Proposal.ExecutorResult;

    /** create the tally once the voting period is over. */
    public tallyTaskId: Uint8Array;

    /**
     * Creates a new Proposal instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Proposal instance
     */
    public static create(properties?: gov.IProposal): gov.Proposal;

    /**
     * Encodes the specified Proposal message. Does not implicitly {@link gov.Proposal.verify|verify} messages.
     * @param message Proposal message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: gov.IProposal, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Proposal message, length delimited. Does not implicitly {@link gov.Proposal.verify|verify} messages.
     * @param message Proposal message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: gov.IProposal, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Proposal message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Proposal
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): gov.Proposal;

    /**
     * Decodes a Proposal message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Proposal
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): gov.Proposal;

    /**
     * Verifies a Proposal message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Proposal message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Proposal
     */
    public static fromObject(object: { [k: string]: any }): gov.Proposal;

    /**
     * Creates a plain object from a Proposal message. Also converts values to other types if specified.
     * @param message Proposal
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: gov.Proposal,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Proposal to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  namespace Proposal {
    /** Status enum. */
    enum Status {
      PROPOSAL_STATUS_INVALID = 0,
      PROPOSAL_STATUS_SUBMITTED = 1,
      PROPOSAL_STATUS_CLOSED = 2,
      PROPOSAL_STATUS_WITHDRAWN = 3,
    }

    /** Result enum. */
    enum Result {
      PROPOSAL_RESULT_INVALID = 0,
      PROPOSAL_RESULT_UNDEFINED = 1,
      PROPOSAL_RESULT_ACCEPTED = 2,
      PROPOSAL_RESULT_REJECTED = 3,
    }

    /** ExecutorResult enum. */
    enum ExecutorResult {
      PROPOSAL_EXECUTOR_RESULT_INVALID = 0,
      PROPOSAL_EXECUTOR_RESULT_NOT_RUN = 1,
      PROPOSAL_EXECUTOR_RESULT_SUCCESS = 2,
      PROPOSAL_EXECUTOR_RESULT_FAILURE = 3,
    }
  }

  /** Properties of a Resolution. */
  interface IResolution {
    /** Resolution metadata */
    metadata?: weave.IMetadata | null;

    /** Resolution proposalId */
    proposalId?: Uint8Array | null;

    /** Resolution electorateRef */
    electorateRef?: orm.IVersionedIDRef | null;

    /** Resolution resolution */
    resolution?: string | null;
  }

  /** Resolution contains TextResolution and an electorate reference. */
  class Resolution implements IResolution {
    /**
     * Constructs a new Resolution.
     * @param [properties] Properties to set
     */
    constructor(properties?: gov.IResolution);

    /** Resolution metadata. */
    public metadata?: weave.IMetadata | null;

    /** Resolution proposalId. */
    public proposalId: Uint8Array;

    /** Resolution electorateRef. */
    public electorateRef?: orm.IVersionedIDRef | null;

    /** Resolution resolution. */
    public resolution: string;

    /**
     * Creates a new Resolution instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Resolution instance
     */
    public static create(properties?: gov.IResolution): gov.Resolution;

    /**
     * Encodes the specified Resolution message. Does not implicitly {@link gov.Resolution.verify|verify} messages.
     * @param message Resolution message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: gov.IResolution, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Resolution message, length delimited. Does not implicitly {@link gov.Resolution.verify|verify} messages.
     * @param message Resolution message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: gov.IResolution, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Resolution message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Resolution
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): gov.Resolution;

    /**
     * Decodes a Resolution message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Resolution
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): gov.Resolution;

    /**
     * Verifies a Resolution message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Resolution message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Resolution
     */
    public static fromObject(object: { [k: string]: any }): gov.Resolution;

    /**
     * Creates a plain object from a Resolution message. Also converts values to other types if specified.
     * @param message Resolution
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: gov.Resolution,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Resolution to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a TallyResult. */
  interface ITallyResult {
    /** TotalYes is the sum of weights of all the voters that approved the proposal */
    totalYes?: number | Long | null;

    /** TotalNo is the sum of weights of all the voters that rejected the proposal */
    totalNo?: number | Long | null;

    /** TotalAbstain is the sum of weights of all the voters that voted abstain */
    totalAbstain?: number | Long | null;

    /** TotalElectorateWeight is the sum of all weights in the electorate. */
    totalElectorateWeight?: number | Long | null;

    /** Quorum when set is the fraction of the total electorate weight that must be exceeded by total votes weight. */
    quorum?: gov.IFraction | null;

    /** The base value is either the total electorate weight or the sum of Yes/No weights when a quorum is defined. */
    threshold?: gov.IFraction | null;
  }

  /** TallyResult contains sums of the votes and all data for the final result. */
  class TallyResult implements ITallyResult {
    /**
     * Constructs a new TallyResult.
     * @param [properties] Properties to set
     */
    constructor(properties?: gov.ITallyResult);

    /** TotalYes is the sum of weights of all the voters that approved the proposal */
    public totalYes: number | Long;

    /** TotalNo is the sum of weights of all the voters that rejected the proposal */
    public totalNo: number | Long;

    /** TotalAbstain is the sum of weights of all the voters that voted abstain */
    public totalAbstain: number | Long;

    /** TotalElectorateWeight is the sum of all weights in the electorate. */
    public totalElectorateWeight: number | Long;

    /** Quorum when set is the fraction of the total electorate weight that must be exceeded by total votes weight. */
    public quorum?: gov.IFraction | null;

    /** The base value is either the total electorate weight or the sum of Yes/No weights when a quorum is defined. */
    public threshold?: gov.IFraction | null;

    /**
     * Creates a new TallyResult instance using the specified properties.
     * @param [properties] Properties to set
     * @returns TallyResult instance
     */
    public static create(properties?: gov.ITallyResult): gov.TallyResult;

    /**
     * Encodes the specified TallyResult message. Does not implicitly {@link gov.TallyResult.verify|verify} messages.
     * @param message TallyResult message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: gov.ITallyResult, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified TallyResult message, length delimited. Does not implicitly {@link gov.TallyResult.verify|verify} messages.
     * @param message TallyResult message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: gov.ITallyResult, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a TallyResult message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns TallyResult
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): gov.TallyResult;

    /**
     * Decodes a TallyResult message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns TallyResult
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): gov.TallyResult;

    /**
     * Verifies a TallyResult message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a TallyResult message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns TallyResult
     */
    public static fromObject(object: { [k: string]: any }): gov.TallyResult;

    /**
     * Creates a plain object from a TallyResult message. Also converts values to other types if specified.
     * @param message TallyResult
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: gov.TallyResult,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this TallyResult to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a Vote. */
  interface IVote {
    /** Vote metadata */
    metadata?: weave.IMetadata | null;

    /** Elector is who voted */
    elector?: gov.IElector | null;

    /** VoteOption is what they voted */
    voted?: gov.VoteOption | null;
  }

  /** The proposalID and address is stored within the key. */
  class Vote implements IVote {
    /**
     * Constructs a new Vote.
     * @param [properties] Properties to set
     */
    constructor(properties?: gov.IVote);

    /** Vote metadata. */
    public metadata?: weave.IMetadata | null;

    /** Elector is who voted */
    public elector?: gov.IElector | null;

    /** VoteOption is what they voted */
    public voted: gov.VoteOption;

    /**
     * Creates a new Vote instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Vote instance
     */
    public static create(properties?: gov.IVote): gov.Vote;

    /**
     * Encodes the specified Vote message. Does not implicitly {@link gov.Vote.verify|verify} messages.
     * @param message Vote message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: gov.IVote, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Vote message, length delimited. Does not implicitly {@link gov.Vote.verify|verify} messages.
     * @param message Vote message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: gov.IVote, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Vote message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Vote
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): gov.Vote;

    /**
     * Decodes a Vote message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Vote
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): gov.Vote;

    /**
     * Verifies a Vote message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Vote message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Vote
     */
    public static fromObject(object: { [k: string]: any }): gov.Vote;

    /**
     * Creates a plain object from a Vote message. Also converts values to other types if specified.
     * @param message Vote
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: gov.Vote, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Vote to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a CreateProposalMsg. */
  interface ICreateProposalMsg {
    /** CreateProposalMsg metadata */
    metadata?: weave.IMetadata | null;

    /** Human readable title. Must match `^[a-zA-Z0-9 _.-]{4,128}$` */
    title?: string | null;

    /** Content of the proposal. Protobuf encoded, app-specific decoded must be passed in handler constructor */
    rawOption?: Uint8Array | null;

    /** Human readable description with 3 to 5000 chars. */
    description?: string | null;

    /** ElectionRuleID is a reference to the election rule */
    electionRuleId?: Uint8Array | null;

    /** Unix timestamp when the proposal starts. Must be in the future. */
    startTime?: number | Long | null;

    /** When not set it will default to the main signer. */
    author?: Uint8Array | null;
  }

  /** (what is being voted on) */
  class CreateProposalMsg implements ICreateProposalMsg {
    /**
     * Constructs a new CreateProposalMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: gov.ICreateProposalMsg);

    /** CreateProposalMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** Human readable title. Must match `^[a-zA-Z0-9 _.-]{4,128}$` */
    public title: string;

    /** Content of the proposal. Protobuf encoded, app-specific decoded must be passed in handler constructor */
    public rawOption: Uint8Array;

    /** Human readable description with 3 to 5000 chars. */
    public description: string;

    /** ElectionRuleID is a reference to the election rule */
    public electionRuleId: Uint8Array;

    /** Unix timestamp when the proposal starts. Must be in the future. */
    public startTime: number | Long;

    /** When not set it will default to the main signer. */
    public author: Uint8Array;

    /**
     * Creates a new CreateProposalMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CreateProposalMsg instance
     */
    public static create(properties?: gov.ICreateProposalMsg): gov.CreateProposalMsg;

    /**
     * Encodes the specified CreateProposalMsg message. Does not implicitly {@link gov.CreateProposalMsg.verify|verify} messages.
     * @param message CreateProposalMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: gov.ICreateProposalMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified CreateProposalMsg message, length delimited. Does not implicitly {@link gov.CreateProposalMsg.verify|verify} messages.
     * @param message CreateProposalMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: gov.ICreateProposalMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a CreateProposalMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CreateProposalMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): gov.CreateProposalMsg;

    /**
     * Decodes a CreateProposalMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CreateProposalMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): gov.CreateProposalMsg;

    /**
     * Verifies a CreateProposalMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a CreateProposalMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CreateProposalMsg
     */
    public static fromObject(object: { [k: string]: any }): gov.CreateProposalMsg;

    /**
     * Creates a plain object from a CreateProposalMsg message. Also converts values to other types if specified.
     * @param message CreateProposalMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: gov.CreateProposalMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this CreateProposalMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a DeleteProposalMsg. */
  interface IDeleteProposalMsg {
    /** DeleteProposalMsg metadata */
    metadata?: weave.IMetadata | null;

    /** ProposalID is the unique identifier of the proposal to delete */
    proposalId?: Uint8Array | null;
  }

  /** DeleteProposalMsg deletes a governance proposal. */
  class DeleteProposalMsg implements IDeleteProposalMsg {
    /**
     * Constructs a new DeleteProposalMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: gov.IDeleteProposalMsg);

    /** DeleteProposalMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** ProposalID is the unique identifier of the proposal to delete */
    public proposalId: Uint8Array;

    /**
     * Creates a new DeleteProposalMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns DeleteProposalMsg instance
     */
    public static create(properties?: gov.IDeleteProposalMsg): gov.DeleteProposalMsg;

    /**
     * Encodes the specified DeleteProposalMsg message. Does not implicitly {@link gov.DeleteProposalMsg.verify|verify} messages.
     * @param message DeleteProposalMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: gov.IDeleteProposalMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified DeleteProposalMsg message, length delimited. Does not implicitly {@link gov.DeleteProposalMsg.verify|verify} messages.
     * @param message DeleteProposalMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: gov.IDeleteProposalMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a DeleteProposalMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns DeleteProposalMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): gov.DeleteProposalMsg;

    /**
     * Decodes a DeleteProposalMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns DeleteProposalMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): gov.DeleteProposalMsg;

    /**
     * Verifies a DeleteProposalMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a DeleteProposalMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns DeleteProposalMsg
     */
    public static fromObject(object: { [k: string]: any }): gov.DeleteProposalMsg;

    /**
     * Creates a plain object from a DeleteProposalMsg message. Also converts values to other types if specified.
     * @param message DeleteProposalMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: gov.DeleteProposalMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this DeleteProposalMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** VoteOptions define possible values for a vote including the INVALID default. */
  enum VoteOption {
    VOTE_OPTION_INVALID = 0,
    VOTE_OPTION_YES = 1,
    VOTE_OPTION_NO = 2,
    VOTE_OPTION_ABSTAIN = 3,
  }

  /** Properties of a VoteMsg. */
  interface IVoteMsg {
    /** VoteMsg metadata */
    metadata?: weave.IMetadata | null;

    /** The unique id of the proposal. */
    proposalId?: Uint8Array | null;

    /** must be included in the electorate for a valid vote. */
    voter?: Uint8Array | null;

    /** Option for the vote. Must be Yes, No or Abstain for a valid vote. */
    selected?: gov.VoteOption | null;
  }

  /** VoteMsg is the way to express a voice and participate in an election of a proposal on chain. */
  class VoteMsg implements IVoteMsg {
    /**
     * Constructs a new VoteMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: gov.IVoteMsg);

    /** VoteMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** The unique id of the proposal. */
    public proposalId: Uint8Array;

    /** must be included in the electorate for a valid vote. */
    public voter: Uint8Array;

    /** Option for the vote. Must be Yes, No or Abstain for a valid vote. */
    public selected: gov.VoteOption;

    /**
     * Creates a new VoteMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns VoteMsg instance
     */
    public static create(properties?: gov.IVoteMsg): gov.VoteMsg;

    /**
     * Encodes the specified VoteMsg message. Does not implicitly {@link gov.VoteMsg.verify|verify} messages.
     * @param message VoteMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: gov.IVoteMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified VoteMsg message, length delimited. Does not implicitly {@link gov.VoteMsg.verify|verify} messages.
     * @param message VoteMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: gov.IVoteMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a VoteMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns VoteMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): gov.VoteMsg;

    /**
     * Decodes a VoteMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns VoteMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): gov.VoteMsg;

    /**
     * Verifies a VoteMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a VoteMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns VoteMsg
     */
    public static fromObject(object: { [k: string]: any }): gov.VoteMsg;

    /**
     * Creates a plain object from a VoteMsg message. Also converts values to other types if specified.
     * @param message VoteMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: gov.VoteMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this VoteMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a TallyMsg. */
  interface ITallyMsg {
    /** TallyMsg metadata */
    metadata?: weave.IMetadata | null;

    /** ProposalID is UUID of the proposal to close. */
    proposalId?: Uint8Array | null;
  }

  /** A final tally can be execute only once. A second submission will fail with an invalid state error. */
  class TallyMsg implements ITallyMsg {
    /**
     * Constructs a new TallyMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: gov.ITallyMsg);

    /** TallyMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** ProposalID is UUID of the proposal to close. */
    public proposalId: Uint8Array;

    /**
     * Creates a new TallyMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns TallyMsg instance
     */
    public static create(properties?: gov.ITallyMsg): gov.TallyMsg;

    /**
     * Encodes the specified TallyMsg message. Does not implicitly {@link gov.TallyMsg.verify|verify} messages.
     * @param message TallyMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: gov.ITallyMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified TallyMsg message, length delimited. Does not implicitly {@link gov.TallyMsg.verify|verify} messages.
     * @param message TallyMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: gov.ITallyMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a TallyMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns TallyMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): gov.TallyMsg;

    /**
     * Decodes a TallyMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns TallyMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): gov.TallyMsg;

    /**
     * Verifies a TallyMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a TallyMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns TallyMsg
     */
    public static fromObject(object: { [k: string]: any }): gov.TallyMsg;

    /**
     * Creates a plain object from a TallyMsg message. Also converts values to other types if specified.
     * @param message TallyMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: gov.TallyMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this TallyMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a CreateTextResolutionMsg. */
  interface ICreateTextResolutionMsg {
    /** CreateTextResolutionMsg metadata */
    metadata?: weave.IMetadata | null;

    /** CreateTextResolutionMsg resolution */
    resolution?: string | null;
  }

  /** with a reference to the electorate that approved it */
  class CreateTextResolutionMsg implements ICreateTextResolutionMsg {
    /**
     * Constructs a new CreateTextResolutionMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: gov.ICreateTextResolutionMsg);

    /** CreateTextResolutionMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** CreateTextResolutionMsg resolution. */
    public resolution: string;

    /**
     * Creates a new CreateTextResolutionMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CreateTextResolutionMsg instance
     */
    public static create(properties?: gov.ICreateTextResolutionMsg): gov.CreateTextResolutionMsg;

    /**
     * Encodes the specified CreateTextResolutionMsg message. Does not implicitly {@link gov.CreateTextResolutionMsg.verify|verify} messages.
     * @param message CreateTextResolutionMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: gov.ICreateTextResolutionMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified CreateTextResolutionMsg message, length delimited. Does not implicitly {@link gov.CreateTextResolutionMsg.verify|verify} messages.
     * @param message CreateTextResolutionMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: gov.ICreateTextResolutionMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a CreateTextResolutionMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CreateTextResolutionMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): gov.CreateTextResolutionMsg;

    /**
     * Decodes a CreateTextResolutionMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CreateTextResolutionMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): gov.CreateTextResolutionMsg;

    /**
     * Verifies a CreateTextResolutionMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a CreateTextResolutionMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CreateTextResolutionMsg
     */
    public static fromObject(object: { [k: string]: any }): gov.CreateTextResolutionMsg;

    /**
     * Creates a plain object from a CreateTextResolutionMsg message. Also converts values to other types if specified.
     * @param message CreateTextResolutionMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: gov.CreateTextResolutionMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this CreateTextResolutionMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of an UpdateElectorateMsg. */
  interface IUpdateElectorateMsg {
    /** UpdateElectorateMsg metadata */
    metadata?: weave.IMetadata | null;

    /** ElectorateID is the reference to the electorate that defines the group of possible voters. */
    electorateId?: Uint8Array | null;

    /** with weight=0. */
    diffElectors?: gov.IElector[] | null;
  }

  /** Represents an UpdateElectorateMsg. */
  class UpdateElectorateMsg implements IUpdateElectorateMsg {
    /**
     * Constructs a new UpdateElectorateMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: gov.IUpdateElectorateMsg);

    /** UpdateElectorateMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** ElectorateID is the reference to the electorate that defines the group of possible voters. */
    public electorateId: Uint8Array;

    /** with weight=0. */
    public diffElectors: gov.IElector[];

    /**
     * Creates a new UpdateElectorateMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns UpdateElectorateMsg instance
     */
    public static create(properties?: gov.IUpdateElectorateMsg): gov.UpdateElectorateMsg;

    /**
     * Encodes the specified UpdateElectorateMsg message. Does not implicitly {@link gov.UpdateElectorateMsg.verify|verify} messages.
     * @param message UpdateElectorateMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: gov.IUpdateElectorateMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified UpdateElectorateMsg message, length delimited. Does not implicitly {@link gov.UpdateElectorateMsg.verify|verify} messages.
     * @param message UpdateElectorateMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: gov.IUpdateElectorateMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes an UpdateElectorateMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns UpdateElectorateMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): gov.UpdateElectorateMsg;

    /**
     * Decodes an UpdateElectorateMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns UpdateElectorateMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): gov.UpdateElectorateMsg;

    /**
     * Verifies an UpdateElectorateMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an UpdateElectorateMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns UpdateElectorateMsg
     */
    public static fromObject(object: { [k: string]: any }): gov.UpdateElectorateMsg;

    /**
     * Creates a plain object from an UpdateElectorateMsg message. Also converts values to other types if specified.
     * @param message UpdateElectorateMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: gov.UpdateElectorateMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this UpdateElectorateMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of an UpdateElectionRuleMsg. */
  interface IUpdateElectionRuleMsg {
    /** UpdateElectionRuleMsg metadata */
    metadata?: weave.IMetadata | null;

    /** ElectionRuleID is a reference to the election rule */
    electionRuleId?: Uint8Array | null;

    /** Duration in seconds of how long the voting period will take place. */
    votingPeriod?: number | null;

    /** of the eligible voters. */
    threshold?: gov.IFraction | null;

    /** allows any value between half and all of the eligible voters. */
    quorum?: gov.IFraction | null;
  }

  /** Represents an UpdateElectionRuleMsg. */
  class UpdateElectionRuleMsg implements IUpdateElectionRuleMsg {
    /**
     * Constructs a new UpdateElectionRuleMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: gov.IUpdateElectionRuleMsg);

    /** UpdateElectionRuleMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** ElectionRuleID is a reference to the election rule */
    public electionRuleId: Uint8Array;

    /** Duration in seconds of how long the voting period will take place. */
    public votingPeriod: number;

    /** of the eligible voters. */
    public threshold?: gov.IFraction | null;

    /** allows any value between half and all of the eligible voters. */
    public quorum?: gov.IFraction | null;

    /**
     * Creates a new UpdateElectionRuleMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns UpdateElectionRuleMsg instance
     */
    public static create(properties?: gov.IUpdateElectionRuleMsg): gov.UpdateElectionRuleMsg;

    /**
     * Encodes the specified UpdateElectionRuleMsg message. Does not implicitly {@link gov.UpdateElectionRuleMsg.verify|verify} messages.
     * @param message UpdateElectionRuleMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: gov.IUpdateElectionRuleMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified UpdateElectionRuleMsg message, length delimited. Does not implicitly {@link gov.UpdateElectionRuleMsg.verify|verify} messages.
     * @param message UpdateElectionRuleMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: gov.IUpdateElectionRuleMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes an UpdateElectionRuleMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns UpdateElectionRuleMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): gov.UpdateElectionRuleMsg;

    /**
     * Decodes an UpdateElectionRuleMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns UpdateElectionRuleMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): gov.UpdateElectionRuleMsg;

    /**
     * Verifies an UpdateElectionRuleMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an UpdateElectionRuleMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns UpdateElectionRuleMsg
     */
    public static fromObject(object: { [k: string]: any }): gov.UpdateElectionRuleMsg;

    /**
     * Creates a plain object from an UpdateElectionRuleMsg message. Also converts values to other types if specified.
     * @param message UpdateElectionRuleMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: gov.UpdateElectionRuleMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this UpdateElectionRuleMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a ProposalOptions. */
  interface IProposalOptions {
    /** ProposalOptions text */
    text?: gov.ICreateTextResolutionMsg | null;

    /** ProposalOptions electorate */
    electorate?: gov.IUpdateElectorateMsg | null;

    /** ProposalOptions rule */
    rule?: gov.IUpdateElectionRuleMsg | null;
  }

  /** and handlers, but an application can reference messages from any package. */
  class ProposalOptions implements IProposalOptions {
    /**
     * Constructs a new ProposalOptions.
     * @param [properties] Properties to set
     */
    constructor(properties?: gov.IProposalOptions);

    /** ProposalOptions text. */
    public text?: gov.ICreateTextResolutionMsg | null;

    /** ProposalOptions electorate. */
    public electorate?: gov.IUpdateElectorateMsg | null;

    /** ProposalOptions rule. */
    public rule?: gov.IUpdateElectionRuleMsg | null;

    /** ProposalOptions option. */
    public option?: "text" | "electorate" | "rule";

    /**
     * Creates a new ProposalOptions instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ProposalOptions instance
     */
    public static create(properties?: gov.IProposalOptions): gov.ProposalOptions;

    /**
     * Encodes the specified ProposalOptions message. Does not implicitly {@link gov.ProposalOptions.verify|verify} messages.
     * @param message ProposalOptions message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: gov.IProposalOptions, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ProposalOptions message, length delimited. Does not implicitly {@link gov.ProposalOptions.verify|verify} messages.
     * @param message ProposalOptions message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: gov.IProposalOptions, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a ProposalOptions message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ProposalOptions
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): gov.ProposalOptions;

    /**
     * Decodes a ProposalOptions message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ProposalOptions
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): gov.ProposalOptions;

    /**
     * Verifies a ProposalOptions message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a ProposalOptions message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ProposalOptions
     */
    public static fromObject(object: { [k: string]: any }): gov.ProposalOptions;

    /**
     * Creates a plain object from a ProposalOptions message. Also converts values to other types if specified.
     * @param message ProposalOptions
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: gov.ProposalOptions,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ProposalOptions to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace msgfee. */
export namespace msgfee {
  /** Properties of a MsgFee. */
  interface IMsgFee {
    /** MsgFee metadata */
    metadata?: weave.IMetadata | null;

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

    /** MsgFee metadata. */
    public metadata?: weave.IMetadata | null;

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
    /** Contract metadata */
    metadata?: weave.IMetadata | null;

    /** contract. */
    participants?: multisig.IParticipant[] | null;

    /** computed as the sum of weights of all participating signatures. */
    activationThreshold?: number | null;

    /** computed as the sum of weights of all participating signatures. */
    adminThreshold?: number | null;

    /** Address of this entity. Set during creation and does not change. */
    address?: Uint8Array | null;
  }

  /** Represents a Contract. */
  class Contract implements IContract {
    /**
     * Constructs a new Contract.
     * @param [properties] Properties to set
     */
    constructor(properties?: multisig.IContract);

    /** Contract metadata. */
    public metadata?: weave.IMetadata | null;

    /** contract. */
    public participants: multisig.IParticipant[];

    /** computed as the sum of weights of all participating signatures. */
    public activationThreshold: number;

    /** computed as the sum of weights of all participating signatures. */
    public adminThreshold: number;

    /** Address of this entity. Set during creation and does not change. */
    public address: Uint8Array;

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

  /** Properties of a Participant. */
  interface IParticipant {
    /** Participant signature */
    signature?: Uint8Array | null;

    /** Participant weight */
    weight?: number | null;
  }

  /** the greater the power of a signature. */
  class Participant implements IParticipant {
    /**
     * Constructs a new Participant.
     * @param [properties] Properties to set
     */
    constructor(properties?: multisig.IParticipant);

    /** Participant signature. */
    public signature: Uint8Array;

    /** Participant weight. */
    public weight: number;

    /**
     * Creates a new Participant instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Participant instance
     */
    public static create(properties?: multisig.IParticipant): multisig.Participant;

    /**
     * Encodes the specified Participant message. Does not implicitly {@link multisig.Participant.verify|verify} messages.
     * @param message Participant message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: multisig.IParticipant, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Participant message, length delimited. Does not implicitly {@link multisig.Participant.verify|verify} messages.
     * @param message Participant message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: multisig.IParticipant,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a Participant message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Participant
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): multisig.Participant;

    /**
     * Decodes a Participant message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Participant
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): multisig.Participant;

    /**
     * Verifies a Participant message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Participant message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Participant
     */
    public static fromObject(object: { [k: string]: any }): multisig.Participant;

    /**
     * Creates a plain object from a Participant message. Also converts values to other types if specified.
     * @param message Participant
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: multisig.Participant,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Participant to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a CreateMsg. */
  interface ICreateMsg {
    /** CreateMsg metadata */
    metadata?: weave.IMetadata | null;

    /** CreateMsg participants */
    participants?: multisig.IParticipant[] | null;

    /** CreateMsg activationThreshold */
    activationThreshold?: number | null;

    /** CreateMsg adminThreshold */
    adminThreshold?: number | null;
  }

  /** Represents a CreateMsg. */
  class CreateMsg implements ICreateMsg {
    /**
     * Constructs a new CreateMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: multisig.ICreateMsg);

    /** CreateMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** CreateMsg participants. */
    public participants: multisig.IParticipant[];

    /** CreateMsg activationThreshold. */
    public activationThreshold: number;

    /** CreateMsg adminThreshold. */
    public adminThreshold: number;

    /**
     * Creates a new CreateMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CreateMsg instance
     */
    public static create(properties?: multisig.ICreateMsg): multisig.CreateMsg;

    /**
     * Encodes the specified CreateMsg message. Does not implicitly {@link multisig.CreateMsg.verify|verify} messages.
     * @param message CreateMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: multisig.ICreateMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified CreateMsg message, length delimited. Does not implicitly {@link multisig.CreateMsg.verify|verify} messages.
     * @param message CreateMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: multisig.ICreateMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a CreateMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CreateMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): multisig.CreateMsg;

    /**
     * Decodes a CreateMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CreateMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): multisig.CreateMsg;

    /**
     * Verifies a CreateMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a CreateMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CreateMsg
     */
    public static fromObject(object: { [k: string]: any }): multisig.CreateMsg;

    /**
     * Creates a plain object from a CreateMsg message. Also converts values to other types if specified.
     * @param message CreateMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: multisig.CreateMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this CreateMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of an UpdateMsg. */
  interface IUpdateMsg {
    /** UpdateMsg metadata */
    metadata?: weave.IMetadata | null;

    /** UpdateMsg contractId */
    contractId?: Uint8Array | null;

    /** UpdateMsg participants */
    participants?: multisig.IParticipant[] | null;

    /** UpdateMsg activationThreshold */
    activationThreshold?: number | null;

    /** UpdateMsg adminThreshold */
    adminThreshold?: number | null;
  }

  /** Represents an UpdateMsg. */
  class UpdateMsg implements IUpdateMsg {
    /**
     * Constructs a new UpdateMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: multisig.IUpdateMsg);

    /** UpdateMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** UpdateMsg contractId. */
    public contractId: Uint8Array;

    /** UpdateMsg participants. */
    public participants: multisig.IParticipant[];

    /** UpdateMsg activationThreshold. */
    public activationThreshold: number;

    /** UpdateMsg adminThreshold. */
    public adminThreshold: number;

    /**
     * Creates a new UpdateMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns UpdateMsg instance
     */
    public static create(properties?: multisig.IUpdateMsg): multisig.UpdateMsg;

    /**
     * Encodes the specified UpdateMsg message. Does not implicitly {@link multisig.UpdateMsg.verify|verify} messages.
     * @param message UpdateMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: multisig.IUpdateMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified UpdateMsg message, length delimited. Does not implicitly {@link multisig.UpdateMsg.verify|verify} messages.
     * @param message UpdateMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: multisig.IUpdateMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an UpdateMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns UpdateMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): multisig.UpdateMsg;

    /**
     * Decodes an UpdateMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns UpdateMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): multisig.UpdateMsg;

    /**
     * Verifies an UpdateMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an UpdateMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns UpdateMsg
     */
    public static fromObject(object: { [k: string]: any }): multisig.UpdateMsg;

    /**
     * Creates a plain object from an UpdateMsg message. Also converts values to other types if specified.
     * @param message UpdateMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: multisig.UpdateMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this UpdateMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace paychan. */
export namespace paychan {
  /** Properties of a PaymentChannel. */
  interface IPaymentChannel {
    /** PaymentChannel metadata */
    metadata?: weave.IMetadata | null;

    /** Source is the source that the founds are allocated from. */
    source?: Uint8Array | null;

    /** to the destination. Signature prevents from altering transfer message. */
    sourcePubkey?: crypto.IPublicKey | null;

    /** Destination is the party that receives payments through this channel */
    destination?: Uint8Array | null;

    /** payment channel. */
    total?: coin.ICoin | null;

    /** expired: [timeout, infinity) */
    timeout?: number | Long | null;

    /** Max length 128 character. */
    memo?: string | null;

    /** (total) value. Transferred must never exceed total value. */
    transferred?: coin.ICoin | null;

    /** Address of this entity. Set during creation and does not change. */
    address?: Uint8Array | null;
  }

  /** PaymentChannel holds the state of a payment channel during its lifetime. */
  class PaymentChannel implements IPaymentChannel {
    /**
     * Constructs a new PaymentChannel.
     * @param [properties] Properties to set
     */
    constructor(properties?: paychan.IPaymentChannel);

    /** PaymentChannel metadata. */
    public metadata?: weave.IMetadata | null;

    /** Source is the source that the founds are allocated from. */
    public source: Uint8Array;

    /** to the destination. Signature prevents from altering transfer message. */
    public sourcePubkey?: crypto.IPublicKey | null;

    /** Destination is the party that receives payments through this channel */
    public destination: Uint8Array;

    /** payment channel. */
    public total?: coin.ICoin | null;

    /** expired: [timeout, infinity) */
    public timeout: number | Long;

    /** Max length 128 character. */
    public memo: string;

    /** (total) value. Transferred must never exceed total value. */
    public transferred?: coin.ICoin | null;

    /** Address of this entity. Set during creation and does not change. */
    public address: Uint8Array;

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

  /** Properties of a CreateMsg. */
  interface ICreateMsg {
    /** CreateMsg metadata */
    metadata?: weave.IMetadata | null;

    /** Source address (weave.Address). */
    source?: Uint8Array | null;

    /** Source public key is for validating transfer message signature. */
    sourcePubkey?: crypto.IPublicKey | null;

    /** Destination address  (weave.Address). */
    destination?: Uint8Array | null;

    /** Maximum amount that can be transferred via this channel. */
    total?: coin.ICoin | null;

    /** If reached, channel can be closed by anyone. */
    timeout?: number | Long | null;

    /** Max length 128 character. */
    memo?: string | null;
  }

  /** in the transactions done via created payment channel. */
  class CreateMsg implements ICreateMsg {
    /**
     * Constructs a new CreateMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: paychan.ICreateMsg);

    /** CreateMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** Source address (weave.Address). */
    public source: Uint8Array;

    /** Source public key is for validating transfer message signature. */
    public sourcePubkey?: crypto.IPublicKey | null;

    /** Destination address  (weave.Address). */
    public destination: Uint8Array;

    /** Maximum amount that can be transferred via this channel. */
    public total?: coin.ICoin | null;

    /** If reached, channel can be closed by anyone. */
    public timeout: number | Long;

    /** Max length 128 character. */
    public memo: string;

    /**
     * Creates a new CreateMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CreateMsg instance
     */
    public static create(properties?: paychan.ICreateMsg): paychan.CreateMsg;

    /**
     * Encodes the specified CreateMsg message. Does not implicitly {@link paychan.CreateMsg.verify|verify} messages.
     * @param message CreateMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: paychan.ICreateMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified CreateMsg message, length delimited. Does not implicitly {@link paychan.CreateMsg.verify|verify} messages.
     * @param message CreateMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: paychan.ICreateMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a CreateMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CreateMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): paychan.CreateMsg;

    /**
     * Decodes a CreateMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CreateMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): paychan.CreateMsg;

    /**
     * Verifies a CreateMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a CreateMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CreateMsg
     */
    public static fromObject(object: { [k: string]: any }): paychan.CreateMsg;

    /**
     * Creates a plain object from a CreateMsg message. Also converts values to other types if specified.
     * @param message CreateMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: paychan.CreateMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this CreateMsg to JSON.
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

  /** Properties of a TransferMsg. */
  interface ITransferMsg {
    /** TransferMsg metadata */
    metadata?: weave.IMetadata | null;

    /** TransferMsg payment */
    payment?: paychan.IPayment | null;

    /** TransferMsg signature */
    signature?: crypto.ISignature | null;
  }

  /** Signature is there to ensure that payment message was not altered. */
  class TransferMsg implements ITransferMsg {
    /**
     * Constructs a new TransferMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: paychan.ITransferMsg);

    /** TransferMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** TransferMsg payment. */
    public payment?: paychan.IPayment | null;

    /** TransferMsg signature. */
    public signature?: crypto.ISignature | null;

    /**
     * Creates a new TransferMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns TransferMsg instance
     */
    public static create(properties?: paychan.ITransferMsg): paychan.TransferMsg;

    /**
     * Encodes the specified TransferMsg message. Does not implicitly {@link paychan.TransferMsg.verify|verify} messages.
     * @param message TransferMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: paychan.ITransferMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified TransferMsg message, length delimited. Does not implicitly {@link paychan.TransferMsg.verify|verify} messages.
     * @param message TransferMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: paychan.ITransferMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a TransferMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns TransferMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): paychan.TransferMsg;

    /**
     * Decodes a TransferMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns TransferMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): paychan.TransferMsg;

    /**
     * Verifies a TransferMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a TransferMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns TransferMsg
     */
    public static fromObject(object: { [k: string]: any }): paychan.TransferMsg;

    /**
     * Creates a plain object from a TransferMsg message. Also converts values to other types if specified.
     * @param message TransferMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: paychan.TransferMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this TransferMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of a CloseMsg. */
  interface ICloseMsg {
    /** CloseMsg metadata */
    metadata?: weave.IMetadata | null;

    /** CloseMsg channelId */
    channelId?: Uint8Array | null;

    /** Max length 128 character. */
    memo?: string | null;
  }

  /** Source can close channel only if the timeout was reached. */
  class CloseMsg implements ICloseMsg {
    /**
     * Constructs a new CloseMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: paychan.ICloseMsg);

    /** CloseMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** CloseMsg channelId. */
    public channelId: Uint8Array;

    /** Max length 128 character. */
    public memo: string;

    /**
     * Creates a new CloseMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CloseMsg instance
     */
    public static create(properties?: paychan.ICloseMsg): paychan.CloseMsg;

    /**
     * Encodes the specified CloseMsg message. Does not implicitly {@link paychan.CloseMsg.verify|verify} messages.
     * @param message CloseMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: paychan.ICloseMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified CloseMsg message, length delimited. Does not implicitly {@link paychan.CloseMsg.verify|verify} messages.
     * @param message CloseMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: paychan.ICloseMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a CloseMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CloseMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): paychan.CloseMsg;

    /**
     * Decodes a CloseMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CloseMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): paychan.CloseMsg;

    /**
     * Verifies a CloseMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a CloseMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CloseMsg
     */
    public static fromObject(object: { [k: string]: any }): paychan.CloseMsg;

    /**
     * Creates a plain object from a CloseMsg message. Also converts values to other types if specified.
     * @param message CloseMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: paychan.CloseMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this CloseMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace sigs. */
export namespace sigs {
  /** Properties of a UserData. */
  interface IUserData {
    /** UserData metadata */
    metadata?: weave.IMetadata | null;

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

    /** UserData metadata. */
    public metadata?: weave.IMetadata | null;

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

  /** Properties of a BumpSequenceMsg. */
  interface IBumpSequenceMsg {
    /** BumpSequenceMsg metadata */
    metadata?: weave.IMetadata | null;

    /** total increment value, including the default increment. */
    increment?: number | null;
  }

  /** that signed the transaction. */
  class BumpSequenceMsg implements IBumpSequenceMsg {
    /**
     * Constructs a new BumpSequenceMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: sigs.IBumpSequenceMsg);

    /** BumpSequenceMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** total increment value, including the default increment. */
    public increment: number;

    /**
     * Creates a new BumpSequenceMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns BumpSequenceMsg instance
     */
    public static create(properties?: sigs.IBumpSequenceMsg): sigs.BumpSequenceMsg;

    /**
     * Encodes the specified BumpSequenceMsg message. Does not implicitly {@link sigs.BumpSequenceMsg.verify|verify} messages.
     * @param message BumpSequenceMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: sigs.IBumpSequenceMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified BumpSequenceMsg message, length delimited. Does not implicitly {@link sigs.BumpSequenceMsg.verify|verify} messages.
     * @param message BumpSequenceMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: sigs.IBumpSequenceMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a BumpSequenceMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns BumpSequenceMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): sigs.BumpSequenceMsg;

    /**
     * Decodes a BumpSequenceMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns BumpSequenceMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): sigs.BumpSequenceMsg;

    /**
     * Verifies a BumpSequenceMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a BumpSequenceMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns BumpSequenceMsg
     */
    public static fromObject(object: { [k: string]: any }): sigs.BumpSequenceMsg;

    /**
     * Creates a plain object from a BumpSequenceMsg message. Also converts values to other types if specified.
     * @param message BumpSequenceMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: sigs.BumpSequenceMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this BumpSequenceMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace validators. */
export namespace validators {
  /** Properties of an ApplyDiffMsg. */
  interface IApplyDiffMsg {
    /** ApplyDiffMsg metadata */
    metadata?: weave.IMetadata | null;

    /** ApplyDiffMsg validatorUpdates */
    validatorUpdates?: weave.IValidatorUpdate[] | null;
  }

  /** ApplyDiffMsg is designed to update validator power */
  class ApplyDiffMsg implements IApplyDiffMsg {
    /**
     * Constructs a new ApplyDiffMsg.
     * @param [properties] Properties to set
     */
    constructor(properties?: validators.IApplyDiffMsg);

    /** ApplyDiffMsg metadata. */
    public metadata?: weave.IMetadata | null;

    /** ApplyDiffMsg validatorUpdates. */
    public validatorUpdates: weave.IValidatorUpdate[];

    /**
     * Creates a new ApplyDiffMsg instance using the specified properties.
     * @param [properties] Properties to set
     * @returns ApplyDiffMsg instance
     */
    public static create(properties?: validators.IApplyDiffMsg): validators.ApplyDiffMsg;

    /**
     * Encodes the specified ApplyDiffMsg message. Does not implicitly {@link validators.ApplyDiffMsg.verify|verify} messages.
     * @param message ApplyDiffMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: validators.IApplyDiffMsg, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified ApplyDiffMsg message, length delimited. Does not implicitly {@link validators.ApplyDiffMsg.verify|verify} messages.
     * @param message ApplyDiffMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: validators.IApplyDiffMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes an ApplyDiffMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ApplyDiffMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): validators.ApplyDiffMsg;

    /**
     * Decodes an ApplyDiffMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ApplyDiffMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): validators.ApplyDiffMsg;

    /**
     * Verifies an ApplyDiffMsg message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an ApplyDiffMsg message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns ApplyDiffMsg
     */
    public static fromObject(object: { [k: string]: any }): validators.ApplyDiffMsg;

    /**
     * Creates a plain object from an ApplyDiffMsg message. Also converts values to other types if specified.
     * @param message ApplyDiffMsg
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: validators.ApplyDiffMsg,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this ApplyDiffMsg to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }

  /** Properties of an Accounts. */
  interface IAccounts {
    /** Accounts metadata */
    metadata?: weave.IMetadata | null;

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

    /** Accounts metadata. */
    public metadata?: weave.IMetadata | null;

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

import * as $protobuf from "protobufjs";

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
    public static encode(
      message: orm.IMultiRef,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified MultiRef message, length delimited. Does not implicitly {@link orm.MultiRef.verify|verify} messages.
     * @param message MultiRef message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: orm.IMultiRef,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a MultiRef message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns MultiRef
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): orm.MultiRef;

    /**
     * Decodes a MultiRef message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns MultiRef
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): orm.MultiRef;

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
    public static encode(
      message: orm.ICounter,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified Counter message, length delimited. Does not implicitly {@link orm.Counter.verify|verify} messages.
     * @param message Counter message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: orm.ICounter,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a Counter message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Counter
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): orm.Counter;

    /**
     * Decodes a Counter message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Counter
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): orm.Counter;

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
    public static encode(
      message: crypto.IPublicKey,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified PublicKey message, length delimited. Does not implicitly {@link crypto.PublicKey.verify|verify} messages.
     * @param message PublicKey message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: crypto.IPublicKey,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a PublicKey message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PublicKey
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): crypto.PublicKey;

    /**
     * Decodes a PublicKey message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PublicKey
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): crypto.PublicKey;

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
    public static encode(
      message: crypto.IPrivateKey,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified PrivateKey message, length delimited. Does not implicitly {@link crypto.PrivateKey.verify|verify} messages.
     * @param message PrivateKey message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: crypto.IPrivateKey,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a PrivateKey message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PrivateKey
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): crypto.PrivateKey;

    /**
     * Decodes a PrivateKey message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PrivateKey
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): crypto.PrivateKey;

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
    public static encode(
      message: crypto.ISignature,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified Signature message, length delimited. Does not implicitly {@link crypto.Signature.verify|verify} messages.
     * @param message Signature message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: crypto.ISignature,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a Signature message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Signature
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): crypto.Signature;

    /**
     * Decodes a Signature message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Signature
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): crypto.Signature;

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

/** Namespace sigs. */
export namespace sigs {
  /** Properties of a UserData. */
  interface IUserData {
    /** UserData pubKey */
    pubKey?: crypto.IPublicKey | null;

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

    /** UserData pubKey. */
    public pubKey?: crypto.IPublicKey | null;

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
    public static encode(
      message: sigs.IUserData,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified UserData message, length delimited. Does not implicitly {@link sigs.UserData.verify|verify} messages.
     * @param message UserData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: sigs.IUserData,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a UserData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns UserData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): sigs.UserData;

    /**
     * Decodes a UserData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns UserData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): sigs.UserData;

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

    /** StdSignature pubKey */
    pubKey?: crypto.IPublicKey | null;

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

    /** StdSignature pubKey. */
    public pubKey?: crypto.IPublicKey | null;

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
    public static encode(
      message: sigs.IStdSignature,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified StdSignature message, length delimited. Does not implicitly {@link sigs.StdSignature.verify|verify} messages.
     * @param message StdSignature message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: sigs.IStdSignature,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a StdSignature message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns StdSignature
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): sigs.StdSignature;

    /**
     * Decodes a StdSignature message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns StdSignature
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): sigs.StdSignature;

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
    public static encode(
      message: cash.ISet,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified Set message, length delimited. Does not implicitly {@link cash.Set.verify|verify} messages.
     * @param message Set message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: cash.ISet,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a Set message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Set
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): cash.Set;

    /**
     * Decodes a Set message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Set
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): cash.Set;

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
    public static toObject(
      message: cash.Set,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

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
    public static encode(
      message: cash.ISendMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified SendMsg message, length delimited. Does not implicitly {@link cash.SendMsg.verify|verify} messages.
     * @param message SendMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: cash.ISendMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a SendMsg message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns SendMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): cash.SendMsg;

    /**
     * Decodes a SendMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns SendMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): cash.SendMsg;

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
    public static encode(
      message: cash.IFeeInfo,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified FeeInfo message, length delimited. Does not implicitly {@link cash.FeeInfo.verify|verify} messages.
     * @param message FeeInfo message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: cash.IFeeInfo,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a FeeInfo message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns FeeInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): cash.FeeInfo;

    /**
     * Decodes a FeeInfo message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns FeeInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): cash.FeeInfo;

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
    public static encode(
      message: x.ICoin,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified Coin message, length delimited. Does not implicitly {@link x.Coin.verify|verify} messages.
     * @param message Coin message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: x.ICoin,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a Coin message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Coin
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): x.Coin;

    /**
     * Decodes a Coin message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Coin
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): x.Coin;

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
    public static toObject(
      message: x.Coin,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Coin to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Namespace app. */
export namespace app {
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
    public static encode(
      message: app.IResultSet,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified ResultSet message, length delimited. Does not implicitly {@link app.ResultSet.verify|verify} messages.
     * @param message ResultSet message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: app.IResultSet,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a ResultSet message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns ResultSet
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): app.ResultSet;

    /**
     * Decodes a ResultSet message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ResultSet
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): app.ResultSet;

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

    /** Tx fees */
    fees?: cash.IFeeInfo | null;

    /** Tx signatures */
    signatures?: sigs.IStdSignature[] | null;

    /** Tx preimage */
    preimage?: Uint8Array | null;
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

    /** Tx fees. */
    public fees?: cash.IFeeInfo | null;

    /** Tx signatures. */
    public signatures: sigs.IStdSignature[];

    /** Tx preimage. */
    public preimage: Uint8Array;

    /** Tx sum. */
    public sum?:
      | "sendMsg"
      | "newTokenMsg"
      | "setNameMsg"
      | "createEscrowMsg"
      | "releaseEscrowMsg"
      | "returnEscrowMsg"
      | "updateEscrowMsg";

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
    public static encode(
      message: app.ITx,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified Tx message, length delimited. Does not implicitly {@link app.Tx.verify|verify} messages.
     * @param message Tx message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: app.ITx,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a Tx message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Tx
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): app.Tx;

    /**
     * Decodes a Tx message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Tx
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): app.Tx;

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
    public static toObject(
      message: app.Tx,
      options?: $protobuf.IConversionOptions,
    ): { [k: string]: any };

    /**
     * Converts this Tx to JSON.
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
    public static encode(
      message: escrow.IEscrow,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified Escrow message, length delimited. Does not implicitly {@link escrow.Escrow.verify|verify} messages.
     * @param message Escrow message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: escrow.IEscrow,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes an Escrow message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Escrow
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): escrow.Escrow;

    /**
     * Decodes an Escrow message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Escrow
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): escrow.Escrow;

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
    /** CreateEscrowMsg sender */
    sender?: Uint8Array | null;

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

    /** CreateEscrowMsg sender. */
    public sender: Uint8Array;

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
    public static create(
      properties?: escrow.ICreateEscrowMsg,
    ): escrow.CreateEscrowMsg;

    /**
     * Encodes the specified CreateEscrowMsg message. Does not implicitly {@link escrow.CreateEscrowMsg.verify|verify} messages.
     * @param message CreateEscrowMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(
      message: escrow.ICreateEscrowMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

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
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): escrow.CreateEscrowMsg;

    /**
     * Decodes a CreateEscrowMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CreateEscrowMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): escrow.CreateEscrowMsg;

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
    public static fromObject(object: {
      [k: string]: any;
    }): escrow.CreateEscrowMsg;

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
    public static create(
      properties?: escrow.IReleaseEscrowMsg,
    ): escrow.ReleaseEscrowMsg;

    /**
     * Encodes the specified ReleaseEscrowMsg message. Does not implicitly {@link escrow.ReleaseEscrowMsg.verify|verify} messages.
     * @param message ReleaseEscrowMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(
      message: escrow.IReleaseEscrowMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

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
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): escrow.ReleaseEscrowMsg;

    /**
     * Decodes a ReleaseEscrowMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ReleaseEscrowMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): escrow.ReleaseEscrowMsg;

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
    public static fromObject(object: {
      [k: string]: any;
    }): escrow.ReleaseEscrowMsg;

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
    public static create(
      properties?: escrow.IReturnEscrowMsg,
    ): escrow.ReturnEscrowMsg;

    /**
     * Encodes the specified ReturnEscrowMsg message. Does not implicitly {@link escrow.ReturnEscrowMsg.verify|verify} messages.
     * @param message ReturnEscrowMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(
      message: escrow.IReturnEscrowMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

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
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): escrow.ReturnEscrowMsg;

    /**
     * Decodes a ReturnEscrowMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns ReturnEscrowMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): escrow.ReturnEscrowMsg;

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
    public static fromObject(object: {
      [k: string]: any;
    }): escrow.ReturnEscrowMsg;

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
    public static create(
      properties?: escrow.IUpdateEscrowPartiesMsg,
    ): escrow.UpdateEscrowPartiesMsg;

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
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): escrow.UpdateEscrowPartiesMsg;

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
    public static fromObject(object: {
      [k: string]: any;
    }): escrow.UpdateEscrowPartiesMsg;

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
    public static encode(
      message: namecoin.IWallet,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified Wallet message, length delimited. Does not implicitly {@link namecoin.Wallet.verify|verify} messages.
     * @param message Wallet message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: namecoin.IWallet,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a Wallet message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Wallet
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): namecoin.Wallet;

    /**
     * Decodes a Wallet message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Wallet
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): namecoin.Wallet;

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
    public static encode(
      message: namecoin.IToken,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Encodes the specified Token message, length delimited. Does not implicitly {@link namecoin.Token.verify|verify} messages.
     * @param message Token message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: namecoin.IToken,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

    /**
     * Decodes a Token message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Token
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): namecoin.Token;

    /**
     * Decodes a Token message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Token
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): namecoin.Token;

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
    public static create(
      properties?: namecoin.INewTokenMsg,
    ): namecoin.NewTokenMsg;

    /**
     * Encodes the specified NewTokenMsg message. Does not implicitly {@link namecoin.NewTokenMsg.verify|verify} messages.
     * @param message NewTokenMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(
      message: namecoin.INewTokenMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

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
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): namecoin.NewTokenMsg;

    /**
     * Decodes a NewTokenMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns NewTokenMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): namecoin.NewTokenMsg;

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
    public static fromObject(object: {
      [k: string]: any;
    }): namecoin.NewTokenMsg;

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
    public static create(
      properties?: namecoin.ISetWalletNameMsg,
    ): namecoin.SetWalletNameMsg;

    /**
     * Encodes the specified SetWalletNameMsg message. Does not implicitly {@link namecoin.SetWalletNameMsg.verify|verify} messages.
     * @param message SetWalletNameMsg message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(
      message: namecoin.ISetWalletNameMsg,
      writer?: $protobuf.Writer,
    ): $protobuf.Writer;

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
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number,
    ): namecoin.SetWalletNameMsg;

    /**
     * Decodes a SetWalletNameMsg message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns SetWalletNameMsg
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array,
    ): namecoin.SetWalletNameMsg;

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
    public static fromObject(object: {
      [k: string]: any;
    }): namecoin.SetWalletNameMsg;

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

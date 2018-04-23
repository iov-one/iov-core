/*eslint-disable block-scoped-var, no-redeclare, no-control-regex, no-prototype-builtins*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.crypto = (function() {

    /**
     * Namespace crypto.
     * @exports crypto
     * @namespace
     */
    var crypto = {};

    crypto.PublicKey = (function() {

        /**
         * Properties of a PublicKey.
         * @memberof crypto
         * @interface IPublicKey
         * @property {Uint8Array|null} [ed25519] PublicKey ed25519
         */

        /**
         * Constructs a new PublicKey.
         * @memberof crypto
         * @classdesc Represents a PublicKey.
         * @implements IPublicKey
         * @constructor
         * @param {crypto.IPublicKey=} [properties] Properties to set
         */
        function PublicKey(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PublicKey ed25519.
         * @member {Uint8Array} ed25519
         * @memberof crypto.PublicKey
         * @instance
         */
        PublicKey.prototype.ed25519 = $util.newBuffer([]);

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * PublicKey pub.
         * @member {"ed25519"|undefined} pub
         * @memberof crypto.PublicKey
         * @instance
         */
        Object.defineProperty(PublicKey.prototype, "pub", {
            get: $util.oneOfGetter($oneOfFields = ["ed25519"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new PublicKey instance using the specified properties.
         * @function create
         * @memberof crypto.PublicKey
         * @static
         * @param {crypto.IPublicKey=} [properties] Properties to set
         * @returns {crypto.PublicKey} PublicKey instance
         */
        PublicKey.create = function create(properties) {
            return new PublicKey(properties);
        };

        /**
         * Encodes the specified PublicKey message. Does not implicitly {@link crypto.PublicKey.verify|verify} messages.
         * @function encode
         * @memberof crypto.PublicKey
         * @static
         * @param {crypto.IPublicKey} message PublicKey message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PublicKey.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.ed25519 != null && message.hasOwnProperty("ed25519"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.ed25519);
            return writer;
        };

        /**
         * Encodes the specified PublicKey message, length delimited. Does not implicitly {@link crypto.PublicKey.verify|verify} messages.
         * @function encodeDelimited
         * @memberof crypto.PublicKey
         * @static
         * @param {crypto.IPublicKey} message PublicKey message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PublicKey.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PublicKey message from the specified reader or buffer.
         * @function decode
         * @memberof crypto.PublicKey
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {crypto.PublicKey} PublicKey
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PublicKey.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.crypto.PublicKey();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.ed25519 = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PublicKey message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof crypto.PublicKey
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {crypto.PublicKey} PublicKey
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PublicKey.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PublicKey message.
         * @function verify
         * @memberof crypto.PublicKey
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PublicKey.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.ed25519 != null && message.hasOwnProperty("ed25519")) {
                properties.pub = 1;
                if (!(message.ed25519 && typeof message.ed25519.length === "number" || $util.isString(message.ed25519)))
                    return "ed25519: buffer expected";
            }
            return null;
        };

        /**
         * Creates a PublicKey message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof crypto.PublicKey
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {crypto.PublicKey} PublicKey
         */
        PublicKey.fromObject = function fromObject(object) {
            if (object instanceof $root.crypto.PublicKey)
                return object;
            var message = new $root.crypto.PublicKey();
            if (object.ed25519 != null)
                if (typeof object.ed25519 === "string")
                    $util.base64.decode(object.ed25519, message.ed25519 = $util.newBuffer($util.base64.length(object.ed25519)), 0);
                else if (object.ed25519.length)
                    message.ed25519 = object.ed25519;
            return message;
        };

        /**
         * Creates a plain object from a PublicKey message. Also converts values to other types if specified.
         * @function toObject
         * @memberof crypto.PublicKey
         * @static
         * @param {crypto.PublicKey} message PublicKey
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PublicKey.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (message.ed25519 != null && message.hasOwnProperty("ed25519")) {
                object.ed25519 = options.bytes === String ? $util.base64.encode(message.ed25519, 0, message.ed25519.length) : options.bytes === Array ? Array.prototype.slice.call(message.ed25519) : message.ed25519;
                if (options.oneofs)
                    object.pub = "ed25519";
            }
            return object;
        };

        /**
         * Converts this PublicKey to JSON.
         * @function toJSON
         * @memberof crypto.PublicKey
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PublicKey.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return PublicKey;
    })();

    crypto.PrivateKey = (function() {

        /**
         * Properties of a PrivateKey.
         * @memberof crypto
         * @interface IPrivateKey
         * @property {Uint8Array|null} [ed25519] PrivateKey ed25519
         */

        /**
         * Constructs a new PrivateKey.
         * @memberof crypto
         * @classdesc Represents a PrivateKey.
         * @implements IPrivateKey
         * @constructor
         * @param {crypto.IPrivateKey=} [properties] Properties to set
         */
        function PrivateKey(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PrivateKey ed25519.
         * @member {Uint8Array} ed25519
         * @memberof crypto.PrivateKey
         * @instance
         */
        PrivateKey.prototype.ed25519 = $util.newBuffer([]);

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * PrivateKey priv.
         * @member {"ed25519"|undefined} priv
         * @memberof crypto.PrivateKey
         * @instance
         */
        Object.defineProperty(PrivateKey.prototype, "priv", {
            get: $util.oneOfGetter($oneOfFields = ["ed25519"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new PrivateKey instance using the specified properties.
         * @function create
         * @memberof crypto.PrivateKey
         * @static
         * @param {crypto.IPrivateKey=} [properties] Properties to set
         * @returns {crypto.PrivateKey} PrivateKey instance
         */
        PrivateKey.create = function create(properties) {
            return new PrivateKey(properties);
        };

        /**
         * Encodes the specified PrivateKey message. Does not implicitly {@link crypto.PrivateKey.verify|verify} messages.
         * @function encode
         * @memberof crypto.PrivateKey
         * @static
         * @param {crypto.IPrivateKey} message PrivateKey message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PrivateKey.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.ed25519 != null && message.hasOwnProperty("ed25519"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.ed25519);
            return writer;
        };

        /**
         * Encodes the specified PrivateKey message, length delimited. Does not implicitly {@link crypto.PrivateKey.verify|verify} messages.
         * @function encodeDelimited
         * @memberof crypto.PrivateKey
         * @static
         * @param {crypto.IPrivateKey} message PrivateKey message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PrivateKey.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PrivateKey message from the specified reader or buffer.
         * @function decode
         * @memberof crypto.PrivateKey
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {crypto.PrivateKey} PrivateKey
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PrivateKey.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.crypto.PrivateKey();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.ed25519 = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PrivateKey message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof crypto.PrivateKey
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {crypto.PrivateKey} PrivateKey
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PrivateKey.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PrivateKey message.
         * @function verify
         * @memberof crypto.PrivateKey
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PrivateKey.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.ed25519 != null && message.hasOwnProperty("ed25519")) {
                properties.priv = 1;
                if (!(message.ed25519 && typeof message.ed25519.length === "number" || $util.isString(message.ed25519)))
                    return "ed25519: buffer expected";
            }
            return null;
        };

        /**
         * Creates a PrivateKey message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof crypto.PrivateKey
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {crypto.PrivateKey} PrivateKey
         */
        PrivateKey.fromObject = function fromObject(object) {
            if (object instanceof $root.crypto.PrivateKey)
                return object;
            var message = new $root.crypto.PrivateKey();
            if (object.ed25519 != null)
                if (typeof object.ed25519 === "string")
                    $util.base64.decode(object.ed25519, message.ed25519 = $util.newBuffer($util.base64.length(object.ed25519)), 0);
                else if (object.ed25519.length)
                    message.ed25519 = object.ed25519;
            return message;
        };

        /**
         * Creates a plain object from a PrivateKey message. Also converts values to other types if specified.
         * @function toObject
         * @memberof crypto.PrivateKey
         * @static
         * @param {crypto.PrivateKey} message PrivateKey
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PrivateKey.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (message.ed25519 != null && message.hasOwnProperty("ed25519")) {
                object.ed25519 = options.bytes === String ? $util.base64.encode(message.ed25519, 0, message.ed25519.length) : options.bytes === Array ? Array.prototype.slice.call(message.ed25519) : message.ed25519;
                if (options.oneofs)
                    object.priv = "ed25519";
            }
            return object;
        };

        /**
         * Converts this PrivateKey to JSON.
         * @function toJSON
         * @memberof crypto.PrivateKey
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PrivateKey.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return PrivateKey;
    })();

    crypto.Signature = (function() {

        /**
         * Properties of a Signature.
         * @memberof crypto
         * @interface ISignature
         * @property {Uint8Array|null} [ed25519] Signature ed25519
         */

        /**
         * Constructs a new Signature.
         * @memberof crypto
         * @classdesc Represents a Signature.
         * @implements ISignature
         * @constructor
         * @param {crypto.ISignature=} [properties] Properties to set
         */
        function Signature(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Signature ed25519.
         * @member {Uint8Array} ed25519
         * @memberof crypto.Signature
         * @instance
         */
        Signature.prototype.ed25519 = $util.newBuffer([]);

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * Signature sig.
         * @member {"ed25519"|undefined} sig
         * @memberof crypto.Signature
         * @instance
         */
        Object.defineProperty(Signature.prototype, "sig", {
            get: $util.oneOfGetter($oneOfFields = ["ed25519"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new Signature instance using the specified properties.
         * @function create
         * @memberof crypto.Signature
         * @static
         * @param {crypto.ISignature=} [properties] Properties to set
         * @returns {crypto.Signature} Signature instance
         */
        Signature.create = function create(properties) {
            return new Signature(properties);
        };

        /**
         * Encodes the specified Signature message. Does not implicitly {@link crypto.Signature.verify|verify} messages.
         * @function encode
         * @memberof crypto.Signature
         * @static
         * @param {crypto.ISignature} message Signature message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Signature.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.ed25519 != null && message.hasOwnProperty("ed25519"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.ed25519);
            return writer;
        };

        /**
         * Encodes the specified Signature message, length delimited. Does not implicitly {@link crypto.Signature.verify|verify} messages.
         * @function encodeDelimited
         * @memberof crypto.Signature
         * @static
         * @param {crypto.ISignature} message Signature message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Signature.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Signature message from the specified reader or buffer.
         * @function decode
         * @memberof crypto.Signature
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {crypto.Signature} Signature
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Signature.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.crypto.Signature();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.ed25519 = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Signature message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof crypto.Signature
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {crypto.Signature} Signature
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Signature.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Signature message.
         * @function verify
         * @memberof crypto.Signature
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Signature.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.ed25519 != null && message.hasOwnProperty("ed25519")) {
                properties.sig = 1;
                if (!(message.ed25519 && typeof message.ed25519.length === "number" || $util.isString(message.ed25519)))
                    return "ed25519: buffer expected";
            }
            return null;
        };

        /**
         * Creates a Signature message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof crypto.Signature
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {crypto.Signature} Signature
         */
        Signature.fromObject = function fromObject(object) {
            if (object instanceof $root.crypto.Signature)
                return object;
            var message = new $root.crypto.Signature();
            if (object.ed25519 != null)
                if (typeof object.ed25519 === "string")
                    $util.base64.decode(object.ed25519, message.ed25519 = $util.newBuffer($util.base64.length(object.ed25519)), 0);
                else if (object.ed25519.length)
                    message.ed25519 = object.ed25519;
            return message;
        };

        /**
         * Creates a plain object from a Signature message. Also converts values to other types if specified.
         * @function toObject
         * @memberof crypto.Signature
         * @static
         * @param {crypto.Signature} message Signature
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Signature.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (message.ed25519 != null && message.hasOwnProperty("ed25519")) {
                object.ed25519 = options.bytes === String ? $util.base64.encode(message.ed25519, 0, message.ed25519.length) : options.bytes === Array ? Array.prototype.slice.call(message.ed25519) : message.ed25519;
                if (options.oneofs)
                    object.sig = "ed25519";
            }
            return object;
        };

        /**
         * Converts this Signature to JSON.
         * @function toJSON
         * @memberof crypto.Signature
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Signature.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Signature;
    })();

    return crypto;
})();

module.exports = $root;

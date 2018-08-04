/*eslint-disable block-scoped-var, no-redeclare, no-control-regex, no-prototype-builtins*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.orm = (function() {

    /**
     * Namespace orm.
     * @exports orm
     * @namespace
     */
    var orm = {};

    orm.MultiRef = (function() {

        /**
         * Properties of a MultiRef.
         * @memberof orm
         * @interface IMultiRef
         * @property {Array.<Uint8Array>|null} [refs] MultiRef refs
         */

        /**
         * Constructs a new MultiRef.
         * @memberof orm
         * @classdesc Represents a MultiRef.
         * @implements IMultiRef
         * @constructor
         * @param {orm.IMultiRef=} [properties] Properties to set
         */
        function MultiRef(properties) {
            this.refs = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MultiRef refs.
         * @member {Array.<Uint8Array>} refs
         * @memberof orm.MultiRef
         * @instance
         */
        MultiRef.prototype.refs = $util.emptyArray;

        /**
         * Creates a new MultiRef instance using the specified properties.
         * @function create
         * @memberof orm.MultiRef
         * @static
         * @param {orm.IMultiRef=} [properties] Properties to set
         * @returns {orm.MultiRef} MultiRef instance
         */
        MultiRef.create = function create(properties) {
            return new MultiRef(properties);
        };

        /**
         * Encodes the specified MultiRef message. Does not implicitly {@link orm.MultiRef.verify|verify} messages.
         * @function encode
         * @memberof orm.MultiRef
         * @static
         * @param {orm.IMultiRef} message MultiRef message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MultiRef.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.refs != null && message.refs.length)
                for (var i = 0; i < message.refs.length; ++i)
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.refs[i]);
            return writer;
        };

        /**
         * Encodes the specified MultiRef message, length delimited. Does not implicitly {@link orm.MultiRef.verify|verify} messages.
         * @function encodeDelimited
         * @memberof orm.MultiRef
         * @static
         * @param {orm.IMultiRef} message MultiRef message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MultiRef.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MultiRef message from the specified reader or buffer.
         * @function decode
         * @memberof orm.MultiRef
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {orm.MultiRef} MultiRef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MultiRef.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.orm.MultiRef();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.refs && message.refs.length))
                        message.refs = [];
                    message.refs.push(reader.bytes());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MultiRef message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof orm.MultiRef
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {orm.MultiRef} MultiRef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MultiRef.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MultiRef message.
         * @function verify
         * @memberof orm.MultiRef
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MultiRef.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.refs != null && message.hasOwnProperty("refs")) {
                if (!Array.isArray(message.refs))
                    return "refs: array expected";
                for (var i = 0; i < message.refs.length; ++i)
                    if (!(message.refs[i] && typeof message.refs[i].length === "number" || $util.isString(message.refs[i])))
                        return "refs: buffer[] expected";
            }
            return null;
        };

        /**
         * Creates a MultiRef message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof orm.MultiRef
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {orm.MultiRef} MultiRef
         */
        MultiRef.fromObject = function fromObject(object) {
            if (object instanceof $root.orm.MultiRef)
                return object;
            var message = new $root.orm.MultiRef();
            if (object.refs) {
                if (!Array.isArray(object.refs))
                    throw TypeError(".orm.MultiRef.refs: array expected");
                message.refs = [];
                for (var i = 0; i < object.refs.length; ++i)
                    if (typeof object.refs[i] === "string")
                        $util.base64.decode(object.refs[i], message.refs[i] = $util.newBuffer($util.base64.length(object.refs[i])), 0);
                    else if (object.refs[i].length)
                        message.refs[i] = object.refs[i];
            }
            return message;
        };

        /**
         * Creates a plain object from a MultiRef message. Also converts values to other types if specified.
         * @function toObject
         * @memberof orm.MultiRef
         * @static
         * @param {orm.MultiRef} message MultiRef
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MultiRef.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.refs = [];
            if (message.refs && message.refs.length) {
                object.refs = [];
                for (var j = 0; j < message.refs.length; ++j)
                    object.refs[j] = options.bytes === String ? $util.base64.encode(message.refs[j], 0, message.refs[j].length) : options.bytes === Array ? Array.prototype.slice.call(message.refs[j]) : message.refs[j];
            }
            return object;
        };

        /**
         * Converts this MultiRef to JSON.
         * @function toJSON
         * @memberof orm.MultiRef
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MultiRef.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return MultiRef;
    })();

    orm.Counter = (function() {

        /**
         * Properties of a Counter.
         * @memberof orm
         * @interface ICounter
         * @property {number|Long|null} [count] Counter count
         */

        /**
         * Constructs a new Counter.
         * @memberof orm
         * @classdesc Represents a Counter.
         * @implements ICounter
         * @constructor
         * @param {orm.ICounter=} [properties] Properties to set
         */
        function Counter(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Counter count.
         * @member {number|Long} count
         * @memberof orm.Counter
         * @instance
         */
        Counter.prototype.count = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new Counter instance using the specified properties.
         * @function create
         * @memberof orm.Counter
         * @static
         * @param {orm.ICounter=} [properties] Properties to set
         * @returns {orm.Counter} Counter instance
         */
        Counter.create = function create(properties) {
            return new Counter(properties);
        };

        /**
         * Encodes the specified Counter message. Does not implicitly {@link orm.Counter.verify|verify} messages.
         * @function encode
         * @memberof orm.Counter
         * @static
         * @param {orm.ICounter} message Counter message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Counter.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.count != null && message.hasOwnProperty("count"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.count);
            return writer;
        };

        /**
         * Encodes the specified Counter message, length delimited. Does not implicitly {@link orm.Counter.verify|verify} messages.
         * @function encodeDelimited
         * @memberof orm.Counter
         * @static
         * @param {orm.ICounter} message Counter message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Counter.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Counter message from the specified reader or buffer.
         * @function decode
         * @memberof orm.Counter
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {orm.Counter} Counter
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Counter.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.orm.Counter();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.count = reader.int64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Counter message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof orm.Counter
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {orm.Counter} Counter
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Counter.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Counter message.
         * @function verify
         * @memberof orm.Counter
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Counter.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.count != null && message.hasOwnProperty("count"))
                if (!$util.isInteger(message.count) && !(message.count && $util.isInteger(message.count.low) && $util.isInteger(message.count.high)))
                    return "count: integer|Long expected";
            return null;
        };

        /**
         * Creates a Counter message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof orm.Counter
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {orm.Counter} Counter
         */
        Counter.fromObject = function fromObject(object) {
            if (object instanceof $root.orm.Counter)
                return object;
            var message = new $root.orm.Counter();
            if (object.count != null)
                if ($util.Long)
                    (message.count = $util.Long.fromValue(object.count)).unsigned = false;
                else if (typeof object.count === "string")
                    message.count = parseInt(object.count, 10);
                else if (typeof object.count === "number")
                    message.count = object.count;
                else if (typeof object.count === "object")
                    message.count = new $util.LongBits(object.count.low >>> 0, object.count.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from a Counter message. Also converts values to other types if specified.
         * @function toObject
         * @memberof orm.Counter
         * @static
         * @param {orm.Counter} message Counter
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Counter.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.count = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.count = options.longs === String ? "0" : 0;
            if (message.count != null && message.hasOwnProperty("count"))
                if (typeof message.count === "number")
                    object.count = options.longs === String ? String(message.count) : message.count;
                else
                    object.count = options.longs === String ? $util.Long.prototype.toString.call(message.count) : options.longs === Number ? new $util.LongBits(message.count.low >>> 0, message.count.high >>> 0).toNumber() : message.count;
            return object;
        };

        /**
         * Converts this Counter to JSON.
         * @function toJSON
         * @memberof orm.Counter
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Counter.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Counter;
    })();

    return orm;
})();

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

$root.sigs = (function() {

    /**
     * Namespace sigs.
     * @exports sigs
     * @namespace
     */
    var sigs = {};

    sigs.UserData = (function() {

        /**
         * Properties of a UserData.
         * @memberof sigs
         * @interface IUserData
         * @property {crypto.IPublicKey|null} [pubKey] UserData pubKey
         * @property {number|Long|null} [sequence] UserData sequence
         */

        /**
         * Constructs a new UserData.
         * @memberof sigs
         * @classdesc Represents a UserData.
         * @implements IUserData
         * @constructor
         * @param {sigs.IUserData=} [properties] Properties to set
         */
        function UserData(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * UserData pubKey.
         * @member {crypto.IPublicKey|null|undefined} pubKey
         * @memberof sigs.UserData
         * @instance
         */
        UserData.prototype.pubKey = null;

        /**
         * UserData sequence.
         * @member {number|Long} sequence
         * @memberof sigs.UserData
         * @instance
         */
        UserData.prototype.sequence = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new UserData instance using the specified properties.
         * @function create
         * @memberof sigs.UserData
         * @static
         * @param {sigs.IUserData=} [properties] Properties to set
         * @returns {sigs.UserData} UserData instance
         */
        UserData.create = function create(properties) {
            return new UserData(properties);
        };

        /**
         * Encodes the specified UserData message. Does not implicitly {@link sigs.UserData.verify|verify} messages.
         * @function encode
         * @memberof sigs.UserData
         * @static
         * @param {sigs.IUserData} message UserData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UserData.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.pubKey != null && message.hasOwnProperty("pubKey"))
                $root.crypto.PublicKey.encode(message.pubKey, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.sequence != null && message.hasOwnProperty("sequence"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.sequence);
            return writer;
        };

        /**
         * Encodes the specified UserData message, length delimited. Does not implicitly {@link sigs.UserData.verify|verify} messages.
         * @function encodeDelimited
         * @memberof sigs.UserData
         * @static
         * @param {sigs.IUserData} message UserData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UserData.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a UserData message from the specified reader or buffer.
         * @function decode
         * @memberof sigs.UserData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {sigs.UserData} UserData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UserData.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.sigs.UserData();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.pubKey = $root.crypto.PublicKey.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.sequence = reader.int64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a UserData message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof sigs.UserData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {sigs.UserData} UserData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UserData.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a UserData message.
         * @function verify
         * @memberof sigs.UserData
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        UserData.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.pubKey != null && message.hasOwnProperty("pubKey")) {
                var error = $root.crypto.PublicKey.verify(message.pubKey);
                if (error)
                    return "pubKey." + error;
            }
            if (message.sequence != null && message.hasOwnProperty("sequence"))
                if (!$util.isInteger(message.sequence) && !(message.sequence && $util.isInteger(message.sequence.low) && $util.isInteger(message.sequence.high)))
                    return "sequence: integer|Long expected";
            return null;
        };

        /**
         * Creates a UserData message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof sigs.UserData
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {sigs.UserData} UserData
         */
        UserData.fromObject = function fromObject(object) {
            if (object instanceof $root.sigs.UserData)
                return object;
            var message = new $root.sigs.UserData();
            if (object.pubKey != null) {
                if (typeof object.pubKey !== "object")
                    throw TypeError(".sigs.UserData.pubKey: object expected");
                message.pubKey = $root.crypto.PublicKey.fromObject(object.pubKey);
            }
            if (object.sequence != null)
                if ($util.Long)
                    (message.sequence = $util.Long.fromValue(object.sequence)).unsigned = false;
                else if (typeof object.sequence === "string")
                    message.sequence = parseInt(object.sequence, 10);
                else if (typeof object.sequence === "number")
                    message.sequence = object.sequence;
                else if (typeof object.sequence === "object")
                    message.sequence = new $util.LongBits(object.sequence.low >>> 0, object.sequence.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from a UserData message. Also converts values to other types if specified.
         * @function toObject
         * @memberof sigs.UserData
         * @static
         * @param {sigs.UserData} message UserData
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        UserData.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.pubKey = null;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.sequence = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.sequence = options.longs === String ? "0" : 0;
            }
            if (message.pubKey != null && message.hasOwnProperty("pubKey"))
                object.pubKey = $root.crypto.PublicKey.toObject(message.pubKey, options);
            if (message.sequence != null && message.hasOwnProperty("sequence"))
                if (typeof message.sequence === "number")
                    object.sequence = options.longs === String ? String(message.sequence) : message.sequence;
                else
                    object.sequence = options.longs === String ? $util.Long.prototype.toString.call(message.sequence) : options.longs === Number ? new $util.LongBits(message.sequence.low >>> 0, message.sequence.high >>> 0).toNumber() : message.sequence;
            return object;
        };

        /**
         * Converts this UserData to JSON.
         * @function toJSON
         * @memberof sigs.UserData
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        UserData.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return UserData;
    })();

    sigs.StdSignature = (function() {

        /**
         * Properties of a StdSignature.
         * @memberof sigs
         * @interface IStdSignature
         * @property {number|Long|null} [sequence] StdSignature sequence
         * @property {crypto.IPublicKey|null} [pubKey] StdSignature pubKey
         * @property {crypto.ISignature|null} [signature] StdSignature signature
         */

        /**
         * Constructs a new StdSignature.
         * @memberof sigs
         * @classdesc Represents a StdSignature.
         * @implements IStdSignature
         * @constructor
         * @param {sigs.IStdSignature=} [properties] Properties to set
         */
        function StdSignature(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * StdSignature sequence.
         * @member {number|Long} sequence
         * @memberof sigs.StdSignature
         * @instance
         */
        StdSignature.prototype.sequence = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * StdSignature pubKey.
         * @member {crypto.IPublicKey|null|undefined} pubKey
         * @memberof sigs.StdSignature
         * @instance
         */
        StdSignature.prototype.pubKey = null;

        /**
         * StdSignature signature.
         * @member {crypto.ISignature|null|undefined} signature
         * @memberof sigs.StdSignature
         * @instance
         */
        StdSignature.prototype.signature = null;

        /**
         * Creates a new StdSignature instance using the specified properties.
         * @function create
         * @memberof sigs.StdSignature
         * @static
         * @param {sigs.IStdSignature=} [properties] Properties to set
         * @returns {sigs.StdSignature} StdSignature instance
         */
        StdSignature.create = function create(properties) {
            return new StdSignature(properties);
        };

        /**
         * Encodes the specified StdSignature message. Does not implicitly {@link sigs.StdSignature.verify|verify} messages.
         * @function encode
         * @memberof sigs.StdSignature
         * @static
         * @param {sigs.IStdSignature} message StdSignature message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        StdSignature.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.sequence != null && message.hasOwnProperty("sequence"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.sequence);
            if (message.pubKey != null && message.hasOwnProperty("pubKey"))
                $root.crypto.PublicKey.encode(message.pubKey, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.signature != null && message.hasOwnProperty("signature"))
                $root.crypto.Signature.encode(message.signature, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified StdSignature message, length delimited. Does not implicitly {@link sigs.StdSignature.verify|verify} messages.
         * @function encodeDelimited
         * @memberof sigs.StdSignature
         * @static
         * @param {sigs.IStdSignature} message StdSignature message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        StdSignature.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a StdSignature message from the specified reader or buffer.
         * @function decode
         * @memberof sigs.StdSignature
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {sigs.StdSignature} StdSignature
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        StdSignature.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.sigs.StdSignature();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.sequence = reader.int64();
                    break;
                case 2:
                    message.pubKey = $root.crypto.PublicKey.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.signature = $root.crypto.Signature.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a StdSignature message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof sigs.StdSignature
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {sigs.StdSignature} StdSignature
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        StdSignature.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a StdSignature message.
         * @function verify
         * @memberof sigs.StdSignature
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        StdSignature.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.sequence != null && message.hasOwnProperty("sequence"))
                if (!$util.isInteger(message.sequence) && !(message.sequence && $util.isInteger(message.sequence.low) && $util.isInteger(message.sequence.high)))
                    return "sequence: integer|Long expected";
            if (message.pubKey != null && message.hasOwnProperty("pubKey")) {
                var error = $root.crypto.PublicKey.verify(message.pubKey);
                if (error)
                    return "pubKey." + error;
            }
            if (message.signature != null && message.hasOwnProperty("signature")) {
                var error = $root.crypto.Signature.verify(message.signature);
                if (error)
                    return "signature." + error;
            }
            return null;
        };

        /**
         * Creates a StdSignature message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof sigs.StdSignature
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {sigs.StdSignature} StdSignature
         */
        StdSignature.fromObject = function fromObject(object) {
            if (object instanceof $root.sigs.StdSignature)
                return object;
            var message = new $root.sigs.StdSignature();
            if (object.sequence != null)
                if ($util.Long)
                    (message.sequence = $util.Long.fromValue(object.sequence)).unsigned = false;
                else if (typeof object.sequence === "string")
                    message.sequence = parseInt(object.sequence, 10);
                else if (typeof object.sequence === "number")
                    message.sequence = object.sequence;
                else if (typeof object.sequence === "object")
                    message.sequence = new $util.LongBits(object.sequence.low >>> 0, object.sequence.high >>> 0).toNumber();
            if (object.pubKey != null) {
                if (typeof object.pubKey !== "object")
                    throw TypeError(".sigs.StdSignature.pubKey: object expected");
                message.pubKey = $root.crypto.PublicKey.fromObject(object.pubKey);
            }
            if (object.signature != null) {
                if (typeof object.signature !== "object")
                    throw TypeError(".sigs.StdSignature.signature: object expected");
                message.signature = $root.crypto.Signature.fromObject(object.signature);
            }
            return message;
        };

        /**
         * Creates a plain object from a StdSignature message. Also converts values to other types if specified.
         * @function toObject
         * @memberof sigs.StdSignature
         * @static
         * @param {sigs.StdSignature} message StdSignature
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        StdSignature.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.sequence = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.sequence = options.longs === String ? "0" : 0;
                object.pubKey = null;
                object.signature = null;
            }
            if (message.sequence != null && message.hasOwnProperty("sequence"))
                if (typeof message.sequence === "number")
                    object.sequence = options.longs === String ? String(message.sequence) : message.sequence;
                else
                    object.sequence = options.longs === String ? $util.Long.prototype.toString.call(message.sequence) : options.longs === Number ? new $util.LongBits(message.sequence.low >>> 0, message.sequence.high >>> 0).toNumber() : message.sequence;
            if (message.pubKey != null && message.hasOwnProperty("pubKey"))
                object.pubKey = $root.crypto.PublicKey.toObject(message.pubKey, options);
            if (message.signature != null && message.hasOwnProperty("signature"))
                object.signature = $root.crypto.Signature.toObject(message.signature, options);
            return object;
        };

        /**
         * Converts this StdSignature to JSON.
         * @function toJSON
         * @memberof sigs.StdSignature
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        StdSignature.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return StdSignature;
    })();

    return sigs;
})();

$root.cash = (function() {

    /**
     * Namespace cash.
     * @exports cash
     * @namespace
     */
    var cash = {};

    cash.Set = (function() {

        /**
         * Properties of a Set.
         * @memberof cash
         * @interface ISet
         * @property {Array.<x.ICoin>|null} [coins] Set coins
         */

        /**
         * Constructs a new Set.
         * @memberof cash
         * @classdesc Represents a Set.
         * @implements ISet
         * @constructor
         * @param {cash.ISet=} [properties] Properties to set
         */
        function Set(properties) {
            this.coins = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Set coins.
         * @member {Array.<x.ICoin>} coins
         * @memberof cash.Set
         * @instance
         */
        Set.prototype.coins = $util.emptyArray;

        /**
         * Creates a new Set instance using the specified properties.
         * @function create
         * @memberof cash.Set
         * @static
         * @param {cash.ISet=} [properties] Properties to set
         * @returns {cash.Set} Set instance
         */
        Set.create = function create(properties) {
            return new Set(properties);
        };

        /**
         * Encodes the specified Set message. Does not implicitly {@link cash.Set.verify|verify} messages.
         * @function encode
         * @memberof cash.Set
         * @static
         * @param {cash.ISet} message Set message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Set.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.coins != null && message.coins.length)
                for (var i = 0; i < message.coins.length; ++i)
                    $root.x.Coin.encode(message.coins[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Set message, length delimited. Does not implicitly {@link cash.Set.verify|verify} messages.
         * @function encodeDelimited
         * @memberof cash.Set
         * @static
         * @param {cash.ISet} message Set message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Set.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Set message from the specified reader or buffer.
         * @function decode
         * @memberof cash.Set
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {cash.Set} Set
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Set.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.cash.Set();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.coins && message.coins.length))
                        message.coins = [];
                    message.coins.push($root.x.Coin.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Set message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof cash.Set
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {cash.Set} Set
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Set.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Set message.
         * @function verify
         * @memberof cash.Set
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Set.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.coins != null && message.hasOwnProperty("coins")) {
                if (!Array.isArray(message.coins))
                    return "coins: array expected";
                for (var i = 0; i < message.coins.length; ++i) {
                    var error = $root.x.Coin.verify(message.coins[i]);
                    if (error)
                        return "coins." + error;
                }
            }
            return null;
        };

        /**
         * Creates a Set message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof cash.Set
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {cash.Set} Set
         */
        Set.fromObject = function fromObject(object) {
            if (object instanceof $root.cash.Set)
                return object;
            var message = new $root.cash.Set();
            if (object.coins) {
                if (!Array.isArray(object.coins))
                    throw TypeError(".cash.Set.coins: array expected");
                message.coins = [];
                for (var i = 0; i < object.coins.length; ++i) {
                    if (typeof object.coins[i] !== "object")
                        throw TypeError(".cash.Set.coins: object expected");
                    message.coins[i] = $root.x.Coin.fromObject(object.coins[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a Set message. Also converts values to other types if specified.
         * @function toObject
         * @memberof cash.Set
         * @static
         * @param {cash.Set} message Set
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Set.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.coins = [];
            if (message.coins && message.coins.length) {
                object.coins = [];
                for (var j = 0; j < message.coins.length; ++j)
                    object.coins[j] = $root.x.Coin.toObject(message.coins[j], options);
            }
            return object;
        };

        /**
         * Converts this Set to JSON.
         * @function toJSON
         * @memberof cash.Set
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Set.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Set;
    })();

    cash.SendMsg = (function() {

        /**
         * Properties of a SendMsg.
         * @memberof cash
         * @interface ISendMsg
         * @property {Uint8Array|null} [src] SendMsg src
         * @property {Uint8Array|null} [dest] SendMsg dest
         * @property {x.ICoin|null} [amount] SendMsg amount
         * @property {string|null} [memo] SendMsg memo
         * @property {Uint8Array|null} [ref] SendMsg ref
         */

        /**
         * Constructs a new SendMsg.
         * @memberof cash
         * @classdesc Represents a SendMsg.
         * @implements ISendMsg
         * @constructor
         * @param {cash.ISendMsg=} [properties] Properties to set
         */
        function SendMsg(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SendMsg src.
         * @member {Uint8Array} src
         * @memberof cash.SendMsg
         * @instance
         */
        SendMsg.prototype.src = $util.newBuffer([]);

        /**
         * SendMsg dest.
         * @member {Uint8Array} dest
         * @memberof cash.SendMsg
         * @instance
         */
        SendMsg.prototype.dest = $util.newBuffer([]);

        /**
         * SendMsg amount.
         * @member {x.ICoin|null|undefined} amount
         * @memberof cash.SendMsg
         * @instance
         */
        SendMsg.prototype.amount = null;

        /**
         * SendMsg memo.
         * @member {string} memo
         * @memberof cash.SendMsg
         * @instance
         */
        SendMsg.prototype.memo = "";

        /**
         * SendMsg ref.
         * @member {Uint8Array} ref
         * @memberof cash.SendMsg
         * @instance
         */
        SendMsg.prototype.ref = $util.newBuffer([]);

        /**
         * Creates a new SendMsg instance using the specified properties.
         * @function create
         * @memberof cash.SendMsg
         * @static
         * @param {cash.ISendMsg=} [properties] Properties to set
         * @returns {cash.SendMsg} SendMsg instance
         */
        SendMsg.create = function create(properties) {
            return new SendMsg(properties);
        };

        /**
         * Encodes the specified SendMsg message. Does not implicitly {@link cash.SendMsg.verify|verify} messages.
         * @function encode
         * @memberof cash.SendMsg
         * @static
         * @param {cash.ISendMsg} message SendMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SendMsg.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.src != null && message.hasOwnProperty("src"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.src);
            if (message.dest != null && message.hasOwnProperty("dest"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.dest);
            if (message.amount != null && message.hasOwnProperty("amount"))
                $root.x.Coin.encode(message.amount, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.memo != null && message.hasOwnProperty("memo"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.memo);
            if (message.ref != null && message.hasOwnProperty("ref"))
                writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.ref);
            return writer;
        };

        /**
         * Encodes the specified SendMsg message, length delimited. Does not implicitly {@link cash.SendMsg.verify|verify} messages.
         * @function encodeDelimited
         * @memberof cash.SendMsg
         * @static
         * @param {cash.ISendMsg} message SendMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SendMsg.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a SendMsg message from the specified reader or buffer.
         * @function decode
         * @memberof cash.SendMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {cash.SendMsg} SendMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SendMsg.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.cash.SendMsg();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.src = reader.bytes();
                    break;
                case 2:
                    message.dest = reader.bytes();
                    break;
                case 3:
                    message.amount = $root.x.Coin.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.memo = reader.string();
                    break;
                case 5:
                    message.ref = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a SendMsg message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof cash.SendMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {cash.SendMsg} SendMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SendMsg.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a SendMsg message.
         * @function verify
         * @memberof cash.SendMsg
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        SendMsg.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.src != null && message.hasOwnProperty("src"))
                if (!(message.src && typeof message.src.length === "number" || $util.isString(message.src)))
                    return "src: buffer expected";
            if (message.dest != null && message.hasOwnProperty("dest"))
                if (!(message.dest && typeof message.dest.length === "number" || $util.isString(message.dest)))
                    return "dest: buffer expected";
            if (message.amount != null && message.hasOwnProperty("amount")) {
                var error = $root.x.Coin.verify(message.amount);
                if (error)
                    return "amount." + error;
            }
            if (message.memo != null && message.hasOwnProperty("memo"))
                if (!$util.isString(message.memo))
                    return "memo: string expected";
            if (message.ref != null && message.hasOwnProperty("ref"))
                if (!(message.ref && typeof message.ref.length === "number" || $util.isString(message.ref)))
                    return "ref: buffer expected";
            return null;
        };

        /**
         * Creates a SendMsg message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof cash.SendMsg
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {cash.SendMsg} SendMsg
         */
        SendMsg.fromObject = function fromObject(object) {
            if (object instanceof $root.cash.SendMsg)
                return object;
            var message = new $root.cash.SendMsg();
            if (object.src != null)
                if (typeof object.src === "string")
                    $util.base64.decode(object.src, message.src = $util.newBuffer($util.base64.length(object.src)), 0);
                else if (object.src.length)
                    message.src = object.src;
            if (object.dest != null)
                if (typeof object.dest === "string")
                    $util.base64.decode(object.dest, message.dest = $util.newBuffer($util.base64.length(object.dest)), 0);
                else if (object.dest.length)
                    message.dest = object.dest;
            if (object.amount != null) {
                if (typeof object.amount !== "object")
                    throw TypeError(".cash.SendMsg.amount: object expected");
                message.amount = $root.x.Coin.fromObject(object.amount);
            }
            if (object.memo != null)
                message.memo = String(object.memo);
            if (object.ref != null)
                if (typeof object.ref === "string")
                    $util.base64.decode(object.ref, message.ref = $util.newBuffer($util.base64.length(object.ref)), 0);
                else if (object.ref.length)
                    message.ref = object.ref;
            return message;
        };

        /**
         * Creates a plain object from a SendMsg message. Also converts values to other types if specified.
         * @function toObject
         * @memberof cash.SendMsg
         * @static
         * @param {cash.SendMsg} message SendMsg
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        SendMsg.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.src = options.bytes === String ? "" : [];
                object.dest = options.bytes === String ? "" : [];
                object.amount = null;
                object.memo = "";
                object.ref = options.bytes === String ? "" : [];
            }
            if (message.src != null && message.hasOwnProperty("src"))
                object.src = options.bytes === String ? $util.base64.encode(message.src, 0, message.src.length) : options.bytes === Array ? Array.prototype.slice.call(message.src) : message.src;
            if (message.dest != null && message.hasOwnProperty("dest"))
                object.dest = options.bytes === String ? $util.base64.encode(message.dest, 0, message.dest.length) : options.bytes === Array ? Array.prototype.slice.call(message.dest) : message.dest;
            if (message.amount != null && message.hasOwnProperty("amount"))
                object.amount = $root.x.Coin.toObject(message.amount, options);
            if (message.memo != null && message.hasOwnProperty("memo"))
                object.memo = message.memo;
            if (message.ref != null && message.hasOwnProperty("ref"))
                object.ref = options.bytes === String ? $util.base64.encode(message.ref, 0, message.ref.length) : options.bytes === Array ? Array.prototype.slice.call(message.ref) : message.ref;
            return object;
        };

        /**
         * Converts this SendMsg to JSON.
         * @function toJSON
         * @memberof cash.SendMsg
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        SendMsg.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return SendMsg;
    })();

    cash.FeeInfo = (function() {

        /**
         * Properties of a FeeInfo.
         * @memberof cash
         * @interface IFeeInfo
         * @property {Uint8Array|null} [payer] FeeInfo payer
         * @property {x.ICoin|null} [fees] FeeInfo fees
         */

        /**
         * Constructs a new FeeInfo.
         * @memberof cash
         * @classdesc Represents a FeeInfo.
         * @implements IFeeInfo
         * @constructor
         * @param {cash.IFeeInfo=} [properties] Properties to set
         */
        function FeeInfo(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * FeeInfo payer.
         * @member {Uint8Array} payer
         * @memberof cash.FeeInfo
         * @instance
         */
        FeeInfo.prototype.payer = $util.newBuffer([]);

        /**
         * FeeInfo fees.
         * @member {x.ICoin|null|undefined} fees
         * @memberof cash.FeeInfo
         * @instance
         */
        FeeInfo.prototype.fees = null;

        /**
         * Creates a new FeeInfo instance using the specified properties.
         * @function create
         * @memberof cash.FeeInfo
         * @static
         * @param {cash.IFeeInfo=} [properties] Properties to set
         * @returns {cash.FeeInfo} FeeInfo instance
         */
        FeeInfo.create = function create(properties) {
            return new FeeInfo(properties);
        };

        /**
         * Encodes the specified FeeInfo message. Does not implicitly {@link cash.FeeInfo.verify|verify} messages.
         * @function encode
         * @memberof cash.FeeInfo
         * @static
         * @param {cash.IFeeInfo} message FeeInfo message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FeeInfo.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.payer != null && message.hasOwnProperty("payer"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.payer);
            if (message.fees != null && message.hasOwnProperty("fees"))
                $root.x.Coin.encode(message.fees, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified FeeInfo message, length delimited. Does not implicitly {@link cash.FeeInfo.verify|verify} messages.
         * @function encodeDelimited
         * @memberof cash.FeeInfo
         * @static
         * @param {cash.IFeeInfo} message FeeInfo message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FeeInfo.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a FeeInfo message from the specified reader or buffer.
         * @function decode
         * @memberof cash.FeeInfo
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {cash.FeeInfo} FeeInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FeeInfo.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.cash.FeeInfo();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.payer = reader.bytes();
                    break;
                case 2:
                    message.fees = $root.x.Coin.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a FeeInfo message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof cash.FeeInfo
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {cash.FeeInfo} FeeInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FeeInfo.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a FeeInfo message.
         * @function verify
         * @memberof cash.FeeInfo
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        FeeInfo.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.payer != null && message.hasOwnProperty("payer"))
                if (!(message.payer && typeof message.payer.length === "number" || $util.isString(message.payer)))
                    return "payer: buffer expected";
            if (message.fees != null && message.hasOwnProperty("fees")) {
                var error = $root.x.Coin.verify(message.fees);
                if (error)
                    return "fees." + error;
            }
            return null;
        };

        /**
         * Creates a FeeInfo message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof cash.FeeInfo
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {cash.FeeInfo} FeeInfo
         */
        FeeInfo.fromObject = function fromObject(object) {
            if (object instanceof $root.cash.FeeInfo)
                return object;
            var message = new $root.cash.FeeInfo();
            if (object.payer != null)
                if (typeof object.payer === "string")
                    $util.base64.decode(object.payer, message.payer = $util.newBuffer($util.base64.length(object.payer)), 0);
                else if (object.payer.length)
                    message.payer = object.payer;
            if (object.fees != null) {
                if (typeof object.fees !== "object")
                    throw TypeError(".cash.FeeInfo.fees: object expected");
                message.fees = $root.x.Coin.fromObject(object.fees);
            }
            return message;
        };

        /**
         * Creates a plain object from a FeeInfo message. Also converts values to other types if specified.
         * @function toObject
         * @memberof cash.FeeInfo
         * @static
         * @param {cash.FeeInfo} message FeeInfo
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        FeeInfo.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.payer = options.bytes === String ? "" : [];
                object.fees = null;
            }
            if (message.payer != null && message.hasOwnProperty("payer"))
                object.payer = options.bytes === String ? $util.base64.encode(message.payer, 0, message.payer.length) : options.bytes === Array ? Array.prototype.slice.call(message.payer) : message.payer;
            if (message.fees != null && message.hasOwnProperty("fees"))
                object.fees = $root.x.Coin.toObject(message.fees, options);
            return object;
        };

        /**
         * Converts this FeeInfo to JSON.
         * @function toJSON
         * @memberof cash.FeeInfo
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        FeeInfo.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return FeeInfo;
    })();

    return cash;
})();

$root.x = (function() {

    /**
     * Namespace x.
     * @exports x
     * @namespace
     */
    var x = {};

    x.Coin = (function() {

        /**
         * Properties of a Coin.
         * @memberof x
         * @interface ICoin
         * @property {number|Long|null} [whole] Coin whole
         * @property {number|Long|null} [fractional] Coin fractional
         * @property {string|null} [ticker] Coin ticker
         * @property {string|null} [issuer] Coin issuer
         */

        /**
         * Constructs a new Coin.
         * @memberof x
         * @classdesc Represents a Coin.
         * @implements ICoin
         * @constructor
         * @param {x.ICoin=} [properties] Properties to set
         */
        function Coin(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Coin whole.
         * @member {number|Long} whole
         * @memberof x.Coin
         * @instance
         */
        Coin.prototype.whole = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Coin fractional.
         * @member {number|Long} fractional
         * @memberof x.Coin
         * @instance
         */
        Coin.prototype.fractional = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Coin ticker.
         * @member {string} ticker
         * @memberof x.Coin
         * @instance
         */
        Coin.prototype.ticker = "";

        /**
         * Coin issuer.
         * @member {string} issuer
         * @memberof x.Coin
         * @instance
         */
        Coin.prototype.issuer = "";

        /**
         * Creates a new Coin instance using the specified properties.
         * @function create
         * @memberof x.Coin
         * @static
         * @param {x.ICoin=} [properties] Properties to set
         * @returns {x.Coin} Coin instance
         */
        Coin.create = function create(properties) {
            return new Coin(properties);
        };

        /**
         * Encodes the specified Coin message. Does not implicitly {@link x.Coin.verify|verify} messages.
         * @function encode
         * @memberof x.Coin
         * @static
         * @param {x.ICoin} message Coin message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Coin.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.whole != null && message.hasOwnProperty("whole"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.whole);
            if (message.fractional != null && message.hasOwnProperty("fractional"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.fractional);
            if (message.ticker != null && message.hasOwnProperty("ticker"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.ticker);
            if (message.issuer != null && message.hasOwnProperty("issuer"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.issuer);
            return writer;
        };

        /**
         * Encodes the specified Coin message, length delimited. Does not implicitly {@link x.Coin.verify|verify} messages.
         * @function encodeDelimited
         * @memberof x.Coin
         * @static
         * @param {x.ICoin} message Coin message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Coin.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Coin message from the specified reader or buffer.
         * @function decode
         * @memberof x.Coin
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {x.Coin} Coin
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Coin.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.x.Coin();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.whole = reader.int64();
                    break;
                case 2:
                    message.fractional = reader.int64();
                    break;
                case 3:
                    message.ticker = reader.string();
                    break;
                case 4:
                    message.issuer = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Coin message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof x.Coin
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {x.Coin} Coin
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Coin.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Coin message.
         * @function verify
         * @memberof x.Coin
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Coin.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.whole != null && message.hasOwnProperty("whole"))
                if (!$util.isInteger(message.whole) && !(message.whole && $util.isInteger(message.whole.low) && $util.isInteger(message.whole.high)))
                    return "whole: integer|Long expected";
            if (message.fractional != null && message.hasOwnProperty("fractional"))
                if (!$util.isInteger(message.fractional) && !(message.fractional && $util.isInteger(message.fractional.low) && $util.isInteger(message.fractional.high)))
                    return "fractional: integer|Long expected";
            if (message.ticker != null && message.hasOwnProperty("ticker"))
                if (!$util.isString(message.ticker))
                    return "ticker: string expected";
            if (message.issuer != null && message.hasOwnProperty("issuer"))
                if (!$util.isString(message.issuer))
                    return "issuer: string expected";
            return null;
        };

        /**
         * Creates a Coin message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof x.Coin
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {x.Coin} Coin
         */
        Coin.fromObject = function fromObject(object) {
            if (object instanceof $root.x.Coin)
                return object;
            var message = new $root.x.Coin();
            if (object.whole != null)
                if ($util.Long)
                    (message.whole = $util.Long.fromValue(object.whole)).unsigned = false;
                else if (typeof object.whole === "string")
                    message.whole = parseInt(object.whole, 10);
                else if (typeof object.whole === "number")
                    message.whole = object.whole;
                else if (typeof object.whole === "object")
                    message.whole = new $util.LongBits(object.whole.low >>> 0, object.whole.high >>> 0).toNumber();
            if (object.fractional != null)
                if ($util.Long)
                    (message.fractional = $util.Long.fromValue(object.fractional)).unsigned = false;
                else if (typeof object.fractional === "string")
                    message.fractional = parseInt(object.fractional, 10);
                else if (typeof object.fractional === "number")
                    message.fractional = object.fractional;
                else if (typeof object.fractional === "object")
                    message.fractional = new $util.LongBits(object.fractional.low >>> 0, object.fractional.high >>> 0).toNumber();
            if (object.ticker != null)
                message.ticker = String(object.ticker);
            if (object.issuer != null)
                message.issuer = String(object.issuer);
            return message;
        };

        /**
         * Creates a plain object from a Coin message. Also converts values to other types if specified.
         * @function toObject
         * @memberof x.Coin
         * @static
         * @param {x.Coin} message Coin
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Coin.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.whole = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.whole = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.fractional = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.fractional = options.longs === String ? "0" : 0;
                object.ticker = "";
                object.issuer = "";
            }
            if (message.whole != null && message.hasOwnProperty("whole"))
                if (typeof message.whole === "number")
                    object.whole = options.longs === String ? String(message.whole) : message.whole;
                else
                    object.whole = options.longs === String ? $util.Long.prototype.toString.call(message.whole) : options.longs === Number ? new $util.LongBits(message.whole.low >>> 0, message.whole.high >>> 0).toNumber() : message.whole;
            if (message.fractional != null && message.hasOwnProperty("fractional"))
                if (typeof message.fractional === "number")
                    object.fractional = options.longs === String ? String(message.fractional) : message.fractional;
                else
                    object.fractional = options.longs === String ? $util.Long.prototype.toString.call(message.fractional) : options.longs === Number ? new $util.LongBits(message.fractional.low >>> 0, message.fractional.high >>> 0).toNumber() : message.fractional;
            if (message.ticker != null && message.hasOwnProperty("ticker"))
                object.ticker = message.ticker;
            if (message.issuer != null && message.hasOwnProperty("issuer"))
                object.issuer = message.issuer;
            return object;
        };

        /**
         * Converts this Coin to JSON.
         * @function toJSON
         * @memberof x.Coin
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Coin.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Coin;
    })();

    return x;
})();

$root.app = (function() {

    /**
     * Namespace app.
     * @exports app
     * @namespace
     */
    var app = {};

    app.ResultSet = (function() {

        /**
         * Properties of a ResultSet.
         * @memberof app
         * @interface IResultSet
         * @property {Array.<Uint8Array>|null} [results] ResultSet results
         */

        /**
         * Constructs a new ResultSet.
         * @memberof app
         * @classdesc Represents a ResultSet.
         * @implements IResultSet
         * @constructor
         * @param {app.IResultSet=} [properties] Properties to set
         */
        function ResultSet(properties) {
            this.results = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ResultSet results.
         * @member {Array.<Uint8Array>} results
         * @memberof app.ResultSet
         * @instance
         */
        ResultSet.prototype.results = $util.emptyArray;

        /**
         * Creates a new ResultSet instance using the specified properties.
         * @function create
         * @memberof app.ResultSet
         * @static
         * @param {app.IResultSet=} [properties] Properties to set
         * @returns {app.ResultSet} ResultSet instance
         */
        ResultSet.create = function create(properties) {
            return new ResultSet(properties);
        };

        /**
         * Encodes the specified ResultSet message. Does not implicitly {@link app.ResultSet.verify|verify} messages.
         * @function encode
         * @memberof app.ResultSet
         * @static
         * @param {app.IResultSet} message ResultSet message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ResultSet.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.results != null && message.results.length)
                for (var i = 0; i < message.results.length; ++i)
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.results[i]);
            return writer;
        };

        /**
         * Encodes the specified ResultSet message, length delimited. Does not implicitly {@link app.ResultSet.verify|verify} messages.
         * @function encodeDelimited
         * @memberof app.ResultSet
         * @static
         * @param {app.IResultSet} message ResultSet message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ResultSet.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ResultSet message from the specified reader or buffer.
         * @function decode
         * @memberof app.ResultSet
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {app.ResultSet} ResultSet
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ResultSet.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.app.ResultSet();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.results && message.results.length))
                        message.results = [];
                    message.results.push(reader.bytes());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ResultSet message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof app.ResultSet
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {app.ResultSet} ResultSet
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ResultSet.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ResultSet message.
         * @function verify
         * @memberof app.ResultSet
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ResultSet.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.results != null && message.hasOwnProperty("results")) {
                if (!Array.isArray(message.results))
                    return "results: array expected";
                for (var i = 0; i < message.results.length; ++i)
                    if (!(message.results[i] && typeof message.results[i].length === "number" || $util.isString(message.results[i])))
                        return "results: buffer[] expected";
            }
            return null;
        };

        /**
         * Creates a ResultSet message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof app.ResultSet
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {app.ResultSet} ResultSet
         */
        ResultSet.fromObject = function fromObject(object) {
            if (object instanceof $root.app.ResultSet)
                return object;
            var message = new $root.app.ResultSet();
            if (object.results) {
                if (!Array.isArray(object.results))
                    throw TypeError(".app.ResultSet.results: array expected");
                message.results = [];
                for (var i = 0; i < object.results.length; ++i)
                    if (typeof object.results[i] === "string")
                        $util.base64.decode(object.results[i], message.results[i] = $util.newBuffer($util.base64.length(object.results[i])), 0);
                    else if (object.results[i].length)
                        message.results[i] = object.results[i];
            }
            return message;
        };

        /**
         * Creates a plain object from a ResultSet message. Also converts values to other types if specified.
         * @function toObject
         * @memberof app.ResultSet
         * @static
         * @param {app.ResultSet} message ResultSet
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ResultSet.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.results = [];
            if (message.results && message.results.length) {
                object.results = [];
                for (var j = 0; j < message.results.length; ++j)
                    object.results[j] = options.bytes === String ? $util.base64.encode(message.results[j], 0, message.results[j].length) : options.bytes === Array ? Array.prototype.slice.call(message.results[j]) : message.results[j];
            }
            return object;
        };

        /**
         * Converts this ResultSet to JSON.
         * @function toJSON
         * @memberof app.ResultSet
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ResultSet.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return ResultSet;
    })();

    app.Tx = (function() {

        /**
         * Properties of a Tx.
         * @memberof app
         * @interface ITx
         * @property {cash.ISendMsg|null} [sendMsg] Tx sendMsg
         * @property {namecoin.INewTokenMsg|null} [newTokenMsg] Tx newTokenMsg
         * @property {namecoin.ISetWalletNameMsg|null} [setNameMsg] Tx setNameMsg
         * @property {escrow.ICreateEscrowMsg|null} [createEscrowMsg] Tx createEscrowMsg
         * @property {escrow.IReleaseEscrowMsg|null} [releaseEscrowMsg] Tx releaseEscrowMsg
         * @property {escrow.IReturnEscrowMsg|null} [returnEscrowMsg] Tx returnEscrowMsg
         * @property {escrow.IUpdateEscrowPartiesMsg|null} [updateEscrowMsg] Tx updateEscrowMsg
         * @property {cash.IFeeInfo|null} [fees] Tx fees
         * @property {Array.<sigs.IStdSignature>|null} [signatures] Tx signatures
         * @property {Uint8Array|null} [preimage] Tx preimage
         */

        /**
         * Constructs a new Tx.
         * @memberof app
         * @classdesc Represents a Tx.
         * @implements ITx
         * @constructor
         * @param {app.ITx=} [properties] Properties to set
         */
        function Tx(properties) {
            this.signatures = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Tx sendMsg.
         * @member {cash.ISendMsg|null|undefined} sendMsg
         * @memberof app.Tx
         * @instance
         */
        Tx.prototype.sendMsg = null;

        /**
         * Tx newTokenMsg.
         * @member {namecoin.INewTokenMsg|null|undefined} newTokenMsg
         * @memberof app.Tx
         * @instance
         */
        Tx.prototype.newTokenMsg = null;

        /**
         * Tx setNameMsg.
         * @member {namecoin.ISetWalletNameMsg|null|undefined} setNameMsg
         * @memberof app.Tx
         * @instance
         */
        Tx.prototype.setNameMsg = null;

        /**
         * Tx createEscrowMsg.
         * @member {escrow.ICreateEscrowMsg|null|undefined} createEscrowMsg
         * @memberof app.Tx
         * @instance
         */
        Tx.prototype.createEscrowMsg = null;

        /**
         * Tx releaseEscrowMsg.
         * @member {escrow.IReleaseEscrowMsg|null|undefined} releaseEscrowMsg
         * @memberof app.Tx
         * @instance
         */
        Tx.prototype.releaseEscrowMsg = null;

        /**
         * Tx returnEscrowMsg.
         * @member {escrow.IReturnEscrowMsg|null|undefined} returnEscrowMsg
         * @memberof app.Tx
         * @instance
         */
        Tx.prototype.returnEscrowMsg = null;

        /**
         * Tx updateEscrowMsg.
         * @member {escrow.IUpdateEscrowPartiesMsg|null|undefined} updateEscrowMsg
         * @memberof app.Tx
         * @instance
         */
        Tx.prototype.updateEscrowMsg = null;

        /**
         * Tx fees.
         * @member {cash.IFeeInfo|null|undefined} fees
         * @memberof app.Tx
         * @instance
         */
        Tx.prototype.fees = null;

        /**
         * Tx signatures.
         * @member {Array.<sigs.IStdSignature>} signatures
         * @memberof app.Tx
         * @instance
         */
        Tx.prototype.signatures = $util.emptyArray;

        /**
         * Tx preimage.
         * @member {Uint8Array} preimage
         * @memberof app.Tx
         * @instance
         */
        Tx.prototype.preimage = $util.newBuffer([]);

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * Tx sum.
         * @member {"sendMsg"|"newTokenMsg"|"setNameMsg"|"createEscrowMsg"|"releaseEscrowMsg"|"returnEscrowMsg"|"updateEscrowMsg"|undefined} sum
         * @memberof app.Tx
         * @instance
         */
        Object.defineProperty(Tx.prototype, "sum", {
            get: $util.oneOfGetter($oneOfFields = ["sendMsg", "newTokenMsg", "setNameMsg", "createEscrowMsg", "releaseEscrowMsg", "returnEscrowMsg", "updateEscrowMsg"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new Tx instance using the specified properties.
         * @function create
         * @memberof app.Tx
         * @static
         * @param {app.ITx=} [properties] Properties to set
         * @returns {app.Tx} Tx instance
         */
        Tx.create = function create(properties) {
            return new Tx(properties);
        };

        /**
         * Encodes the specified Tx message. Does not implicitly {@link app.Tx.verify|verify} messages.
         * @function encode
         * @memberof app.Tx
         * @static
         * @param {app.ITx} message Tx message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Tx.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.sendMsg != null && message.hasOwnProperty("sendMsg"))
                $root.cash.SendMsg.encode(message.sendMsg, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.newTokenMsg != null && message.hasOwnProperty("newTokenMsg"))
                $root.namecoin.NewTokenMsg.encode(message.newTokenMsg, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.setNameMsg != null && message.hasOwnProperty("setNameMsg"))
                $root.namecoin.SetWalletNameMsg.encode(message.setNameMsg, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.createEscrowMsg != null && message.hasOwnProperty("createEscrowMsg"))
                $root.escrow.CreateEscrowMsg.encode(message.createEscrowMsg, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.releaseEscrowMsg != null && message.hasOwnProperty("releaseEscrowMsg"))
                $root.escrow.ReleaseEscrowMsg.encode(message.releaseEscrowMsg, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.returnEscrowMsg != null && message.hasOwnProperty("returnEscrowMsg"))
                $root.escrow.ReturnEscrowMsg.encode(message.returnEscrowMsg, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
            if (message.updateEscrowMsg != null && message.hasOwnProperty("updateEscrowMsg"))
                $root.escrow.UpdateEscrowPartiesMsg.encode(message.updateEscrowMsg, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
            if (message.fees != null && message.hasOwnProperty("fees"))
                $root.cash.FeeInfo.encode(message.fees, writer.uint32(/* id 20, wireType 2 =*/162).fork()).ldelim();
            if (message.signatures != null && message.signatures.length)
                for (var i = 0; i < message.signatures.length; ++i)
                    $root.sigs.StdSignature.encode(message.signatures[i], writer.uint32(/* id 21, wireType 2 =*/170).fork()).ldelim();
            if (message.preimage != null && message.hasOwnProperty("preimage"))
                writer.uint32(/* id 22, wireType 2 =*/178).bytes(message.preimage);
            return writer;
        };

        /**
         * Encodes the specified Tx message, length delimited. Does not implicitly {@link app.Tx.verify|verify} messages.
         * @function encodeDelimited
         * @memberof app.Tx
         * @static
         * @param {app.ITx} message Tx message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Tx.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Tx message from the specified reader or buffer.
         * @function decode
         * @memberof app.Tx
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {app.Tx} Tx
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Tx.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.app.Tx();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.sendMsg = $root.cash.SendMsg.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.newTokenMsg = $root.namecoin.NewTokenMsg.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.setNameMsg = $root.namecoin.SetWalletNameMsg.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.createEscrowMsg = $root.escrow.CreateEscrowMsg.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.releaseEscrowMsg = $root.escrow.ReleaseEscrowMsg.decode(reader, reader.uint32());
                    break;
                case 6:
                    message.returnEscrowMsg = $root.escrow.ReturnEscrowMsg.decode(reader, reader.uint32());
                    break;
                case 7:
                    message.updateEscrowMsg = $root.escrow.UpdateEscrowPartiesMsg.decode(reader, reader.uint32());
                    break;
                case 20:
                    message.fees = $root.cash.FeeInfo.decode(reader, reader.uint32());
                    break;
                case 21:
                    if (!(message.signatures && message.signatures.length))
                        message.signatures = [];
                    message.signatures.push($root.sigs.StdSignature.decode(reader, reader.uint32()));
                    break;
                case 22:
                    message.preimage = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Tx message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof app.Tx
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {app.Tx} Tx
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Tx.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Tx message.
         * @function verify
         * @memberof app.Tx
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Tx.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.sendMsg != null && message.hasOwnProperty("sendMsg")) {
                properties.sum = 1;
                {
                    var error = $root.cash.SendMsg.verify(message.sendMsg);
                    if (error)
                        return "sendMsg." + error;
                }
            }
            if (message.newTokenMsg != null && message.hasOwnProperty("newTokenMsg")) {
                if (properties.sum === 1)
                    return "sum: multiple values";
                properties.sum = 1;
                {
                    var error = $root.namecoin.NewTokenMsg.verify(message.newTokenMsg);
                    if (error)
                        return "newTokenMsg." + error;
                }
            }
            if (message.setNameMsg != null && message.hasOwnProperty("setNameMsg")) {
                if (properties.sum === 1)
                    return "sum: multiple values";
                properties.sum = 1;
                {
                    var error = $root.namecoin.SetWalletNameMsg.verify(message.setNameMsg);
                    if (error)
                        return "setNameMsg." + error;
                }
            }
            if (message.createEscrowMsg != null && message.hasOwnProperty("createEscrowMsg")) {
                if (properties.sum === 1)
                    return "sum: multiple values";
                properties.sum = 1;
                {
                    var error = $root.escrow.CreateEscrowMsg.verify(message.createEscrowMsg);
                    if (error)
                        return "createEscrowMsg." + error;
                }
            }
            if (message.releaseEscrowMsg != null && message.hasOwnProperty("releaseEscrowMsg")) {
                if (properties.sum === 1)
                    return "sum: multiple values";
                properties.sum = 1;
                {
                    var error = $root.escrow.ReleaseEscrowMsg.verify(message.releaseEscrowMsg);
                    if (error)
                        return "releaseEscrowMsg." + error;
                }
            }
            if (message.returnEscrowMsg != null && message.hasOwnProperty("returnEscrowMsg")) {
                if (properties.sum === 1)
                    return "sum: multiple values";
                properties.sum = 1;
                {
                    var error = $root.escrow.ReturnEscrowMsg.verify(message.returnEscrowMsg);
                    if (error)
                        return "returnEscrowMsg." + error;
                }
            }
            if (message.updateEscrowMsg != null && message.hasOwnProperty("updateEscrowMsg")) {
                if (properties.sum === 1)
                    return "sum: multiple values";
                properties.sum = 1;
                {
                    var error = $root.escrow.UpdateEscrowPartiesMsg.verify(message.updateEscrowMsg);
                    if (error)
                        return "updateEscrowMsg." + error;
                }
            }
            if (message.fees != null && message.hasOwnProperty("fees")) {
                var error = $root.cash.FeeInfo.verify(message.fees);
                if (error)
                    return "fees." + error;
            }
            if (message.signatures != null && message.hasOwnProperty("signatures")) {
                if (!Array.isArray(message.signatures))
                    return "signatures: array expected";
                for (var i = 0; i < message.signatures.length; ++i) {
                    var error = $root.sigs.StdSignature.verify(message.signatures[i]);
                    if (error)
                        return "signatures." + error;
                }
            }
            if (message.preimage != null && message.hasOwnProperty("preimage"))
                if (!(message.preimage && typeof message.preimage.length === "number" || $util.isString(message.preimage)))
                    return "preimage: buffer expected";
            return null;
        };

        /**
         * Creates a Tx message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof app.Tx
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {app.Tx} Tx
         */
        Tx.fromObject = function fromObject(object) {
            if (object instanceof $root.app.Tx)
                return object;
            var message = new $root.app.Tx();
            if (object.sendMsg != null) {
                if (typeof object.sendMsg !== "object")
                    throw TypeError(".app.Tx.sendMsg: object expected");
                message.sendMsg = $root.cash.SendMsg.fromObject(object.sendMsg);
            }
            if (object.newTokenMsg != null) {
                if (typeof object.newTokenMsg !== "object")
                    throw TypeError(".app.Tx.newTokenMsg: object expected");
                message.newTokenMsg = $root.namecoin.NewTokenMsg.fromObject(object.newTokenMsg);
            }
            if (object.setNameMsg != null) {
                if (typeof object.setNameMsg !== "object")
                    throw TypeError(".app.Tx.setNameMsg: object expected");
                message.setNameMsg = $root.namecoin.SetWalletNameMsg.fromObject(object.setNameMsg);
            }
            if (object.createEscrowMsg != null) {
                if (typeof object.createEscrowMsg !== "object")
                    throw TypeError(".app.Tx.createEscrowMsg: object expected");
                message.createEscrowMsg = $root.escrow.CreateEscrowMsg.fromObject(object.createEscrowMsg);
            }
            if (object.releaseEscrowMsg != null) {
                if (typeof object.releaseEscrowMsg !== "object")
                    throw TypeError(".app.Tx.releaseEscrowMsg: object expected");
                message.releaseEscrowMsg = $root.escrow.ReleaseEscrowMsg.fromObject(object.releaseEscrowMsg);
            }
            if (object.returnEscrowMsg != null) {
                if (typeof object.returnEscrowMsg !== "object")
                    throw TypeError(".app.Tx.returnEscrowMsg: object expected");
                message.returnEscrowMsg = $root.escrow.ReturnEscrowMsg.fromObject(object.returnEscrowMsg);
            }
            if (object.updateEscrowMsg != null) {
                if (typeof object.updateEscrowMsg !== "object")
                    throw TypeError(".app.Tx.updateEscrowMsg: object expected");
                message.updateEscrowMsg = $root.escrow.UpdateEscrowPartiesMsg.fromObject(object.updateEscrowMsg);
            }
            if (object.fees != null) {
                if (typeof object.fees !== "object")
                    throw TypeError(".app.Tx.fees: object expected");
                message.fees = $root.cash.FeeInfo.fromObject(object.fees);
            }
            if (object.signatures) {
                if (!Array.isArray(object.signatures))
                    throw TypeError(".app.Tx.signatures: array expected");
                message.signatures = [];
                for (var i = 0; i < object.signatures.length; ++i) {
                    if (typeof object.signatures[i] !== "object")
                        throw TypeError(".app.Tx.signatures: object expected");
                    message.signatures[i] = $root.sigs.StdSignature.fromObject(object.signatures[i]);
                }
            }
            if (object.preimage != null)
                if (typeof object.preimage === "string")
                    $util.base64.decode(object.preimage, message.preimage = $util.newBuffer($util.base64.length(object.preimage)), 0);
                else if (object.preimage.length)
                    message.preimage = object.preimage;
            return message;
        };

        /**
         * Creates a plain object from a Tx message. Also converts values to other types if specified.
         * @function toObject
         * @memberof app.Tx
         * @static
         * @param {app.Tx} message Tx
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Tx.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.signatures = [];
            if (options.defaults) {
                object.fees = null;
                object.preimage = options.bytes === String ? "" : [];
            }
            if (message.sendMsg != null && message.hasOwnProperty("sendMsg")) {
                object.sendMsg = $root.cash.SendMsg.toObject(message.sendMsg, options);
                if (options.oneofs)
                    object.sum = "sendMsg";
            }
            if (message.newTokenMsg != null && message.hasOwnProperty("newTokenMsg")) {
                object.newTokenMsg = $root.namecoin.NewTokenMsg.toObject(message.newTokenMsg, options);
                if (options.oneofs)
                    object.sum = "newTokenMsg";
            }
            if (message.setNameMsg != null && message.hasOwnProperty("setNameMsg")) {
                object.setNameMsg = $root.namecoin.SetWalletNameMsg.toObject(message.setNameMsg, options);
                if (options.oneofs)
                    object.sum = "setNameMsg";
            }
            if (message.createEscrowMsg != null && message.hasOwnProperty("createEscrowMsg")) {
                object.createEscrowMsg = $root.escrow.CreateEscrowMsg.toObject(message.createEscrowMsg, options);
                if (options.oneofs)
                    object.sum = "createEscrowMsg";
            }
            if (message.releaseEscrowMsg != null && message.hasOwnProperty("releaseEscrowMsg")) {
                object.releaseEscrowMsg = $root.escrow.ReleaseEscrowMsg.toObject(message.releaseEscrowMsg, options);
                if (options.oneofs)
                    object.sum = "releaseEscrowMsg";
            }
            if (message.returnEscrowMsg != null && message.hasOwnProperty("returnEscrowMsg")) {
                object.returnEscrowMsg = $root.escrow.ReturnEscrowMsg.toObject(message.returnEscrowMsg, options);
                if (options.oneofs)
                    object.sum = "returnEscrowMsg";
            }
            if (message.updateEscrowMsg != null && message.hasOwnProperty("updateEscrowMsg")) {
                object.updateEscrowMsg = $root.escrow.UpdateEscrowPartiesMsg.toObject(message.updateEscrowMsg, options);
                if (options.oneofs)
                    object.sum = "updateEscrowMsg";
            }
            if (message.fees != null && message.hasOwnProperty("fees"))
                object.fees = $root.cash.FeeInfo.toObject(message.fees, options);
            if (message.signatures && message.signatures.length) {
                object.signatures = [];
                for (var j = 0; j < message.signatures.length; ++j)
                    object.signatures[j] = $root.sigs.StdSignature.toObject(message.signatures[j], options);
            }
            if (message.preimage != null && message.hasOwnProperty("preimage"))
                object.preimage = options.bytes === String ? $util.base64.encode(message.preimage, 0, message.preimage.length) : options.bytes === Array ? Array.prototype.slice.call(message.preimage) : message.preimage;
            return object;
        };

        /**
         * Converts this Tx to JSON.
         * @function toJSON
         * @memberof app.Tx
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Tx.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Tx;
    })();

    return app;
})();

$root.escrow = (function() {

    /**
     * Namespace escrow.
     * @exports escrow
     * @namespace
     */
    var escrow = {};

    escrow.Escrow = (function() {

        /**
         * Properties of an Escrow.
         * @memberof escrow
         * @interface IEscrow
         * @property {Uint8Array|null} [sender] Escrow sender
         * @property {Uint8Array|null} [arbiter] Escrow arbiter
         * @property {Uint8Array|null} [recipient] Escrow recipient
         * @property {Array.<x.ICoin>|null} [amount] Escrow amount
         * @property {number|Long|null} [timeout] Escrow timeout
         * @property {string|null} [memo] Escrow memo
         */

        /**
         * Constructs a new Escrow.
         * @memberof escrow
         * @classdesc Represents an Escrow.
         * @implements IEscrow
         * @constructor
         * @param {escrow.IEscrow=} [properties] Properties to set
         */
        function Escrow(properties) {
            this.amount = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Escrow sender.
         * @member {Uint8Array} sender
         * @memberof escrow.Escrow
         * @instance
         */
        Escrow.prototype.sender = $util.newBuffer([]);

        /**
         * Escrow arbiter.
         * @member {Uint8Array} arbiter
         * @memberof escrow.Escrow
         * @instance
         */
        Escrow.prototype.arbiter = $util.newBuffer([]);

        /**
         * Escrow recipient.
         * @member {Uint8Array} recipient
         * @memberof escrow.Escrow
         * @instance
         */
        Escrow.prototype.recipient = $util.newBuffer([]);

        /**
         * Escrow amount.
         * @member {Array.<x.ICoin>} amount
         * @memberof escrow.Escrow
         * @instance
         */
        Escrow.prototype.amount = $util.emptyArray;

        /**
         * Escrow timeout.
         * @member {number|Long} timeout
         * @memberof escrow.Escrow
         * @instance
         */
        Escrow.prototype.timeout = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Escrow memo.
         * @member {string} memo
         * @memberof escrow.Escrow
         * @instance
         */
        Escrow.prototype.memo = "";

        /**
         * Creates a new Escrow instance using the specified properties.
         * @function create
         * @memberof escrow.Escrow
         * @static
         * @param {escrow.IEscrow=} [properties] Properties to set
         * @returns {escrow.Escrow} Escrow instance
         */
        Escrow.create = function create(properties) {
            return new Escrow(properties);
        };

        /**
         * Encodes the specified Escrow message. Does not implicitly {@link escrow.Escrow.verify|verify} messages.
         * @function encode
         * @memberof escrow.Escrow
         * @static
         * @param {escrow.IEscrow} message Escrow message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Escrow.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.sender != null && message.hasOwnProperty("sender"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.sender);
            if (message.arbiter != null && message.hasOwnProperty("arbiter"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.arbiter);
            if (message.recipient != null && message.hasOwnProperty("recipient"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.recipient);
            if (message.amount != null && message.amount.length)
                for (var i = 0; i < message.amount.length; ++i)
                    $root.x.Coin.encode(message.amount[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.timeout != null && message.hasOwnProperty("timeout"))
                writer.uint32(/* id 5, wireType 0 =*/40).int64(message.timeout);
            if (message.memo != null && message.hasOwnProperty("memo"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.memo);
            return writer;
        };

        /**
         * Encodes the specified Escrow message, length delimited. Does not implicitly {@link escrow.Escrow.verify|verify} messages.
         * @function encodeDelimited
         * @memberof escrow.Escrow
         * @static
         * @param {escrow.IEscrow} message Escrow message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Escrow.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Escrow message from the specified reader or buffer.
         * @function decode
         * @memberof escrow.Escrow
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {escrow.Escrow} Escrow
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Escrow.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.escrow.Escrow();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.sender = reader.bytes();
                    break;
                case 2:
                    message.arbiter = reader.bytes();
                    break;
                case 3:
                    message.recipient = reader.bytes();
                    break;
                case 4:
                    if (!(message.amount && message.amount.length))
                        message.amount = [];
                    message.amount.push($root.x.Coin.decode(reader, reader.uint32()));
                    break;
                case 5:
                    message.timeout = reader.int64();
                    break;
                case 6:
                    message.memo = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Escrow message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof escrow.Escrow
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {escrow.Escrow} Escrow
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Escrow.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Escrow message.
         * @function verify
         * @memberof escrow.Escrow
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Escrow.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.sender != null && message.hasOwnProperty("sender"))
                if (!(message.sender && typeof message.sender.length === "number" || $util.isString(message.sender)))
                    return "sender: buffer expected";
            if (message.arbiter != null && message.hasOwnProperty("arbiter"))
                if (!(message.arbiter && typeof message.arbiter.length === "number" || $util.isString(message.arbiter)))
                    return "arbiter: buffer expected";
            if (message.recipient != null && message.hasOwnProperty("recipient"))
                if (!(message.recipient && typeof message.recipient.length === "number" || $util.isString(message.recipient)))
                    return "recipient: buffer expected";
            if (message.amount != null && message.hasOwnProperty("amount")) {
                if (!Array.isArray(message.amount))
                    return "amount: array expected";
                for (var i = 0; i < message.amount.length; ++i) {
                    var error = $root.x.Coin.verify(message.amount[i]);
                    if (error)
                        return "amount." + error;
                }
            }
            if (message.timeout != null && message.hasOwnProperty("timeout"))
                if (!$util.isInteger(message.timeout) && !(message.timeout && $util.isInteger(message.timeout.low) && $util.isInteger(message.timeout.high)))
                    return "timeout: integer|Long expected";
            if (message.memo != null && message.hasOwnProperty("memo"))
                if (!$util.isString(message.memo))
                    return "memo: string expected";
            return null;
        };

        /**
         * Creates an Escrow message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof escrow.Escrow
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {escrow.Escrow} Escrow
         */
        Escrow.fromObject = function fromObject(object) {
            if (object instanceof $root.escrow.Escrow)
                return object;
            var message = new $root.escrow.Escrow();
            if (object.sender != null)
                if (typeof object.sender === "string")
                    $util.base64.decode(object.sender, message.sender = $util.newBuffer($util.base64.length(object.sender)), 0);
                else if (object.sender.length)
                    message.sender = object.sender;
            if (object.arbiter != null)
                if (typeof object.arbiter === "string")
                    $util.base64.decode(object.arbiter, message.arbiter = $util.newBuffer($util.base64.length(object.arbiter)), 0);
                else if (object.arbiter.length)
                    message.arbiter = object.arbiter;
            if (object.recipient != null)
                if (typeof object.recipient === "string")
                    $util.base64.decode(object.recipient, message.recipient = $util.newBuffer($util.base64.length(object.recipient)), 0);
                else if (object.recipient.length)
                    message.recipient = object.recipient;
            if (object.amount) {
                if (!Array.isArray(object.amount))
                    throw TypeError(".escrow.Escrow.amount: array expected");
                message.amount = [];
                for (var i = 0; i < object.amount.length; ++i) {
                    if (typeof object.amount[i] !== "object")
                        throw TypeError(".escrow.Escrow.amount: object expected");
                    message.amount[i] = $root.x.Coin.fromObject(object.amount[i]);
                }
            }
            if (object.timeout != null)
                if ($util.Long)
                    (message.timeout = $util.Long.fromValue(object.timeout)).unsigned = false;
                else if (typeof object.timeout === "string")
                    message.timeout = parseInt(object.timeout, 10);
                else if (typeof object.timeout === "number")
                    message.timeout = object.timeout;
                else if (typeof object.timeout === "object")
                    message.timeout = new $util.LongBits(object.timeout.low >>> 0, object.timeout.high >>> 0).toNumber();
            if (object.memo != null)
                message.memo = String(object.memo);
            return message;
        };

        /**
         * Creates a plain object from an Escrow message. Also converts values to other types if specified.
         * @function toObject
         * @memberof escrow.Escrow
         * @static
         * @param {escrow.Escrow} message Escrow
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Escrow.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.amount = [];
            if (options.defaults) {
                object.sender = options.bytes === String ? "" : [];
                object.arbiter = options.bytes === String ? "" : [];
                object.recipient = options.bytes === String ? "" : [];
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.timeout = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.timeout = options.longs === String ? "0" : 0;
                object.memo = "";
            }
            if (message.sender != null && message.hasOwnProperty("sender"))
                object.sender = options.bytes === String ? $util.base64.encode(message.sender, 0, message.sender.length) : options.bytes === Array ? Array.prototype.slice.call(message.sender) : message.sender;
            if (message.arbiter != null && message.hasOwnProperty("arbiter"))
                object.arbiter = options.bytes === String ? $util.base64.encode(message.arbiter, 0, message.arbiter.length) : options.bytes === Array ? Array.prototype.slice.call(message.arbiter) : message.arbiter;
            if (message.recipient != null && message.hasOwnProperty("recipient"))
                object.recipient = options.bytes === String ? $util.base64.encode(message.recipient, 0, message.recipient.length) : options.bytes === Array ? Array.prototype.slice.call(message.recipient) : message.recipient;
            if (message.amount && message.amount.length) {
                object.amount = [];
                for (var j = 0; j < message.amount.length; ++j)
                    object.amount[j] = $root.x.Coin.toObject(message.amount[j], options);
            }
            if (message.timeout != null && message.hasOwnProperty("timeout"))
                if (typeof message.timeout === "number")
                    object.timeout = options.longs === String ? String(message.timeout) : message.timeout;
                else
                    object.timeout = options.longs === String ? $util.Long.prototype.toString.call(message.timeout) : options.longs === Number ? new $util.LongBits(message.timeout.low >>> 0, message.timeout.high >>> 0).toNumber() : message.timeout;
            if (message.memo != null && message.hasOwnProperty("memo"))
                object.memo = message.memo;
            return object;
        };

        /**
         * Converts this Escrow to JSON.
         * @function toJSON
         * @memberof escrow.Escrow
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Escrow.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Escrow;
    })();

    escrow.CreateEscrowMsg = (function() {

        /**
         * Properties of a CreateEscrowMsg.
         * @memberof escrow
         * @interface ICreateEscrowMsg
         * @property {Uint8Array|null} [sender] CreateEscrowMsg sender
         * @property {Uint8Array|null} [arbiter] CreateEscrowMsg arbiter
         * @property {Uint8Array|null} [recipient] CreateEscrowMsg recipient
         * @property {Array.<x.ICoin>|null} [amount] CreateEscrowMsg amount
         * @property {number|Long|null} [timeout] CreateEscrowMsg timeout
         * @property {string|null} [memo] CreateEscrowMsg memo
         */

        /**
         * Constructs a new CreateEscrowMsg.
         * @memberof escrow
         * @classdesc Represents a CreateEscrowMsg.
         * @implements ICreateEscrowMsg
         * @constructor
         * @param {escrow.ICreateEscrowMsg=} [properties] Properties to set
         */
        function CreateEscrowMsg(properties) {
            this.amount = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CreateEscrowMsg sender.
         * @member {Uint8Array} sender
         * @memberof escrow.CreateEscrowMsg
         * @instance
         */
        CreateEscrowMsg.prototype.sender = $util.newBuffer([]);

        /**
         * CreateEscrowMsg arbiter.
         * @member {Uint8Array} arbiter
         * @memberof escrow.CreateEscrowMsg
         * @instance
         */
        CreateEscrowMsg.prototype.arbiter = $util.newBuffer([]);

        /**
         * CreateEscrowMsg recipient.
         * @member {Uint8Array} recipient
         * @memberof escrow.CreateEscrowMsg
         * @instance
         */
        CreateEscrowMsg.prototype.recipient = $util.newBuffer([]);

        /**
         * CreateEscrowMsg amount.
         * @member {Array.<x.ICoin>} amount
         * @memberof escrow.CreateEscrowMsg
         * @instance
         */
        CreateEscrowMsg.prototype.amount = $util.emptyArray;

        /**
         * CreateEscrowMsg timeout.
         * @member {number|Long} timeout
         * @memberof escrow.CreateEscrowMsg
         * @instance
         */
        CreateEscrowMsg.prototype.timeout = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * CreateEscrowMsg memo.
         * @member {string} memo
         * @memberof escrow.CreateEscrowMsg
         * @instance
         */
        CreateEscrowMsg.prototype.memo = "";

        /**
         * Creates a new CreateEscrowMsg instance using the specified properties.
         * @function create
         * @memberof escrow.CreateEscrowMsg
         * @static
         * @param {escrow.ICreateEscrowMsg=} [properties] Properties to set
         * @returns {escrow.CreateEscrowMsg} CreateEscrowMsg instance
         */
        CreateEscrowMsg.create = function create(properties) {
            return new CreateEscrowMsg(properties);
        };

        /**
         * Encodes the specified CreateEscrowMsg message. Does not implicitly {@link escrow.CreateEscrowMsg.verify|verify} messages.
         * @function encode
         * @memberof escrow.CreateEscrowMsg
         * @static
         * @param {escrow.ICreateEscrowMsg} message CreateEscrowMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateEscrowMsg.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.sender != null && message.hasOwnProperty("sender"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.sender);
            if (message.arbiter != null && message.hasOwnProperty("arbiter"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.arbiter);
            if (message.recipient != null && message.hasOwnProperty("recipient"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.recipient);
            if (message.amount != null && message.amount.length)
                for (var i = 0; i < message.amount.length; ++i)
                    $root.x.Coin.encode(message.amount[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.timeout != null && message.hasOwnProperty("timeout"))
                writer.uint32(/* id 5, wireType 0 =*/40).int64(message.timeout);
            if (message.memo != null && message.hasOwnProperty("memo"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.memo);
            return writer;
        };

        /**
         * Encodes the specified CreateEscrowMsg message, length delimited. Does not implicitly {@link escrow.CreateEscrowMsg.verify|verify} messages.
         * @function encodeDelimited
         * @memberof escrow.CreateEscrowMsg
         * @static
         * @param {escrow.ICreateEscrowMsg} message CreateEscrowMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateEscrowMsg.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CreateEscrowMsg message from the specified reader or buffer.
         * @function decode
         * @memberof escrow.CreateEscrowMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {escrow.CreateEscrowMsg} CreateEscrowMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateEscrowMsg.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.escrow.CreateEscrowMsg();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.sender = reader.bytes();
                    break;
                case 2:
                    message.arbiter = reader.bytes();
                    break;
                case 3:
                    message.recipient = reader.bytes();
                    break;
                case 4:
                    if (!(message.amount && message.amount.length))
                        message.amount = [];
                    message.amount.push($root.x.Coin.decode(reader, reader.uint32()));
                    break;
                case 5:
                    message.timeout = reader.int64();
                    break;
                case 6:
                    message.memo = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CreateEscrowMsg message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof escrow.CreateEscrowMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {escrow.CreateEscrowMsg} CreateEscrowMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateEscrowMsg.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CreateEscrowMsg message.
         * @function verify
         * @memberof escrow.CreateEscrowMsg
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CreateEscrowMsg.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.sender != null && message.hasOwnProperty("sender"))
                if (!(message.sender && typeof message.sender.length === "number" || $util.isString(message.sender)))
                    return "sender: buffer expected";
            if (message.arbiter != null && message.hasOwnProperty("arbiter"))
                if (!(message.arbiter && typeof message.arbiter.length === "number" || $util.isString(message.arbiter)))
                    return "arbiter: buffer expected";
            if (message.recipient != null && message.hasOwnProperty("recipient"))
                if (!(message.recipient && typeof message.recipient.length === "number" || $util.isString(message.recipient)))
                    return "recipient: buffer expected";
            if (message.amount != null && message.hasOwnProperty("amount")) {
                if (!Array.isArray(message.amount))
                    return "amount: array expected";
                for (var i = 0; i < message.amount.length; ++i) {
                    var error = $root.x.Coin.verify(message.amount[i]);
                    if (error)
                        return "amount." + error;
                }
            }
            if (message.timeout != null && message.hasOwnProperty("timeout"))
                if (!$util.isInteger(message.timeout) && !(message.timeout && $util.isInteger(message.timeout.low) && $util.isInteger(message.timeout.high)))
                    return "timeout: integer|Long expected";
            if (message.memo != null && message.hasOwnProperty("memo"))
                if (!$util.isString(message.memo))
                    return "memo: string expected";
            return null;
        };

        /**
         * Creates a CreateEscrowMsg message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof escrow.CreateEscrowMsg
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {escrow.CreateEscrowMsg} CreateEscrowMsg
         */
        CreateEscrowMsg.fromObject = function fromObject(object) {
            if (object instanceof $root.escrow.CreateEscrowMsg)
                return object;
            var message = new $root.escrow.CreateEscrowMsg();
            if (object.sender != null)
                if (typeof object.sender === "string")
                    $util.base64.decode(object.sender, message.sender = $util.newBuffer($util.base64.length(object.sender)), 0);
                else if (object.sender.length)
                    message.sender = object.sender;
            if (object.arbiter != null)
                if (typeof object.arbiter === "string")
                    $util.base64.decode(object.arbiter, message.arbiter = $util.newBuffer($util.base64.length(object.arbiter)), 0);
                else if (object.arbiter.length)
                    message.arbiter = object.arbiter;
            if (object.recipient != null)
                if (typeof object.recipient === "string")
                    $util.base64.decode(object.recipient, message.recipient = $util.newBuffer($util.base64.length(object.recipient)), 0);
                else if (object.recipient.length)
                    message.recipient = object.recipient;
            if (object.amount) {
                if (!Array.isArray(object.amount))
                    throw TypeError(".escrow.CreateEscrowMsg.amount: array expected");
                message.amount = [];
                for (var i = 0; i < object.amount.length; ++i) {
                    if (typeof object.amount[i] !== "object")
                        throw TypeError(".escrow.CreateEscrowMsg.amount: object expected");
                    message.amount[i] = $root.x.Coin.fromObject(object.amount[i]);
                }
            }
            if (object.timeout != null)
                if ($util.Long)
                    (message.timeout = $util.Long.fromValue(object.timeout)).unsigned = false;
                else if (typeof object.timeout === "string")
                    message.timeout = parseInt(object.timeout, 10);
                else if (typeof object.timeout === "number")
                    message.timeout = object.timeout;
                else if (typeof object.timeout === "object")
                    message.timeout = new $util.LongBits(object.timeout.low >>> 0, object.timeout.high >>> 0).toNumber();
            if (object.memo != null)
                message.memo = String(object.memo);
            return message;
        };

        /**
         * Creates a plain object from a CreateEscrowMsg message. Also converts values to other types if specified.
         * @function toObject
         * @memberof escrow.CreateEscrowMsg
         * @static
         * @param {escrow.CreateEscrowMsg} message CreateEscrowMsg
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CreateEscrowMsg.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.amount = [];
            if (options.defaults) {
                object.sender = options.bytes === String ? "" : [];
                object.arbiter = options.bytes === String ? "" : [];
                object.recipient = options.bytes === String ? "" : [];
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.timeout = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.timeout = options.longs === String ? "0" : 0;
                object.memo = "";
            }
            if (message.sender != null && message.hasOwnProperty("sender"))
                object.sender = options.bytes === String ? $util.base64.encode(message.sender, 0, message.sender.length) : options.bytes === Array ? Array.prototype.slice.call(message.sender) : message.sender;
            if (message.arbiter != null && message.hasOwnProperty("arbiter"))
                object.arbiter = options.bytes === String ? $util.base64.encode(message.arbiter, 0, message.arbiter.length) : options.bytes === Array ? Array.prototype.slice.call(message.arbiter) : message.arbiter;
            if (message.recipient != null && message.hasOwnProperty("recipient"))
                object.recipient = options.bytes === String ? $util.base64.encode(message.recipient, 0, message.recipient.length) : options.bytes === Array ? Array.prototype.slice.call(message.recipient) : message.recipient;
            if (message.amount && message.amount.length) {
                object.amount = [];
                for (var j = 0; j < message.amount.length; ++j)
                    object.amount[j] = $root.x.Coin.toObject(message.amount[j], options);
            }
            if (message.timeout != null && message.hasOwnProperty("timeout"))
                if (typeof message.timeout === "number")
                    object.timeout = options.longs === String ? String(message.timeout) : message.timeout;
                else
                    object.timeout = options.longs === String ? $util.Long.prototype.toString.call(message.timeout) : options.longs === Number ? new $util.LongBits(message.timeout.low >>> 0, message.timeout.high >>> 0).toNumber() : message.timeout;
            if (message.memo != null && message.hasOwnProperty("memo"))
                object.memo = message.memo;
            return object;
        };

        /**
         * Converts this CreateEscrowMsg to JSON.
         * @function toJSON
         * @memberof escrow.CreateEscrowMsg
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CreateEscrowMsg.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return CreateEscrowMsg;
    })();

    escrow.ReleaseEscrowMsg = (function() {

        /**
         * Properties of a ReleaseEscrowMsg.
         * @memberof escrow
         * @interface IReleaseEscrowMsg
         * @property {Uint8Array|null} [escrowId] ReleaseEscrowMsg escrowId
         * @property {Array.<x.ICoin>|null} [amount] ReleaseEscrowMsg amount
         */

        /**
         * Constructs a new ReleaseEscrowMsg.
         * @memberof escrow
         * @classdesc Represents a ReleaseEscrowMsg.
         * @implements IReleaseEscrowMsg
         * @constructor
         * @param {escrow.IReleaseEscrowMsg=} [properties] Properties to set
         */
        function ReleaseEscrowMsg(properties) {
            this.amount = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ReleaseEscrowMsg escrowId.
         * @member {Uint8Array} escrowId
         * @memberof escrow.ReleaseEscrowMsg
         * @instance
         */
        ReleaseEscrowMsg.prototype.escrowId = $util.newBuffer([]);

        /**
         * ReleaseEscrowMsg amount.
         * @member {Array.<x.ICoin>} amount
         * @memberof escrow.ReleaseEscrowMsg
         * @instance
         */
        ReleaseEscrowMsg.prototype.amount = $util.emptyArray;

        /**
         * Creates a new ReleaseEscrowMsg instance using the specified properties.
         * @function create
         * @memberof escrow.ReleaseEscrowMsg
         * @static
         * @param {escrow.IReleaseEscrowMsg=} [properties] Properties to set
         * @returns {escrow.ReleaseEscrowMsg} ReleaseEscrowMsg instance
         */
        ReleaseEscrowMsg.create = function create(properties) {
            return new ReleaseEscrowMsg(properties);
        };

        /**
         * Encodes the specified ReleaseEscrowMsg message. Does not implicitly {@link escrow.ReleaseEscrowMsg.verify|verify} messages.
         * @function encode
         * @memberof escrow.ReleaseEscrowMsg
         * @static
         * @param {escrow.IReleaseEscrowMsg} message ReleaseEscrowMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ReleaseEscrowMsg.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.escrowId != null && message.hasOwnProperty("escrowId"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.escrowId);
            if (message.amount != null && message.amount.length)
                for (var i = 0; i < message.amount.length; ++i)
                    $root.x.Coin.encode(message.amount[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified ReleaseEscrowMsg message, length delimited. Does not implicitly {@link escrow.ReleaseEscrowMsg.verify|verify} messages.
         * @function encodeDelimited
         * @memberof escrow.ReleaseEscrowMsg
         * @static
         * @param {escrow.IReleaseEscrowMsg} message ReleaseEscrowMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ReleaseEscrowMsg.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ReleaseEscrowMsg message from the specified reader or buffer.
         * @function decode
         * @memberof escrow.ReleaseEscrowMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {escrow.ReleaseEscrowMsg} ReleaseEscrowMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ReleaseEscrowMsg.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.escrow.ReleaseEscrowMsg();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.escrowId = reader.bytes();
                    break;
                case 2:
                    if (!(message.amount && message.amount.length))
                        message.amount = [];
                    message.amount.push($root.x.Coin.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ReleaseEscrowMsg message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof escrow.ReleaseEscrowMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {escrow.ReleaseEscrowMsg} ReleaseEscrowMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ReleaseEscrowMsg.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ReleaseEscrowMsg message.
         * @function verify
         * @memberof escrow.ReleaseEscrowMsg
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ReleaseEscrowMsg.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.escrowId != null && message.hasOwnProperty("escrowId"))
                if (!(message.escrowId && typeof message.escrowId.length === "number" || $util.isString(message.escrowId)))
                    return "escrowId: buffer expected";
            if (message.amount != null && message.hasOwnProperty("amount")) {
                if (!Array.isArray(message.amount))
                    return "amount: array expected";
                for (var i = 0; i < message.amount.length; ++i) {
                    var error = $root.x.Coin.verify(message.amount[i]);
                    if (error)
                        return "amount." + error;
                }
            }
            return null;
        };

        /**
         * Creates a ReleaseEscrowMsg message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof escrow.ReleaseEscrowMsg
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {escrow.ReleaseEscrowMsg} ReleaseEscrowMsg
         */
        ReleaseEscrowMsg.fromObject = function fromObject(object) {
            if (object instanceof $root.escrow.ReleaseEscrowMsg)
                return object;
            var message = new $root.escrow.ReleaseEscrowMsg();
            if (object.escrowId != null)
                if (typeof object.escrowId === "string")
                    $util.base64.decode(object.escrowId, message.escrowId = $util.newBuffer($util.base64.length(object.escrowId)), 0);
                else if (object.escrowId.length)
                    message.escrowId = object.escrowId;
            if (object.amount) {
                if (!Array.isArray(object.amount))
                    throw TypeError(".escrow.ReleaseEscrowMsg.amount: array expected");
                message.amount = [];
                for (var i = 0; i < object.amount.length; ++i) {
                    if (typeof object.amount[i] !== "object")
                        throw TypeError(".escrow.ReleaseEscrowMsg.amount: object expected");
                    message.amount[i] = $root.x.Coin.fromObject(object.amount[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a ReleaseEscrowMsg message. Also converts values to other types if specified.
         * @function toObject
         * @memberof escrow.ReleaseEscrowMsg
         * @static
         * @param {escrow.ReleaseEscrowMsg} message ReleaseEscrowMsg
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ReleaseEscrowMsg.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.amount = [];
            if (options.defaults)
                object.escrowId = options.bytes === String ? "" : [];
            if (message.escrowId != null && message.hasOwnProperty("escrowId"))
                object.escrowId = options.bytes === String ? $util.base64.encode(message.escrowId, 0, message.escrowId.length) : options.bytes === Array ? Array.prototype.slice.call(message.escrowId) : message.escrowId;
            if (message.amount && message.amount.length) {
                object.amount = [];
                for (var j = 0; j < message.amount.length; ++j)
                    object.amount[j] = $root.x.Coin.toObject(message.amount[j], options);
            }
            return object;
        };

        /**
         * Converts this ReleaseEscrowMsg to JSON.
         * @function toJSON
         * @memberof escrow.ReleaseEscrowMsg
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ReleaseEscrowMsg.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return ReleaseEscrowMsg;
    })();

    escrow.ReturnEscrowMsg = (function() {

        /**
         * Properties of a ReturnEscrowMsg.
         * @memberof escrow
         * @interface IReturnEscrowMsg
         * @property {Uint8Array|null} [escrowId] ReturnEscrowMsg escrowId
         */

        /**
         * Constructs a new ReturnEscrowMsg.
         * @memberof escrow
         * @classdesc Represents a ReturnEscrowMsg.
         * @implements IReturnEscrowMsg
         * @constructor
         * @param {escrow.IReturnEscrowMsg=} [properties] Properties to set
         */
        function ReturnEscrowMsg(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ReturnEscrowMsg escrowId.
         * @member {Uint8Array} escrowId
         * @memberof escrow.ReturnEscrowMsg
         * @instance
         */
        ReturnEscrowMsg.prototype.escrowId = $util.newBuffer([]);

        /**
         * Creates a new ReturnEscrowMsg instance using the specified properties.
         * @function create
         * @memberof escrow.ReturnEscrowMsg
         * @static
         * @param {escrow.IReturnEscrowMsg=} [properties] Properties to set
         * @returns {escrow.ReturnEscrowMsg} ReturnEscrowMsg instance
         */
        ReturnEscrowMsg.create = function create(properties) {
            return new ReturnEscrowMsg(properties);
        };

        /**
         * Encodes the specified ReturnEscrowMsg message. Does not implicitly {@link escrow.ReturnEscrowMsg.verify|verify} messages.
         * @function encode
         * @memberof escrow.ReturnEscrowMsg
         * @static
         * @param {escrow.IReturnEscrowMsg} message ReturnEscrowMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ReturnEscrowMsg.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.escrowId != null && message.hasOwnProperty("escrowId"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.escrowId);
            return writer;
        };

        /**
         * Encodes the specified ReturnEscrowMsg message, length delimited. Does not implicitly {@link escrow.ReturnEscrowMsg.verify|verify} messages.
         * @function encodeDelimited
         * @memberof escrow.ReturnEscrowMsg
         * @static
         * @param {escrow.IReturnEscrowMsg} message ReturnEscrowMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ReturnEscrowMsg.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ReturnEscrowMsg message from the specified reader or buffer.
         * @function decode
         * @memberof escrow.ReturnEscrowMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {escrow.ReturnEscrowMsg} ReturnEscrowMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ReturnEscrowMsg.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.escrow.ReturnEscrowMsg();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.escrowId = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ReturnEscrowMsg message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof escrow.ReturnEscrowMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {escrow.ReturnEscrowMsg} ReturnEscrowMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ReturnEscrowMsg.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ReturnEscrowMsg message.
         * @function verify
         * @memberof escrow.ReturnEscrowMsg
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ReturnEscrowMsg.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.escrowId != null && message.hasOwnProperty("escrowId"))
                if (!(message.escrowId && typeof message.escrowId.length === "number" || $util.isString(message.escrowId)))
                    return "escrowId: buffer expected";
            return null;
        };

        /**
         * Creates a ReturnEscrowMsg message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof escrow.ReturnEscrowMsg
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {escrow.ReturnEscrowMsg} ReturnEscrowMsg
         */
        ReturnEscrowMsg.fromObject = function fromObject(object) {
            if (object instanceof $root.escrow.ReturnEscrowMsg)
                return object;
            var message = new $root.escrow.ReturnEscrowMsg();
            if (object.escrowId != null)
                if (typeof object.escrowId === "string")
                    $util.base64.decode(object.escrowId, message.escrowId = $util.newBuffer($util.base64.length(object.escrowId)), 0);
                else if (object.escrowId.length)
                    message.escrowId = object.escrowId;
            return message;
        };

        /**
         * Creates a plain object from a ReturnEscrowMsg message. Also converts values to other types if specified.
         * @function toObject
         * @memberof escrow.ReturnEscrowMsg
         * @static
         * @param {escrow.ReturnEscrowMsg} message ReturnEscrowMsg
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ReturnEscrowMsg.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.escrowId = options.bytes === String ? "" : [];
            if (message.escrowId != null && message.hasOwnProperty("escrowId"))
                object.escrowId = options.bytes === String ? $util.base64.encode(message.escrowId, 0, message.escrowId.length) : options.bytes === Array ? Array.prototype.slice.call(message.escrowId) : message.escrowId;
            return object;
        };

        /**
         * Converts this ReturnEscrowMsg to JSON.
         * @function toJSON
         * @memberof escrow.ReturnEscrowMsg
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ReturnEscrowMsg.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return ReturnEscrowMsg;
    })();

    escrow.UpdateEscrowPartiesMsg = (function() {

        /**
         * Properties of an UpdateEscrowPartiesMsg.
         * @memberof escrow
         * @interface IUpdateEscrowPartiesMsg
         * @property {Uint8Array|null} [escrowId] UpdateEscrowPartiesMsg escrowId
         * @property {Uint8Array|null} [sender] UpdateEscrowPartiesMsg sender
         * @property {Uint8Array|null} [arbiter] UpdateEscrowPartiesMsg arbiter
         * @property {Uint8Array|null} [recipient] UpdateEscrowPartiesMsg recipient
         */

        /**
         * Constructs a new UpdateEscrowPartiesMsg.
         * @memberof escrow
         * @classdesc Represents an UpdateEscrowPartiesMsg.
         * @implements IUpdateEscrowPartiesMsg
         * @constructor
         * @param {escrow.IUpdateEscrowPartiesMsg=} [properties] Properties to set
         */
        function UpdateEscrowPartiesMsg(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * UpdateEscrowPartiesMsg escrowId.
         * @member {Uint8Array} escrowId
         * @memberof escrow.UpdateEscrowPartiesMsg
         * @instance
         */
        UpdateEscrowPartiesMsg.prototype.escrowId = $util.newBuffer([]);

        /**
         * UpdateEscrowPartiesMsg sender.
         * @member {Uint8Array} sender
         * @memberof escrow.UpdateEscrowPartiesMsg
         * @instance
         */
        UpdateEscrowPartiesMsg.prototype.sender = $util.newBuffer([]);

        /**
         * UpdateEscrowPartiesMsg arbiter.
         * @member {Uint8Array} arbiter
         * @memberof escrow.UpdateEscrowPartiesMsg
         * @instance
         */
        UpdateEscrowPartiesMsg.prototype.arbiter = $util.newBuffer([]);

        /**
         * UpdateEscrowPartiesMsg recipient.
         * @member {Uint8Array} recipient
         * @memberof escrow.UpdateEscrowPartiesMsg
         * @instance
         */
        UpdateEscrowPartiesMsg.prototype.recipient = $util.newBuffer([]);

        /**
         * Creates a new UpdateEscrowPartiesMsg instance using the specified properties.
         * @function create
         * @memberof escrow.UpdateEscrowPartiesMsg
         * @static
         * @param {escrow.IUpdateEscrowPartiesMsg=} [properties] Properties to set
         * @returns {escrow.UpdateEscrowPartiesMsg} UpdateEscrowPartiesMsg instance
         */
        UpdateEscrowPartiesMsg.create = function create(properties) {
            return new UpdateEscrowPartiesMsg(properties);
        };

        /**
         * Encodes the specified UpdateEscrowPartiesMsg message. Does not implicitly {@link escrow.UpdateEscrowPartiesMsg.verify|verify} messages.
         * @function encode
         * @memberof escrow.UpdateEscrowPartiesMsg
         * @static
         * @param {escrow.IUpdateEscrowPartiesMsg} message UpdateEscrowPartiesMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateEscrowPartiesMsg.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.escrowId != null && message.hasOwnProperty("escrowId"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.escrowId);
            if (message.sender != null && message.hasOwnProperty("sender"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.sender);
            if (message.arbiter != null && message.hasOwnProperty("arbiter"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.arbiter);
            if (message.recipient != null && message.hasOwnProperty("recipient"))
                writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.recipient);
            return writer;
        };

        /**
         * Encodes the specified UpdateEscrowPartiesMsg message, length delimited. Does not implicitly {@link escrow.UpdateEscrowPartiesMsg.verify|verify} messages.
         * @function encodeDelimited
         * @memberof escrow.UpdateEscrowPartiesMsg
         * @static
         * @param {escrow.IUpdateEscrowPartiesMsg} message UpdateEscrowPartiesMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateEscrowPartiesMsg.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an UpdateEscrowPartiesMsg message from the specified reader or buffer.
         * @function decode
         * @memberof escrow.UpdateEscrowPartiesMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {escrow.UpdateEscrowPartiesMsg} UpdateEscrowPartiesMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateEscrowPartiesMsg.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.escrow.UpdateEscrowPartiesMsg();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.escrowId = reader.bytes();
                    break;
                case 2:
                    message.sender = reader.bytes();
                    break;
                case 3:
                    message.arbiter = reader.bytes();
                    break;
                case 4:
                    message.recipient = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an UpdateEscrowPartiesMsg message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof escrow.UpdateEscrowPartiesMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {escrow.UpdateEscrowPartiesMsg} UpdateEscrowPartiesMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateEscrowPartiesMsg.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an UpdateEscrowPartiesMsg message.
         * @function verify
         * @memberof escrow.UpdateEscrowPartiesMsg
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        UpdateEscrowPartiesMsg.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.escrowId != null && message.hasOwnProperty("escrowId"))
                if (!(message.escrowId && typeof message.escrowId.length === "number" || $util.isString(message.escrowId)))
                    return "escrowId: buffer expected";
            if (message.sender != null && message.hasOwnProperty("sender"))
                if (!(message.sender && typeof message.sender.length === "number" || $util.isString(message.sender)))
                    return "sender: buffer expected";
            if (message.arbiter != null && message.hasOwnProperty("arbiter"))
                if (!(message.arbiter && typeof message.arbiter.length === "number" || $util.isString(message.arbiter)))
                    return "arbiter: buffer expected";
            if (message.recipient != null && message.hasOwnProperty("recipient"))
                if (!(message.recipient && typeof message.recipient.length === "number" || $util.isString(message.recipient)))
                    return "recipient: buffer expected";
            return null;
        };

        /**
         * Creates an UpdateEscrowPartiesMsg message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof escrow.UpdateEscrowPartiesMsg
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {escrow.UpdateEscrowPartiesMsg} UpdateEscrowPartiesMsg
         */
        UpdateEscrowPartiesMsg.fromObject = function fromObject(object) {
            if (object instanceof $root.escrow.UpdateEscrowPartiesMsg)
                return object;
            var message = new $root.escrow.UpdateEscrowPartiesMsg();
            if (object.escrowId != null)
                if (typeof object.escrowId === "string")
                    $util.base64.decode(object.escrowId, message.escrowId = $util.newBuffer($util.base64.length(object.escrowId)), 0);
                else if (object.escrowId.length)
                    message.escrowId = object.escrowId;
            if (object.sender != null)
                if (typeof object.sender === "string")
                    $util.base64.decode(object.sender, message.sender = $util.newBuffer($util.base64.length(object.sender)), 0);
                else if (object.sender.length)
                    message.sender = object.sender;
            if (object.arbiter != null)
                if (typeof object.arbiter === "string")
                    $util.base64.decode(object.arbiter, message.arbiter = $util.newBuffer($util.base64.length(object.arbiter)), 0);
                else if (object.arbiter.length)
                    message.arbiter = object.arbiter;
            if (object.recipient != null)
                if (typeof object.recipient === "string")
                    $util.base64.decode(object.recipient, message.recipient = $util.newBuffer($util.base64.length(object.recipient)), 0);
                else if (object.recipient.length)
                    message.recipient = object.recipient;
            return message;
        };

        /**
         * Creates a plain object from an UpdateEscrowPartiesMsg message. Also converts values to other types if specified.
         * @function toObject
         * @memberof escrow.UpdateEscrowPartiesMsg
         * @static
         * @param {escrow.UpdateEscrowPartiesMsg} message UpdateEscrowPartiesMsg
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        UpdateEscrowPartiesMsg.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.escrowId = options.bytes === String ? "" : [];
                object.sender = options.bytes === String ? "" : [];
                object.arbiter = options.bytes === String ? "" : [];
                object.recipient = options.bytes === String ? "" : [];
            }
            if (message.escrowId != null && message.hasOwnProperty("escrowId"))
                object.escrowId = options.bytes === String ? $util.base64.encode(message.escrowId, 0, message.escrowId.length) : options.bytes === Array ? Array.prototype.slice.call(message.escrowId) : message.escrowId;
            if (message.sender != null && message.hasOwnProperty("sender"))
                object.sender = options.bytes === String ? $util.base64.encode(message.sender, 0, message.sender.length) : options.bytes === Array ? Array.prototype.slice.call(message.sender) : message.sender;
            if (message.arbiter != null && message.hasOwnProperty("arbiter"))
                object.arbiter = options.bytes === String ? $util.base64.encode(message.arbiter, 0, message.arbiter.length) : options.bytes === Array ? Array.prototype.slice.call(message.arbiter) : message.arbiter;
            if (message.recipient != null && message.hasOwnProperty("recipient"))
                object.recipient = options.bytes === String ? $util.base64.encode(message.recipient, 0, message.recipient.length) : options.bytes === Array ? Array.prototype.slice.call(message.recipient) : message.recipient;
            return object;
        };

        /**
         * Converts this UpdateEscrowPartiesMsg to JSON.
         * @function toJSON
         * @memberof escrow.UpdateEscrowPartiesMsg
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        UpdateEscrowPartiesMsg.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return UpdateEscrowPartiesMsg;
    })();

    return escrow;
})();

$root.namecoin = (function() {

    /**
     * Namespace namecoin.
     * @exports namecoin
     * @namespace
     */
    var namecoin = {};

    namecoin.Wallet = (function() {

        /**
         * Properties of a Wallet.
         * @memberof namecoin
         * @interface IWallet
         * @property {Array.<x.ICoin>|null} [coins] Wallet coins
         * @property {string|null} [name] Wallet name
         */

        /**
         * Constructs a new Wallet.
         * @memberof namecoin
         * @classdesc Represents a Wallet.
         * @implements IWallet
         * @constructor
         * @param {namecoin.IWallet=} [properties] Properties to set
         */
        function Wallet(properties) {
            this.coins = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Wallet coins.
         * @member {Array.<x.ICoin>} coins
         * @memberof namecoin.Wallet
         * @instance
         */
        Wallet.prototype.coins = $util.emptyArray;

        /**
         * Wallet name.
         * @member {string} name
         * @memberof namecoin.Wallet
         * @instance
         */
        Wallet.prototype.name = "";

        /**
         * Creates a new Wallet instance using the specified properties.
         * @function create
         * @memberof namecoin.Wallet
         * @static
         * @param {namecoin.IWallet=} [properties] Properties to set
         * @returns {namecoin.Wallet} Wallet instance
         */
        Wallet.create = function create(properties) {
            return new Wallet(properties);
        };

        /**
         * Encodes the specified Wallet message. Does not implicitly {@link namecoin.Wallet.verify|verify} messages.
         * @function encode
         * @memberof namecoin.Wallet
         * @static
         * @param {namecoin.IWallet} message Wallet message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Wallet.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.coins != null && message.coins.length)
                for (var i = 0; i < message.coins.length; ++i)
                    $root.x.Coin.encode(message.coins[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.name != null && message.hasOwnProperty("name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            return writer;
        };

        /**
         * Encodes the specified Wallet message, length delimited. Does not implicitly {@link namecoin.Wallet.verify|verify} messages.
         * @function encodeDelimited
         * @memberof namecoin.Wallet
         * @static
         * @param {namecoin.IWallet} message Wallet message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Wallet.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Wallet message from the specified reader or buffer.
         * @function decode
         * @memberof namecoin.Wallet
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {namecoin.Wallet} Wallet
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Wallet.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.namecoin.Wallet();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.coins && message.coins.length))
                        message.coins = [];
                    message.coins.push($root.x.Coin.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.name = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Wallet message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof namecoin.Wallet
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {namecoin.Wallet} Wallet
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Wallet.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Wallet message.
         * @function verify
         * @memberof namecoin.Wallet
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Wallet.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.coins != null && message.hasOwnProperty("coins")) {
                if (!Array.isArray(message.coins))
                    return "coins: array expected";
                for (var i = 0; i < message.coins.length; ++i) {
                    var error = $root.x.Coin.verify(message.coins[i]);
                    if (error)
                        return "coins." + error;
                }
            }
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            return null;
        };

        /**
         * Creates a Wallet message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof namecoin.Wallet
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {namecoin.Wallet} Wallet
         */
        Wallet.fromObject = function fromObject(object) {
            if (object instanceof $root.namecoin.Wallet)
                return object;
            var message = new $root.namecoin.Wallet();
            if (object.coins) {
                if (!Array.isArray(object.coins))
                    throw TypeError(".namecoin.Wallet.coins: array expected");
                message.coins = [];
                for (var i = 0; i < object.coins.length; ++i) {
                    if (typeof object.coins[i] !== "object")
                        throw TypeError(".namecoin.Wallet.coins: object expected");
                    message.coins[i] = $root.x.Coin.fromObject(object.coins[i]);
                }
            }
            if (object.name != null)
                message.name = String(object.name);
            return message;
        };

        /**
         * Creates a plain object from a Wallet message. Also converts values to other types if specified.
         * @function toObject
         * @memberof namecoin.Wallet
         * @static
         * @param {namecoin.Wallet} message Wallet
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Wallet.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.coins = [];
            if (options.defaults)
                object.name = "";
            if (message.coins && message.coins.length) {
                object.coins = [];
                for (var j = 0; j < message.coins.length; ++j)
                    object.coins[j] = $root.x.Coin.toObject(message.coins[j], options);
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            return object;
        };

        /**
         * Converts this Wallet to JSON.
         * @function toJSON
         * @memberof namecoin.Wallet
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Wallet.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Wallet;
    })();

    namecoin.Token = (function() {

        /**
         * Properties of a Token.
         * @memberof namecoin
         * @interface IToken
         * @property {string|null} [name] Token name
         * @property {number|null} [sigFigs] Token sigFigs
         */

        /**
         * Constructs a new Token.
         * @memberof namecoin
         * @classdesc Represents a Token.
         * @implements IToken
         * @constructor
         * @param {namecoin.IToken=} [properties] Properties to set
         */
        function Token(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Token name.
         * @member {string} name
         * @memberof namecoin.Token
         * @instance
         */
        Token.prototype.name = "";

        /**
         * Token sigFigs.
         * @member {number} sigFigs
         * @memberof namecoin.Token
         * @instance
         */
        Token.prototype.sigFigs = 0;

        /**
         * Creates a new Token instance using the specified properties.
         * @function create
         * @memberof namecoin.Token
         * @static
         * @param {namecoin.IToken=} [properties] Properties to set
         * @returns {namecoin.Token} Token instance
         */
        Token.create = function create(properties) {
            return new Token(properties);
        };

        /**
         * Encodes the specified Token message. Does not implicitly {@link namecoin.Token.verify|verify} messages.
         * @function encode
         * @memberof namecoin.Token
         * @static
         * @param {namecoin.IToken} message Token message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Token.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && message.hasOwnProperty("name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.sigFigs != null && message.hasOwnProperty("sigFigs"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.sigFigs);
            return writer;
        };

        /**
         * Encodes the specified Token message, length delimited. Does not implicitly {@link namecoin.Token.verify|verify} messages.
         * @function encodeDelimited
         * @memberof namecoin.Token
         * @static
         * @param {namecoin.IToken} message Token message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Token.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Token message from the specified reader or buffer.
         * @function decode
         * @memberof namecoin.Token
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {namecoin.Token} Token
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Token.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.namecoin.Token();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 2:
                    message.name = reader.string();
                    break;
                case 3:
                    message.sigFigs = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Token message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof namecoin.Token
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {namecoin.Token} Token
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Token.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Token message.
         * @function verify
         * @memberof namecoin.Token
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Token.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.sigFigs != null && message.hasOwnProperty("sigFigs"))
                if (!$util.isInteger(message.sigFigs))
                    return "sigFigs: integer expected";
            return null;
        };

        /**
         * Creates a Token message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof namecoin.Token
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {namecoin.Token} Token
         */
        Token.fromObject = function fromObject(object) {
            if (object instanceof $root.namecoin.Token)
                return object;
            var message = new $root.namecoin.Token();
            if (object.name != null)
                message.name = String(object.name);
            if (object.sigFigs != null)
                message.sigFigs = object.sigFigs | 0;
            return message;
        };

        /**
         * Creates a plain object from a Token message. Also converts values to other types if specified.
         * @function toObject
         * @memberof namecoin.Token
         * @static
         * @param {namecoin.Token} message Token
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Token.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.name = "";
                object.sigFigs = 0;
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.sigFigs != null && message.hasOwnProperty("sigFigs"))
                object.sigFigs = message.sigFigs;
            return object;
        };

        /**
         * Converts this Token to JSON.
         * @function toJSON
         * @memberof namecoin.Token
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Token.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Token;
    })();

    namecoin.NewTokenMsg = (function() {

        /**
         * Properties of a NewTokenMsg.
         * @memberof namecoin
         * @interface INewTokenMsg
         * @property {string|null} [ticker] NewTokenMsg ticker
         * @property {string|null} [name] NewTokenMsg name
         * @property {number|null} [sigFigs] NewTokenMsg sigFigs
         */

        /**
         * Constructs a new NewTokenMsg.
         * @memberof namecoin
         * @classdesc Represents a NewTokenMsg.
         * @implements INewTokenMsg
         * @constructor
         * @param {namecoin.INewTokenMsg=} [properties] Properties to set
         */
        function NewTokenMsg(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * NewTokenMsg ticker.
         * @member {string} ticker
         * @memberof namecoin.NewTokenMsg
         * @instance
         */
        NewTokenMsg.prototype.ticker = "";

        /**
         * NewTokenMsg name.
         * @member {string} name
         * @memberof namecoin.NewTokenMsg
         * @instance
         */
        NewTokenMsg.prototype.name = "";

        /**
         * NewTokenMsg sigFigs.
         * @member {number} sigFigs
         * @memberof namecoin.NewTokenMsg
         * @instance
         */
        NewTokenMsg.prototype.sigFigs = 0;

        /**
         * Creates a new NewTokenMsg instance using the specified properties.
         * @function create
         * @memberof namecoin.NewTokenMsg
         * @static
         * @param {namecoin.INewTokenMsg=} [properties] Properties to set
         * @returns {namecoin.NewTokenMsg} NewTokenMsg instance
         */
        NewTokenMsg.create = function create(properties) {
            return new NewTokenMsg(properties);
        };

        /**
         * Encodes the specified NewTokenMsg message. Does not implicitly {@link namecoin.NewTokenMsg.verify|verify} messages.
         * @function encode
         * @memberof namecoin.NewTokenMsg
         * @static
         * @param {namecoin.INewTokenMsg} message NewTokenMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        NewTokenMsg.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.ticker != null && message.hasOwnProperty("ticker"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.ticker);
            if (message.name != null && message.hasOwnProperty("name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.sigFigs != null && message.hasOwnProperty("sigFigs"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.sigFigs);
            return writer;
        };

        /**
         * Encodes the specified NewTokenMsg message, length delimited. Does not implicitly {@link namecoin.NewTokenMsg.verify|verify} messages.
         * @function encodeDelimited
         * @memberof namecoin.NewTokenMsg
         * @static
         * @param {namecoin.INewTokenMsg} message NewTokenMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        NewTokenMsg.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a NewTokenMsg message from the specified reader or buffer.
         * @function decode
         * @memberof namecoin.NewTokenMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {namecoin.NewTokenMsg} NewTokenMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        NewTokenMsg.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.namecoin.NewTokenMsg();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.ticker = reader.string();
                    break;
                case 2:
                    message.name = reader.string();
                    break;
                case 3:
                    message.sigFigs = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a NewTokenMsg message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof namecoin.NewTokenMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {namecoin.NewTokenMsg} NewTokenMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        NewTokenMsg.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a NewTokenMsg message.
         * @function verify
         * @memberof namecoin.NewTokenMsg
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        NewTokenMsg.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.ticker != null && message.hasOwnProperty("ticker"))
                if (!$util.isString(message.ticker))
                    return "ticker: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.sigFigs != null && message.hasOwnProperty("sigFigs"))
                if (!$util.isInteger(message.sigFigs))
                    return "sigFigs: integer expected";
            return null;
        };

        /**
         * Creates a NewTokenMsg message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof namecoin.NewTokenMsg
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {namecoin.NewTokenMsg} NewTokenMsg
         */
        NewTokenMsg.fromObject = function fromObject(object) {
            if (object instanceof $root.namecoin.NewTokenMsg)
                return object;
            var message = new $root.namecoin.NewTokenMsg();
            if (object.ticker != null)
                message.ticker = String(object.ticker);
            if (object.name != null)
                message.name = String(object.name);
            if (object.sigFigs != null)
                message.sigFigs = object.sigFigs | 0;
            return message;
        };

        /**
         * Creates a plain object from a NewTokenMsg message. Also converts values to other types if specified.
         * @function toObject
         * @memberof namecoin.NewTokenMsg
         * @static
         * @param {namecoin.NewTokenMsg} message NewTokenMsg
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        NewTokenMsg.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.ticker = "";
                object.name = "";
                object.sigFigs = 0;
            }
            if (message.ticker != null && message.hasOwnProperty("ticker"))
                object.ticker = message.ticker;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.sigFigs != null && message.hasOwnProperty("sigFigs"))
                object.sigFigs = message.sigFigs;
            return object;
        };

        /**
         * Converts this NewTokenMsg to JSON.
         * @function toJSON
         * @memberof namecoin.NewTokenMsg
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        NewTokenMsg.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return NewTokenMsg;
    })();

    namecoin.SetWalletNameMsg = (function() {

        /**
         * Properties of a SetWalletNameMsg.
         * @memberof namecoin
         * @interface ISetWalletNameMsg
         * @property {Uint8Array|null} [address] SetWalletNameMsg address
         * @property {string|null} [name] SetWalletNameMsg name
         */

        /**
         * Constructs a new SetWalletNameMsg.
         * @memberof namecoin
         * @classdesc Represents a SetWalletNameMsg.
         * @implements ISetWalletNameMsg
         * @constructor
         * @param {namecoin.ISetWalletNameMsg=} [properties] Properties to set
         */
        function SetWalletNameMsg(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SetWalletNameMsg address.
         * @member {Uint8Array} address
         * @memberof namecoin.SetWalletNameMsg
         * @instance
         */
        SetWalletNameMsg.prototype.address = $util.newBuffer([]);

        /**
         * SetWalletNameMsg name.
         * @member {string} name
         * @memberof namecoin.SetWalletNameMsg
         * @instance
         */
        SetWalletNameMsg.prototype.name = "";

        /**
         * Creates a new SetWalletNameMsg instance using the specified properties.
         * @function create
         * @memberof namecoin.SetWalletNameMsg
         * @static
         * @param {namecoin.ISetWalletNameMsg=} [properties] Properties to set
         * @returns {namecoin.SetWalletNameMsg} SetWalletNameMsg instance
         */
        SetWalletNameMsg.create = function create(properties) {
            return new SetWalletNameMsg(properties);
        };

        /**
         * Encodes the specified SetWalletNameMsg message. Does not implicitly {@link namecoin.SetWalletNameMsg.verify|verify} messages.
         * @function encode
         * @memberof namecoin.SetWalletNameMsg
         * @static
         * @param {namecoin.ISetWalletNameMsg} message SetWalletNameMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SetWalletNameMsg.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.address != null && message.hasOwnProperty("address"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.address);
            if (message.name != null && message.hasOwnProperty("name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            return writer;
        };

        /**
         * Encodes the specified SetWalletNameMsg message, length delimited. Does not implicitly {@link namecoin.SetWalletNameMsg.verify|verify} messages.
         * @function encodeDelimited
         * @memberof namecoin.SetWalletNameMsg
         * @static
         * @param {namecoin.ISetWalletNameMsg} message SetWalletNameMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SetWalletNameMsg.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a SetWalletNameMsg message from the specified reader or buffer.
         * @function decode
         * @memberof namecoin.SetWalletNameMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {namecoin.SetWalletNameMsg} SetWalletNameMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SetWalletNameMsg.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.namecoin.SetWalletNameMsg();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.address = reader.bytes();
                    break;
                case 2:
                    message.name = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a SetWalletNameMsg message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof namecoin.SetWalletNameMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {namecoin.SetWalletNameMsg} SetWalletNameMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SetWalletNameMsg.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a SetWalletNameMsg message.
         * @function verify
         * @memberof namecoin.SetWalletNameMsg
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        SetWalletNameMsg.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.address != null && message.hasOwnProperty("address"))
                if (!(message.address && typeof message.address.length === "number" || $util.isString(message.address)))
                    return "address: buffer expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            return null;
        };

        /**
         * Creates a SetWalletNameMsg message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof namecoin.SetWalletNameMsg
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {namecoin.SetWalletNameMsg} SetWalletNameMsg
         */
        SetWalletNameMsg.fromObject = function fromObject(object) {
            if (object instanceof $root.namecoin.SetWalletNameMsg)
                return object;
            var message = new $root.namecoin.SetWalletNameMsg();
            if (object.address != null)
                if (typeof object.address === "string")
                    $util.base64.decode(object.address, message.address = $util.newBuffer($util.base64.length(object.address)), 0);
                else if (object.address.length)
                    message.address = object.address;
            if (object.name != null)
                message.name = String(object.name);
            return message;
        };

        /**
         * Creates a plain object from a SetWalletNameMsg message. Also converts values to other types if specified.
         * @function toObject
         * @memberof namecoin.SetWalletNameMsg
         * @static
         * @param {namecoin.SetWalletNameMsg} message SetWalletNameMsg
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        SetWalletNameMsg.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.address = options.bytes === String ? "" : [];
                object.name = "";
            }
            if (message.address != null && message.hasOwnProperty("address"))
                object.address = options.bytes === String ? $util.base64.encode(message.address, 0, message.address.length) : options.bytes === Array ? Array.prototype.slice.call(message.address) : message.address;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            return object;
        };

        /**
         * Converts this SetWalletNameMsg to JSON.
         * @function toJSON
         * @memberof namecoin.SetWalletNameMsg
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        SetWalletNameMsg.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return SetWalletNameMsg;
    })();

    return namecoin;
})();

module.exports = $root;

/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.app = (function() {

    /**
     * Namespace app.
     * @exports app
     * @namespace
     */
    var app = {};

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
         * @property {multisig.ICreateContractMsg|null} [createContractMsg] Tx createContractMsg
         * @property {multisig.IUpdateContractMsg|null} [updateContractMsg] Tx updateContractMsg
         * @property {validators.ISetValidatorsMsg|null} [setValidatorsMsg] Tx setValidatorsMsg
         * @property {nft.IAddApprovalMsg|null} [addApprovalMsg] Tx addApprovalMsg
         * @property {nft.IRemoveApprovalMsg|null} [removeApprovalMsg] Tx removeApprovalMsg
         * @property {username.IIssueTokenMsg|null} [issueUsernameNftMsg] Tx issueUsernameNftMsg
         * @property {username.IAddChainAddressMsg|null} [addUsernameAddressNftMsg] Tx addUsernameAddressNftMsg
         * @property {username.IRemoveChainAddressMsg|null} [removeUsernameAddressMsg] Tx removeUsernameAddressMsg
         * @property {blockchain.IIssueTokenMsg|null} [issueBlockchainNftMsg] Tx issueBlockchainNftMsg
         * @property {ticker.IIssueTokenMsg|null} [issueTickerNftMsg] Tx issueTickerNftMsg
         * @property {bootstrap_node.IIssueTokenMsg|null} [issueBootstrapNodeNftMsg] Tx issueBootstrapNodeNftMsg
         * @property {cash.IFeeInfo|null} [fees] Tx fees
         * @property {Array.<sigs.IStdSignature>|null} [signatures] Tx signatures
         * @property {Uint8Array|null} [preimage] Tx preimage
         * @property {Array.<Uint8Array>|null} [multisig] Tx multisig
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
            this.multisig = [];
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
         * Tx createContractMsg.
         * @member {multisig.ICreateContractMsg|null|undefined} createContractMsg
         * @memberof app.Tx
         * @instance
         */
        Tx.prototype.createContractMsg = null;

        /**
         * Tx updateContractMsg.
         * @member {multisig.IUpdateContractMsg|null|undefined} updateContractMsg
         * @memberof app.Tx
         * @instance
         */
        Tx.prototype.updateContractMsg = null;

        /**
         * Tx setValidatorsMsg.
         * @member {validators.ISetValidatorsMsg|null|undefined} setValidatorsMsg
         * @memberof app.Tx
         * @instance
         */
        Tx.prototype.setValidatorsMsg = null;

        /**
         * Tx addApprovalMsg.
         * @member {nft.IAddApprovalMsg|null|undefined} addApprovalMsg
         * @memberof app.Tx
         * @instance
         */
        Tx.prototype.addApprovalMsg = null;

        /**
         * Tx removeApprovalMsg.
         * @member {nft.IRemoveApprovalMsg|null|undefined} removeApprovalMsg
         * @memberof app.Tx
         * @instance
         */
        Tx.prototype.removeApprovalMsg = null;

        /**
         * Tx issueUsernameNftMsg.
         * @member {username.IIssueTokenMsg|null|undefined} issueUsernameNftMsg
         * @memberof app.Tx
         * @instance
         */
        Tx.prototype.issueUsernameNftMsg = null;

        /**
         * Tx addUsernameAddressNftMsg.
         * @member {username.IAddChainAddressMsg|null|undefined} addUsernameAddressNftMsg
         * @memberof app.Tx
         * @instance
         */
        Tx.prototype.addUsernameAddressNftMsg = null;

        /**
         * Tx removeUsernameAddressMsg.
         * @member {username.IRemoveChainAddressMsg|null|undefined} removeUsernameAddressMsg
         * @memberof app.Tx
         * @instance
         */
        Tx.prototype.removeUsernameAddressMsg = null;

        /**
         * Tx issueBlockchainNftMsg.
         * @member {blockchain.IIssueTokenMsg|null|undefined} issueBlockchainNftMsg
         * @memberof app.Tx
         * @instance
         */
        Tx.prototype.issueBlockchainNftMsg = null;

        /**
         * Tx issueTickerNftMsg.
         * @member {ticker.IIssueTokenMsg|null|undefined} issueTickerNftMsg
         * @memberof app.Tx
         * @instance
         */
        Tx.prototype.issueTickerNftMsg = null;

        /**
         * Tx issueBootstrapNodeNftMsg.
         * @member {bootstrap_node.IIssueTokenMsg|null|undefined} issueBootstrapNodeNftMsg
         * @memberof app.Tx
         * @instance
         */
        Tx.prototype.issueBootstrapNodeNftMsg = null;

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

        /**
         * Tx multisig.
         * @member {Array.<Uint8Array>} multisig
         * @memberof app.Tx
         * @instance
         */
        Tx.prototype.multisig = $util.emptyArray;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * Tx sum.
         * @member {"sendMsg"|"newTokenMsg"|"setNameMsg"|"createEscrowMsg"|"releaseEscrowMsg"|"returnEscrowMsg"|"updateEscrowMsg"|"createContractMsg"|"updateContractMsg"|"setValidatorsMsg"|"addApprovalMsg"|"removeApprovalMsg"|"issueUsernameNftMsg"|"addUsernameAddressNftMsg"|"removeUsernameAddressMsg"|"issueBlockchainNftMsg"|"issueTickerNftMsg"|"issueBootstrapNodeNftMsg"|undefined} sum
         * @memberof app.Tx
         * @instance
         */
        Object.defineProperty(Tx.prototype, "sum", {
            get: $util.oneOfGetter($oneOfFields = ["sendMsg", "newTokenMsg", "setNameMsg", "createEscrowMsg", "releaseEscrowMsg", "returnEscrowMsg", "updateEscrowMsg", "createContractMsg", "updateContractMsg", "setValidatorsMsg", "addApprovalMsg", "removeApprovalMsg", "issueUsernameNftMsg", "addUsernameAddressNftMsg", "removeUsernameAddressMsg", "issueBlockchainNftMsg", "issueTickerNftMsg", "issueBootstrapNodeNftMsg"]),
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
            if (message.createContractMsg != null && message.hasOwnProperty("createContractMsg"))
                $root.multisig.CreateContractMsg.encode(message.createContractMsg, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
            if (message.updateContractMsg != null && message.hasOwnProperty("updateContractMsg"))
                $root.multisig.UpdateContractMsg.encode(message.updateContractMsg, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
            if (message.setValidatorsMsg != null && message.hasOwnProperty("setValidatorsMsg"))
                $root.validators.SetValidatorsMsg.encode(message.setValidatorsMsg, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
            if (message.addApprovalMsg != null && message.hasOwnProperty("addApprovalMsg"))
                $root.nft.AddApprovalMsg.encode(message.addApprovalMsg, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
            if (message.removeApprovalMsg != null && message.hasOwnProperty("removeApprovalMsg"))
                $root.nft.RemoveApprovalMsg.encode(message.removeApprovalMsg, writer.uint32(/* id 12, wireType 2 =*/98).fork()).ldelim();
            if (message.issueUsernameNftMsg != null && message.hasOwnProperty("issueUsernameNftMsg"))
                $root.username.IssueTokenMsg.encode(message.issueUsernameNftMsg, writer.uint32(/* id 13, wireType 2 =*/106).fork()).ldelim();
            if (message.addUsernameAddressNftMsg != null && message.hasOwnProperty("addUsernameAddressNftMsg"))
                $root.username.AddChainAddressMsg.encode(message.addUsernameAddressNftMsg, writer.uint32(/* id 14, wireType 2 =*/114).fork()).ldelim();
            if (message.removeUsernameAddressMsg != null && message.hasOwnProperty("removeUsernameAddressMsg"))
                $root.username.RemoveChainAddressMsg.encode(message.removeUsernameAddressMsg, writer.uint32(/* id 15, wireType 2 =*/122).fork()).ldelim();
            if (message.issueBlockchainNftMsg != null && message.hasOwnProperty("issueBlockchainNftMsg"))
                $root.blockchain.IssueTokenMsg.encode(message.issueBlockchainNftMsg, writer.uint32(/* id 16, wireType 2 =*/130).fork()).ldelim();
            if (message.issueTickerNftMsg != null && message.hasOwnProperty("issueTickerNftMsg"))
                $root.ticker.IssueTokenMsg.encode(message.issueTickerNftMsg, writer.uint32(/* id 17, wireType 2 =*/138).fork()).ldelim();
            if (message.issueBootstrapNodeNftMsg != null && message.hasOwnProperty("issueBootstrapNodeNftMsg"))
                $root.bootstrap_node.IssueTokenMsg.encode(message.issueBootstrapNodeNftMsg, writer.uint32(/* id 18, wireType 2 =*/146).fork()).ldelim();
            if (message.fees != null && message.hasOwnProperty("fees"))
                $root.cash.FeeInfo.encode(message.fees, writer.uint32(/* id 20, wireType 2 =*/162).fork()).ldelim();
            if (message.signatures != null && message.signatures.length)
                for (var i = 0; i < message.signatures.length; ++i)
                    $root.sigs.StdSignature.encode(message.signatures[i], writer.uint32(/* id 21, wireType 2 =*/170).fork()).ldelim();
            if (message.preimage != null && message.hasOwnProperty("preimage"))
                writer.uint32(/* id 22, wireType 2 =*/178).bytes(message.preimage);
            if (message.multisig != null && message.multisig.length)
                for (var i = 0; i < message.multisig.length; ++i)
                    writer.uint32(/* id 23, wireType 2 =*/186).bytes(message.multisig[i]);
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
                case 8:
                    message.createContractMsg = $root.multisig.CreateContractMsg.decode(reader, reader.uint32());
                    break;
                case 9:
                    message.updateContractMsg = $root.multisig.UpdateContractMsg.decode(reader, reader.uint32());
                    break;
                case 10:
                    message.setValidatorsMsg = $root.validators.SetValidatorsMsg.decode(reader, reader.uint32());
                    break;
                case 11:
                    message.addApprovalMsg = $root.nft.AddApprovalMsg.decode(reader, reader.uint32());
                    break;
                case 12:
                    message.removeApprovalMsg = $root.nft.RemoveApprovalMsg.decode(reader, reader.uint32());
                    break;
                case 13:
                    message.issueUsernameNftMsg = $root.username.IssueTokenMsg.decode(reader, reader.uint32());
                    break;
                case 14:
                    message.addUsernameAddressNftMsg = $root.username.AddChainAddressMsg.decode(reader, reader.uint32());
                    break;
                case 15:
                    message.removeUsernameAddressMsg = $root.username.RemoveChainAddressMsg.decode(reader, reader.uint32());
                    break;
                case 16:
                    message.issueBlockchainNftMsg = $root.blockchain.IssueTokenMsg.decode(reader, reader.uint32());
                    break;
                case 17:
                    message.issueTickerNftMsg = $root.ticker.IssueTokenMsg.decode(reader, reader.uint32());
                    break;
                case 18:
                    message.issueBootstrapNodeNftMsg = $root.bootstrap_node.IssueTokenMsg.decode(reader, reader.uint32());
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
                case 23:
                    if (!(message.multisig && message.multisig.length))
                        message.multisig = [];
                    message.multisig.push(reader.bytes());
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
            if (message.createContractMsg != null && message.hasOwnProperty("createContractMsg")) {
                if (properties.sum === 1)
                    return "sum: multiple values";
                properties.sum = 1;
                {
                    var error = $root.multisig.CreateContractMsg.verify(message.createContractMsg);
                    if (error)
                        return "createContractMsg." + error;
                }
            }
            if (message.updateContractMsg != null && message.hasOwnProperty("updateContractMsg")) {
                if (properties.sum === 1)
                    return "sum: multiple values";
                properties.sum = 1;
                {
                    var error = $root.multisig.UpdateContractMsg.verify(message.updateContractMsg);
                    if (error)
                        return "updateContractMsg." + error;
                }
            }
            if (message.setValidatorsMsg != null && message.hasOwnProperty("setValidatorsMsg")) {
                if (properties.sum === 1)
                    return "sum: multiple values";
                properties.sum = 1;
                {
                    var error = $root.validators.SetValidatorsMsg.verify(message.setValidatorsMsg);
                    if (error)
                        return "setValidatorsMsg." + error;
                }
            }
            if (message.addApprovalMsg != null && message.hasOwnProperty("addApprovalMsg")) {
                if (properties.sum === 1)
                    return "sum: multiple values";
                properties.sum = 1;
                {
                    var error = $root.nft.AddApprovalMsg.verify(message.addApprovalMsg);
                    if (error)
                        return "addApprovalMsg." + error;
                }
            }
            if (message.removeApprovalMsg != null && message.hasOwnProperty("removeApprovalMsg")) {
                if (properties.sum === 1)
                    return "sum: multiple values";
                properties.sum = 1;
                {
                    var error = $root.nft.RemoveApprovalMsg.verify(message.removeApprovalMsg);
                    if (error)
                        return "removeApprovalMsg." + error;
                }
            }
            if (message.issueUsernameNftMsg != null && message.hasOwnProperty("issueUsernameNftMsg")) {
                if (properties.sum === 1)
                    return "sum: multiple values";
                properties.sum = 1;
                {
                    var error = $root.username.IssueTokenMsg.verify(message.issueUsernameNftMsg);
                    if (error)
                        return "issueUsernameNftMsg." + error;
                }
            }
            if (message.addUsernameAddressNftMsg != null && message.hasOwnProperty("addUsernameAddressNftMsg")) {
                if (properties.sum === 1)
                    return "sum: multiple values";
                properties.sum = 1;
                {
                    var error = $root.username.AddChainAddressMsg.verify(message.addUsernameAddressNftMsg);
                    if (error)
                        return "addUsernameAddressNftMsg." + error;
                }
            }
            if (message.removeUsernameAddressMsg != null && message.hasOwnProperty("removeUsernameAddressMsg")) {
                if (properties.sum === 1)
                    return "sum: multiple values";
                properties.sum = 1;
                {
                    var error = $root.username.RemoveChainAddressMsg.verify(message.removeUsernameAddressMsg);
                    if (error)
                        return "removeUsernameAddressMsg." + error;
                }
            }
            if (message.issueBlockchainNftMsg != null && message.hasOwnProperty("issueBlockchainNftMsg")) {
                if (properties.sum === 1)
                    return "sum: multiple values";
                properties.sum = 1;
                {
                    var error = $root.blockchain.IssueTokenMsg.verify(message.issueBlockchainNftMsg);
                    if (error)
                        return "issueBlockchainNftMsg." + error;
                }
            }
            if (message.issueTickerNftMsg != null && message.hasOwnProperty("issueTickerNftMsg")) {
                if (properties.sum === 1)
                    return "sum: multiple values";
                properties.sum = 1;
                {
                    var error = $root.ticker.IssueTokenMsg.verify(message.issueTickerNftMsg);
                    if (error)
                        return "issueTickerNftMsg." + error;
                }
            }
            if (message.issueBootstrapNodeNftMsg != null && message.hasOwnProperty("issueBootstrapNodeNftMsg")) {
                if (properties.sum === 1)
                    return "sum: multiple values";
                properties.sum = 1;
                {
                    var error = $root.bootstrap_node.IssueTokenMsg.verify(message.issueBootstrapNodeNftMsg);
                    if (error)
                        return "issueBootstrapNodeNftMsg." + error;
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
            if (message.multisig != null && message.hasOwnProperty("multisig")) {
                if (!Array.isArray(message.multisig))
                    return "multisig: array expected";
                for (var i = 0; i < message.multisig.length; ++i)
                    if (!(message.multisig[i] && typeof message.multisig[i].length === "number" || $util.isString(message.multisig[i])))
                        return "multisig: buffer[] expected";
            }
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
            if (object.createContractMsg != null) {
                if (typeof object.createContractMsg !== "object")
                    throw TypeError(".app.Tx.createContractMsg: object expected");
                message.createContractMsg = $root.multisig.CreateContractMsg.fromObject(object.createContractMsg);
            }
            if (object.updateContractMsg != null) {
                if (typeof object.updateContractMsg !== "object")
                    throw TypeError(".app.Tx.updateContractMsg: object expected");
                message.updateContractMsg = $root.multisig.UpdateContractMsg.fromObject(object.updateContractMsg);
            }
            if (object.setValidatorsMsg != null) {
                if (typeof object.setValidatorsMsg !== "object")
                    throw TypeError(".app.Tx.setValidatorsMsg: object expected");
                message.setValidatorsMsg = $root.validators.SetValidatorsMsg.fromObject(object.setValidatorsMsg);
            }
            if (object.addApprovalMsg != null) {
                if (typeof object.addApprovalMsg !== "object")
                    throw TypeError(".app.Tx.addApprovalMsg: object expected");
                message.addApprovalMsg = $root.nft.AddApprovalMsg.fromObject(object.addApprovalMsg);
            }
            if (object.removeApprovalMsg != null) {
                if (typeof object.removeApprovalMsg !== "object")
                    throw TypeError(".app.Tx.removeApprovalMsg: object expected");
                message.removeApprovalMsg = $root.nft.RemoveApprovalMsg.fromObject(object.removeApprovalMsg);
            }
            if (object.issueUsernameNftMsg != null) {
                if (typeof object.issueUsernameNftMsg !== "object")
                    throw TypeError(".app.Tx.issueUsernameNftMsg: object expected");
                message.issueUsernameNftMsg = $root.username.IssueTokenMsg.fromObject(object.issueUsernameNftMsg);
            }
            if (object.addUsernameAddressNftMsg != null) {
                if (typeof object.addUsernameAddressNftMsg !== "object")
                    throw TypeError(".app.Tx.addUsernameAddressNftMsg: object expected");
                message.addUsernameAddressNftMsg = $root.username.AddChainAddressMsg.fromObject(object.addUsernameAddressNftMsg);
            }
            if (object.removeUsernameAddressMsg != null) {
                if (typeof object.removeUsernameAddressMsg !== "object")
                    throw TypeError(".app.Tx.removeUsernameAddressMsg: object expected");
                message.removeUsernameAddressMsg = $root.username.RemoveChainAddressMsg.fromObject(object.removeUsernameAddressMsg);
            }
            if (object.issueBlockchainNftMsg != null) {
                if (typeof object.issueBlockchainNftMsg !== "object")
                    throw TypeError(".app.Tx.issueBlockchainNftMsg: object expected");
                message.issueBlockchainNftMsg = $root.blockchain.IssueTokenMsg.fromObject(object.issueBlockchainNftMsg);
            }
            if (object.issueTickerNftMsg != null) {
                if (typeof object.issueTickerNftMsg !== "object")
                    throw TypeError(".app.Tx.issueTickerNftMsg: object expected");
                message.issueTickerNftMsg = $root.ticker.IssueTokenMsg.fromObject(object.issueTickerNftMsg);
            }
            if (object.issueBootstrapNodeNftMsg != null) {
                if (typeof object.issueBootstrapNodeNftMsg !== "object")
                    throw TypeError(".app.Tx.issueBootstrapNodeNftMsg: object expected");
                message.issueBootstrapNodeNftMsg = $root.bootstrap_node.IssueTokenMsg.fromObject(object.issueBootstrapNodeNftMsg);
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
            if (object.multisig) {
                if (!Array.isArray(object.multisig))
                    throw TypeError(".app.Tx.multisig: array expected");
                message.multisig = [];
                for (var i = 0; i < object.multisig.length; ++i)
                    if (typeof object.multisig[i] === "string")
                        $util.base64.decode(object.multisig[i], message.multisig[i] = $util.newBuffer($util.base64.length(object.multisig[i])), 0);
                    else if (object.multisig[i].length)
                        message.multisig[i] = object.multisig[i];
            }
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
            if (options.arrays || options.defaults) {
                object.signatures = [];
                object.multisig = [];
            }
            if (options.defaults) {
                object.fees = null;
                if (options.bytes === String)
                    object.preimage = "";
                else {
                    object.preimage = [];
                    if (options.bytes !== Array)
                        object.preimage = $util.newBuffer(object.preimage);
                }
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
            if (message.createContractMsg != null && message.hasOwnProperty("createContractMsg")) {
                object.createContractMsg = $root.multisig.CreateContractMsg.toObject(message.createContractMsg, options);
                if (options.oneofs)
                    object.sum = "createContractMsg";
            }
            if (message.updateContractMsg != null && message.hasOwnProperty("updateContractMsg")) {
                object.updateContractMsg = $root.multisig.UpdateContractMsg.toObject(message.updateContractMsg, options);
                if (options.oneofs)
                    object.sum = "updateContractMsg";
            }
            if (message.setValidatorsMsg != null && message.hasOwnProperty("setValidatorsMsg")) {
                object.setValidatorsMsg = $root.validators.SetValidatorsMsg.toObject(message.setValidatorsMsg, options);
                if (options.oneofs)
                    object.sum = "setValidatorsMsg";
            }
            if (message.addApprovalMsg != null && message.hasOwnProperty("addApprovalMsg")) {
                object.addApprovalMsg = $root.nft.AddApprovalMsg.toObject(message.addApprovalMsg, options);
                if (options.oneofs)
                    object.sum = "addApprovalMsg";
            }
            if (message.removeApprovalMsg != null && message.hasOwnProperty("removeApprovalMsg")) {
                object.removeApprovalMsg = $root.nft.RemoveApprovalMsg.toObject(message.removeApprovalMsg, options);
                if (options.oneofs)
                    object.sum = "removeApprovalMsg";
            }
            if (message.issueUsernameNftMsg != null && message.hasOwnProperty("issueUsernameNftMsg")) {
                object.issueUsernameNftMsg = $root.username.IssueTokenMsg.toObject(message.issueUsernameNftMsg, options);
                if (options.oneofs)
                    object.sum = "issueUsernameNftMsg";
            }
            if (message.addUsernameAddressNftMsg != null && message.hasOwnProperty("addUsernameAddressNftMsg")) {
                object.addUsernameAddressNftMsg = $root.username.AddChainAddressMsg.toObject(message.addUsernameAddressNftMsg, options);
                if (options.oneofs)
                    object.sum = "addUsernameAddressNftMsg";
            }
            if (message.removeUsernameAddressMsg != null && message.hasOwnProperty("removeUsernameAddressMsg")) {
                object.removeUsernameAddressMsg = $root.username.RemoveChainAddressMsg.toObject(message.removeUsernameAddressMsg, options);
                if (options.oneofs)
                    object.sum = "removeUsernameAddressMsg";
            }
            if (message.issueBlockchainNftMsg != null && message.hasOwnProperty("issueBlockchainNftMsg")) {
                object.issueBlockchainNftMsg = $root.blockchain.IssueTokenMsg.toObject(message.issueBlockchainNftMsg, options);
                if (options.oneofs)
                    object.sum = "issueBlockchainNftMsg";
            }
            if (message.issueTickerNftMsg != null && message.hasOwnProperty("issueTickerNftMsg")) {
                object.issueTickerNftMsg = $root.ticker.IssueTokenMsg.toObject(message.issueTickerNftMsg, options);
                if (options.oneofs)
                    object.sum = "issueTickerNftMsg";
            }
            if (message.issueBootstrapNodeNftMsg != null && message.hasOwnProperty("issueBootstrapNodeNftMsg")) {
                object.issueBootstrapNodeNftMsg = $root.bootstrap_node.IssueTokenMsg.toObject(message.issueBootstrapNodeNftMsg, options);
                if (options.oneofs)
                    object.sum = "issueBootstrapNodeNftMsg";
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
            if (message.multisig && message.multisig.length) {
                object.multisig = [];
                for (var j = 0; j < message.multisig.length; ++j)
                    object.multisig[j] = options.bytes === String ? $util.base64.encode(message.multisig[j], 0, message.multisig[j].length) : options.bytes === Array ? Array.prototype.slice.call(message.multisig[j]) : message.multisig[j];
            }
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

    /**
     * NftType enum.
     * @name app.NftType
     * @enum {string}
     * @property {number} Username=0 Username value
     * @property {number} Ticker=1 Ticker value
     * @property {number} Blockchain=3 Blockchain value
     * @property {number} BootstrapNode=4 BootstrapNode value
     */
    app.NftType = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "Username"] = 0;
        values[valuesById[1] = "Ticker"] = 1;
        values[valuesById[3] = "Blockchain"] = 3;
        values[valuesById[4] = "BootstrapNode"] = 4;
        return values;
    })();

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

    return app;
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
                if (options.bytes === String)
                    object.address = "";
                else {
                    object.address = [];
                    if (options.bytes !== Array)
                        object.address = $util.newBuffer(object.address);
                }
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

$root.blockchain = (function() {

    /**
     * Namespace blockchain.
     * @exports blockchain
     * @namespace
     */
    var blockchain = {};

    blockchain.BlockchainToken = (function() {

        /**
         * Properties of a BlockchainToken.
         * @memberof blockchain
         * @interface IBlockchainToken
         * @property {nft.INonFungibleToken|null} [base] BlockchainToken base
         * @property {blockchain.ITokenDetails|null} [details] BlockchainToken details
         */

        /**
         * Constructs a new BlockchainToken.
         * @memberof blockchain
         * @classdesc Represents a BlockchainToken.
         * @implements IBlockchainToken
         * @constructor
         * @param {blockchain.IBlockchainToken=} [properties] Properties to set
         */
        function BlockchainToken(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * BlockchainToken base.
         * @member {nft.INonFungibleToken|null|undefined} base
         * @memberof blockchain.BlockchainToken
         * @instance
         */
        BlockchainToken.prototype.base = null;

        /**
         * BlockchainToken details.
         * @member {blockchain.ITokenDetails|null|undefined} details
         * @memberof blockchain.BlockchainToken
         * @instance
         */
        BlockchainToken.prototype.details = null;

        /**
         * Creates a new BlockchainToken instance using the specified properties.
         * @function create
         * @memberof blockchain.BlockchainToken
         * @static
         * @param {blockchain.IBlockchainToken=} [properties] Properties to set
         * @returns {blockchain.BlockchainToken} BlockchainToken instance
         */
        BlockchainToken.create = function create(properties) {
            return new BlockchainToken(properties);
        };

        /**
         * Encodes the specified BlockchainToken message. Does not implicitly {@link blockchain.BlockchainToken.verify|verify} messages.
         * @function encode
         * @memberof blockchain.BlockchainToken
         * @static
         * @param {blockchain.IBlockchainToken} message BlockchainToken message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BlockchainToken.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.base != null && message.hasOwnProperty("base"))
                $root.nft.NonFungibleToken.encode(message.base, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.details != null && message.hasOwnProperty("details"))
                $root.blockchain.TokenDetails.encode(message.details, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified BlockchainToken message, length delimited. Does not implicitly {@link blockchain.BlockchainToken.verify|verify} messages.
         * @function encodeDelimited
         * @memberof blockchain.BlockchainToken
         * @static
         * @param {blockchain.IBlockchainToken} message BlockchainToken message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BlockchainToken.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a BlockchainToken message from the specified reader or buffer.
         * @function decode
         * @memberof blockchain.BlockchainToken
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {blockchain.BlockchainToken} BlockchainToken
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BlockchainToken.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.blockchain.BlockchainToken();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.base = $root.nft.NonFungibleToken.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.details = $root.blockchain.TokenDetails.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a BlockchainToken message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof blockchain.BlockchainToken
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {blockchain.BlockchainToken} BlockchainToken
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BlockchainToken.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a BlockchainToken message.
         * @function verify
         * @memberof blockchain.BlockchainToken
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        BlockchainToken.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.base != null && message.hasOwnProperty("base")) {
                var error = $root.nft.NonFungibleToken.verify(message.base);
                if (error)
                    return "base." + error;
            }
            if (message.details != null && message.hasOwnProperty("details")) {
                var error = $root.blockchain.TokenDetails.verify(message.details);
                if (error)
                    return "details." + error;
            }
            return null;
        };

        /**
         * Creates a BlockchainToken message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof blockchain.BlockchainToken
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {blockchain.BlockchainToken} BlockchainToken
         */
        BlockchainToken.fromObject = function fromObject(object) {
            if (object instanceof $root.blockchain.BlockchainToken)
                return object;
            var message = new $root.blockchain.BlockchainToken();
            if (object.base != null) {
                if (typeof object.base !== "object")
                    throw TypeError(".blockchain.BlockchainToken.base: object expected");
                message.base = $root.nft.NonFungibleToken.fromObject(object.base);
            }
            if (object.details != null) {
                if (typeof object.details !== "object")
                    throw TypeError(".blockchain.BlockchainToken.details: object expected");
                message.details = $root.blockchain.TokenDetails.fromObject(object.details);
            }
            return message;
        };

        /**
         * Creates a plain object from a BlockchainToken message. Also converts values to other types if specified.
         * @function toObject
         * @memberof blockchain.BlockchainToken
         * @static
         * @param {blockchain.BlockchainToken} message BlockchainToken
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        BlockchainToken.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.base = null;
                object.details = null;
            }
            if (message.base != null && message.hasOwnProperty("base"))
                object.base = $root.nft.NonFungibleToken.toObject(message.base, options);
            if (message.details != null && message.hasOwnProperty("details"))
                object.details = $root.blockchain.TokenDetails.toObject(message.details, options);
            return object;
        };

        /**
         * Converts this BlockchainToken to JSON.
         * @function toJSON
         * @memberof blockchain.BlockchainToken
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        BlockchainToken.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return BlockchainToken;
    })();

    blockchain.TokenDetails = (function() {

        /**
         * Properties of a TokenDetails.
         * @memberof blockchain
         * @interface ITokenDetails
         * @property {blockchain.IChain|null} [chain] TokenDetails chain
         * @property {blockchain.IIOV|null} [iov] TokenDetails iov
         */

        /**
         * Constructs a new TokenDetails.
         * @memberof blockchain
         * @classdesc Represents a TokenDetails.
         * @implements ITokenDetails
         * @constructor
         * @param {blockchain.ITokenDetails=} [properties] Properties to set
         */
        function TokenDetails(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TokenDetails chain.
         * @member {blockchain.IChain|null|undefined} chain
         * @memberof blockchain.TokenDetails
         * @instance
         */
        TokenDetails.prototype.chain = null;

        /**
         * TokenDetails iov.
         * @member {blockchain.IIOV|null|undefined} iov
         * @memberof blockchain.TokenDetails
         * @instance
         */
        TokenDetails.prototype.iov = null;

        /**
         * Creates a new TokenDetails instance using the specified properties.
         * @function create
         * @memberof blockchain.TokenDetails
         * @static
         * @param {blockchain.ITokenDetails=} [properties] Properties to set
         * @returns {blockchain.TokenDetails} TokenDetails instance
         */
        TokenDetails.create = function create(properties) {
            return new TokenDetails(properties);
        };

        /**
         * Encodes the specified TokenDetails message. Does not implicitly {@link blockchain.TokenDetails.verify|verify} messages.
         * @function encode
         * @memberof blockchain.TokenDetails
         * @static
         * @param {blockchain.ITokenDetails} message TokenDetails message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TokenDetails.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.chain != null && message.hasOwnProperty("chain"))
                $root.blockchain.Chain.encode(message.chain, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.iov != null && message.hasOwnProperty("iov"))
                $root.blockchain.IOV.encode(message.iov, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified TokenDetails message, length delimited. Does not implicitly {@link blockchain.TokenDetails.verify|verify} messages.
         * @function encodeDelimited
         * @memberof blockchain.TokenDetails
         * @static
         * @param {blockchain.ITokenDetails} message TokenDetails message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TokenDetails.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TokenDetails message from the specified reader or buffer.
         * @function decode
         * @memberof blockchain.TokenDetails
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {blockchain.TokenDetails} TokenDetails
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TokenDetails.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.blockchain.TokenDetails();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.chain = $root.blockchain.Chain.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.iov = $root.blockchain.IOV.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TokenDetails message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof blockchain.TokenDetails
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {blockchain.TokenDetails} TokenDetails
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TokenDetails.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TokenDetails message.
         * @function verify
         * @memberof blockchain.TokenDetails
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TokenDetails.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.chain != null && message.hasOwnProperty("chain")) {
                var error = $root.blockchain.Chain.verify(message.chain);
                if (error)
                    return "chain." + error;
            }
            if (message.iov != null && message.hasOwnProperty("iov")) {
                var error = $root.blockchain.IOV.verify(message.iov);
                if (error)
                    return "iov." + error;
            }
            return null;
        };

        /**
         * Creates a TokenDetails message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof blockchain.TokenDetails
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {blockchain.TokenDetails} TokenDetails
         */
        TokenDetails.fromObject = function fromObject(object) {
            if (object instanceof $root.blockchain.TokenDetails)
                return object;
            var message = new $root.blockchain.TokenDetails();
            if (object.chain != null) {
                if (typeof object.chain !== "object")
                    throw TypeError(".blockchain.TokenDetails.chain: object expected");
                message.chain = $root.blockchain.Chain.fromObject(object.chain);
            }
            if (object.iov != null) {
                if (typeof object.iov !== "object")
                    throw TypeError(".blockchain.TokenDetails.iov: object expected");
                message.iov = $root.blockchain.IOV.fromObject(object.iov);
            }
            return message;
        };

        /**
         * Creates a plain object from a TokenDetails message. Also converts values to other types if specified.
         * @function toObject
         * @memberof blockchain.TokenDetails
         * @static
         * @param {blockchain.TokenDetails} message TokenDetails
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TokenDetails.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.chain = null;
                object.iov = null;
            }
            if (message.chain != null && message.hasOwnProperty("chain"))
                object.chain = $root.blockchain.Chain.toObject(message.chain, options);
            if (message.iov != null && message.hasOwnProperty("iov"))
                object.iov = $root.blockchain.IOV.toObject(message.iov, options);
            return object;
        };

        /**
         * Converts this TokenDetails to JSON.
         * @function toJSON
         * @memberof blockchain.TokenDetails
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TokenDetails.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return TokenDetails;
    })();

    blockchain.Chain = (function() {

        /**
         * Properties of a Chain.
         * @memberof blockchain
         * @interface IChain
         * @property {string|null} [chainID] Chain chainID
         * @property {string|null} [networkID] Chain networkID
         * @property {string|null} [name] Chain name
         * @property {boolean|null} [enabled] Chain enabled
         * @property {boolean|null} [production] Chain production
         * @property {Uint8Array|null} [mainTickerID] Chain mainTickerID
         */

        /**
         * Constructs a new Chain.
         * @memberof blockchain
         * @classdesc Represents a Chain.
         * @implements IChain
         * @constructor
         * @param {blockchain.IChain=} [properties] Properties to set
         */
        function Chain(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Chain chainID.
         * @member {string} chainID
         * @memberof blockchain.Chain
         * @instance
         */
        Chain.prototype.chainID = "";

        /**
         * Chain networkID.
         * @member {string} networkID
         * @memberof blockchain.Chain
         * @instance
         */
        Chain.prototype.networkID = "";

        /**
         * Chain name.
         * @member {string} name
         * @memberof blockchain.Chain
         * @instance
         */
        Chain.prototype.name = "";

        /**
         * Chain enabled.
         * @member {boolean} enabled
         * @memberof blockchain.Chain
         * @instance
         */
        Chain.prototype.enabled = false;

        /**
         * Chain production.
         * @member {boolean} production
         * @memberof blockchain.Chain
         * @instance
         */
        Chain.prototype.production = false;

        /**
         * Chain mainTickerID.
         * @member {Uint8Array} mainTickerID
         * @memberof blockchain.Chain
         * @instance
         */
        Chain.prototype.mainTickerID = $util.newBuffer([]);

        /**
         * Creates a new Chain instance using the specified properties.
         * @function create
         * @memberof blockchain.Chain
         * @static
         * @param {blockchain.IChain=} [properties] Properties to set
         * @returns {blockchain.Chain} Chain instance
         */
        Chain.create = function create(properties) {
            return new Chain(properties);
        };

        /**
         * Encodes the specified Chain message. Does not implicitly {@link blockchain.Chain.verify|verify} messages.
         * @function encode
         * @memberof blockchain.Chain
         * @static
         * @param {blockchain.IChain} message Chain message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Chain.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.chainID != null && message.hasOwnProperty("chainID"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.chainID);
            if (message.networkID != null && message.hasOwnProperty("networkID"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.networkID);
            if (message.name != null && message.hasOwnProperty("name"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.name);
            if (message.enabled != null && message.hasOwnProperty("enabled"))
                writer.uint32(/* id 4, wireType 0 =*/32).bool(message.enabled);
            if (message.production != null && message.hasOwnProperty("production"))
                writer.uint32(/* id 5, wireType 0 =*/40).bool(message.production);
            if (message.mainTickerID != null && message.hasOwnProperty("mainTickerID"))
                writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.mainTickerID);
            return writer;
        };

        /**
         * Encodes the specified Chain message, length delimited. Does not implicitly {@link blockchain.Chain.verify|verify} messages.
         * @function encodeDelimited
         * @memberof blockchain.Chain
         * @static
         * @param {blockchain.IChain} message Chain message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Chain.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Chain message from the specified reader or buffer.
         * @function decode
         * @memberof blockchain.Chain
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {blockchain.Chain} Chain
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Chain.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.blockchain.Chain();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.chainID = reader.string();
                    break;
                case 2:
                    message.networkID = reader.string();
                    break;
                case 3:
                    message.name = reader.string();
                    break;
                case 4:
                    message.enabled = reader.bool();
                    break;
                case 5:
                    message.production = reader.bool();
                    break;
                case 6:
                    message.mainTickerID = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Chain message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof blockchain.Chain
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {blockchain.Chain} Chain
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Chain.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Chain message.
         * @function verify
         * @memberof blockchain.Chain
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Chain.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.chainID != null && message.hasOwnProperty("chainID"))
                if (!$util.isString(message.chainID))
                    return "chainID: string expected";
            if (message.networkID != null && message.hasOwnProperty("networkID"))
                if (!$util.isString(message.networkID))
                    return "networkID: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.enabled != null && message.hasOwnProperty("enabled"))
                if (typeof message.enabled !== "boolean")
                    return "enabled: boolean expected";
            if (message.production != null && message.hasOwnProperty("production"))
                if (typeof message.production !== "boolean")
                    return "production: boolean expected";
            if (message.mainTickerID != null && message.hasOwnProperty("mainTickerID"))
                if (!(message.mainTickerID && typeof message.mainTickerID.length === "number" || $util.isString(message.mainTickerID)))
                    return "mainTickerID: buffer expected";
            return null;
        };

        /**
         * Creates a Chain message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof blockchain.Chain
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {blockchain.Chain} Chain
         */
        Chain.fromObject = function fromObject(object) {
            if (object instanceof $root.blockchain.Chain)
                return object;
            var message = new $root.blockchain.Chain();
            if (object.chainID != null)
                message.chainID = String(object.chainID);
            if (object.networkID != null)
                message.networkID = String(object.networkID);
            if (object.name != null)
                message.name = String(object.name);
            if (object.enabled != null)
                message.enabled = Boolean(object.enabled);
            if (object.production != null)
                message.production = Boolean(object.production);
            if (object.mainTickerID != null)
                if (typeof object.mainTickerID === "string")
                    $util.base64.decode(object.mainTickerID, message.mainTickerID = $util.newBuffer($util.base64.length(object.mainTickerID)), 0);
                else if (object.mainTickerID.length)
                    message.mainTickerID = object.mainTickerID;
            return message;
        };

        /**
         * Creates a plain object from a Chain message. Also converts values to other types if specified.
         * @function toObject
         * @memberof blockchain.Chain
         * @static
         * @param {blockchain.Chain} message Chain
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Chain.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.chainID = "";
                object.networkID = "";
                object.name = "";
                object.enabled = false;
                object.production = false;
                if (options.bytes === String)
                    object.mainTickerID = "";
                else {
                    object.mainTickerID = [];
                    if (options.bytes !== Array)
                        object.mainTickerID = $util.newBuffer(object.mainTickerID);
                }
            }
            if (message.chainID != null && message.hasOwnProperty("chainID"))
                object.chainID = message.chainID;
            if (message.networkID != null && message.hasOwnProperty("networkID"))
                object.networkID = message.networkID;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.enabled != null && message.hasOwnProperty("enabled"))
                object.enabled = message.enabled;
            if (message.production != null && message.hasOwnProperty("production"))
                object.production = message.production;
            if (message.mainTickerID != null && message.hasOwnProperty("mainTickerID"))
                object.mainTickerID = options.bytes === String ? $util.base64.encode(message.mainTickerID, 0, message.mainTickerID.length) : options.bytes === Array ? Array.prototype.slice.call(message.mainTickerID) : message.mainTickerID;
            return object;
        };

        /**
         * Converts this Chain to JSON.
         * @function toJSON
         * @memberof blockchain.Chain
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Chain.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Chain;
    })();

    blockchain.IOV = (function() {

        /**
         * Properties of a IOV.
         * @memberof blockchain
         * @interface IIOV
         * @property {string|null} [codec] IOV codec
         * @property {string|null} [codecConfig] IOV codecConfig
         */

        /**
         * Constructs a new IOV.
         * @memberof blockchain
         * @classdesc Represents a IOV.
         * @implements IIOV
         * @constructor
         * @param {blockchain.IIOV=} [properties] Properties to set
         */
        function IOV(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * IOV codec.
         * @member {string} codec
         * @memberof blockchain.IOV
         * @instance
         */
        IOV.prototype.codec = "";

        /**
         * IOV codecConfig.
         * @member {string} codecConfig
         * @memberof blockchain.IOV
         * @instance
         */
        IOV.prototype.codecConfig = "";

        /**
         * Creates a new IOV instance using the specified properties.
         * @function create
         * @memberof blockchain.IOV
         * @static
         * @param {blockchain.IIOV=} [properties] Properties to set
         * @returns {blockchain.IOV} IOV instance
         */
        IOV.create = function create(properties) {
            return new IOV(properties);
        };

        /**
         * Encodes the specified IOV message. Does not implicitly {@link blockchain.IOV.verify|verify} messages.
         * @function encode
         * @memberof blockchain.IOV
         * @static
         * @param {blockchain.IIOV} message IOV message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        IOV.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.codec != null && message.hasOwnProperty("codec"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.codec);
            if (message.codecConfig != null && message.hasOwnProperty("codecConfig"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.codecConfig);
            return writer;
        };

        /**
         * Encodes the specified IOV message, length delimited. Does not implicitly {@link blockchain.IOV.verify|verify} messages.
         * @function encodeDelimited
         * @memberof blockchain.IOV
         * @static
         * @param {blockchain.IIOV} message IOV message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        IOV.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a IOV message from the specified reader or buffer.
         * @function decode
         * @memberof blockchain.IOV
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {blockchain.IOV} IOV
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        IOV.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.blockchain.IOV();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.codec = reader.string();
                    break;
                case 2:
                    message.codecConfig = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a IOV message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof blockchain.IOV
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {blockchain.IOV} IOV
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        IOV.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a IOV message.
         * @function verify
         * @memberof blockchain.IOV
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        IOV.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.codec != null && message.hasOwnProperty("codec"))
                if (!$util.isString(message.codec))
                    return "codec: string expected";
            if (message.codecConfig != null && message.hasOwnProperty("codecConfig"))
                if (!$util.isString(message.codecConfig))
                    return "codecConfig: string expected";
            return null;
        };

        /**
         * Creates a IOV message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof blockchain.IOV
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {blockchain.IOV} IOV
         */
        IOV.fromObject = function fromObject(object) {
            if (object instanceof $root.blockchain.IOV)
                return object;
            var message = new $root.blockchain.IOV();
            if (object.codec != null)
                message.codec = String(object.codec);
            if (object.codecConfig != null)
                message.codecConfig = String(object.codecConfig);
            return message;
        };

        /**
         * Creates a plain object from a IOV message. Also converts values to other types if specified.
         * @function toObject
         * @memberof blockchain.IOV
         * @static
         * @param {blockchain.IOV} message IOV
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        IOV.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.codec = "";
                object.codecConfig = "";
            }
            if (message.codec != null && message.hasOwnProperty("codec"))
                object.codec = message.codec;
            if (message.codecConfig != null && message.hasOwnProperty("codecConfig"))
                object.codecConfig = message.codecConfig;
            return object;
        };

        /**
         * Converts this IOV to JSON.
         * @function toJSON
         * @memberof blockchain.IOV
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        IOV.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return IOV;
    })();

    blockchain.Config = (function() {

        /**
         * Properties of a Config.
         * @memberof blockchain
         * @interface IConfig
         * @property {blockchain.IChain|null} [chain] Config chain
         * @property {string|null} [codecConfig] Config codecConfig
         */

        /**
         * Constructs a new Config.
         * @memberof blockchain
         * @classdesc Represents a Config.
         * @implements IConfig
         * @constructor
         * @param {blockchain.IConfig=} [properties] Properties to set
         */
        function Config(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Config chain.
         * @member {blockchain.IChain|null|undefined} chain
         * @memberof blockchain.Config
         * @instance
         */
        Config.prototype.chain = null;

        /**
         * Config codecConfig.
         * @member {string} codecConfig
         * @memberof blockchain.Config
         * @instance
         */
        Config.prototype.codecConfig = "";

        /**
         * Creates a new Config instance using the specified properties.
         * @function create
         * @memberof blockchain.Config
         * @static
         * @param {blockchain.IConfig=} [properties] Properties to set
         * @returns {blockchain.Config} Config instance
         */
        Config.create = function create(properties) {
            return new Config(properties);
        };

        /**
         * Encodes the specified Config message. Does not implicitly {@link blockchain.Config.verify|verify} messages.
         * @function encode
         * @memberof blockchain.Config
         * @static
         * @param {blockchain.IConfig} message Config message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Config.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.chain != null && message.hasOwnProperty("chain"))
                $root.blockchain.Chain.encode(message.chain, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.codecConfig != null && message.hasOwnProperty("codecConfig"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.codecConfig);
            return writer;
        };

        /**
         * Encodes the specified Config message, length delimited. Does not implicitly {@link blockchain.Config.verify|verify} messages.
         * @function encodeDelimited
         * @memberof blockchain.Config
         * @static
         * @param {blockchain.IConfig} message Config message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Config.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Config message from the specified reader or buffer.
         * @function decode
         * @memberof blockchain.Config
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {blockchain.Config} Config
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Config.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.blockchain.Config();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.chain = $root.blockchain.Chain.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.codecConfig = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Config message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof blockchain.Config
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {blockchain.Config} Config
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Config.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Config message.
         * @function verify
         * @memberof blockchain.Config
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Config.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.chain != null && message.hasOwnProperty("chain")) {
                var error = $root.blockchain.Chain.verify(message.chain);
                if (error)
                    return "chain." + error;
            }
            if (message.codecConfig != null && message.hasOwnProperty("codecConfig"))
                if (!$util.isString(message.codecConfig))
                    return "codecConfig: string expected";
            return null;
        };

        /**
         * Creates a Config message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof blockchain.Config
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {blockchain.Config} Config
         */
        Config.fromObject = function fromObject(object) {
            if (object instanceof $root.blockchain.Config)
                return object;
            var message = new $root.blockchain.Config();
            if (object.chain != null) {
                if (typeof object.chain !== "object")
                    throw TypeError(".blockchain.Config.chain: object expected");
                message.chain = $root.blockchain.Chain.fromObject(object.chain);
            }
            if (object.codecConfig != null)
                message.codecConfig = String(object.codecConfig);
            return message;
        };

        /**
         * Creates a plain object from a Config message. Also converts values to other types if specified.
         * @function toObject
         * @memberof blockchain.Config
         * @static
         * @param {blockchain.Config} message Config
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Config.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.chain = null;
                object.codecConfig = "";
            }
            if (message.chain != null && message.hasOwnProperty("chain"))
                object.chain = $root.blockchain.Chain.toObject(message.chain, options);
            if (message.codecConfig != null && message.hasOwnProperty("codecConfig"))
                object.codecConfig = message.codecConfig;
            return object;
        };

        /**
         * Converts this Config to JSON.
         * @function toJSON
         * @memberof blockchain.Config
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Config.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Config;
    })();

    blockchain.IssueTokenMsg = (function() {

        /**
         * Properties of an IssueTokenMsg.
         * @memberof blockchain
         * @interface IIssueTokenMsg
         * @property {Uint8Array|null} [owner] IssueTokenMsg owner
         * @property {Uint8Array|null} [id] IssueTokenMsg id
         * @property {blockchain.ITokenDetails|null} [details] IssueTokenMsg details
         * @property {Array.<nft.IActionApprovals>|null} [approvals] IssueTokenMsg approvals
         */

        /**
         * Constructs a new IssueTokenMsg.
         * @memberof blockchain
         * @classdesc Represents an IssueTokenMsg.
         * @implements IIssueTokenMsg
         * @constructor
         * @param {blockchain.IIssueTokenMsg=} [properties] Properties to set
         */
        function IssueTokenMsg(properties) {
            this.approvals = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * IssueTokenMsg owner.
         * @member {Uint8Array} owner
         * @memberof blockchain.IssueTokenMsg
         * @instance
         */
        IssueTokenMsg.prototype.owner = $util.newBuffer([]);

        /**
         * IssueTokenMsg id.
         * @member {Uint8Array} id
         * @memberof blockchain.IssueTokenMsg
         * @instance
         */
        IssueTokenMsg.prototype.id = $util.newBuffer([]);

        /**
         * IssueTokenMsg details.
         * @member {blockchain.ITokenDetails|null|undefined} details
         * @memberof blockchain.IssueTokenMsg
         * @instance
         */
        IssueTokenMsg.prototype.details = null;

        /**
         * IssueTokenMsg approvals.
         * @member {Array.<nft.IActionApprovals>} approvals
         * @memberof blockchain.IssueTokenMsg
         * @instance
         */
        IssueTokenMsg.prototype.approvals = $util.emptyArray;

        /**
         * Creates a new IssueTokenMsg instance using the specified properties.
         * @function create
         * @memberof blockchain.IssueTokenMsg
         * @static
         * @param {blockchain.IIssueTokenMsg=} [properties] Properties to set
         * @returns {blockchain.IssueTokenMsg} IssueTokenMsg instance
         */
        IssueTokenMsg.create = function create(properties) {
            return new IssueTokenMsg(properties);
        };

        /**
         * Encodes the specified IssueTokenMsg message. Does not implicitly {@link blockchain.IssueTokenMsg.verify|verify} messages.
         * @function encode
         * @memberof blockchain.IssueTokenMsg
         * @static
         * @param {blockchain.IIssueTokenMsg} message IssueTokenMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        IssueTokenMsg.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.owner != null && message.hasOwnProperty("owner"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.owner);
            if (message.id != null && message.hasOwnProperty("id"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.id);
            if (message.details != null && message.hasOwnProperty("details"))
                $root.blockchain.TokenDetails.encode(message.details, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.approvals != null && message.approvals.length)
                for (var i = 0; i < message.approvals.length; ++i)
                    $root.nft.ActionApprovals.encode(message.approvals[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified IssueTokenMsg message, length delimited. Does not implicitly {@link blockchain.IssueTokenMsg.verify|verify} messages.
         * @function encodeDelimited
         * @memberof blockchain.IssueTokenMsg
         * @static
         * @param {blockchain.IIssueTokenMsg} message IssueTokenMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        IssueTokenMsg.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an IssueTokenMsg message from the specified reader or buffer.
         * @function decode
         * @memberof blockchain.IssueTokenMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {blockchain.IssueTokenMsg} IssueTokenMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        IssueTokenMsg.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.blockchain.IssueTokenMsg();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.owner = reader.bytes();
                    break;
                case 2:
                    message.id = reader.bytes();
                    break;
                case 3:
                    message.details = $root.blockchain.TokenDetails.decode(reader, reader.uint32());
                    break;
                case 4:
                    if (!(message.approvals && message.approvals.length))
                        message.approvals = [];
                    message.approvals.push($root.nft.ActionApprovals.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an IssueTokenMsg message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof blockchain.IssueTokenMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {blockchain.IssueTokenMsg} IssueTokenMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        IssueTokenMsg.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an IssueTokenMsg message.
         * @function verify
         * @memberof blockchain.IssueTokenMsg
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        IssueTokenMsg.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.owner != null && message.hasOwnProperty("owner"))
                if (!(message.owner && typeof message.owner.length === "number" || $util.isString(message.owner)))
                    return "owner: buffer expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!(message.id && typeof message.id.length === "number" || $util.isString(message.id)))
                    return "id: buffer expected";
            if (message.details != null && message.hasOwnProperty("details")) {
                var error = $root.blockchain.TokenDetails.verify(message.details);
                if (error)
                    return "details." + error;
            }
            if (message.approvals != null && message.hasOwnProperty("approvals")) {
                if (!Array.isArray(message.approvals))
                    return "approvals: array expected";
                for (var i = 0; i < message.approvals.length; ++i) {
                    var error = $root.nft.ActionApprovals.verify(message.approvals[i]);
                    if (error)
                        return "approvals." + error;
                }
            }
            return null;
        };

        /**
         * Creates an IssueTokenMsg message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof blockchain.IssueTokenMsg
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {blockchain.IssueTokenMsg} IssueTokenMsg
         */
        IssueTokenMsg.fromObject = function fromObject(object) {
            if (object instanceof $root.blockchain.IssueTokenMsg)
                return object;
            var message = new $root.blockchain.IssueTokenMsg();
            if (object.owner != null)
                if (typeof object.owner === "string")
                    $util.base64.decode(object.owner, message.owner = $util.newBuffer($util.base64.length(object.owner)), 0);
                else if (object.owner.length)
                    message.owner = object.owner;
            if (object.id != null)
                if (typeof object.id === "string")
                    $util.base64.decode(object.id, message.id = $util.newBuffer($util.base64.length(object.id)), 0);
                else if (object.id.length)
                    message.id = object.id;
            if (object.details != null) {
                if (typeof object.details !== "object")
                    throw TypeError(".blockchain.IssueTokenMsg.details: object expected");
                message.details = $root.blockchain.TokenDetails.fromObject(object.details);
            }
            if (object.approvals) {
                if (!Array.isArray(object.approvals))
                    throw TypeError(".blockchain.IssueTokenMsg.approvals: array expected");
                message.approvals = [];
                for (var i = 0; i < object.approvals.length; ++i) {
                    if (typeof object.approvals[i] !== "object")
                        throw TypeError(".blockchain.IssueTokenMsg.approvals: object expected");
                    message.approvals[i] = $root.nft.ActionApprovals.fromObject(object.approvals[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from an IssueTokenMsg message. Also converts values to other types if specified.
         * @function toObject
         * @memberof blockchain.IssueTokenMsg
         * @static
         * @param {blockchain.IssueTokenMsg} message IssueTokenMsg
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        IssueTokenMsg.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.approvals = [];
            if (options.defaults) {
                if (options.bytes === String)
                    object.owner = "";
                else {
                    object.owner = [];
                    if (options.bytes !== Array)
                        object.owner = $util.newBuffer(object.owner);
                }
                if (options.bytes === String)
                    object.id = "";
                else {
                    object.id = [];
                    if (options.bytes !== Array)
                        object.id = $util.newBuffer(object.id);
                }
                object.details = null;
            }
            if (message.owner != null && message.hasOwnProperty("owner"))
                object.owner = options.bytes === String ? $util.base64.encode(message.owner, 0, message.owner.length) : options.bytes === Array ? Array.prototype.slice.call(message.owner) : message.owner;
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = options.bytes === String ? $util.base64.encode(message.id, 0, message.id.length) : options.bytes === Array ? Array.prototype.slice.call(message.id) : message.id;
            if (message.details != null && message.hasOwnProperty("details"))
                object.details = $root.blockchain.TokenDetails.toObject(message.details, options);
            if (message.approvals && message.approvals.length) {
                object.approvals = [];
                for (var j = 0; j < message.approvals.length; ++j)
                    object.approvals[j] = $root.nft.ActionApprovals.toObject(message.approvals[j], options);
            }
            return object;
        };

        /**
         * Converts this IssueTokenMsg to JSON.
         * @function toJSON
         * @memberof blockchain.IssueTokenMsg
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        IssueTokenMsg.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return IssueTokenMsg;
    })();

    return blockchain;
})();

$root.ticker = (function() {

    /**
     * Namespace ticker.
     * @exports ticker
     * @namespace
     */
    var ticker = {};

    ticker.TickerToken = (function() {

        /**
         * Properties of a TickerToken.
         * @memberof ticker
         * @interface ITickerToken
         * @property {nft.INonFungibleToken|null} [base] TickerToken base
         * @property {ticker.ITokenDetails|null} [details] TickerToken details
         */

        /**
         * Constructs a new TickerToken.
         * @memberof ticker
         * @classdesc Represents a TickerToken.
         * @implements ITickerToken
         * @constructor
         * @param {ticker.ITickerToken=} [properties] Properties to set
         */
        function TickerToken(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TickerToken base.
         * @member {nft.INonFungibleToken|null|undefined} base
         * @memberof ticker.TickerToken
         * @instance
         */
        TickerToken.prototype.base = null;

        /**
         * TickerToken details.
         * @member {ticker.ITokenDetails|null|undefined} details
         * @memberof ticker.TickerToken
         * @instance
         */
        TickerToken.prototype.details = null;

        /**
         * Creates a new TickerToken instance using the specified properties.
         * @function create
         * @memberof ticker.TickerToken
         * @static
         * @param {ticker.ITickerToken=} [properties] Properties to set
         * @returns {ticker.TickerToken} TickerToken instance
         */
        TickerToken.create = function create(properties) {
            return new TickerToken(properties);
        };

        /**
         * Encodes the specified TickerToken message. Does not implicitly {@link ticker.TickerToken.verify|verify} messages.
         * @function encode
         * @memberof ticker.TickerToken
         * @static
         * @param {ticker.ITickerToken} message TickerToken message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TickerToken.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.base != null && message.hasOwnProperty("base"))
                $root.nft.NonFungibleToken.encode(message.base, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.details != null && message.hasOwnProperty("details"))
                $root.ticker.TokenDetails.encode(message.details, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified TickerToken message, length delimited. Does not implicitly {@link ticker.TickerToken.verify|verify} messages.
         * @function encodeDelimited
         * @memberof ticker.TickerToken
         * @static
         * @param {ticker.ITickerToken} message TickerToken message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TickerToken.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TickerToken message from the specified reader or buffer.
         * @function decode
         * @memberof ticker.TickerToken
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {ticker.TickerToken} TickerToken
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TickerToken.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ticker.TickerToken();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.base = $root.nft.NonFungibleToken.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.details = $root.ticker.TokenDetails.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TickerToken message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof ticker.TickerToken
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {ticker.TickerToken} TickerToken
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TickerToken.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TickerToken message.
         * @function verify
         * @memberof ticker.TickerToken
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TickerToken.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.base != null && message.hasOwnProperty("base")) {
                var error = $root.nft.NonFungibleToken.verify(message.base);
                if (error)
                    return "base." + error;
            }
            if (message.details != null && message.hasOwnProperty("details")) {
                var error = $root.ticker.TokenDetails.verify(message.details);
                if (error)
                    return "details." + error;
            }
            return null;
        };

        /**
         * Creates a TickerToken message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof ticker.TickerToken
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {ticker.TickerToken} TickerToken
         */
        TickerToken.fromObject = function fromObject(object) {
            if (object instanceof $root.ticker.TickerToken)
                return object;
            var message = new $root.ticker.TickerToken();
            if (object.base != null) {
                if (typeof object.base !== "object")
                    throw TypeError(".ticker.TickerToken.base: object expected");
                message.base = $root.nft.NonFungibleToken.fromObject(object.base);
            }
            if (object.details != null) {
                if (typeof object.details !== "object")
                    throw TypeError(".ticker.TickerToken.details: object expected");
                message.details = $root.ticker.TokenDetails.fromObject(object.details);
            }
            return message;
        };

        /**
         * Creates a plain object from a TickerToken message. Also converts values to other types if specified.
         * @function toObject
         * @memberof ticker.TickerToken
         * @static
         * @param {ticker.TickerToken} message TickerToken
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TickerToken.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.base = null;
                object.details = null;
            }
            if (message.base != null && message.hasOwnProperty("base"))
                object.base = $root.nft.NonFungibleToken.toObject(message.base, options);
            if (message.details != null && message.hasOwnProperty("details"))
                object.details = $root.ticker.TokenDetails.toObject(message.details, options);
            return object;
        };

        /**
         * Converts this TickerToken to JSON.
         * @function toJSON
         * @memberof ticker.TickerToken
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TickerToken.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return TickerToken;
    })();

    ticker.TokenDetails = (function() {

        /**
         * Properties of a TokenDetails.
         * @memberof ticker
         * @interface ITokenDetails
         * @property {Uint8Array|null} [blockchainID] TokenDetails blockchainID
         */

        /**
         * Constructs a new TokenDetails.
         * @memberof ticker
         * @classdesc Represents a TokenDetails.
         * @implements ITokenDetails
         * @constructor
         * @param {ticker.ITokenDetails=} [properties] Properties to set
         */
        function TokenDetails(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TokenDetails blockchainID.
         * @member {Uint8Array} blockchainID
         * @memberof ticker.TokenDetails
         * @instance
         */
        TokenDetails.prototype.blockchainID = $util.newBuffer([]);

        /**
         * Creates a new TokenDetails instance using the specified properties.
         * @function create
         * @memberof ticker.TokenDetails
         * @static
         * @param {ticker.ITokenDetails=} [properties] Properties to set
         * @returns {ticker.TokenDetails} TokenDetails instance
         */
        TokenDetails.create = function create(properties) {
            return new TokenDetails(properties);
        };

        /**
         * Encodes the specified TokenDetails message. Does not implicitly {@link ticker.TokenDetails.verify|verify} messages.
         * @function encode
         * @memberof ticker.TokenDetails
         * @static
         * @param {ticker.ITokenDetails} message TokenDetails message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TokenDetails.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.blockchainID != null && message.hasOwnProperty("blockchainID"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.blockchainID);
            return writer;
        };

        /**
         * Encodes the specified TokenDetails message, length delimited. Does not implicitly {@link ticker.TokenDetails.verify|verify} messages.
         * @function encodeDelimited
         * @memberof ticker.TokenDetails
         * @static
         * @param {ticker.ITokenDetails} message TokenDetails message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TokenDetails.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TokenDetails message from the specified reader or buffer.
         * @function decode
         * @memberof ticker.TokenDetails
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {ticker.TokenDetails} TokenDetails
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TokenDetails.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ticker.TokenDetails();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.blockchainID = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TokenDetails message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof ticker.TokenDetails
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {ticker.TokenDetails} TokenDetails
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TokenDetails.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TokenDetails message.
         * @function verify
         * @memberof ticker.TokenDetails
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TokenDetails.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.blockchainID != null && message.hasOwnProperty("blockchainID"))
                if (!(message.blockchainID && typeof message.blockchainID.length === "number" || $util.isString(message.blockchainID)))
                    return "blockchainID: buffer expected";
            return null;
        };

        /**
         * Creates a TokenDetails message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof ticker.TokenDetails
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {ticker.TokenDetails} TokenDetails
         */
        TokenDetails.fromObject = function fromObject(object) {
            if (object instanceof $root.ticker.TokenDetails)
                return object;
            var message = new $root.ticker.TokenDetails();
            if (object.blockchainID != null)
                if (typeof object.blockchainID === "string")
                    $util.base64.decode(object.blockchainID, message.blockchainID = $util.newBuffer($util.base64.length(object.blockchainID)), 0);
                else if (object.blockchainID.length)
                    message.blockchainID = object.blockchainID;
            return message;
        };

        /**
         * Creates a plain object from a TokenDetails message. Also converts values to other types if specified.
         * @function toObject
         * @memberof ticker.TokenDetails
         * @static
         * @param {ticker.TokenDetails} message TokenDetails
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TokenDetails.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                if (options.bytes === String)
                    object.blockchainID = "";
                else {
                    object.blockchainID = [];
                    if (options.bytes !== Array)
                        object.blockchainID = $util.newBuffer(object.blockchainID);
                }
            if (message.blockchainID != null && message.hasOwnProperty("blockchainID"))
                object.blockchainID = options.bytes === String ? $util.base64.encode(message.blockchainID, 0, message.blockchainID.length) : options.bytes === Array ? Array.prototype.slice.call(message.blockchainID) : message.blockchainID;
            return object;
        };

        /**
         * Converts this TokenDetails to JSON.
         * @function toJSON
         * @memberof ticker.TokenDetails
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TokenDetails.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return TokenDetails;
    })();

    ticker.IssueTokenMsg = (function() {

        /**
         * Properties of an IssueTokenMsg.
         * @memberof ticker
         * @interface IIssueTokenMsg
         * @property {Uint8Array|null} [owner] IssueTokenMsg owner
         * @property {Uint8Array|null} [id] IssueTokenMsg id
         * @property {ticker.ITokenDetails|null} [details] IssueTokenMsg details
         * @property {Array.<nft.IActionApprovals>|null} [approvals] IssueTokenMsg approvals
         */

        /**
         * Constructs a new IssueTokenMsg.
         * @memberof ticker
         * @classdesc Represents an IssueTokenMsg.
         * @implements IIssueTokenMsg
         * @constructor
         * @param {ticker.IIssueTokenMsg=} [properties] Properties to set
         */
        function IssueTokenMsg(properties) {
            this.approvals = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * IssueTokenMsg owner.
         * @member {Uint8Array} owner
         * @memberof ticker.IssueTokenMsg
         * @instance
         */
        IssueTokenMsg.prototype.owner = $util.newBuffer([]);

        /**
         * IssueTokenMsg id.
         * @member {Uint8Array} id
         * @memberof ticker.IssueTokenMsg
         * @instance
         */
        IssueTokenMsg.prototype.id = $util.newBuffer([]);

        /**
         * IssueTokenMsg details.
         * @member {ticker.ITokenDetails|null|undefined} details
         * @memberof ticker.IssueTokenMsg
         * @instance
         */
        IssueTokenMsg.prototype.details = null;

        /**
         * IssueTokenMsg approvals.
         * @member {Array.<nft.IActionApprovals>} approvals
         * @memberof ticker.IssueTokenMsg
         * @instance
         */
        IssueTokenMsg.prototype.approvals = $util.emptyArray;

        /**
         * Creates a new IssueTokenMsg instance using the specified properties.
         * @function create
         * @memberof ticker.IssueTokenMsg
         * @static
         * @param {ticker.IIssueTokenMsg=} [properties] Properties to set
         * @returns {ticker.IssueTokenMsg} IssueTokenMsg instance
         */
        IssueTokenMsg.create = function create(properties) {
            return new IssueTokenMsg(properties);
        };

        /**
         * Encodes the specified IssueTokenMsg message. Does not implicitly {@link ticker.IssueTokenMsg.verify|verify} messages.
         * @function encode
         * @memberof ticker.IssueTokenMsg
         * @static
         * @param {ticker.IIssueTokenMsg} message IssueTokenMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        IssueTokenMsg.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.owner != null && message.hasOwnProperty("owner"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.owner);
            if (message.id != null && message.hasOwnProperty("id"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.id);
            if (message.details != null && message.hasOwnProperty("details"))
                $root.ticker.TokenDetails.encode(message.details, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.approvals != null && message.approvals.length)
                for (var i = 0; i < message.approvals.length; ++i)
                    $root.nft.ActionApprovals.encode(message.approvals[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified IssueTokenMsg message, length delimited. Does not implicitly {@link ticker.IssueTokenMsg.verify|verify} messages.
         * @function encodeDelimited
         * @memberof ticker.IssueTokenMsg
         * @static
         * @param {ticker.IIssueTokenMsg} message IssueTokenMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        IssueTokenMsg.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an IssueTokenMsg message from the specified reader or buffer.
         * @function decode
         * @memberof ticker.IssueTokenMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {ticker.IssueTokenMsg} IssueTokenMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        IssueTokenMsg.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ticker.IssueTokenMsg();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.owner = reader.bytes();
                    break;
                case 2:
                    message.id = reader.bytes();
                    break;
                case 3:
                    message.details = $root.ticker.TokenDetails.decode(reader, reader.uint32());
                    break;
                case 4:
                    if (!(message.approvals && message.approvals.length))
                        message.approvals = [];
                    message.approvals.push($root.nft.ActionApprovals.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an IssueTokenMsg message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof ticker.IssueTokenMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {ticker.IssueTokenMsg} IssueTokenMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        IssueTokenMsg.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an IssueTokenMsg message.
         * @function verify
         * @memberof ticker.IssueTokenMsg
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        IssueTokenMsg.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.owner != null && message.hasOwnProperty("owner"))
                if (!(message.owner && typeof message.owner.length === "number" || $util.isString(message.owner)))
                    return "owner: buffer expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!(message.id && typeof message.id.length === "number" || $util.isString(message.id)))
                    return "id: buffer expected";
            if (message.details != null && message.hasOwnProperty("details")) {
                var error = $root.ticker.TokenDetails.verify(message.details);
                if (error)
                    return "details." + error;
            }
            if (message.approvals != null && message.hasOwnProperty("approvals")) {
                if (!Array.isArray(message.approvals))
                    return "approvals: array expected";
                for (var i = 0; i < message.approvals.length; ++i) {
                    var error = $root.nft.ActionApprovals.verify(message.approvals[i]);
                    if (error)
                        return "approvals." + error;
                }
            }
            return null;
        };

        /**
         * Creates an IssueTokenMsg message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof ticker.IssueTokenMsg
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {ticker.IssueTokenMsg} IssueTokenMsg
         */
        IssueTokenMsg.fromObject = function fromObject(object) {
            if (object instanceof $root.ticker.IssueTokenMsg)
                return object;
            var message = new $root.ticker.IssueTokenMsg();
            if (object.owner != null)
                if (typeof object.owner === "string")
                    $util.base64.decode(object.owner, message.owner = $util.newBuffer($util.base64.length(object.owner)), 0);
                else if (object.owner.length)
                    message.owner = object.owner;
            if (object.id != null)
                if (typeof object.id === "string")
                    $util.base64.decode(object.id, message.id = $util.newBuffer($util.base64.length(object.id)), 0);
                else if (object.id.length)
                    message.id = object.id;
            if (object.details != null) {
                if (typeof object.details !== "object")
                    throw TypeError(".ticker.IssueTokenMsg.details: object expected");
                message.details = $root.ticker.TokenDetails.fromObject(object.details);
            }
            if (object.approvals) {
                if (!Array.isArray(object.approvals))
                    throw TypeError(".ticker.IssueTokenMsg.approvals: array expected");
                message.approvals = [];
                for (var i = 0; i < object.approvals.length; ++i) {
                    if (typeof object.approvals[i] !== "object")
                        throw TypeError(".ticker.IssueTokenMsg.approvals: object expected");
                    message.approvals[i] = $root.nft.ActionApprovals.fromObject(object.approvals[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from an IssueTokenMsg message. Also converts values to other types if specified.
         * @function toObject
         * @memberof ticker.IssueTokenMsg
         * @static
         * @param {ticker.IssueTokenMsg} message IssueTokenMsg
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        IssueTokenMsg.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.approvals = [];
            if (options.defaults) {
                if (options.bytes === String)
                    object.owner = "";
                else {
                    object.owner = [];
                    if (options.bytes !== Array)
                        object.owner = $util.newBuffer(object.owner);
                }
                if (options.bytes === String)
                    object.id = "";
                else {
                    object.id = [];
                    if (options.bytes !== Array)
                        object.id = $util.newBuffer(object.id);
                }
                object.details = null;
            }
            if (message.owner != null && message.hasOwnProperty("owner"))
                object.owner = options.bytes === String ? $util.base64.encode(message.owner, 0, message.owner.length) : options.bytes === Array ? Array.prototype.slice.call(message.owner) : message.owner;
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = options.bytes === String ? $util.base64.encode(message.id, 0, message.id.length) : options.bytes === Array ? Array.prototype.slice.call(message.id) : message.id;
            if (message.details != null && message.hasOwnProperty("details"))
                object.details = $root.ticker.TokenDetails.toObject(message.details, options);
            if (message.approvals && message.approvals.length) {
                object.approvals = [];
                for (var j = 0; j < message.approvals.length; ++j)
                    object.approvals[j] = $root.nft.ActionApprovals.toObject(message.approvals[j], options);
            }
            return object;
        };

        /**
         * Converts this IssueTokenMsg to JSON.
         * @function toJSON
         * @memberof ticker.IssueTokenMsg
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        IssueTokenMsg.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return IssueTokenMsg;
    })();

    return ticker;
})();

$root.bootstrap_node = (function() {

    /**
     * Namespace bootstrap_node.
     * @exports bootstrap_node
     * @namespace
     */
    var bootstrap_node = {};

    bootstrap_node.BootstrapNodeToken = (function() {

        /**
         * Properties of a BootstrapNodeToken.
         * @memberof bootstrap_node
         * @interface IBootstrapNodeToken
         * @property {nft.INonFungibleToken|null} [base] BootstrapNodeToken base
         * @property {bootstrap_node.ITokenDetails|null} [details] BootstrapNodeToken details
         */

        /**
         * Constructs a new BootstrapNodeToken.
         * @memberof bootstrap_node
         * @classdesc Represents a BootstrapNodeToken.
         * @implements IBootstrapNodeToken
         * @constructor
         * @param {bootstrap_node.IBootstrapNodeToken=} [properties] Properties to set
         */
        function BootstrapNodeToken(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * BootstrapNodeToken base.
         * @member {nft.INonFungibleToken|null|undefined} base
         * @memberof bootstrap_node.BootstrapNodeToken
         * @instance
         */
        BootstrapNodeToken.prototype.base = null;

        /**
         * BootstrapNodeToken details.
         * @member {bootstrap_node.ITokenDetails|null|undefined} details
         * @memberof bootstrap_node.BootstrapNodeToken
         * @instance
         */
        BootstrapNodeToken.prototype.details = null;

        /**
         * Creates a new BootstrapNodeToken instance using the specified properties.
         * @function create
         * @memberof bootstrap_node.BootstrapNodeToken
         * @static
         * @param {bootstrap_node.IBootstrapNodeToken=} [properties] Properties to set
         * @returns {bootstrap_node.BootstrapNodeToken} BootstrapNodeToken instance
         */
        BootstrapNodeToken.create = function create(properties) {
            return new BootstrapNodeToken(properties);
        };

        /**
         * Encodes the specified BootstrapNodeToken message. Does not implicitly {@link bootstrap_node.BootstrapNodeToken.verify|verify} messages.
         * @function encode
         * @memberof bootstrap_node.BootstrapNodeToken
         * @static
         * @param {bootstrap_node.IBootstrapNodeToken} message BootstrapNodeToken message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BootstrapNodeToken.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.base != null && message.hasOwnProperty("base"))
                $root.nft.NonFungibleToken.encode(message.base, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.details != null && message.hasOwnProperty("details"))
                $root.bootstrap_node.TokenDetails.encode(message.details, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified BootstrapNodeToken message, length delimited. Does not implicitly {@link bootstrap_node.BootstrapNodeToken.verify|verify} messages.
         * @function encodeDelimited
         * @memberof bootstrap_node.BootstrapNodeToken
         * @static
         * @param {bootstrap_node.IBootstrapNodeToken} message BootstrapNodeToken message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BootstrapNodeToken.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a BootstrapNodeToken message from the specified reader or buffer.
         * @function decode
         * @memberof bootstrap_node.BootstrapNodeToken
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {bootstrap_node.BootstrapNodeToken} BootstrapNodeToken
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BootstrapNodeToken.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.bootstrap_node.BootstrapNodeToken();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.base = $root.nft.NonFungibleToken.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.details = $root.bootstrap_node.TokenDetails.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a BootstrapNodeToken message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof bootstrap_node.BootstrapNodeToken
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {bootstrap_node.BootstrapNodeToken} BootstrapNodeToken
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BootstrapNodeToken.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a BootstrapNodeToken message.
         * @function verify
         * @memberof bootstrap_node.BootstrapNodeToken
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        BootstrapNodeToken.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.base != null && message.hasOwnProperty("base")) {
                var error = $root.nft.NonFungibleToken.verify(message.base);
                if (error)
                    return "base." + error;
            }
            if (message.details != null && message.hasOwnProperty("details")) {
                var error = $root.bootstrap_node.TokenDetails.verify(message.details);
                if (error)
                    return "details." + error;
            }
            return null;
        };

        /**
         * Creates a BootstrapNodeToken message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof bootstrap_node.BootstrapNodeToken
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {bootstrap_node.BootstrapNodeToken} BootstrapNodeToken
         */
        BootstrapNodeToken.fromObject = function fromObject(object) {
            if (object instanceof $root.bootstrap_node.BootstrapNodeToken)
                return object;
            var message = new $root.bootstrap_node.BootstrapNodeToken();
            if (object.base != null) {
                if (typeof object.base !== "object")
                    throw TypeError(".bootstrap_node.BootstrapNodeToken.base: object expected");
                message.base = $root.nft.NonFungibleToken.fromObject(object.base);
            }
            if (object.details != null) {
                if (typeof object.details !== "object")
                    throw TypeError(".bootstrap_node.BootstrapNodeToken.details: object expected");
                message.details = $root.bootstrap_node.TokenDetails.fromObject(object.details);
            }
            return message;
        };

        /**
         * Creates a plain object from a BootstrapNodeToken message. Also converts values to other types if specified.
         * @function toObject
         * @memberof bootstrap_node.BootstrapNodeToken
         * @static
         * @param {bootstrap_node.BootstrapNodeToken} message BootstrapNodeToken
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        BootstrapNodeToken.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.base = null;
                object.details = null;
            }
            if (message.base != null && message.hasOwnProperty("base"))
                object.base = $root.nft.NonFungibleToken.toObject(message.base, options);
            if (message.details != null && message.hasOwnProperty("details"))
                object.details = $root.bootstrap_node.TokenDetails.toObject(message.details, options);
            return object;
        };

        /**
         * Converts this BootstrapNodeToken to JSON.
         * @function toJSON
         * @memberof bootstrap_node.BootstrapNodeToken
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        BootstrapNodeToken.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return BootstrapNodeToken;
    })();

    bootstrap_node.TokenDetails = (function() {

        /**
         * Properties of a TokenDetails.
         * @memberof bootstrap_node
         * @interface ITokenDetails
         * @property {Uint8Array|null} [blockchainID] TokenDetails blockchainID
         * @property {bootstrap_node.IURI|null} [uri] TokenDetails uri
         */

        /**
         * Constructs a new TokenDetails.
         * @memberof bootstrap_node
         * @classdesc Represents a TokenDetails.
         * @implements ITokenDetails
         * @constructor
         * @param {bootstrap_node.ITokenDetails=} [properties] Properties to set
         */
        function TokenDetails(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TokenDetails blockchainID.
         * @member {Uint8Array} blockchainID
         * @memberof bootstrap_node.TokenDetails
         * @instance
         */
        TokenDetails.prototype.blockchainID = $util.newBuffer([]);

        /**
         * TokenDetails uri.
         * @member {bootstrap_node.IURI|null|undefined} uri
         * @memberof bootstrap_node.TokenDetails
         * @instance
         */
        TokenDetails.prototype.uri = null;

        /**
         * Creates a new TokenDetails instance using the specified properties.
         * @function create
         * @memberof bootstrap_node.TokenDetails
         * @static
         * @param {bootstrap_node.ITokenDetails=} [properties] Properties to set
         * @returns {bootstrap_node.TokenDetails} TokenDetails instance
         */
        TokenDetails.create = function create(properties) {
            return new TokenDetails(properties);
        };

        /**
         * Encodes the specified TokenDetails message. Does not implicitly {@link bootstrap_node.TokenDetails.verify|verify} messages.
         * @function encode
         * @memberof bootstrap_node.TokenDetails
         * @static
         * @param {bootstrap_node.ITokenDetails} message TokenDetails message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TokenDetails.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.blockchainID != null && message.hasOwnProperty("blockchainID"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.blockchainID);
            if (message.uri != null && message.hasOwnProperty("uri"))
                $root.bootstrap_node.URI.encode(message.uri, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified TokenDetails message, length delimited. Does not implicitly {@link bootstrap_node.TokenDetails.verify|verify} messages.
         * @function encodeDelimited
         * @memberof bootstrap_node.TokenDetails
         * @static
         * @param {bootstrap_node.ITokenDetails} message TokenDetails message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TokenDetails.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TokenDetails message from the specified reader or buffer.
         * @function decode
         * @memberof bootstrap_node.TokenDetails
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {bootstrap_node.TokenDetails} TokenDetails
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TokenDetails.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.bootstrap_node.TokenDetails();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.blockchainID = reader.bytes();
                    break;
                case 2:
                    message.uri = $root.bootstrap_node.URI.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TokenDetails message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof bootstrap_node.TokenDetails
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {bootstrap_node.TokenDetails} TokenDetails
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TokenDetails.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TokenDetails message.
         * @function verify
         * @memberof bootstrap_node.TokenDetails
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TokenDetails.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.blockchainID != null && message.hasOwnProperty("blockchainID"))
                if (!(message.blockchainID && typeof message.blockchainID.length === "number" || $util.isString(message.blockchainID)))
                    return "blockchainID: buffer expected";
            if (message.uri != null && message.hasOwnProperty("uri")) {
                var error = $root.bootstrap_node.URI.verify(message.uri);
                if (error)
                    return "uri." + error;
            }
            return null;
        };

        /**
         * Creates a TokenDetails message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof bootstrap_node.TokenDetails
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {bootstrap_node.TokenDetails} TokenDetails
         */
        TokenDetails.fromObject = function fromObject(object) {
            if (object instanceof $root.bootstrap_node.TokenDetails)
                return object;
            var message = new $root.bootstrap_node.TokenDetails();
            if (object.blockchainID != null)
                if (typeof object.blockchainID === "string")
                    $util.base64.decode(object.blockchainID, message.blockchainID = $util.newBuffer($util.base64.length(object.blockchainID)), 0);
                else if (object.blockchainID.length)
                    message.blockchainID = object.blockchainID;
            if (object.uri != null) {
                if (typeof object.uri !== "object")
                    throw TypeError(".bootstrap_node.TokenDetails.uri: object expected");
                message.uri = $root.bootstrap_node.URI.fromObject(object.uri);
            }
            return message;
        };

        /**
         * Creates a plain object from a TokenDetails message. Also converts values to other types if specified.
         * @function toObject
         * @memberof bootstrap_node.TokenDetails
         * @static
         * @param {bootstrap_node.TokenDetails} message TokenDetails
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TokenDetails.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.blockchainID = "";
                else {
                    object.blockchainID = [];
                    if (options.bytes !== Array)
                        object.blockchainID = $util.newBuffer(object.blockchainID);
                }
                object.uri = null;
            }
            if (message.blockchainID != null && message.hasOwnProperty("blockchainID"))
                object.blockchainID = options.bytes === String ? $util.base64.encode(message.blockchainID, 0, message.blockchainID.length) : options.bytes === Array ? Array.prototype.slice.call(message.blockchainID) : message.blockchainID;
            if (message.uri != null && message.hasOwnProperty("uri"))
                object.uri = $root.bootstrap_node.URI.toObject(message.uri, options);
            return object;
        };

        /**
         * Converts this TokenDetails to JSON.
         * @function toJSON
         * @memberof bootstrap_node.TokenDetails
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TokenDetails.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return TokenDetails;
    })();

    bootstrap_node.URI = (function() {

        /**
         * Properties of a URI.
         * @memberof bootstrap_node
         * @interface IURI
         * @property {string|null} [host] URI host
         * @property {number|null} [port] URI port
         * @property {string|null} [protocol] URI protocol
         * @property {string|null} [pubKey] URI pubKey
         */

        /**
         * Constructs a new URI.
         * @memberof bootstrap_node
         * @classdesc Represents a URI.
         * @implements IURI
         * @constructor
         * @param {bootstrap_node.IURI=} [properties] Properties to set
         */
        function URI(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * URI host.
         * @member {string} host
         * @memberof bootstrap_node.URI
         * @instance
         */
        URI.prototype.host = "";

        /**
         * URI port.
         * @member {number} port
         * @memberof bootstrap_node.URI
         * @instance
         */
        URI.prototype.port = 0;

        /**
         * URI protocol.
         * @member {string} protocol
         * @memberof bootstrap_node.URI
         * @instance
         */
        URI.prototype.protocol = "";

        /**
         * URI pubKey.
         * @member {string} pubKey
         * @memberof bootstrap_node.URI
         * @instance
         */
        URI.prototype.pubKey = "";

        /**
         * Creates a new URI instance using the specified properties.
         * @function create
         * @memberof bootstrap_node.URI
         * @static
         * @param {bootstrap_node.IURI=} [properties] Properties to set
         * @returns {bootstrap_node.URI} URI instance
         */
        URI.create = function create(properties) {
            return new URI(properties);
        };

        /**
         * Encodes the specified URI message. Does not implicitly {@link bootstrap_node.URI.verify|verify} messages.
         * @function encode
         * @memberof bootstrap_node.URI
         * @static
         * @param {bootstrap_node.IURI} message URI message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        URI.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.host != null && message.hasOwnProperty("host"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.host);
            if (message.port != null && message.hasOwnProperty("port"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.port);
            if (message.protocol != null && message.hasOwnProperty("protocol"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.protocol);
            if (message.pubKey != null && message.hasOwnProperty("pubKey"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.pubKey);
            return writer;
        };

        /**
         * Encodes the specified URI message, length delimited. Does not implicitly {@link bootstrap_node.URI.verify|verify} messages.
         * @function encodeDelimited
         * @memberof bootstrap_node.URI
         * @static
         * @param {bootstrap_node.IURI} message URI message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        URI.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a URI message from the specified reader or buffer.
         * @function decode
         * @memberof bootstrap_node.URI
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {bootstrap_node.URI} URI
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        URI.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.bootstrap_node.URI();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.host = reader.string();
                    break;
                case 2:
                    message.port = reader.int32();
                    break;
                case 3:
                    message.protocol = reader.string();
                    break;
                case 4:
                    message.pubKey = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a URI message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof bootstrap_node.URI
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {bootstrap_node.URI} URI
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        URI.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a URI message.
         * @function verify
         * @memberof bootstrap_node.URI
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        URI.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.host != null && message.hasOwnProperty("host"))
                if (!$util.isString(message.host))
                    return "host: string expected";
            if (message.port != null && message.hasOwnProperty("port"))
                if (!$util.isInteger(message.port))
                    return "port: integer expected";
            if (message.protocol != null && message.hasOwnProperty("protocol"))
                if (!$util.isString(message.protocol))
                    return "protocol: string expected";
            if (message.pubKey != null && message.hasOwnProperty("pubKey"))
                if (!$util.isString(message.pubKey))
                    return "pubKey: string expected";
            return null;
        };

        /**
         * Creates a URI message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof bootstrap_node.URI
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {bootstrap_node.URI} URI
         */
        URI.fromObject = function fromObject(object) {
            if (object instanceof $root.bootstrap_node.URI)
                return object;
            var message = new $root.bootstrap_node.URI();
            if (object.host != null)
                message.host = String(object.host);
            if (object.port != null)
                message.port = object.port | 0;
            if (object.protocol != null)
                message.protocol = String(object.protocol);
            if (object.pubKey != null)
                message.pubKey = String(object.pubKey);
            return message;
        };

        /**
         * Creates a plain object from a URI message. Also converts values to other types if specified.
         * @function toObject
         * @memberof bootstrap_node.URI
         * @static
         * @param {bootstrap_node.URI} message URI
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        URI.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.host = "";
                object.port = 0;
                object.protocol = "";
                object.pubKey = "";
            }
            if (message.host != null && message.hasOwnProperty("host"))
                object.host = message.host;
            if (message.port != null && message.hasOwnProperty("port"))
                object.port = message.port;
            if (message.protocol != null && message.hasOwnProperty("protocol"))
                object.protocol = message.protocol;
            if (message.pubKey != null && message.hasOwnProperty("pubKey"))
                object.pubKey = message.pubKey;
            return object;
        };

        /**
         * Converts this URI to JSON.
         * @function toJSON
         * @memberof bootstrap_node.URI
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        URI.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return URI;
    })();

    bootstrap_node.IssueTokenMsg = (function() {

        /**
         * Properties of an IssueTokenMsg.
         * @memberof bootstrap_node
         * @interface IIssueTokenMsg
         * @property {Uint8Array|null} [owner] IssueTokenMsg owner
         * @property {Uint8Array|null} [id] IssueTokenMsg id
         * @property {bootstrap_node.ITokenDetails|null} [details] IssueTokenMsg details
         * @property {Array.<nft.IActionApprovals>|null} [approvals] IssueTokenMsg approvals
         */

        /**
         * Constructs a new IssueTokenMsg.
         * @memberof bootstrap_node
         * @classdesc Represents an IssueTokenMsg.
         * @implements IIssueTokenMsg
         * @constructor
         * @param {bootstrap_node.IIssueTokenMsg=} [properties] Properties to set
         */
        function IssueTokenMsg(properties) {
            this.approvals = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * IssueTokenMsg owner.
         * @member {Uint8Array} owner
         * @memberof bootstrap_node.IssueTokenMsg
         * @instance
         */
        IssueTokenMsg.prototype.owner = $util.newBuffer([]);

        /**
         * IssueTokenMsg id.
         * @member {Uint8Array} id
         * @memberof bootstrap_node.IssueTokenMsg
         * @instance
         */
        IssueTokenMsg.prototype.id = $util.newBuffer([]);

        /**
         * IssueTokenMsg details.
         * @member {bootstrap_node.ITokenDetails|null|undefined} details
         * @memberof bootstrap_node.IssueTokenMsg
         * @instance
         */
        IssueTokenMsg.prototype.details = null;

        /**
         * IssueTokenMsg approvals.
         * @member {Array.<nft.IActionApprovals>} approvals
         * @memberof bootstrap_node.IssueTokenMsg
         * @instance
         */
        IssueTokenMsg.prototype.approvals = $util.emptyArray;

        /**
         * Creates a new IssueTokenMsg instance using the specified properties.
         * @function create
         * @memberof bootstrap_node.IssueTokenMsg
         * @static
         * @param {bootstrap_node.IIssueTokenMsg=} [properties] Properties to set
         * @returns {bootstrap_node.IssueTokenMsg} IssueTokenMsg instance
         */
        IssueTokenMsg.create = function create(properties) {
            return new IssueTokenMsg(properties);
        };

        /**
         * Encodes the specified IssueTokenMsg message. Does not implicitly {@link bootstrap_node.IssueTokenMsg.verify|verify} messages.
         * @function encode
         * @memberof bootstrap_node.IssueTokenMsg
         * @static
         * @param {bootstrap_node.IIssueTokenMsg} message IssueTokenMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        IssueTokenMsg.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.owner != null && message.hasOwnProperty("owner"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.owner);
            if (message.id != null && message.hasOwnProperty("id"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.id);
            if (message.details != null && message.hasOwnProperty("details"))
                $root.bootstrap_node.TokenDetails.encode(message.details, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.approvals != null && message.approvals.length)
                for (var i = 0; i < message.approvals.length; ++i)
                    $root.nft.ActionApprovals.encode(message.approvals[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified IssueTokenMsg message, length delimited. Does not implicitly {@link bootstrap_node.IssueTokenMsg.verify|verify} messages.
         * @function encodeDelimited
         * @memberof bootstrap_node.IssueTokenMsg
         * @static
         * @param {bootstrap_node.IIssueTokenMsg} message IssueTokenMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        IssueTokenMsg.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an IssueTokenMsg message from the specified reader or buffer.
         * @function decode
         * @memberof bootstrap_node.IssueTokenMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {bootstrap_node.IssueTokenMsg} IssueTokenMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        IssueTokenMsg.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.bootstrap_node.IssueTokenMsg();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.owner = reader.bytes();
                    break;
                case 2:
                    message.id = reader.bytes();
                    break;
                case 3:
                    message.details = $root.bootstrap_node.TokenDetails.decode(reader, reader.uint32());
                    break;
                case 4:
                    if (!(message.approvals && message.approvals.length))
                        message.approvals = [];
                    message.approvals.push($root.nft.ActionApprovals.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an IssueTokenMsg message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof bootstrap_node.IssueTokenMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {bootstrap_node.IssueTokenMsg} IssueTokenMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        IssueTokenMsg.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an IssueTokenMsg message.
         * @function verify
         * @memberof bootstrap_node.IssueTokenMsg
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        IssueTokenMsg.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.owner != null && message.hasOwnProperty("owner"))
                if (!(message.owner && typeof message.owner.length === "number" || $util.isString(message.owner)))
                    return "owner: buffer expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!(message.id && typeof message.id.length === "number" || $util.isString(message.id)))
                    return "id: buffer expected";
            if (message.details != null && message.hasOwnProperty("details")) {
                var error = $root.bootstrap_node.TokenDetails.verify(message.details);
                if (error)
                    return "details." + error;
            }
            if (message.approvals != null && message.hasOwnProperty("approvals")) {
                if (!Array.isArray(message.approvals))
                    return "approvals: array expected";
                for (var i = 0; i < message.approvals.length; ++i) {
                    var error = $root.nft.ActionApprovals.verify(message.approvals[i]);
                    if (error)
                        return "approvals." + error;
                }
            }
            return null;
        };

        /**
         * Creates an IssueTokenMsg message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof bootstrap_node.IssueTokenMsg
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {bootstrap_node.IssueTokenMsg} IssueTokenMsg
         */
        IssueTokenMsg.fromObject = function fromObject(object) {
            if (object instanceof $root.bootstrap_node.IssueTokenMsg)
                return object;
            var message = new $root.bootstrap_node.IssueTokenMsg();
            if (object.owner != null)
                if (typeof object.owner === "string")
                    $util.base64.decode(object.owner, message.owner = $util.newBuffer($util.base64.length(object.owner)), 0);
                else if (object.owner.length)
                    message.owner = object.owner;
            if (object.id != null)
                if (typeof object.id === "string")
                    $util.base64.decode(object.id, message.id = $util.newBuffer($util.base64.length(object.id)), 0);
                else if (object.id.length)
                    message.id = object.id;
            if (object.details != null) {
                if (typeof object.details !== "object")
                    throw TypeError(".bootstrap_node.IssueTokenMsg.details: object expected");
                message.details = $root.bootstrap_node.TokenDetails.fromObject(object.details);
            }
            if (object.approvals) {
                if (!Array.isArray(object.approvals))
                    throw TypeError(".bootstrap_node.IssueTokenMsg.approvals: array expected");
                message.approvals = [];
                for (var i = 0; i < object.approvals.length; ++i) {
                    if (typeof object.approvals[i] !== "object")
                        throw TypeError(".bootstrap_node.IssueTokenMsg.approvals: object expected");
                    message.approvals[i] = $root.nft.ActionApprovals.fromObject(object.approvals[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from an IssueTokenMsg message. Also converts values to other types if specified.
         * @function toObject
         * @memberof bootstrap_node.IssueTokenMsg
         * @static
         * @param {bootstrap_node.IssueTokenMsg} message IssueTokenMsg
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        IssueTokenMsg.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.approvals = [];
            if (options.defaults) {
                if (options.bytes === String)
                    object.owner = "";
                else {
                    object.owner = [];
                    if (options.bytes !== Array)
                        object.owner = $util.newBuffer(object.owner);
                }
                if (options.bytes === String)
                    object.id = "";
                else {
                    object.id = [];
                    if (options.bytes !== Array)
                        object.id = $util.newBuffer(object.id);
                }
                object.details = null;
            }
            if (message.owner != null && message.hasOwnProperty("owner"))
                object.owner = options.bytes === String ? $util.base64.encode(message.owner, 0, message.owner.length) : options.bytes === Array ? Array.prototype.slice.call(message.owner) : message.owner;
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = options.bytes === String ? $util.base64.encode(message.id, 0, message.id.length) : options.bytes === Array ? Array.prototype.slice.call(message.id) : message.id;
            if (message.details != null && message.hasOwnProperty("details"))
                object.details = $root.bootstrap_node.TokenDetails.toObject(message.details, options);
            if (message.approvals && message.approvals.length) {
                object.approvals = [];
                for (var j = 0; j < message.approvals.length; ++j)
                    object.approvals[j] = $root.nft.ActionApprovals.toObject(message.approvals[j], options);
            }
            return object;
        };

        /**
         * Converts this IssueTokenMsg to JSON.
         * @function toJSON
         * @memberof bootstrap_node.IssueTokenMsg
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        IssueTokenMsg.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return IssueTokenMsg;
    })();

    return bootstrap_node;
})();

$root.nft = (function() {

    /**
     * Namespace nft.
     * @exports nft
     * @namespace
     */
    var nft = {};

    nft.NonFungibleToken = (function() {

        /**
         * Properties of a NonFungibleToken.
         * @memberof nft
         * @interface INonFungibleToken
         * @property {Uint8Array|null} [id] NonFungibleToken id
         * @property {Uint8Array|null} [owner] NonFungibleToken owner
         * @property {Array.<nft.IActionApprovals>|null} [actionApprovals] NonFungibleToken actionApprovals
         */

        /**
         * Constructs a new NonFungibleToken.
         * @memberof nft
         * @classdesc Represents a NonFungibleToken.
         * @implements INonFungibleToken
         * @constructor
         * @param {nft.INonFungibleToken=} [properties] Properties to set
         */
        function NonFungibleToken(properties) {
            this.actionApprovals = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * NonFungibleToken id.
         * @member {Uint8Array} id
         * @memberof nft.NonFungibleToken
         * @instance
         */
        NonFungibleToken.prototype.id = $util.newBuffer([]);

        /**
         * NonFungibleToken owner.
         * @member {Uint8Array} owner
         * @memberof nft.NonFungibleToken
         * @instance
         */
        NonFungibleToken.prototype.owner = $util.newBuffer([]);

        /**
         * NonFungibleToken actionApprovals.
         * @member {Array.<nft.IActionApprovals>} actionApprovals
         * @memberof nft.NonFungibleToken
         * @instance
         */
        NonFungibleToken.prototype.actionApprovals = $util.emptyArray;

        /**
         * Creates a new NonFungibleToken instance using the specified properties.
         * @function create
         * @memberof nft.NonFungibleToken
         * @static
         * @param {nft.INonFungibleToken=} [properties] Properties to set
         * @returns {nft.NonFungibleToken} NonFungibleToken instance
         */
        NonFungibleToken.create = function create(properties) {
            return new NonFungibleToken(properties);
        };

        /**
         * Encodes the specified NonFungibleToken message. Does not implicitly {@link nft.NonFungibleToken.verify|verify} messages.
         * @function encode
         * @memberof nft.NonFungibleToken
         * @static
         * @param {nft.INonFungibleToken} message NonFungibleToken message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        NonFungibleToken.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && message.hasOwnProperty("id"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.id);
            if (message.owner != null && message.hasOwnProperty("owner"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.owner);
            if (message.actionApprovals != null && message.actionApprovals.length)
                for (var i = 0; i < message.actionApprovals.length; ++i)
                    $root.nft.ActionApprovals.encode(message.actionApprovals[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified NonFungibleToken message, length delimited. Does not implicitly {@link nft.NonFungibleToken.verify|verify} messages.
         * @function encodeDelimited
         * @memberof nft.NonFungibleToken
         * @static
         * @param {nft.INonFungibleToken} message NonFungibleToken message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        NonFungibleToken.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a NonFungibleToken message from the specified reader or buffer.
         * @function decode
         * @memberof nft.NonFungibleToken
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {nft.NonFungibleToken} NonFungibleToken
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        NonFungibleToken.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.nft.NonFungibleToken();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.id = reader.bytes();
                    break;
                case 2:
                    message.owner = reader.bytes();
                    break;
                case 3:
                    if (!(message.actionApprovals && message.actionApprovals.length))
                        message.actionApprovals = [];
                    message.actionApprovals.push($root.nft.ActionApprovals.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a NonFungibleToken message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof nft.NonFungibleToken
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {nft.NonFungibleToken} NonFungibleToken
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        NonFungibleToken.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a NonFungibleToken message.
         * @function verify
         * @memberof nft.NonFungibleToken
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        NonFungibleToken.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!(message.id && typeof message.id.length === "number" || $util.isString(message.id)))
                    return "id: buffer expected";
            if (message.owner != null && message.hasOwnProperty("owner"))
                if (!(message.owner && typeof message.owner.length === "number" || $util.isString(message.owner)))
                    return "owner: buffer expected";
            if (message.actionApprovals != null && message.hasOwnProperty("actionApprovals")) {
                if (!Array.isArray(message.actionApprovals))
                    return "actionApprovals: array expected";
                for (var i = 0; i < message.actionApprovals.length; ++i) {
                    var error = $root.nft.ActionApprovals.verify(message.actionApprovals[i]);
                    if (error)
                        return "actionApprovals." + error;
                }
            }
            return null;
        };

        /**
         * Creates a NonFungibleToken message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof nft.NonFungibleToken
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {nft.NonFungibleToken} NonFungibleToken
         */
        NonFungibleToken.fromObject = function fromObject(object) {
            if (object instanceof $root.nft.NonFungibleToken)
                return object;
            var message = new $root.nft.NonFungibleToken();
            if (object.id != null)
                if (typeof object.id === "string")
                    $util.base64.decode(object.id, message.id = $util.newBuffer($util.base64.length(object.id)), 0);
                else if (object.id.length)
                    message.id = object.id;
            if (object.owner != null)
                if (typeof object.owner === "string")
                    $util.base64.decode(object.owner, message.owner = $util.newBuffer($util.base64.length(object.owner)), 0);
                else if (object.owner.length)
                    message.owner = object.owner;
            if (object.actionApprovals) {
                if (!Array.isArray(object.actionApprovals))
                    throw TypeError(".nft.NonFungibleToken.actionApprovals: array expected");
                message.actionApprovals = [];
                for (var i = 0; i < object.actionApprovals.length; ++i) {
                    if (typeof object.actionApprovals[i] !== "object")
                        throw TypeError(".nft.NonFungibleToken.actionApprovals: object expected");
                    message.actionApprovals[i] = $root.nft.ActionApprovals.fromObject(object.actionApprovals[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a NonFungibleToken message. Also converts values to other types if specified.
         * @function toObject
         * @memberof nft.NonFungibleToken
         * @static
         * @param {nft.NonFungibleToken} message NonFungibleToken
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        NonFungibleToken.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.actionApprovals = [];
            if (options.defaults) {
                if (options.bytes === String)
                    object.id = "";
                else {
                    object.id = [];
                    if (options.bytes !== Array)
                        object.id = $util.newBuffer(object.id);
                }
                if (options.bytes === String)
                    object.owner = "";
                else {
                    object.owner = [];
                    if (options.bytes !== Array)
                        object.owner = $util.newBuffer(object.owner);
                }
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = options.bytes === String ? $util.base64.encode(message.id, 0, message.id.length) : options.bytes === Array ? Array.prototype.slice.call(message.id) : message.id;
            if (message.owner != null && message.hasOwnProperty("owner"))
                object.owner = options.bytes === String ? $util.base64.encode(message.owner, 0, message.owner.length) : options.bytes === Array ? Array.prototype.slice.call(message.owner) : message.owner;
            if (message.actionApprovals && message.actionApprovals.length) {
                object.actionApprovals = [];
                for (var j = 0; j < message.actionApprovals.length; ++j)
                    object.actionApprovals[j] = $root.nft.ActionApprovals.toObject(message.actionApprovals[j], options);
            }
            return object;
        };

        /**
         * Converts this NonFungibleToken to JSON.
         * @function toJSON
         * @memberof nft.NonFungibleToken
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        NonFungibleToken.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return NonFungibleToken;
    })();

    nft.ActionApprovals = (function() {

        /**
         * Properties of an ActionApprovals.
         * @memberof nft
         * @interface IActionApprovals
         * @property {string|null} [action] ActionApprovals action
         * @property {Array.<nft.IApproval>|null} [approvals] ActionApprovals approvals
         */

        /**
         * Constructs a new ActionApprovals.
         * @memberof nft
         * @classdesc Represents an ActionApprovals.
         * @implements IActionApprovals
         * @constructor
         * @param {nft.IActionApprovals=} [properties] Properties to set
         */
        function ActionApprovals(properties) {
            this.approvals = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ActionApprovals action.
         * @member {string} action
         * @memberof nft.ActionApprovals
         * @instance
         */
        ActionApprovals.prototype.action = "";

        /**
         * ActionApprovals approvals.
         * @member {Array.<nft.IApproval>} approvals
         * @memberof nft.ActionApprovals
         * @instance
         */
        ActionApprovals.prototype.approvals = $util.emptyArray;

        /**
         * Creates a new ActionApprovals instance using the specified properties.
         * @function create
         * @memberof nft.ActionApprovals
         * @static
         * @param {nft.IActionApprovals=} [properties] Properties to set
         * @returns {nft.ActionApprovals} ActionApprovals instance
         */
        ActionApprovals.create = function create(properties) {
            return new ActionApprovals(properties);
        };

        /**
         * Encodes the specified ActionApprovals message. Does not implicitly {@link nft.ActionApprovals.verify|verify} messages.
         * @function encode
         * @memberof nft.ActionApprovals
         * @static
         * @param {nft.IActionApprovals} message ActionApprovals message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ActionApprovals.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.action != null && message.hasOwnProperty("action"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.action);
            if (message.approvals != null && message.approvals.length)
                for (var i = 0; i < message.approvals.length; ++i)
                    $root.nft.Approval.encode(message.approvals[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified ActionApprovals message, length delimited. Does not implicitly {@link nft.ActionApprovals.verify|verify} messages.
         * @function encodeDelimited
         * @memberof nft.ActionApprovals
         * @static
         * @param {nft.IActionApprovals} message ActionApprovals message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ActionApprovals.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an ActionApprovals message from the specified reader or buffer.
         * @function decode
         * @memberof nft.ActionApprovals
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {nft.ActionApprovals} ActionApprovals
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ActionApprovals.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.nft.ActionApprovals();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.action = reader.string();
                    break;
                case 2:
                    if (!(message.approvals && message.approvals.length))
                        message.approvals = [];
                    message.approvals.push($root.nft.Approval.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an ActionApprovals message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof nft.ActionApprovals
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {nft.ActionApprovals} ActionApprovals
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ActionApprovals.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an ActionApprovals message.
         * @function verify
         * @memberof nft.ActionApprovals
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ActionApprovals.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.action != null && message.hasOwnProperty("action"))
                if (!$util.isString(message.action))
                    return "action: string expected";
            if (message.approvals != null && message.hasOwnProperty("approvals")) {
                if (!Array.isArray(message.approvals))
                    return "approvals: array expected";
                for (var i = 0; i < message.approvals.length; ++i) {
                    var error = $root.nft.Approval.verify(message.approvals[i]);
                    if (error)
                        return "approvals." + error;
                }
            }
            return null;
        };

        /**
         * Creates an ActionApprovals message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof nft.ActionApprovals
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {nft.ActionApprovals} ActionApprovals
         */
        ActionApprovals.fromObject = function fromObject(object) {
            if (object instanceof $root.nft.ActionApprovals)
                return object;
            var message = new $root.nft.ActionApprovals();
            if (object.action != null)
                message.action = String(object.action);
            if (object.approvals) {
                if (!Array.isArray(object.approvals))
                    throw TypeError(".nft.ActionApprovals.approvals: array expected");
                message.approvals = [];
                for (var i = 0; i < object.approvals.length; ++i) {
                    if (typeof object.approvals[i] !== "object")
                        throw TypeError(".nft.ActionApprovals.approvals: object expected");
                    message.approvals[i] = $root.nft.Approval.fromObject(object.approvals[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from an ActionApprovals message. Also converts values to other types if specified.
         * @function toObject
         * @memberof nft.ActionApprovals
         * @static
         * @param {nft.ActionApprovals} message ActionApprovals
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ActionApprovals.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.approvals = [];
            if (options.defaults)
                object.action = "";
            if (message.action != null && message.hasOwnProperty("action"))
                object.action = message.action;
            if (message.approvals && message.approvals.length) {
                object.approvals = [];
                for (var j = 0; j < message.approvals.length; ++j)
                    object.approvals[j] = $root.nft.Approval.toObject(message.approvals[j], options);
            }
            return object;
        };

        /**
         * Converts this ActionApprovals to JSON.
         * @function toJSON
         * @memberof nft.ActionApprovals
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ActionApprovals.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return ActionApprovals;
    })();

    nft.Approval = (function() {

        /**
         * Properties of an Approval.
         * @memberof nft
         * @interface IApproval
         * @property {Uint8Array|null} [address] Approval address
         * @property {nft.IApprovalOptions|null} [options] Approval options
         */

        /**
         * Constructs a new Approval.
         * @memberof nft
         * @classdesc Represents an Approval.
         * @implements IApproval
         * @constructor
         * @param {nft.IApproval=} [properties] Properties to set
         */
        function Approval(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Approval address.
         * @member {Uint8Array} address
         * @memberof nft.Approval
         * @instance
         */
        Approval.prototype.address = $util.newBuffer([]);

        /**
         * Approval options.
         * @member {nft.IApprovalOptions|null|undefined} options
         * @memberof nft.Approval
         * @instance
         */
        Approval.prototype.options = null;

        /**
         * Creates a new Approval instance using the specified properties.
         * @function create
         * @memberof nft.Approval
         * @static
         * @param {nft.IApproval=} [properties] Properties to set
         * @returns {nft.Approval} Approval instance
         */
        Approval.create = function create(properties) {
            return new Approval(properties);
        };

        /**
         * Encodes the specified Approval message. Does not implicitly {@link nft.Approval.verify|verify} messages.
         * @function encode
         * @memberof nft.Approval
         * @static
         * @param {nft.IApproval} message Approval message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Approval.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.address != null && message.hasOwnProperty("address"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.address);
            if (message.options != null && message.hasOwnProperty("options"))
                $root.nft.ApprovalOptions.encode(message.options, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Approval message, length delimited. Does not implicitly {@link nft.Approval.verify|verify} messages.
         * @function encodeDelimited
         * @memberof nft.Approval
         * @static
         * @param {nft.IApproval} message Approval message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Approval.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Approval message from the specified reader or buffer.
         * @function decode
         * @memberof nft.Approval
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {nft.Approval} Approval
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Approval.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.nft.Approval();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.address = reader.bytes();
                    break;
                case 2:
                    message.options = $root.nft.ApprovalOptions.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Approval message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof nft.Approval
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {nft.Approval} Approval
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Approval.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Approval message.
         * @function verify
         * @memberof nft.Approval
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Approval.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.address != null && message.hasOwnProperty("address"))
                if (!(message.address && typeof message.address.length === "number" || $util.isString(message.address)))
                    return "address: buffer expected";
            if (message.options != null && message.hasOwnProperty("options")) {
                var error = $root.nft.ApprovalOptions.verify(message.options);
                if (error)
                    return "options." + error;
            }
            return null;
        };

        /**
         * Creates an Approval message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof nft.Approval
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {nft.Approval} Approval
         */
        Approval.fromObject = function fromObject(object) {
            if (object instanceof $root.nft.Approval)
                return object;
            var message = new $root.nft.Approval();
            if (object.address != null)
                if (typeof object.address === "string")
                    $util.base64.decode(object.address, message.address = $util.newBuffer($util.base64.length(object.address)), 0);
                else if (object.address.length)
                    message.address = object.address;
            if (object.options != null) {
                if (typeof object.options !== "object")
                    throw TypeError(".nft.Approval.options: object expected");
                message.options = $root.nft.ApprovalOptions.fromObject(object.options);
            }
            return message;
        };

        /**
         * Creates a plain object from an Approval message. Also converts values to other types if specified.
         * @function toObject
         * @memberof nft.Approval
         * @static
         * @param {nft.Approval} message Approval
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Approval.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.address = "";
                else {
                    object.address = [];
                    if (options.bytes !== Array)
                        object.address = $util.newBuffer(object.address);
                }
                object.options = null;
            }
            if (message.address != null && message.hasOwnProperty("address"))
                object.address = options.bytes === String ? $util.base64.encode(message.address, 0, message.address.length) : options.bytes === Array ? Array.prototype.slice.call(message.address) : message.address;
            if (message.options != null && message.hasOwnProperty("options"))
                object.options = $root.nft.ApprovalOptions.toObject(message.options, options);
            return object;
        };

        /**
         * Converts this Approval to JSON.
         * @function toJSON
         * @memberof nft.Approval
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Approval.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Approval;
    })();

    nft.ApprovalOptions = (function() {

        /**
         * Properties of an ApprovalOptions.
         * @memberof nft
         * @interface IApprovalOptions
         * @property {number|Long|null} [untilBlockHeight] ApprovalOptions untilBlockHeight
         * @property {number|Long|null} [count] ApprovalOptions count
         * @property {boolean|null} [immutable] ApprovalOptions immutable
         */

        /**
         * Constructs a new ApprovalOptions.
         * @memberof nft
         * @classdesc Represents an ApprovalOptions.
         * @implements IApprovalOptions
         * @constructor
         * @param {nft.IApprovalOptions=} [properties] Properties to set
         */
        function ApprovalOptions(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ApprovalOptions untilBlockHeight.
         * @member {number|Long} untilBlockHeight
         * @memberof nft.ApprovalOptions
         * @instance
         */
        ApprovalOptions.prototype.untilBlockHeight = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * ApprovalOptions count.
         * @member {number|Long} count
         * @memberof nft.ApprovalOptions
         * @instance
         */
        ApprovalOptions.prototype.count = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * ApprovalOptions immutable.
         * @member {boolean} immutable
         * @memberof nft.ApprovalOptions
         * @instance
         */
        ApprovalOptions.prototype.immutable = false;

        /**
         * Creates a new ApprovalOptions instance using the specified properties.
         * @function create
         * @memberof nft.ApprovalOptions
         * @static
         * @param {nft.IApprovalOptions=} [properties] Properties to set
         * @returns {nft.ApprovalOptions} ApprovalOptions instance
         */
        ApprovalOptions.create = function create(properties) {
            return new ApprovalOptions(properties);
        };

        /**
         * Encodes the specified ApprovalOptions message. Does not implicitly {@link nft.ApprovalOptions.verify|verify} messages.
         * @function encode
         * @memberof nft.ApprovalOptions
         * @static
         * @param {nft.IApprovalOptions} message ApprovalOptions message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ApprovalOptions.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.untilBlockHeight != null && message.hasOwnProperty("untilBlockHeight"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.untilBlockHeight);
            if (message.count != null && message.hasOwnProperty("count"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.count);
            if (message.immutable != null && message.hasOwnProperty("immutable"))
                writer.uint32(/* id 3, wireType 0 =*/24).bool(message.immutable);
            return writer;
        };

        /**
         * Encodes the specified ApprovalOptions message, length delimited. Does not implicitly {@link nft.ApprovalOptions.verify|verify} messages.
         * @function encodeDelimited
         * @memberof nft.ApprovalOptions
         * @static
         * @param {nft.IApprovalOptions} message ApprovalOptions message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ApprovalOptions.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an ApprovalOptions message from the specified reader or buffer.
         * @function decode
         * @memberof nft.ApprovalOptions
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {nft.ApprovalOptions} ApprovalOptions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ApprovalOptions.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.nft.ApprovalOptions();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.untilBlockHeight = reader.int64();
                    break;
                case 2:
                    message.count = reader.int64();
                    break;
                case 3:
                    message.immutable = reader.bool();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an ApprovalOptions message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof nft.ApprovalOptions
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {nft.ApprovalOptions} ApprovalOptions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ApprovalOptions.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an ApprovalOptions message.
         * @function verify
         * @memberof nft.ApprovalOptions
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ApprovalOptions.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.untilBlockHeight != null && message.hasOwnProperty("untilBlockHeight"))
                if (!$util.isInteger(message.untilBlockHeight) && !(message.untilBlockHeight && $util.isInteger(message.untilBlockHeight.low) && $util.isInteger(message.untilBlockHeight.high)))
                    return "untilBlockHeight: integer|Long expected";
            if (message.count != null && message.hasOwnProperty("count"))
                if (!$util.isInteger(message.count) && !(message.count && $util.isInteger(message.count.low) && $util.isInteger(message.count.high)))
                    return "count: integer|Long expected";
            if (message.immutable != null && message.hasOwnProperty("immutable"))
                if (typeof message.immutable !== "boolean")
                    return "immutable: boolean expected";
            return null;
        };

        /**
         * Creates an ApprovalOptions message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof nft.ApprovalOptions
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {nft.ApprovalOptions} ApprovalOptions
         */
        ApprovalOptions.fromObject = function fromObject(object) {
            if (object instanceof $root.nft.ApprovalOptions)
                return object;
            var message = new $root.nft.ApprovalOptions();
            if (object.untilBlockHeight != null)
                if ($util.Long)
                    (message.untilBlockHeight = $util.Long.fromValue(object.untilBlockHeight)).unsigned = false;
                else if (typeof object.untilBlockHeight === "string")
                    message.untilBlockHeight = parseInt(object.untilBlockHeight, 10);
                else if (typeof object.untilBlockHeight === "number")
                    message.untilBlockHeight = object.untilBlockHeight;
                else if (typeof object.untilBlockHeight === "object")
                    message.untilBlockHeight = new $util.LongBits(object.untilBlockHeight.low >>> 0, object.untilBlockHeight.high >>> 0).toNumber();
            if (object.count != null)
                if ($util.Long)
                    (message.count = $util.Long.fromValue(object.count)).unsigned = false;
                else if (typeof object.count === "string")
                    message.count = parseInt(object.count, 10);
                else if (typeof object.count === "number")
                    message.count = object.count;
                else if (typeof object.count === "object")
                    message.count = new $util.LongBits(object.count.low >>> 0, object.count.high >>> 0).toNumber();
            if (object.immutable != null)
                message.immutable = Boolean(object.immutable);
            return message;
        };

        /**
         * Creates a plain object from an ApprovalOptions message. Also converts values to other types if specified.
         * @function toObject
         * @memberof nft.ApprovalOptions
         * @static
         * @param {nft.ApprovalOptions} message ApprovalOptions
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ApprovalOptions.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.untilBlockHeight = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.untilBlockHeight = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.count = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.count = options.longs === String ? "0" : 0;
                object.immutable = false;
            }
            if (message.untilBlockHeight != null && message.hasOwnProperty("untilBlockHeight"))
                if (typeof message.untilBlockHeight === "number")
                    object.untilBlockHeight = options.longs === String ? String(message.untilBlockHeight) : message.untilBlockHeight;
                else
                    object.untilBlockHeight = options.longs === String ? $util.Long.prototype.toString.call(message.untilBlockHeight) : options.longs === Number ? new $util.LongBits(message.untilBlockHeight.low >>> 0, message.untilBlockHeight.high >>> 0).toNumber() : message.untilBlockHeight;
            if (message.count != null && message.hasOwnProperty("count"))
                if (typeof message.count === "number")
                    object.count = options.longs === String ? String(message.count) : message.count;
                else
                    object.count = options.longs === String ? $util.Long.prototype.toString.call(message.count) : options.longs === Number ? new $util.LongBits(message.count.low >>> 0, message.count.high >>> 0).toNumber() : message.count;
            if (message.immutable != null && message.hasOwnProperty("immutable"))
                object.immutable = message.immutable;
            return object;
        };

        /**
         * Converts this ApprovalOptions to JSON.
         * @function toJSON
         * @memberof nft.ApprovalOptions
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ApprovalOptions.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return ApprovalOptions;
    })();

    nft.AddApprovalMsg = (function() {

        /**
         * Properties of an AddApprovalMsg.
         * @memberof nft
         * @interface IAddApprovalMsg
         * @property {Uint8Array|null} [id] AddApprovalMsg id
         * @property {Uint8Array|null} [address] AddApprovalMsg address
         * @property {string|null} [action] AddApprovalMsg action
         * @property {nft.IApprovalOptions|null} [options] AddApprovalMsg options
         * @property {string|null} [t] AddApprovalMsg t
         */

        /**
         * Constructs a new AddApprovalMsg.
         * @memberof nft
         * @classdesc Represents an AddApprovalMsg.
         * @implements IAddApprovalMsg
         * @constructor
         * @param {nft.IAddApprovalMsg=} [properties] Properties to set
         */
        function AddApprovalMsg(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * AddApprovalMsg id.
         * @member {Uint8Array} id
         * @memberof nft.AddApprovalMsg
         * @instance
         */
        AddApprovalMsg.prototype.id = $util.newBuffer([]);

        /**
         * AddApprovalMsg address.
         * @member {Uint8Array} address
         * @memberof nft.AddApprovalMsg
         * @instance
         */
        AddApprovalMsg.prototype.address = $util.newBuffer([]);

        /**
         * AddApprovalMsg action.
         * @member {string} action
         * @memberof nft.AddApprovalMsg
         * @instance
         */
        AddApprovalMsg.prototype.action = "";

        /**
         * AddApprovalMsg options.
         * @member {nft.IApprovalOptions|null|undefined} options
         * @memberof nft.AddApprovalMsg
         * @instance
         */
        AddApprovalMsg.prototype.options = null;

        /**
         * AddApprovalMsg t.
         * @member {string} t
         * @memberof nft.AddApprovalMsg
         * @instance
         */
        AddApprovalMsg.prototype.t = "";

        /**
         * Creates a new AddApprovalMsg instance using the specified properties.
         * @function create
         * @memberof nft.AddApprovalMsg
         * @static
         * @param {nft.IAddApprovalMsg=} [properties] Properties to set
         * @returns {nft.AddApprovalMsg} AddApprovalMsg instance
         */
        AddApprovalMsg.create = function create(properties) {
            return new AddApprovalMsg(properties);
        };

        /**
         * Encodes the specified AddApprovalMsg message. Does not implicitly {@link nft.AddApprovalMsg.verify|verify} messages.
         * @function encode
         * @memberof nft.AddApprovalMsg
         * @static
         * @param {nft.IAddApprovalMsg} message AddApprovalMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AddApprovalMsg.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && message.hasOwnProperty("id"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.id);
            if (message.address != null && message.hasOwnProperty("address"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.address);
            if (message.action != null && message.hasOwnProperty("action"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.action);
            if (message.options != null && message.hasOwnProperty("options"))
                $root.nft.ApprovalOptions.encode(message.options, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.t != null && message.hasOwnProperty("t"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.t);
            return writer;
        };

        /**
         * Encodes the specified AddApprovalMsg message, length delimited. Does not implicitly {@link nft.AddApprovalMsg.verify|verify} messages.
         * @function encodeDelimited
         * @memberof nft.AddApprovalMsg
         * @static
         * @param {nft.IAddApprovalMsg} message AddApprovalMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AddApprovalMsg.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an AddApprovalMsg message from the specified reader or buffer.
         * @function decode
         * @memberof nft.AddApprovalMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {nft.AddApprovalMsg} AddApprovalMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AddApprovalMsg.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.nft.AddApprovalMsg();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.id = reader.bytes();
                    break;
                case 2:
                    message.address = reader.bytes();
                    break;
                case 3:
                    message.action = reader.string();
                    break;
                case 4:
                    message.options = $root.nft.ApprovalOptions.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.t = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an AddApprovalMsg message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof nft.AddApprovalMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {nft.AddApprovalMsg} AddApprovalMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AddApprovalMsg.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an AddApprovalMsg message.
         * @function verify
         * @memberof nft.AddApprovalMsg
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        AddApprovalMsg.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!(message.id && typeof message.id.length === "number" || $util.isString(message.id)))
                    return "id: buffer expected";
            if (message.address != null && message.hasOwnProperty("address"))
                if (!(message.address && typeof message.address.length === "number" || $util.isString(message.address)))
                    return "address: buffer expected";
            if (message.action != null && message.hasOwnProperty("action"))
                if (!$util.isString(message.action))
                    return "action: string expected";
            if (message.options != null && message.hasOwnProperty("options")) {
                var error = $root.nft.ApprovalOptions.verify(message.options);
                if (error)
                    return "options." + error;
            }
            if (message.t != null && message.hasOwnProperty("t"))
                if (!$util.isString(message.t))
                    return "t: string expected";
            return null;
        };

        /**
         * Creates an AddApprovalMsg message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof nft.AddApprovalMsg
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {nft.AddApprovalMsg} AddApprovalMsg
         */
        AddApprovalMsg.fromObject = function fromObject(object) {
            if (object instanceof $root.nft.AddApprovalMsg)
                return object;
            var message = new $root.nft.AddApprovalMsg();
            if (object.id != null)
                if (typeof object.id === "string")
                    $util.base64.decode(object.id, message.id = $util.newBuffer($util.base64.length(object.id)), 0);
                else if (object.id.length)
                    message.id = object.id;
            if (object.address != null)
                if (typeof object.address === "string")
                    $util.base64.decode(object.address, message.address = $util.newBuffer($util.base64.length(object.address)), 0);
                else if (object.address.length)
                    message.address = object.address;
            if (object.action != null)
                message.action = String(object.action);
            if (object.options != null) {
                if (typeof object.options !== "object")
                    throw TypeError(".nft.AddApprovalMsg.options: object expected");
                message.options = $root.nft.ApprovalOptions.fromObject(object.options);
            }
            if (object.t != null)
                message.t = String(object.t);
            return message;
        };

        /**
         * Creates a plain object from an AddApprovalMsg message. Also converts values to other types if specified.
         * @function toObject
         * @memberof nft.AddApprovalMsg
         * @static
         * @param {nft.AddApprovalMsg} message AddApprovalMsg
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        AddApprovalMsg.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.id = "";
                else {
                    object.id = [];
                    if (options.bytes !== Array)
                        object.id = $util.newBuffer(object.id);
                }
                if (options.bytes === String)
                    object.address = "";
                else {
                    object.address = [];
                    if (options.bytes !== Array)
                        object.address = $util.newBuffer(object.address);
                }
                object.action = "";
                object.options = null;
                object.t = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = options.bytes === String ? $util.base64.encode(message.id, 0, message.id.length) : options.bytes === Array ? Array.prototype.slice.call(message.id) : message.id;
            if (message.address != null && message.hasOwnProperty("address"))
                object.address = options.bytes === String ? $util.base64.encode(message.address, 0, message.address.length) : options.bytes === Array ? Array.prototype.slice.call(message.address) : message.address;
            if (message.action != null && message.hasOwnProperty("action"))
                object.action = message.action;
            if (message.options != null && message.hasOwnProperty("options"))
                object.options = $root.nft.ApprovalOptions.toObject(message.options, options);
            if (message.t != null && message.hasOwnProperty("t"))
                object.t = message.t;
            return object;
        };

        /**
         * Converts this AddApprovalMsg to JSON.
         * @function toJSON
         * @memberof nft.AddApprovalMsg
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        AddApprovalMsg.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return AddApprovalMsg;
    })();

    nft.RemoveApprovalMsg = (function() {

        /**
         * Properties of a RemoveApprovalMsg.
         * @memberof nft
         * @interface IRemoveApprovalMsg
         * @property {Uint8Array|null} [id] RemoveApprovalMsg id
         * @property {Uint8Array|null} [address] RemoveApprovalMsg address
         * @property {string|null} [action] RemoveApprovalMsg action
         * @property {string|null} [t] RemoveApprovalMsg t
         */

        /**
         * Constructs a new RemoveApprovalMsg.
         * @memberof nft
         * @classdesc Represents a RemoveApprovalMsg.
         * @implements IRemoveApprovalMsg
         * @constructor
         * @param {nft.IRemoveApprovalMsg=} [properties] Properties to set
         */
        function RemoveApprovalMsg(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RemoveApprovalMsg id.
         * @member {Uint8Array} id
         * @memberof nft.RemoveApprovalMsg
         * @instance
         */
        RemoveApprovalMsg.prototype.id = $util.newBuffer([]);

        /**
         * RemoveApprovalMsg address.
         * @member {Uint8Array} address
         * @memberof nft.RemoveApprovalMsg
         * @instance
         */
        RemoveApprovalMsg.prototype.address = $util.newBuffer([]);

        /**
         * RemoveApprovalMsg action.
         * @member {string} action
         * @memberof nft.RemoveApprovalMsg
         * @instance
         */
        RemoveApprovalMsg.prototype.action = "";

        /**
         * RemoveApprovalMsg t.
         * @member {string} t
         * @memberof nft.RemoveApprovalMsg
         * @instance
         */
        RemoveApprovalMsg.prototype.t = "";

        /**
         * Creates a new RemoveApprovalMsg instance using the specified properties.
         * @function create
         * @memberof nft.RemoveApprovalMsg
         * @static
         * @param {nft.IRemoveApprovalMsg=} [properties] Properties to set
         * @returns {nft.RemoveApprovalMsg} RemoveApprovalMsg instance
         */
        RemoveApprovalMsg.create = function create(properties) {
            return new RemoveApprovalMsg(properties);
        };

        /**
         * Encodes the specified RemoveApprovalMsg message. Does not implicitly {@link nft.RemoveApprovalMsg.verify|verify} messages.
         * @function encode
         * @memberof nft.RemoveApprovalMsg
         * @static
         * @param {nft.IRemoveApprovalMsg} message RemoveApprovalMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RemoveApprovalMsg.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && message.hasOwnProperty("id"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.id);
            if (message.address != null && message.hasOwnProperty("address"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.address);
            if (message.action != null && message.hasOwnProperty("action"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.action);
            if (message.t != null && message.hasOwnProperty("t"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.t);
            return writer;
        };

        /**
         * Encodes the specified RemoveApprovalMsg message, length delimited. Does not implicitly {@link nft.RemoveApprovalMsg.verify|verify} messages.
         * @function encodeDelimited
         * @memberof nft.RemoveApprovalMsg
         * @static
         * @param {nft.IRemoveApprovalMsg} message RemoveApprovalMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RemoveApprovalMsg.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RemoveApprovalMsg message from the specified reader or buffer.
         * @function decode
         * @memberof nft.RemoveApprovalMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {nft.RemoveApprovalMsg} RemoveApprovalMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RemoveApprovalMsg.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.nft.RemoveApprovalMsg();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.id = reader.bytes();
                    break;
                case 2:
                    message.address = reader.bytes();
                    break;
                case 3:
                    message.action = reader.string();
                    break;
                case 4:
                    message.t = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a RemoveApprovalMsg message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof nft.RemoveApprovalMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {nft.RemoveApprovalMsg} RemoveApprovalMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RemoveApprovalMsg.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RemoveApprovalMsg message.
         * @function verify
         * @memberof nft.RemoveApprovalMsg
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RemoveApprovalMsg.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!(message.id && typeof message.id.length === "number" || $util.isString(message.id)))
                    return "id: buffer expected";
            if (message.address != null && message.hasOwnProperty("address"))
                if (!(message.address && typeof message.address.length === "number" || $util.isString(message.address)))
                    return "address: buffer expected";
            if (message.action != null && message.hasOwnProperty("action"))
                if (!$util.isString(message.action))
                    return "action: string expected";
            if (message.t != null && message.hasOwnProperty("t"))
                if (!$util.isString(message.t))
                    return "t: string expected";
            return null;
        };

        /**
         * Creates a RemoveApprovalMsg message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof nft.RemoveApprovalMsg
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {nft.RemoveApprovalMsg} RemoveApprovalMsg
         */
        RemoveApprovalMsg.fromObject = function fromObject(object) {
            if (object instanceof $root.nft.RemoveApprovalMsg)
                return object;
            var message = new $root.nft.RemoveApprovalMsg();
            if (object.id != null)
                if (typeof object.id === "string")
                    $util.base64.decode(object.id, message.id = $util.newBuffer($util.base64.length(object.id)), 0);
                else if (object.id.length)
                    message.id = object.id;
            if (object.address != null)
                if (typeof object.address === "string")
                    $util.base64.decode(object.address, message.address = $util.newBuffer($util.base64.length(object.address)), 0);
                else if (object.address.length)
                    message.address = object.address;
            if (object.action != null)
                message.action = String(object.action);
            if (object.t != null)
                message.t = String(object.t);
            return message;
        };

        /**
         * Creates a plain object from a RemoveApprovalMsg message. Also converts values to other types if specified.
         * @function toObject
         * @memberof nft.RemoveApprovalMsg
         * @static
         * @param {nft.RemoveApprovalMsg} message RemoveApprovalMsg
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RemoveApprovalMsg.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.id = "";
                else {
                    object.id = [];
                    if (options.bytes !== Array)
                        object.id = $util.newBuffer(object.id);
                }
                if (options.bytes === String)
                    object.address = "";
                else {
                    object.address = [];
                    if (options.bytes !== Array)
                        object.address = $util.newBuffer(object.address);
                }
                object.action = "";
                object.t = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = options.bytes === String ? $util.base64.encode(message.id, 0, message.id.length) : options.bytes === Array ? Array.prototype.slice.call(message.id) : message.id;
            if (message.address != null && message.hasOwnProperty("address"))
                object.address = options.bytes === String ? $util.base64.encode(message.address, 0, message.address.length) : options.bytes === Array ? Array.prototype.slice.call(message.address) : message.address;
            if (message.action != null && message.hasOwnProperty("action"))
                object.action = message.action;
            if (message.t != null && message.hasOwnProperty("t"))
                object.t = message.t;
            return object;
        };

        /**
         * Converts this RemoveApprovalMsg to JSON.
         * @function toJSON
         * @memberof nft.RemoveApprovalMsg
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RemoveApprovalMsg.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return RemoveApprovalMsg;
    })();

    /**
     * Action enum.
     * @name nft.Action
     * @enum {string}
     * @property {number} ActionUpdateDetails=0 ActionUpdateDetails value
     * @property {number} ActionTransfer=1 ActionTransfer value
     * @property {number} ActionUpdateApprovals=2 ActionUpdateApprovals value
     */
    nft.Action = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "ActionUpdateDetails"] = 0;
        values[valuesById[1] = "ActionTransfer"] = 1;
        values[valuesById[2] = "ActionUpdateApprovals"] = 2;
        return values;
    })();

    return nft;
})();

$root.username = (function() {

    /**
     * Namespace username.
     * @exports username
     * @namespace
     */
    var username = {};

    username.UsernameToken = (function() {

        /**
         * Properties of a UsernameToken.
         * @memberof username
         * @interface IUsernameToken
         * @property {nft.INonFungibleToken|null} [base] UsernameToken base
         * @property {username.ITokenDetails|null} [details] UsernameToken details
         */

        /**
         * Constructs a new UsernameToken.
         * @memberof username
         * @classdesc Represents a UsernameToken.
         * @implements IUsernameToken
         * @constructor
         * @param {username.IUsernameToken=} [properties] Properties to set
         */
        function UsernameToken(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * UsernameToken base.
         * @member {nft.INonFungibleToken|null|undefined} base
         * @memberof username.UsernameToken
         * @instance
         */
        UsernameToken.prototype.base = null;

        /**
         * UsernameToken details.
         * @member {username.ITokenDetails|null|undefined} details
         * @memberof username.UsernameToken
         * @instance
         */
        UsernameToken.prototype.details = null;

        /**
         * Creates a new UsernameToken instance using the specified properties.
         * @function create
         * @memberof username.UsernameToken
         * @static
         * @param {username.IUsernameToken=} [properties] Properties to set
         * @returns {username.UsernameToken} UsernameToken instance
         */
        UsernameToken.create = function create(properties) {
            return new UsernameToken(properties);
        };

        /**
         * Encodes the specified UsernameToken message. Does not implicitly {@link username.UsernameToken.verify|verify} messages.
         * @function encode
         * @memberof username.UsernameToken
         * @static
         * @param {username.IUsernameToken} message UsernameToken message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UsernameToken.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.base != null && message.hasOwnProperty("base"))
                $root.nft.NonFungibleToken.encode(message.base, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.details != null && message.hasOwnProperty("details"))
                $root.username.TokenDetails.encode(message.details, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified UsernameToken message, length delimited. Does not implicitly {@link username.UsernameToken.verify|verify} messages.
         * @function encodeDelimited
         * @memberof username.UsernameToken
         * @static
         * @param {username.IUsernameToken} message UsernameToken message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UsernameToken.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a UsernameToken message from the specified reader or buffer.
         * @function decode
         * @memberof username.UsernameToken
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {username.UsernameToken} UsernameToken
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UsernameToken.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.username.UsernameToken();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.base = $root.nft.NonFungibleToken.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.details = $root.username.TokenDetails.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a UsernameToken message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof username.UsernameToken
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {username.UsernameToken} UsernameToken
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UsernameToken.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a UsernameToken message.
         * @function verify
         * @memberof username.UsernameToken
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        UsernameToken.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.base != null && message.hasOwnProperty("base")) {
                var error = $root.nft.NonFungibleToken.verify(message.base);
                if (error)
                    return "base." + error;
            }
            if (message.details != null && message.hasOwnProperty("details")) {
                var error = $root.username.TokenDetails.verify(message.details);
                if (error)
                    return "details." + error;
            }
            return null;
        };

        /**
         * Creates a UsernameToken message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof username.UsernameToken
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {username.UsernameToken} UsernameToken
         */
        UsernameToken.fromObject = function fromObject(object) {
            if (object instanceof $root.username.UsernameToken)
                return object;
            var message = new $root.username.UsernameToken();
            if (object.base != null) {
                if (typeof object.base !== "object")
                    throw TypeError(".username.UsernameToken.base: object expected");
                message.base = $root.nft.NonFungibleToken.fromObject(object.base);
            }
            if (object.details != null) {
                if (typeof object.details !== "object")
                    throw TypeError(".username.UsernameToken.details: object expected");
                message.details = $root.username.TokenDetails.fromObject(object.details);
            }
            return message;
        };

        /**
         * Creates a plain object from a UsernameToken message. Also converts values to other types if specified.
         * @function toObject
         * @memberof username.UsernameToken
         * @static
         * @param {username.UsernameToken} message UsernameToken
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        UsernameToken.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.base = null;
                object.details = null;
            }
            if (message.base != null && message.hasOwnProperty("base"))
                object.base = $root.nft.NonFungibleToken.toObject(message.base, options);
            if (message.details != null && message.hasOwnProperty("details"))
                object.details = $root.username.TokenDetails.toObject(message.details, options);
            return object;
        };

        /**
         * Converts this UsernameToken to JSON.
         * @function toJSON
         * @memberof username.UsernameToken
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        UsernameToken.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return UsernameToken;
    })();

    username.TokenDetails = (function() {

        /**
         * Properties of a TokenDetails.
         * @memberof username
         * @interface ITokenDetails
         * @property {Array.<username.IChainAddress>|null} [addresses] TokenDetails addresses
         */

        /**
         * Constructs a new TokenDetails.
         * @memberof username
         * @classdesc Represents a TokenDetails.
         * @implements ITokenDetails
         * @constructor
         * @param {username.ITokenDetails=} [properties] Properties to set
         */
        function TokenDetails(properties) {
            this.addresses = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TokenDetails addresses.
         * @member {Array.<username.IChainAddress>} addresses
         * @memberof username.TokenDetails
         * @instance
         */
        TokenDetails.prototype.addresses = $util.emptyArray;

        /**
         * Creates a new TokenDetails instance using the specified properties.
         * @function create
         * @memberof username.TokenDetails
         * @static
         * @param {username.ITokenDetails=} [properties] Properties to set
         * @returns {username.TokenDetails} TokenDetails instance
         */
        TokenDetails.create = function create(properties) {
            return new TokenDetails(properties);
        };

        /**
         * Encodes the specified TokenDetails message. Does not implicitly {@link username.TokenDetails.verify|verify} messages.
         * @function encode
         * @memberof username.TokenDetails
         * @static
         * @param {username.ITokenDetails} message TokenDetails message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TokenDetails.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.addresses != null && message.addresses.length)
                for (var i = 0; i < message.addresses.length; ++i)
                    $root.username.ChainAddress.encode(message.addresses[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified TokenDetails message, length delimited. Does not implicitly {@link username.TokenDetails.verify|verify} messages.
         * @function encodeDelimited
         * @memberof username.TokenDetails
         * @static
         * @param {username.ITokenDetails} message TokenDetails message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TokenDetails.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TokenDetails message from the specified reader or buffer.
         * @function decode
         * @memberof username.TokenDetails
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {username.TokenDetails} TokenDetails
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TokenDetails.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.username.TokenDetails();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.addresses && message.addresses.length))
                        message.addresses = [];
                    message.addresses.push($root.username.ChainAddress.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TokenDetails message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof username.TokenDetails
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {username.TokenDetails} TokenDetails
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TokenDetails.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TokenDetails message.
         * @function verify
         * @memberof username.TokenDetails
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TokenDetails.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.addresses != null && message.hasOwnProperty("addresses")) {
                if (!Array.isArray(message.addresses))
                    return "addresses: array expected";
                for (var i = 0; i < message.addresses.length; ++i) {
                    var error = $root.username.ChainAddress.verify(message.addresses[i]);
                    if (error)
                        return "addresses." + error;
                }
            }
            return null;
        };

        /**
         * Creates a TokenDetails message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof username.TokenDetails
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {username.TokenDetails} TokenDetails
         */
        TokenDetails.fromObject = function fromObject(object) {
            if (object instanceof $root.username.TokenDetails)
                return object;
            var message = new $root.username.TokenDetails();
            if (object.addresses) {
                if (!Array.isArray(object.addresses))
                    throw TypeError(".username.TokenDetails.addresses: array expected");
                message.addresses = [];
                for (var i = 0; i < object.addresses.length; ++i) {
                    if (typeof object.addresses[i] !== "object")
                        throw TypeError(".username.TokenDetails.addresses: object expected");
                    message.addresses[i] = $root.username.ChainAddress.fromObject(object.addresses[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a TokenDetails message. Also converts values to other types if specified.
         * @function toObject
         * @memberof username.TokenDetails
         * @static
         * @param {username.TokenDetails} message TokenDetails
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TokenDetails.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.addresses = [];
            if (message.addresses && message.addresses.length) {
                object.addresses = [];
                for (var j = 0; j < message.addresses.length; ++j)
                    object.addresses[j] = $root.username.ChainAddress.toObject(message.addresses[j], options);
            }
            return object;
        };

        /**
         * Converts this TokenDetails to JSON.
         * @function toJSON
         * @memberof username.TokenDetails
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TokenDetails.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return TokenDetails;
    })();

    username.ChainAddress = (function() {

        /**
         * Properties of a ChainAddress.
         * @memberof username
         * @interface IChainAddress
         * @property {Uint8Array|null} [chainID] ChainAddress chainID
         * @property {Uint8Array|null} [address] ChainAddress address
         */

        /**
         * Constructs a new ChainAddress.
         * @memberof username
         * @classdesc Represents a ChainAddress.
         * @implements IChainAddress
         * @constructor
         * @param {username.IChainAddress=} [properties] Properties to set
         */
        function ChainAddress(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ChainAddress chainID.
         * @member {Uint8Array} chainID
         * @memberof username.ChainAddress
         * @instance
         */
        ChainAddress.prototype.chainID = $util.newBuffer([]);

        /**
         * ChainAddress address.
         * @member {Uint8Array} address
         * @memberof username.ChainAddress
         * @instance
         */
        ChainAddress.prototype.address = $util.newBuffer([]);

        /**
         * Creates a new ChainAddress instance using the specified properties.
         * @function create
         * @memberof username.ChainAddress
         * @static
         * @param {username.IChainAddress=} [properties] Properties to set
         * @returns {username.ChainAddress} ChainAddress instance
         */
        ChainAddress.create = function create(properties) {
            return new ChainAddress(properties);
        };

        /**
         * Encodes the specified ChainAddress message. Does not implicitly {@link username.ChainAddress.verify|verify} messages.
         * @function encode
         * @memberof username.ChainAddress
         * @static
         * @param {username.IChainAddress} message ChainAddress message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ChainAddress.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.chainID != null && message.hasOwnProperty("chainID"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.chainID);
            if (message.address != null && message.hasOwnProperty("address"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.address);
            return writer;
        };

        /**
         * Encodes the specified ChainAddress message, length delimited. Does not implicitly {@link username.ChainAddress.verify|verify} messages.
         * @function encodeDelimited
         * @memberof username.ChainAddress
         * @static
         * @param {username.IChainAddress} message ChainAddress message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ChainAddress.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ChainAddress message from the specified reader or buffer.
         * @function decode
         * @memberof username.ChainAddress
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {username.ChainAddress} ChainAddress
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ChainAddress.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.username.ChainAddress();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.chainID = reader.bytes();
                    break;
                case 2:
                    message.address = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ChainAddress message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof username.ChainAddress
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {username.ChainAddress} ChainAddress
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ChainAddress.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ChainAddress message.
         * @function verify
         * @memberof username.ChainAddress
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ChainAddress.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.chainID != null && message.hasOwnProperty("chainID"))
                if (!(message.chainID && typeof message.chainID.length === "number" || $util.isString(message.chainID)))
                    return "chainID: buffer expected";
            if (message.address != null && message.hasOwnProperty("address"))
                if (!(message.address && typeof message.address.length === "number" || $util.isString(message.address)))
                    return "address: buffer expected";
            return null;
        };

        /**
         * Creates a ChainAddress message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof username.ChainAddress
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {username.ChainAddress} ChainAddress
         */
        ChainAddress.fromObject = function fromObject(object) {
            if (object instanceof $root.username.ChainAddress)
                return object;
            var message = new $root.username.ChainAddress();
            if (object.chainID != null)
                if (typeof object.chainID === "string")
                    $util.base64.decode(object.chainID, message.chainID = $util.newBuffer($util.base64.length(object.chainID)), 0);
                else if (object.chainID.length)
                    message.chainID = object.chainID;
            if (object.address != null)
                if (typeof object.address === "string")
                    $util.base64.decode(object.address, message.address = $util.newBuffer($util.base64.length(object.address)), 0);
                else if (object.address.length)
                    message.address = object.address;
            return message;
        };

        /**
         * Creates a plain object from a ChainAddress message. Also converts values to other types if specified.
         * @function toObject
         * @memberof username.ChainAddress
         * @static
         * @param {username.ChainAddress} message ChainAddress
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ChainAddress.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.chainID = "";
                else {
                    object.chainID = [];
                    if (options.bytes !== Array)
                        object.chainID = $util.newBuffer(object.chainID);
                }
                if (options.bytes === String)
                    object.address = "";
                else {
                    object.address = [];
                    if (options.bytes !== Array)
                        object.address = $util.newBuffer(object.address);
                }
            }
            if (message.chainID != null && message.hasOwnProperty("chainID"))
                object.chainID = options.bytes === String ? $util.base64.encode(message.chainID, 0, message.chainID.length) : options.bytes === Array ? Array.prototype.slice.call(message.chainID) : message.chainID;
            if (message.address != null && message.hasOwnProperty("address"))
                object.address = options.bytes === String ? $util.base64.encode(message.address, 0, message.address.length) : options.bytes === Array ? Array.prototype.slice.call(message.address) : message.address;
            return object;
        };

        /**
         * Converts this ChainAddress to JSON.
         * @function toJSON
         * @memberof username.ChainAddress
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ChainAddress.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return ChainAddress;
    })();

    username.IssueTokenMsg = (function() {

        /**
         * Properties of an IssueTokenMsg.
         * @memberof username
         * @interface IIssueTokenMsg
         * @property {Uint8Array|null} [id] IssueTokenMsg id
         * @property {Uint8Array|null} [owner] IssueTokenMsg owner
         * @property {Array.<nft.IActionApprovals>|null} [approvals] IssueTokenMsg approvals
         * @property {username.ITokenDetails|null} [details] IssueTokenMsg details
         */

        /**
         * Constructs a new IssueTokenMsg.
         * @memberof username
         * @classdesc Represents an IssueTokenMsg.
         * @implements IIssueTokenMsg
         * @constructor
         * @param {username.IIssueTokenMsg=} [properties] Properties to set
         */
        function IssueTokenMsg(properties) {
            this.approvals = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * IssueTokenMsg id.
         * @member {Uint8Array} id
         * @memberof username.IssueTokenMsg
         * @instance
         */
        IssueTokenMsg.prototype.id = $util.newBuffer([]);

        /**
         * IssueTokenMsg owner.
         * @member {Uint8Array} owner
         * @memberof username.IssueTokenMsg
         * @instance
         */
        IssueTokenMsg.prototype.owner = $util.newBuffer([]);

        /**
         * IssueTokenMsg approvals.
         * @member {Array.<nft.IActionApprovals>} approvals
         * @memberof username.IssueTokenMsg
         * @instance
         */
        IssueTokenMsg.prototype.approvals = $util.emptyArray;

        /**
         * IssueTokenMsg details.
         * @member {username.ITokenDetails|null|undefined} details
         * @memberof username.IssueTokenMsg
         * @instance
         */
        IssueTokenMsg.prototype.details = null;

        /**
         * Creates a new IssueTokenMsg instance using the specified properties.
         * @function create
         * @memberof username.IssueTokenMsg
         * @static
         * @param {username.IIssueTokenMsg=} [properties] Properties to set
         * @returns {username.IssueTokenMsg} IssueTokenMsg instance
         */
        IssueTokenMsg.create = function create(properties) {
            return new IssueTokenMsg(properties);
        };

        /**
         * Encodes the specified IssueTokenMsg message. Does not implicitly {@link username.IssueTokenMsg.verify|verify} messages.
         * @function encode
         * @memberof username.IssueTokenMsg
         * @static
         * @param {username.IIssueTokenMsg} message IssueTokenMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        IssueTokenMsg.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && message.hasOwnProperty("id"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.id);
            if (message.owner != null && message.hasOwnProperty("owner"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.owner);
            if (message.approvals != null && message.approvals.length)
                for (var i = 0; i < message.approvals.length; ++i)
                    $root.nft.ActionApprovals.encode(message.approvals[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.details != null && message.hasOwnProperty("details"))
                $root.username.TokenDetails.encode(message.details, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified IssueTokenMsg message, length delimited. Does not implicitly {@link username.IssueTokenMsg.verify|verify} messages.
         * @function encodeDelimited
         * @memberof username.IssueTokenMsg
         * @static
         * @param {username.IIssueTokenMsg} message IssueTokenMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        IssueTokenMsg.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an IssueTokenMsg message from the specified reader or buffer.
         * @function decode
         * @memberof username.IssueTokenMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {username.IssueTokenMsg} IssueTokenMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        IssueTokenMsg.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.username.IssueTokenMsg();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.id = reader.bytes();
                    break;
                case 2:
                    message.owner = reader.bytes();
                    break;
                case 3:
                    if (!(message.approvals && message.approvals.length))
                        message.approvals = [];
                    message.approvals.push($root.nft.ActionApprovals.decode(reader, reader.uint32()));
                    break;
                case 4:
                    message.details = $root.username.TokenDetails.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an IssueTokenMsg message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof username.IssueTokenMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {username.IssueTokenMsg} IssueTokenMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        IssueTokenMsg.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an IssueTokenMsg message.
         * @function verify
         * @memberof username.IssueTokenMsg
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        IssueTokenMsg.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!(message.id && typeof message.id.length === "number" || $util.isString(message.id)))
                    return "id: buffer expected";
            if (message.owner != null && message.hasOwnProperty("owner"))
                if (!(message.owner && typeof message.owner.length === "number" || $util.isString(message.owner)))
                    return "owner: buffer expected";
            if (message.approvals != null && message.hasOwnProperty("approvals")) {
                if (!Array.isArray(message.approvals))
                    return "approvals: array expected";
                for (var i = 0; i < message.approvals.length; ++i) {
                    var error = $root.nft.ActionApprovals.verify(message.approvals[i]);
                    if (error)
                        return "approvals." + error;
                }
            }
            if (message.details != null && message.hasOwnProperty("details")) {
                var error = $root.username.TokenDetails.verify(message.details);
                if (error)
                    return "details." + error;
            }
            return null;
        };

        /**
         * Creates an IssueTokenMsg message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof username.IssueTokenMsg
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {username.IssueTokenMsg} IssueTokenMsg
         */
        IssueTokenMsg.fromObject = function fromObject(object) {
            if (object instanceof $root.username.IssueTokenMsg)
                return object;
            var message = new $root.username.IssueTokenMsg();
            if (object.id != null)
                if (typeof object.id === "string")
                    $util.base64.decode(object.id, message.id = $util.newBuffer($util.base64.length(object.id)), 0);
                else if (object.id.length)
                    message.id = object.id;
            if (object.owner != null)
                if (typeof object.owner === "string")
                    $util.base64.decode(object.owner, message.owner = $util.newBuffer($util.base64.length(object.owner)), 0);
                else if (object.owner.length)
                    message.owner = object.owner;
            if (object.approvals) {
                if (!Array.isArray(object.approvals))
                    throw TypeError(".username.IssueTokenMsg.approvals: array expected");
                message.approvals = [];
                for (var i = 0; i < object.approvals.length; ++i) {
                    if (typeof object.approvals[i] !== "object")
                        throw TypeError(".username.IssueTokenMsg.approvals: object expected");
                    message.approvals[i] = $root.nft.ActionApprovals.fromObject(object.approvals[i]);
                }
            }
            if (object.details != null) {
                if (typeof object.details !== "object")
                    throw TypeError(".username.IssueTokenMsg.details: object expected");
                message.details = $root.username.TokenDetails.fromObject(object.details);
            }
            return message;
        };

        /**
         * Creates a plain object from an IssueTokenMsg message. Also converts values to other types if specified.
         * @function toObject
         * @memberof username.IssueTokenMsg
         * @static
         * @param {username.IssueTokenMsg} message IssueTokenMsg
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        IssueTokenMsg.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.approvals = [];
            if (options.defaults) {
                if (options.bytes === String)
                    object.id = "";
                else {
                    object.id = [];
                    if (options.bytes !== Array)
                        object.id = $util.newBuffer(object.id);
                }
                if (options.bytes === String)
                    object.owner = "";
                else {
                    object.owner = [];
                    if (options.bytes !== Array)
                        object.owner = $util.newBuffer(object.owner);
                }
                object.details = null;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = options.bytes === String ? $util.base64.encode(message.id, 0, message.id.length) : options.bytes === Array ? Array.prototype.slice.call(message.id) : message.id;
            if (message.owner != null && message.hasOwnProperty("owner"))
                object.owner = options.bytes === String ? $util.base64.encode(message.owner, 0, message.owner.length) : options.bytes === Array ? Array.prototype.slice.call(message.owner) : message.owner;
            if (message.approvals && message.approvals.length) {
                object.approvals = [];
                for (var j = 0; j < message.approvals.length; ++j)
                    object.approvals[j] = $root.nft.ActionApprovals.toObject(message.approvals[j], options);
            }
            if (message.details != null && message.hasOwnProperty("details"))
                object.details = $root.username.TokenDetails.toObject(message.details, options);
            return object;
        };

        /**
         * Converts this IssueTokenMsg to JSON.
         * @function toJSON
         * @memberof username.IssueTokenMsg
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        IssueTokenMsg.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return IssueTokenMsg;
    })();

    username.AddChainAddressMsg = (function() {

        /**
         * Properties of an AddChainAddressMsg.
         * @memberof username
         * @interface IAddChainAddressMsg
         * @property {Uint8Array|null} [id] AddChainAddressMsg id
         * @property {Uint8Array|null} [chainID] AddChainAddressMsg chainID
         * @property {Uint8Array|null} [address] AddChainAddressMsg address
         */

        /**
         * Constructs a new AddChainAddressMsg.
         * @memberof username
         * @classdesc Represents an AddChainAddressMsg.
         * @implements IAddChainAddressMsg
         * @constructor
         * @param {username.IAddChainAddressMsg=} [properties] Properties to set
         */
        function AddChainAddressMsg(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * AddChainAddressMsg id.
         * @member {Uint8Array} id
         * @memberof username.AddChainAddressMsg
         * @instance
         */
        AddChainAddressMsg.prototype.id = $util.newBuffer([]);

        /**
         * AddChainAddressMsg chainID.
         * @member {Uint8Array} chainID
         * @memberof username.AddChainAddressMsg
         * @instance
         */
        AddChainAddressMsg.prototype.chainID = $util.newBuffer([]);

        /**
         * AddChainAddressMsg address.
         * @member {Uint8Array} address
         * @memberof username.AddChainAddressMsg
         * @instance
         */
        AddChainAddressMsg.prototype.address = $util.newBuffer([]);

        /**
         * Creates a new AddChainAddressMsg instance using the specified properties.
         * @function create
         * @memberof username.AddChainAddressMsg
         * @static
         * @param {username.IAddChainAddressMsg=} [properties] Properties to set
         * @returns {username.AddChainAddressMsg} AddChainAddressMsg instance
         */
        AddChainAddressMsg.create = function create(properties) {
            return new AddChainAddressMsg(properties);
        };

        /**
         * Encodes the specified AddChainAddressMsg message. Does not implicitly {@link username.AddChainAddressMsg.verify|verify} messages.
         * @function encode
         * @memberof username.AddChainAddressMsg
         * @static
         * @param {username.IAddChainAddressMsg} message AddChainAddressMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AddChainAddressMsg.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && message.hasOwnProperty("id"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.id);
            if (message.chainID != null && message.hasOwnProperty("chainID"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.chainID);
            if (message.address != null && message.hasOwnProperty("address"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.address);
            return writer;
        };

        /**
         * Encodes the specified AddChainAddressMsg message, length delimited. Does not implicitly {@link username.AddChainAddressMsg.verify|verify} messages.
         * @function encodeDelimited
         * @memberof username.AddChainAddressMsg
         * @static
         * @param {username.IAddChainAddressMsg} message AddChainAddressMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AddChainAddressMsg.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an AddChainAddressMsg message from the specified reader or buffer.
         * @function decode
         * @memberof username.AddChainAddressMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {username.AddChainAddressMsg} AddChainAddressMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AddChainAddressMsg.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.username.AddChainAddressMsg();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.id = reader.bytes();
                    break;
                case 2:
                    message.chainID = reader.bytes();
                    break;
                case 3:
                    message.address = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an AddChainAddressMsg message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof username.AddChainAddressMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {username.AddChainAddressMsg} AddChainAddressMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AddChainAddressMsg.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an AddChainAddressMsg message.
         * @function verify
         * @memberof username.AddChainAddressMsg
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        AddChainAddressMsg.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!(message.id && typeof message.id.length === "number" || $util.isString(message.id)))
                    return "id: buffer expected";
            if (message.chainID != null && message.hasOwnProperty("chainID"))
                if (!(message.chainID && typeof message.chainID.length === "number" || $util.isString(message.chainID)))
                    return "chainID: buffer expected";
            if (message.address != null && message.hasOwnProperty("address"))
                if (!(message.address && typeof message.address.length === "number" || $util.isString(message.address)))
                    return "address: buffer expected";
            return null;
        };

        /**
         * Creates an AddChainAddressMsg message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof username.AddChainAddressMsg
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {username.AddChainAddressMsg} AddChainAddressMsg
         */
        AddChainAddressMsg.fromObject = function fromObject(object) {
            if (object instanceof $root.username.AddChainAddressMsg)
                return object;
            var message = new $root.username.AddChainAddressMsg();
            if (object.id != null)
                if (typeof object.id === "string")
                    $util.base64.decode(object.id, message.id = $util.newBuffer($util.base64.length(object.id)), 0);
                else if (object.id.length)
                    message.id = object.id;
            if (object.chainID != null)
                if (typeof object.chainID === "string")
                    $util.base64.decode(object.chainID, message.chainID = $util.newBuffer($util.base64.length(object.chainID)), 0);
                else if (object.chainID.length)
                    message.chainID = object.chainID;
            if (object.address != null)
                if (typeof object.address === "string")
                    $util.base64.decode(object.address, message.address = $util.newBuffer($util.base64.length(object.address)), 0);
                else if (object.address.length)
                    message.address = object.address;
            return message;
        };

        /**
         * Creates a plain object from an AddChainAddressMsg message. Also converts values to other types if specified.
         * @function toObject
         * @memberof username.AddChainAddressMsg
         * @static
         * @param {username.AddChainAddressMsg} message AddChainAddressMsg
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        AddChainAddressMsg.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.id = "";
                else {
                    object.id = [];
                    if (options.bytes !== Array)
                        object.id = $util.newBuffer(object.id);
                }
                if (options.bytes === String)
                    object.chainID = "";
                else {
                    object.chainID = [];
                    if (options.bytes !== Array)
                        object.chainID = $util.newBuffer(object.chainID);
                }
                if (options.bytes === String)
                    object.address = "";
                else {
                    object.address = [];
                    if (options.bytes !== Array)
                        object.address = $util.newBuffer(object.address);
                }
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = options.bytes === String ? $util.base64.encode(message.id, 0, message.id.length) : options.bytes === Array ? Array.prototype.slice.call(message.id) : message.id;
            if (message.chainID != null && message.hasOwnProperty("chainID"))
                object.chainID = options.bytes === String ? $util.base64.encode(message.chainID, 0, message.chainID.length) : options.bytes === Array ? Array.prototype.slice.call(message.chainID) : message.chainID;
            if (message.address != null && message.hasOwnProperty("address"))
                object.address = options.bytes === String ? $util.base64.encode(message.address, 0, message.address.length) : options.bytes === Array ? Array.prototype.slice.call(message.address) : message.address;
            return object;
        };

        /**
         * Converts this AddChainAddressMsg to JSON.
         * @function toJSON
         * @memberof username.AddChainAddressMsg
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        AddChainAddressMsg.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return AddChainAddressMsg;
    })();

    username.RemoveChainAddressMsg = (function() {

        /**
         * Properties of a RemoveChainAddressMsg.
         * @memberof username
         * @interface IRemoveChainAddressMsg
         * @property {Uint8Array|null} [id] RemoveChainAddressMsg id
         * @property {Uint8Array|null} [chainID] RemoveChainAddressMsg chainID
         * @property {Uint8Array|null} [address] RemoveChainAddressMsg address
         */

        /**
         * Constructs a new RemoveChainAddressMsg.
         * @memberof username
         * @classdesc Represents a RemoveChainAddressMsg.
         * @implements IRemoveChainAddressMsg
         * @constructor
         * @param {username.IRemoveChainAddressMsg=} [properties] Properties to set
         */
        function RemoveChainAddressMsg(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RemoveChainAddressMsg id.
         * @member {Uint8Array} id
         * @memberof username.RemoveChainAddressMsg
         * @instance
         */
        RemoveChainAddressMsg.prototype.id = $util.newBuffer([]);

        /**
         * RemoveChainAddressMsg chainID.
         * @member {Uint8Array} chainID
         * @memberof username.RemoveChainAddressMsg
         * @instance
         */
        RemoveChainAddressMsg.prototype.chainID = $util.newBuffer([]);

        /**
         * RemoveChainAddressMsg address.
         * @member {Uint8Array} address
         * @memberof username.RemoveChainAddressMsg
         * @instance
         */
        RemoveChainAddressMsg.prototype.address = $util.newBuffer([]);

        /**
         * Creates a new RemoveChainAddressMsg instance using the specified properties.
         * @function create
         * @memberof username.RemoveChainAddressMsg
         * @static
         * @param {username.IRemoveChainAddressMsg=} [properties] Properties to set
         * @returns {username.RemoveChainAddressMsg} RemoveChainAddressMsg instance
         */
        RemoveChainAddressMsg.create = function create(properties) {
            return new RemoveChainAddressMsg(properties);
        };

        /**
         * Encodes the specified RemoveChainAddressMsg message. Does not implicitly {@link username.RemoveChainAddressMsg.verify|verify} messages.
         * @function encode
         * @memberof username.RemoveChainAddressMsg
         * @static
         * @param {username.IRemoveChainAddressMsg} message RemoveChainAddressMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RemoveChainAddressMsg.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && message.hasOwnProperty("id"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.id);
            if (message.chainID != null && message.hasOwnProperty("chainID"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.chainID);
            if (message.address != null && message.hasOwnProperty("address"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.address);
            return writer;
        };

        /**
         * Encodes the specified RemoveChainAddressMsg message, length delimited. Does not implicitly {@link username.RemoveChainAddressMsg.verify|verify} messages.
         * @function encodeDelimited
         * @memberof username.RemoveChainAddressMsg
         * @static
         * @param {username.IRemoveChainAddressMsg} message RemoveChainAddressMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RemoveChainAddressMsg.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RemoveChainAddressMsg message from the specified reader or buffer.
         * @function decode
         * @memberof username.RemoveChainAddressMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {username.RemoveChainAddressMsg} RemoveChainAddressMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RemoveChainAddressMsg.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.username.RemoveChainAddressMsg();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.id = reader.bytes();
                    break;
                case 2:
                    message.chainID = reader.bytes();
                    break;
                case 3:
                    message.address = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a RemoveChainAddressMsg message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof username.RemoveChainAddressMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {username.RemoveChainAddressMsg} RemoveChainAddressMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RemoveChainAddressMsg.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RemoveChainAddressMsg message.
         * @function verify
         * @memberof username.RemoveChainAddressMsg
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RemoveChainAddressMsg.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!(message.id && typeof message.id.length === "number" || $util.isString(message.id)))
                    return "id: buffer expected";
            if (message.chainID != null && message.hasOwnProperty("chainID"))
                if (!(message.chainID && typeof message.chainID.length === "number" || $util.isString(message.chainID)))
                    return "chainID: buffer expected";
            if (message.address != null && message.hasOwnProperty("address"))
                if (!(message.address && typeof message.address.length === "number" || $util.isString(message.address)))
                    return "address: buffer expected";
            return null;
        };

        /**
         * Creates a RemoveChainAddressMsg message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof username.RemoveChainAddressMsg
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {username.RemoveChainAddressMsg} RemoveChainAddressMsg
         */
        RemoveChainAddressMsg.fromObject = function fromObject(object) {
            if (object instanceof $root.username.RemoveChainAddressMsg)
                return object;
            var message = new $root.username.RemoveChainAddressMsg();
            if (object.id != null)
                if (typeof object.id === "string")
                    $util.base64.decode(object.id, message.id = $util.newBuffer($util.base64.length(object.id)), 0);
                else if (object.id.length)
                    message.id = object.id;
            if (object.chainID != null)
                if (typeof object.chainID === "string")
                    $util.base64.decode(object.chainID, message.chainID = $util.newBuffer($util.base64.length(object.chainID)), 0);
                else if (object.chainID.length)
                    message.chainID = object.chainID;
            if (object.address != null)
                if (typeof object.address === "string")
                    $util.base64.decode(object.address, message.address = $util.newBuffer($util.base64.length(object.address)), 0);
                else if (object.address.length)
                    message.address = object.address;
            return message;
        };

        /**
         * Creates a plain object from a RemoveChainAddressMsg message. Also converts values to other types if specified.
         * @function toObject
         * @memberof username.RemoveChainAddressMsg
         * @static
         * @param {username.RemoveChainAddressMsg} message RemoveChainAddressMsg
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RemoveChainAddressMsg.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.id = "";
                else {
                    object.id = [];
                    if (options.bytes !== Array)
                        object.id = $util.newBuffer(object.id);
                }
                if (options.bytes === String)
                    object.chainID = "";
                else {
                    object.chainID = [];
                    if (options.bytes !== Array)
                        object.chainID = $util.newBuffer(object.chainID);
                }
                if (options.bytes === String)
                    object.address = "";
                else {
                    object.address = [];
                    if (options.bytes !== Array)
                        object.address = $util.newBuffer(object.address);
                }
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = options.bytes === String ? $util.base64.encode(message.id, 0, message.id.length) : options.bytes === Array ? Array.prototype.slice.call(message.id) : message.id;
            if (message.chainID != null && message.hasOwnProperty("chainID"))
                object.chainID = options.bytes === String ? $util.base64.encode(message.chainID, 0, message.chainID.length) : options.bytes === Array ? Array.prototype.slice.call(message.chainID) : message.chainID;
            if (message.address != null && message.hasOwnProperty("address"))
                object.address = options.bytes === String ? $util.base64.encode(message.address, 0, message.address.length) : options.bytes === Array ? Array.prototype.slice.call(message.address) : message.address;
            return object;
        };

        /**
         * Converts this RemoveChainAddressMsg to JSON.
         * @function toJSON
         * @memberof username.RemoveChainAddressMsg
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RemoveChainAddressMsg.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return RemoveChainAddressMsg;
    })();

    return username;
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
                if (options.bytes === String)
                    object.src = "";
                else {
                    object.src = [];
                    if (options.bytes !== Array)
                        object.src = $util.newBuffer(object.src);
                }
                if (options.bytes === String)
                    object.dest = "";
                else {
                    object.dest = [];
                    if (options.bytes !== Array)
                        object.dest = $util.newBuffer(object.dest);
                }
                object.amount = null;
                object.memo = "";
                if (options.bytes === String)
                    object.ref = "";
                else {
                    object.ref = [];
                    if (options.bytes !== Array)
                        object.ref = $util.newBuffer(object.ref);
                }
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
                if (options.bytes === String)
                    object.payer = "";
                else {
                    object.payer = [];
                    if (options.bytes !== Array)
                        object.payer = $util.newBuffer(object.payer);
                }
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

$root.multisig = (function() {

    /**
     * Namespace multisig.
     * @exports multisig
     * @namespace
     */
    var multisig = {};

    multisig.Contract = (function() {

        /**
         * Properties of a Contract.
         * @memberof multisig
         * @interface IContract
         * @property {Array.<Uint8Array>|null} [sigs] Contract sigs
         * @property {number|Long|null} [activationThreshold] Contract activationThreshold
         * @property {number|Long|null} [adminThreshold] Contract adminThreshold
         */

        /**
         * Constructs a new Contract.
         * @memberof multisig
         * @classdesc Represents a Contract.
         * @implements IContract
         * @constructor
         * @param {multisig.IContract=} [properties] Properties to set
         */
        function Contract(properties) {
            this.sigs = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Contract sigs.
         * @member {Array.<Uint8Array>} sigs
         * @memberof multisig.Contract
         * @instance
         */
        Contract.prototype.sigs = $util.emptyArray;

        /**
         * Contract activationThreshold.
         * @member {number|Long} activationThreshold
         * @memberof multisig.Contract
         * @instance
         */
        Contract.prototype.activationThreshold = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Contract adminThreshold.
         * @member {number|Long} adminThreshold
         * @memberof multisig.Contract
         * @instance
         */
        Contract.prototype.adminThreshold = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new Contract instance using the specified properties.
         * @function create
         * @memberof multisig.Contract
         * @static
         * @param {multisig.IContract=} [properties] Properties to set
         * @returns {multisig.Contract} Contract instance
         */
        Contract.create = function create(properties) {
            return new Contract(properties);
        };

        /**
         * Encodes the specified Contract message. Does not implicitly {@link multisig.Contract.verify|verify} messages.
         * @function encode
         * @memberof multisig.Contract
         * @static
         * @param {multisig.IContract} message Contract message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Contract.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.sigs != null && message.sigs.length)
                for (var i = 0; i < message.sigs.length; ++i)
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.sigs[i]);
            if (message.activationThreshold != null && message.hasOwnProperty("activationThreshold"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.activationThreshold);
            if (message.adminThreshold != null && message.hasOwnProperty("adminThreshold"))
                writer.uint32(/* id 3, wireType 0 =*/24).int64(message.adminThreshold);
            return writer;
        };

        /**
         * Encodes the specified Contract message, length delimited. Does not implicitly {@link multisig.Contract.verify|verify} messages.
         * @function encodeDelimited
         * @memberof multisig.Contract
         * @static
         * @param {multisig.IContract} message Contract message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Contract.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Contract message from the specified reader or buffer.
         * @function decode
         * @memberof multisig.Contract
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {multisig.Contract} Contract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Contract.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.multisig.Contract();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.sigs && message.sigs.length))
                        message.sigs = [];
                    message.sigs.push(reader.bytes());
                    break;
                case 2:
                    message.activationThreshold = reader.int64();
                    break;
                case 3:
                    message.adminThreshold = reader.int64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Contract message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof multisig.Contract
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {multisig.Contract} Contract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Contract.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Contract message.
         * @function verify
         * @memberof multisig.Contract
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Contract.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.sigs != null && message.hasOwnProperty("sigs")) {
                if (!Array.isArray(message.sigs))
                    return "sigs: array expected";
                for (var i = 0; i < message.sigs.length; ++i)
                    if (!(message.sigs[i] && typeof message.sigs[i].length === "number" || $util.isString(message.sigs[i])))
                        return "sigs: buffer[] expected";
            }
            if (message.activationThreshold != null && message.hasOwnProperty("activationThreshold"))
                if (!$util.isInteger(message.activationThreshold) && !(message.activationThreshold && $util.isInteger(message.activationThreshold.low) && $util.isInteger(message.activationThreshold.high)))
                    return "activationThreshold: integer|Long expected";
            if (message.adminThreshold != null && message.hasOwnProperty("adminThreshold"))
                if (!$util.isInteger(message.adminThreshold) && !(message.adminThreshold && $util.isInteger(message.adminThreshold.low) && $util.isInteger(message.adminThreshold.high)))
                    return "adminThreshold: integer|Long expected";
            return null;
        };

        /**
         * Creates a Contract message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof multisig.Contract
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {multisig.Contract} Contract
         */
        Contract.fromObject = function fromObject(object) {
            if (object instanceof $root.multisig.Contract)
                return object;
            var message = new $root.multisig.Contract();
            if (object.sigs) {
                if (!Array.isArray(object.sigs))
                    throw TypeError(".multisig.Contract.sigs: array expected");
                message.sigs = [];
                for (var i = 0; i < object.sigs.length; ++i)
                    if (typeof object.sigs[i] === "string")
                        $util.base64.decode(object.sigs[i], message.sigs[i] = $util.newBuffer($util.base64.length(object.sigs[i])), 0);
                    else if (object.sigs[i].length)
                        message.sigs[i] = object.sigs[i];
            }
            if (object.activationThreshold != null)
                if ($util.Long)
                    (message.activationThreshold = $util.Long.fromValue(object.activationThreshold)).unsigned = false;
                else if (typeof object.activationThreshold === "string")
                    message.activationThreshold = parseInt(object.activationThreshold, 10);
                else if (typeof object.activationThreshold === "number")
                    message.activationThreshold = object.activationThreshold;
                else if (typeof object.activationThreshold === "object")
                    message.activationThreshold = new $util.LongBits(object.activationThreshold.low >>> 0, object.activationThreshold.high >>> 0).toNumber();
            if (object.adminThreshold != null)
                if ($util.Long)
                    (message.adminThreshold = $util.Long.fromValue(object.adminThreshold)).unsigned = false;
                else if (typeof object.adminThreshold === "string")
                    message.adminThreshold = parseInt(object.adminThreshold, 10);
                else if (typeof object.adminThreshold === "number")
                    message.adminThreshold = object.adminThreshold;
                else if (typeof object.adminThreshold === "object")
                    message.adminThreshold = new $util.LongBits(object.adminThreshold.low >>> 0, object.adminThreshold.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from a Contract message. Also converts values to other types if specified.
         * @function toObject
         * @memberof multisig.Contract
         * @static
         * @param {multisig.Contract} message Contract
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Contract.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.sigs = [];
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.activationThreshold = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.activationThreshold = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.adminThreshold = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.adminThreshold = options.longs === String ? "0" : 0;
            }
            if (message.sigs && message.sigs.length) {
                object.sigs = [];
                for (var j = 0; j < message.sigs.length; ++j)
                    object.sigs[j] = options.bytes === String ? $util.base64.encode(message.sigs[j], 0, message.sigs[j].length) : options.bytes === Array ? Array.prototype.slice.call(message.sigs[j]) : message.sigs[j];
            }
            if (message.activationThreshold != null && message.hasOwnProperty("activationThreshold"))
                if (typeof message.activationThreshold === "number")
                    object.activationThreshold = options.longs === String ? String(message.activationThreshold) : message.activationThreshold;
                else
                    object.activationThreshold = options.longs === String ? $util.Long.prototype.toString.call(message.activationThreshold) : options.longs === Number ? new $util.LongBits(message.activationThreshold.low >>> 0, message.activationThreshold.high >>> 0).toNumber() : message.activationThreshold;
            if (message.adminThreshold != null && message.hasOwnProperty("adminThreshold"))
                if (typeof message.adminThreshold === "number")
                    object.adminThreshold = options.longs === String ? String(message.adminThreshold) : message.adminThreshold;
                else
                    object.adminThreshold = options.longs === String ? $util.Long.prototype.toString.call(message.adminThreshold) : options.longs === Number ? new $util.LongBits(message.adminThreshold.low >>> 0, message.adminThreshold.high >>> 0).toNumber() : message.adminThreshold;
            return object;
        };

        /**
         * Converts this Contract to JSON.
         * @function toJSON
         * @memberof multisig.Contract
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Contract.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Contract;
    })();

    multisig.CreateContractMsg = (function() {

        /**
         * Properties of a CreateContractMsg.
         * @memberof multisig
         * @interface ICreateContractMsg
         * @property {Array.<Uint8Array>|null} [sigs] CreateContractMsg sigs
         * @property {number|Long|null} [activationThreshold] CreateContractMsg activationThreshold
         * @property {number|Long|null} [adminThreshold] CreateContractMsg adminThreshold
         */

        /**
         * Constructs a new CreateContractMsg.
         * @memberof multisig
         * @classdesc Represents a CreateContractMsg.
         * @implements ICreateContractMsg
         * @constructor
         * @param {multisig.ICreateContractMsg=} [properties] Properties to set
         */
        function CreateContractMsg(properties) {
            this.sigs = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CreateContractMsg sigs.
         * @member {Array.<Uint8Array>} sigs
         * @memberof multisig.CreateContractMsg
         * @instance
         */
        CreateContractMsg.prototype.sigs = $util.emptyArray;

        /**
         * CreateContractMsg activationThreshold.
         * @member {number|Long} activationThreshold
         * @memberof multisig.CreateContractMsg
         * @instance
         */
        CreateContractMsg.prototype.activationThreshold = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * CreateContractMsg adminThreshold.
         * @member {number|Long} adminThreshold
         * @memberof multisig.CreateContractMsg
         * @instance
         */
        CreateContractMsg.prototype.adminThreshold = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new CreateContractMsg instance using the specified properties.
         * @function create
         * @memberof multisig.CreateContractMsg
         * @static
         * @param {multisig.ICreateContractMsg=} [properties] Properties to set
         * @returns {multisig.CreateContractMsg} CreateContractMsg instance
         */
        CreateContractMsg.create = function create(properties) {
            return new CreateContractMsg(properties);
        };

        /**
         * Encodes the specified CreateContractMsg message. Does not implicitly {@link multisig.CreateContractMsg.verify|verify} messages.
         * @function encode
         * @memberof multisig.CreateContractMsg
         * @static
         * @param {multisig.ICreateContractMsg} message CreateContractMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateContractMsg.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.sigs != null && message.sigs.length)
                for (var i = 0; i < message.sigs.length; ++i)
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.sigs[i]);
            if (message.activationThreshold != null && message.hasOwnProperty("activationThreshold"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.activationThreshold);
            if (message.adminThreshold != null && message.hasOwnProperty("adminThreshold"))
                writer.uint32(/* id 3, wireType 0 =*/24).int64(message.adminThreshold);
            return writer;
        };

        /**
         * Encodes the specified CreateContractMsg message, length delimited. Does not implicitly {@link multisig.CreateContractMsg.verify|verify} messages.
         * @function encodeDelimited
         * @memberof multisig.CreateContractMsg
         * @static
         * @param {multisig.ICreateContractMsg} message CreateContractMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateContractMsg.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CreateContractMsg message from the specified reader or buffer.
         * @function decode
         * @memberof multisig.CreateContractMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {multisig.CreateContractMsg} CreateContractMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateContractMsg.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.multisig.CreateContractMsg();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.sigs && message.sigs.length))
                        message.sigs = [];
                    message.sigs.push(reader.bytes());
                    break;
                case 2:
                    message.activationThreshold = reader.int64();
                    break;
                case 3:
                    message.adminThreshold = reader.int64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CreateContractMsg message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof multisig.CreateContractMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {multisig.CreateContractMsg} CreateContractMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateContractMsg.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CreateContractMsg message.
         * @function verify
         * @memberof multisig.CreateContractMsg
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CreateContractMsg.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.sigs != null && message.hasOwnProperty("sigs")) {
                if (!Array.isArray(message.sigs))
                    return "sigs: array expected";
                for (var i = 0; i < message.sigs.length; ++i)
                    if (!(message.sigs[i] && typeof message.sigs[i].length === "number" || $util.isString(message.sigs[i])))
                        return "sigs: buffer[] expected";
            }
            if (message.activationThreshold != null && message.hasOwnProperty("activationThreshold"))
                if (!$util.isInteger(message.activationThreshold) && !(message.activationThreshold && $util.isInteger(message.activationThreshold.low) && $util.isInteger(message.activationThreshold.high)))
                    return "activationThreshold: integer|Long expected";
            if (message.adminThreshold != null && message.hasOwnProperty("adminThreshold"))
                if (!$util.isInteger(message.adminThreshold) && !(message.adminThreshold && $util.isInteger(message.adminThreshold.low) && $util.isInteger(message.adminThreshold.high)))
                    return "adminThreshold: integer|Long expected";
            return null;
        };

        /**
         * Creates a CreateContractMsg message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof multisig.CreateContractMsg
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {multisig.CreateContractMsg} CreateContractMsg
         */
        CreateContractMsg.fromObject = function fromObject(object) {
            if (object instanceof $root.multisig.CreateContractMsg)
                return object;
            var message = new $root.multisig.CreateContractMsg();
            if (object.sigs) {
                if (!Array.isArray(object.sigs))
                    throw TypeError(".multisig.CreateContractMsg.sigs: array expected");
                message.sigs = [];
                for (var i = 0; i < object.sigs.length; ++i)
                    if (typeof object.sigs[i] === "string")
                        $util.base64.decode(object.sigs[i], message.sigs[i] = $util.newBuffer($util.base64.length(object.sigs[i])), 0);
                    else if (object.sigs[i].length)
                        message.sigs[i] = object.sigs[i];
            }
            if (object.activationThreshold != null)
                if ($util.Long)
                    (message.activationThreshold = $util.Long.fromValue(object.activationThreshold)).unsigned = false;
                else if (typeof object.activationThreshold === "string")
                    message.activationThreshold = parseInt(object.activationThreshold, 10);
                else if (typeof object.activationThreshold === "number")
                    message.activationThreshold = object.activationThreshold;
                else if (typeof object.activationThreshold === "object")
                    message.activationThreshold = new $util.LongBits(object.activationThreshold.low >>> 0, object.activationThreshold.high >>> 0).toNumber();
            if (object.adminThreshold != null)
                if ($util.Long)
                    (message.adminThreshold = $util.Long.fromValue(object.adminThreshold)).unsigned = false;
                else if (typeof object.adminThreshold === "string")
                    message.adminThreshold = parseInt(object.adminThreshold, 10);
                else if (typeof object.adminThreshold === "number")
                    message.adminThreshold = object.adminThreshold;
                else if (typeof object.adminThreshold === "object")
                    message.adminThreshold = new $util.LongBits(object.adminThreshold.low >>> 0, object.adminThreshold.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from a CreateContractMsg message. Also converts values to other types if specified.
         * @function toObject
         * @memberof multisig.CreateContractMsg
         * @static
         * @param {multisig.CreateContractMsg} message CreateContractMsg
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CreateContractMsg.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.sigs = [];
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.activationThreshold = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.activationThreshold = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.adminThreshold = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.adminThreshold = options.longs === String ? "0" : 0;
            }
            if (message.sigs && message.sigs.length) {
                object.sigs = [];
                for (var j = 0; j < message.sigs.length; ++j)
                    object.sigs[j] = options.bytes === String ? $util.base64.encode(message.sigs[j], 0, message.sigs[j].length) : options.bytes === Array ? Array.prototype.slice.call(message.sigs[j]) : message.sigs[j];
            }
            if (message.activationThreshold != null && message.hasOwnProperty("activationThreshold"))
                if (typeof message.activationThreshold === "number")
                    object.activationThreshold = options.longs === String ? String(message.activationThreshold) : message.activationThreshold;
                else
                    object.activationThreshold = options.longs === String ? $util.Long.prototype.toString.call(message.activationThreshold) : options.longs === Number ? new $util.LongBits(message.activationThreshold.low >>> 0, message.activationThreshold.high >>> 0).toNumber() : message.activationThreshold;
            if (message.adminThreshold != null && message.hasOwnProperty("adminThreshold"))
                if (typeof message.adminThreshold === "number")
                    object.adminThreshold = options.longs === String ? String(message.adminThreshold) : message.adminThreshold;
                else
                    object.adminThreshold = options.longs === String ? $util.Long.prototype.toString.call(message.adminThreshold) : options.longs === Number ? new $util.LongBits(message.adminThreshold.low >>> 0, message.adminThreshold.high >>> 0).toNumber() : message.adminThreshold;
            return object;
        };

        /**
         * Converts this CreateContractMsg to JSON.
         * @function toJSON
         * @memberof multisig.CreateContractMsg
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CreateContractMsg.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return CreateContractMsg;
    })();

    multisig.UpdateContractMsg = (function() {

        /**
         * Properties of an UpdateContractMsg.
         * @memberof multisig
         * @interface IUpdateContractMsg
         * @property {Uint8Array|null} [id] UpdateContractMsg id
         * @property {Array.<Uint8Array>|null} [sigs] UpdateContractMsg sigs
         * @property {number|Long|null} [activationThreshold] UpdateContractMsg activationThreshold
         * @property {number|Long|null} [adminThreshold] UpdateContractMsg adminThreshold
         */

        /**
         * Constructs a new UpdateContractMsg.
         * @memberof multisig
         * @classdesc Represents an UpdateContractMsg.
         * @implements IUpdateContractMsg
         * @constructor
         * @param {multisig.IUpdateContractMsg=} [properties] Properties to set
         */
        function UpdateContractMsg(properties) {
            this.sigs = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * UpdateContractMsg id.
         * @member {Uint8Array} id
         * @memberof multisig.UpdateContractMsg
         * @instance
         */
        UpdateContractMsg.prototype.id = $util.newBuffer([]);

        /**
         * UpdateContractMsg sigs.
         * @member {Array.<Uint8Array>} sigs
         * @memberof multisig.UpdateContractMsg
         * @instance
         */
        UpdateContractMsg.prototype.sigs = $util.emptyArray;

        /**
         * UpdateContractMsg activationThreshold.
         * @member {number|Long} activationThreshold
         * @memberof multisig.UpdateContractMsg
         * @instance
         */
        UpdateContractMsg.prototype.activationThreshold = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UpdateContractMsg adminThreshold.
         * @member {number|Long} adminThreshold
         * @memberof multisig.UpdateContractMsg
         * @instance
         */
        UpdateContractMsg.prototype.adminThreshold = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new UpdateContractMsg instance using the specified properties.
         * @function create
         * @memberof multisig.UpdateContractMsg
         * @static
         * @param {multisig.IUpdateContractMsg=} [properties] Properties to set
         * @returns {multisig.UpdateContractMsg} UpdateContractMsg instance
         */
        UpdateContractMsg.create = function create(properties) {
            return new UpdateContractMsg(properties);
        };

        /**
         * Encodes the specified UpdateContractMsg message. Does not implicitly {@link multisig.UpdateContractMsg.verify|verify} messages.
         * @function encode
         * @memberof multisig.UpdateContractMsg
         * @static
         * @param {multisig.IUpdateContractMsg} message UpdateContractMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateContractMsg.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && message.hasOwnProperty("id"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.id);
            if (message.sigs != null && message.sigs.length)
                for (var i = 0; i < message.sigs.length; ++i)
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.sigs[i]);
            if (message.activationThreshold != null && message.hasOwnProperty("activationThreshold"))
                writer.uint32(/* id 3, wireType 0 =*/24).int64(message.activationThreshold);
            if (message.adminThreshold != null && message.hasOwnProperty("adminThreshold"))
                writer.uint32(/* id 4, wireType 0 =*/32).int64(message.adminThreshold);
            return writer;
        };

        /**
         * Encodes the specified UpdateContractMsg message, length delimited. Does not implicitly {@link multisig.UpdateContractMsg.verify|verify} messages.
         * @function encodeDelimited
         * @memberof multisig.UpdateContractMsg
         * @static
         * @param {multisig.IUpdateContractMsg} message UpdateContractMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateContractMsg.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an UpdateContractMsg message from the specified reader or buffer.
         * @function decode
         * @memberof multisig.UpdateContractMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {multisig.UpdateContractMsg} UpdateContractMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateContractMsg.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.multisig.UpdateContractMsg();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.id = reader.bytes();
                    break;
                case 2:
                    if (!(message.sigs && message.sigs.length))
                        message.sigs = [];
                    message.sigs.push(reader.bytes());
                    break;
                case 3:
                    message.activationThreshold = reader.int64();
                    break;
                case 4:
                    message.adminThreshold = reader.int64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an UpdateContractMsg message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof multisig.UpdateContractMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {multisig.UpdateContractMsg} UpdateContractMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateContractMsg.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an UpdateContractMsg message.
         * @function verify
         * @memberof multisig.UpdateContractMsg
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        UpdateContractMsg.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!(message.id && typeof message.id.length === "number" || $util.isString(message.id)))
                    return "id: buffer expected";
            if (message.sigs != null && message.hasOwnProperty("sigs")) {
                if (!Array.isArray(message.sigs))
                    return "sigs: array expected";
                for (var i = 0; i < message.sigs.length; ++i)
                    if (!(message.sigs[i] && typeof message.sigs[i].length === "number" || $util.isString(message.sigs[i])))
                        return "sigs: buffer[] expected";
            }
            if (message.activationThreshold != null && message.hasOwnProperty("activationThreshold"))
                if (!$util.isInteger(message.activationThreshold) && !(message.activationThreshold && $util.isInteger(message.activationThreshold.low) && $util.isInteger(message.activationThreshold.high)))
                    return "activationThreshold: integer|Long expected";
            if (message.adminThreshold != null && message.hasOwnProperty("adminThreshold"))
                if (!$util.isInteger(message.adminThreshold) && !(message.adminThreshold && $util.isInteger(message.adminThreshold.low) && $util.isInteger(message.adminThreshold.high)))
                    return "adminThreshold: integer|Long expected";
            return null;
        };

        /**
         * Creates an UpdateContractMsg message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof multisig.UpdateContractMsg
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {multisig.UpdateContractMsg} UpdateContractMsg
         */
        UpdateContractMsg.fromObject = function fromObject(object) {
            if (object instanceof $root.multisig.UpdateContractMsg)
                return object;
            var message = new $root.multisig.UpdateContractMsg();
            if (object.id != null)
                if (typeof object.id === "string")
                    $util.base64.decode(object.id, message.id = $util.newBuffer($util.base64.length(object.id)), 0);
                else if (object.id.length)
                    message.id = object.id;
            if (object.sigs) {
                if (!Array.isArray(object.sigs))
                    throw TypeError(".multisig.UpdateContractMsg.sigs: array expected");
                message.sigs = [];
                for (var i = 0; i < object.sigs.length; ++i)
                    if (typeof object.sigs[i] === "string")
                        $util.base64.decode(object.sigs[i], message.sigs[i] = $util.newBuffer($util.base64.length(object.sigs[i])), 0);
                    else if (object.sigs[i].length)
                        message.sigs[i] = object.sigs[i];
            }
            if (object.activationThreshold != null)
                if ($util.Long)
                    (message.activationThreshold = $util.Long.fromValue(object.activationThreshold)).unsigned = false;
                else if (typeof object.activationThreshold === "string")
                    message.activationThreshold = parseInt(object.activationThreshold, 10);
                else if (typeof object.activationThreshold === "number")
                    message.activationThreshold = object.activationThreshold;
                else if (typeof object.activationThreshold === "object")
                    message.activationThreshold = new $util.LongBits(object.activationThreshold.low >>> 0, object.activationThreshold.high >>> 0).toNumber();
            if (object.adminThreshold != null)
                if ($util.Long)
                    (message.adminThreshold = $util.Long.fromValue(object.adminThreshold)).unsigned = false;
                else if (typeof object.adminThreshold === "string")
                    message.adminThreshold = parseInt(object.adminThreshold, 10);
                else if (typeof object.adminThreshold === "number")
                    message.adminThreshold = object.adminThreshold;
                else if (typeof object.adminThreshold === "object")
                    message.adminThreshold = new $util.LongBits(object.adminThreshold.low >>> 0, object.adminThreshold.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from an UpdateContractMsg message. Also converts values to other types if specified.
         * @function toObject
         * @memberof multisig.UpdateContractMsg
         * @static
         * @param {multisig.UpdateContractMsg} message UpdateContractMsg
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        UpdateContractMsg.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.sigs = [];
            if (options.defaults) {
                if (options.bytes === String)
                    object.id = "";
                else {
                    object.id = [];
                    if (options.bytes !== Array)
                        object.id = $util.newBuffer(object.id);
                }
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.activationThreshold = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.activationThreshold = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.adminThreshold = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.adminThreshold = options.longs === String ? "0" : 0;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = options.bytes === String ? $util.base64.encode(message.id, 0, message.id.length) : options.bytes === Array ? Array.prototype.slice.call(message.id) : message.id;
            if (message.sigs && message.sigs.length) {
                object.sigs = [];
                for (var j = 0; j < message.sigs.length; ++j)
                    object.sigs[j] = options.bytes === String ? $util.base64.encode(message.sigs[j], 0, message.sigs[j].length) : options.bytes === Array ? Array.prototype.slice.call(message.sigs[j]) : message.sigs[j];
            }
            if (message.activationThreshold != null && message.hasOwnProperty("activationThreshold"))
                if (typeof message.activationThreshold === "number")
                    object.activationThreshold = options.longs === String ? String(message.activationThreshold) : message.activationThreshold;
                else
                    object.activationThreshold = options.longs === String ? $util.Long.prototype.toString.call(message.activationThreshold) : options.longs === Number ? new $util.LongBits(message.activationThreshold.low >>> 0, message.activationThreshold.high >>> 0).toNumber() : message.activationThreshold;
            if (message.adminThreshold != null && message.hasOwnProperty("adminThreshold"))
                if (typeof message.adminThreshold === "number")
                    object.adminThreshold = options.longs === String ? String(message.adminThreshold) : message.adminThreshold;
                else
                    object.adminThreshold = options.longs === String ? $util.Long.prototype.toString.call(message.adminThreshold) : options.longs === Number ? new $util.LongBits(message.adminThreshold.low >>> 0, message.adminThreshold.high >>> 0).toNumber() : message.adminThreshold;
            return object;
        };

        /**
         * Converts this UpdateContractMsg to JSON.
         * @function toJSON
         * @memberof multisig.UpdateContractMsg
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        UpdateContractMsg.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return UpdateContractMsg;
    })();

    return multisig;
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
                if (options.bytes === String)
                    object.sender = "";
                else {
                    object.sender = [];
                    if (options.bytes !== Array)
                        object.sender = $util.newBuffer(object.sender);
                }
                if (options.bytes === String)
                    object.arbiter = "";
                else {
                    object.arbiter = [];
                    if (options.bytes !== Array)
                        object.arbiter = $util.newBuffer(object.arbiter);
                }
                if (options.bytes === String)
                    object.recipient = "";
                else {
                    object.recipient = [];
                    if (options.bytes !== Array)
                        object.recipient = $util.newBuffer(object.recipient);
                }
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
         * @property {Uint8Array|null} [src] CreateEscrowMsg src
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
         * CreateEscrowMsg src.
         * @member {Uint8Array} src
         * @memberof escrow.CreateEscrowMsg
         * @instance
         */
        CreateEscrowMsg.prototype.src = $util.newBuffer([]);

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
            if (message.src != null && message.hasOwnProperty("src"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.src);
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
                    message.src = reader.bytes();
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
            if (message.src != null && message.hasOwnProperty("src"))
                if (!(message.src && typeof message.src.length === "number" || $util.isString(message.src)))
                    return "src: buffer expected";
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
            if (object.src != null)
                if (typeof object.src === "string")
                    $util.base64.decode(object.src, message.src = $util.newBuffer($util.base64.length(object.src)), 0);
                else if (object.src.length)
                    message.src = object.src;
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
                if (options.bytes === String)
                    object.src = "";
                else {
                    object.src = [];
                    if (options.bytes !== Array)
                        object.src = $util.newBuffer(object.src);
                }
                if (options.bytes === String)
                    object.arbiter = "";
                else {
                    object.arbiter = [];
                    if (options.bytes !== Array)
                        object.arbiter = $util.newBuffer(object.arbiter);
                }
                if (options.bytes === String)
                    object.recipient = "";
                else {
                    object.recipient = [];
                    if (options.bytes !== Array)
                        object.recipient = $util.newBuffer(object.recipient);
                }
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.timeout = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.timeout = options.longs === String ? "0" : 0;
                object.memo = "";
            }
            if (message.src != null && message.hasOwnProperty("src"))
                object.src = options.bytes === String ? $util.base64.encode(message.src, 0, message.src.length) : options.bytes === Array ? Array.prototype.slice.call(message.src) : message.src;
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
                if (options.bytes === String)
                    object.escrowId = "";
                else {
                    object.escrowId = [];
                    if (options.bytes !== Array)
                        object.escrowId = $util.newBuffer(object.escrowId);
                }
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
                if (options.bytes === String)
                    object.escrowId = "";
                else {
                    object.escrowId = [];
                    if (options.bytes !== Array)
                        object.escrowId = $util.newBuffer(object.escrowId);
                }
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
                if (options.bytes === String)
                    object.escrowId = "";
                else {
                    object.escrowId = [];
                    if (options.bytes !== Array)
                        object.escrowId = $util.newBuffer(object.escrowId);
                }
                if (options.bytes === String)
                    object.sender = "";
                else {
                    object.sender = [];
                    if (options.bytes !== Array)
                        object.sender = $util.newBuffer(object.sender);
                }
                if (options.bytes === String)
                    object.arbiter = "";
                else {
                    object.arbiter = [];
                    if (options.bytes !== Array)
                        object.arbiter = $util.newBuffer(object.arbiter);
                }
                if (options.bytes === String)
                    object.recipient = "";
                else {
                    object.recipient = [];
                    if (options.bytes !== Array)
                        object.recipient = $util.newBuffer(object.recipient);
                }
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

$root.validators = (function() {

    /**
     * Namespace validators.
     * @exports validators
     * @namespace
     */
    var validators = {};

    validators.ValidatorUpdate = (function() {

        /**
         * Properties of a ValidatorUpdate.
         * @memberof validators
         * @interface IValidatorUpdate
         * @property {validators.IPubkey|null} [pubkey] ValidatorUpdate pubkey
         * @property {number|Long|null} [power] ValidatorUpdate power
         */

        /**
         * Constructs a new ValidatorUpdate.
         * @memberof validators
         * @classdesc Represents a ValidatorUpdate.
         * @implements IValidatorUpdate
         * @constructor
         * @param {validators.IValidatorUpdate=} [properties] Properties to set
         */
        function ValidatorUpdate(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ValidatorUpdate pubkey.
         * @member {validators.IPubkey|null|undefined} pubkey
         * @memberof validators.ValidatorUpdate
         * @instance
         */
        ValidatorUpdate.prototype.pubkey = null;

        /**
         * ValidatorUpdate power.
         * @member {number|Long} power
         * @memberof validators.ValidatorUpdate
         * @instance
         */
        ValidatorUpdate.prototype.power = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new ValidatorUpdate instance using the specified properties.
         * @function create
         * @memberof validators.ValidatorUpdate
         * @static
         * @param {validators.IValidatorUpdate=} [properties] Properties to set
         * @returns {validators.ValidatorUpdate} ValidatorUpdate instance
         */
        ValidatorUpdate.create = function create(properties) {
            return new ValidatorUpdate(properties);
        };

        /**
         * Encodes the specified ValidatorUpdate message. Does not implicitly {@link validators.ValidatorUpdate.verify|verify} messages.
         * @function encode
         * @memberof validators.ValidatorUpdate
         * @static
         * @param {validators.IValidatorUpdate} message ValidatorUpdate message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ValidatorUpdate.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.pubkey != null && message.hasOwnProperty("pubkey"))
                $root.validators.Pubkey.encode(message.pubkey, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.power != null && message.hasOwnProperty("power"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.power);
            return writer;
        };

        /**
         * Encodes the specified ValidatorUpdate message, length delimited. Does not implicitly {@link validators.ValidatorUpdate.verify|verify} messages.
         * @function encodeDelimited
         * @memberof validators.ValidatorUpdate
         * @static
         * @param {validators.IValidatorUpdate} message ValidatorUpdate message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ValidatorUpdate.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ValidatorUpdate message from the specified reader or buffer.
         * @function decode
         * @memberof validators.ValidatorUpdate
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {validators.ValidatorUpdate} ValidatorUpdate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ValidatorUpdate.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.validators.ValidatorUpdate();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.pubkey = $root.validators.Pubkey.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.power = reader.int64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ValidatorUpdate message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof validators.ValidatorUpdate
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {validators.ValidatorUpdate} ValidatorUpdate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ValidatorUpdate.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ValidatorUpdate message.
         * @function verify
         * @memberof validators.ValidatorUpdate
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ValidatorUpdate.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.pubkey != null && message.hasOwnProperty("pubkey")) {
                var error = $root.validators.Pubkey.verify(message.pubkey);
                if (error)
                    return "pubkey." + error;
            }
            if (message.power != null && message.hasOwnProperty("power"))
                if (!$util.isInteger(message.power) && !(message.power && $util.isInteger(message.power.low) && $util.isInteger(message.power.high)))
                    return "power: integer|Long expected";
            return null;
        };

        /**
         * Creates a ValidatorUpdate message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof validators.ValidatorUpdate
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {validators.ValidatorUpdate} ValidatorUpdate
         */
        ValidatorUpdate.fromObject = function fromObject(object) {
            if (object instanceof $root.validators.ValidatorUpdate)
                return object;
            var message = new $root.validators.ValidatorUpdate();
            if (object.pubkey != null) {
                if (typeof object.pubkey !== "object")
                    throw TypeError(".validators.ValidatorUpdate.pubkey: object expected");
                message.pubkey = $root.validators.Pubkey.fromObject(object.pubkey);
            }
            if (object.power != null)
                if ($util.Long)
                    (message.power = $util.Long.fromValue(object.power)).unsigned = false;
                else if (typeof object.power === "string")
                    message.power = parseInt(object.power, 10);
                else if (typeof object.power === "number")
                    message.power = object.power;
                else if (typeof object.power === "object")
                    message.power = new $util.LongBits(object.power.low >>> 0, object.power.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from a ValidatorUpdate message. Also converts values to other types if specified.
         * @function toObject
         * @memberof validators.ValidatorUpdate
         * @static
         * @param {validators.ValidatorUpdate} message ValidatorUpdate
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ValidatorUpdate.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.pubkey = null;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.power = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.power = options.longs === String ? "0" : 0;
            }
            if (message.pubkey != null && message.hasOwnProperty("pubkey"))
                object.pubkey = $root.validators.Pubkey.toObject(message.pubkey, options);
            if (message.power != null && message.hasOwnProperty("power"))
                if (typeof message.power === "number")
                    object.power = options.longs === String ? String(message.power) : message.power;
                else
                    object.power = options.longs === String ? $util.Long.prototype.toString.call(message.power) : options.longs === Number ? new $util.LongBits(message.power.low >>> 0, message.power.high >>> 0).toNumber() : message.power;
            return object;
        };

        /**
         * Converts this ValidatorUpdate to JSON.
         * @function toJSON
         * @memberof validators.ValidatorUpdate
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ValidatorUpdate.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return ValidatorUpdate;
    })();

    validators.Pubkey = (function() {

        /**
         * Properties of a Pubkey.
         * @memberof validators
         * @interface IPubkey
         * @property {string|null} [type] Pubkey type
         * @property {Uint8Array|null} [data] Pubkey data
         */

        /**
         * Constructs a new Pubkey.
         * @memberof validators
         * @classdesc Represents a Pubkey.
         * @implements IPubkey
         * @constructor
         * @param {validators.IPubkey=} [properties] Properties to set
         */
        function Pubkey(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Pubkey type.
         * @member {string} type
         * @memberof validators.Pubkey
         * @instance
         */
        Pubkey.prototype.type = "";

        /**
         * Pubkey data.
         * @member {Uint8Array} data
         * @memberof validators.Pubkey
         * @instance
         */
        Pubkey.prototype.data = $util.newBuffer([]);

        /**
         * Creates a new Pubkey instance using the specified properties.
         * @function create
         * @memberof validators.Pubkey
         * @static
         * @param {validators.IPubkey=} [properties] Properties to set
         * @returns {validators.Pubkey} Pubkey instance
         */
        Pubkey.create = function create(properties) {
            return new Pubkey(properties);
        };

        /**
         * Encodes the specified Pubkey message. Does not implicitly {@link validators.Pubkey.verify|verify} messages.
         * @function encode
         * @memberof validators.Pubkey
         * @static
         * @param {validators.IPubkey} message Pubkey message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pubkey.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.type != null && message.hasOwnProperty("type"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.type);
            if (message.data != null && message.hasOwnProperty("data"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.data);
            return writer;
        };

        /**
         * Encodes the specified Pubkey message, length delimited. Does not implicitly {@link validators.Pubkey.verify|verify} messages.
         * @function encodeDelimited
         * @memberof validators.Pubkey
         * @static
         * @param {validators.IPubkey} message Pubkey message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pubkey.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Pubkey message from the specified reader or buffer.
         * @function decode
         * @memberof validators.Pubkey
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {validators.Pubkey} Pubkey
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pubkey.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.validators.Pubkey();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.type = reader.string();
                    break;
                case 2:
                    message.data = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Pubkey message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof validators.Pubkey
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {validators.Pubkey} Pubkey
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pubkey.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Pubkey message.
         * @function verify
         * @memberof validators.Pubkey
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Pubkey.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.type != null && message.hasOwnProperty("type"))
                if (!$util.isString(message.type))
                    return "type: string expected";
            if (message.data != null && message.hasOwnProperty("data"))
                if (!(message.data && typeof message.data.length === "number" || $util.isString(message.data)))
                    return "data: buffer expected";
            return null;
        };

        /**
         * Creates a Pubkey message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof validators.Pubkey
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {validators.Pubkey} Pubkey
         */
        Pubkey.fromObject = function fromObject(object) {
            if (object instanceof $root.validators.Pubkey)
                return object;
            var message = new $root.validators.Pubkey();
            if (object.type != null)
                message.type = String(object.type);
            if (object.data != null)
                if (typeof object.data === "string")
                    $util.base64.decode(object.data, message.data = $util.newBuffer($util.base64.length(object.data)), 0);
                else if (object.data.length)
                    message.data = object.data;
            return message;
        };

        /**
         * Creates a plain object from a Pubkey message. Also converts values to other types if specified.
         * @function toObject
         * @memberof validators.Pubkey
         * @static
         * @param {validators.Pubkey} message Pubkey
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Pubkey.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.type = "";
                if (options.bytes === String)
                    object.data = "";
                else {
                    object.data = [];
                    if (options.bytes !== Array)
                        object.data = $util.newBuffer(object.data);
                }
            }
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = message.type;
            if (message.data != null && message.hasOwnProperty("data"))
                object.data = options.bytes === String ? $util.base64.encode(message.data, 0, message.data.length) : options.bytes === Array ? Array.prototype.slice.call(message.data) : message.data;
            return object;
        };

        /**
         * Converts this Pubkey to JSON.
         * @function toJSON
         * @memberof validators.Pubkey
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Pubkey.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Pubkey;
    })();

    validators.SetValidatorsMsg = (function() {

        /**
         * Properties of a SetValidatorsMsg.
         * @memberof validators
         * @interface ISetValidatorsMsg
         * @property {Array.<validators.IValidatorUpdate>|null} [validatorUpdates] SetValidatorsMsg validatorUpdates
         */

        /**
         * Constructs a new SetValidatorsMsg.
         * @memberof validators
         * @classdesc Represents a SetValidatorsMsg.
         * @implements ISetValidatorsMsg
         * @constructor
         * @param {validators.ISetValidatorsMsg=} [properties] Properties to set
         */
        function SetValidatorsMsg(properties) {
            this.validatorUpdates = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SetValidatorsMsg validatorUpdates.
         * @member {Array.<validators.IValidatorUpdate>} validatorUpdates
         * @memberof validators.SetValidatorsMsg
         * @instance
         */
        SetValidatorsMsg.prototype.validatorUpdates = $util.emptyArray;

        /**
         * Creates a new SetValidatorsMsg instance using the specified properties.
         * @function create
         * @memberof validators.SetValidatorsMsg
         * @static
         * @param {validators.ISetValidatorsMsg=} [properties] Properties to set
         * @returns {validators.SetValidatorsMsg} SetValidatorsMsg instance
         */
        SetValidatorsMsg.create = function create(properties) {
            return new SetValidatorsMsg(properties);
        };

        /**
         * Encodes the specified SetValidatorsMsg message. Does not implicitly {@link validators.SetValidatorsMsg.verify|verify} messages.
         * @function encode
         * @memberof validators.SetValidatorsMsg
         * @static
         * @param {validators.ISetValidatorsMsg} message SetValidatorsMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SetValidatorsMsg.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.validatorUpdates != null && message.validatorUpdates.length)
                for (var i = 0; i < message.validatorUpdates.length; ++i)
                    $root.validators.ValidatorUpdate.encode(message.validatorUpdates[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified SetValidatorsMsg message, length delimited. Does not implicitly {@link validators.SetValidatorsMsg.verify|verify} messages.
         * @function encodeDelimited
         * @memberof validators.SetValidatorsMsg
         * @static
         * @param {validators.ISetValidatorsMsg} message SetValidatorsMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SetValidatorsMsg.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a SetValidatorsMsg message from the specified reader or buffer.
         * @function decode
         * @memberof validators.SetValidatorsMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {validators.SetValidatorsMsg} SetValidatorsMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SetValidatorsMsg.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.validators.SetValidatorsMsg();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.validatorUpdates && message.validatorUpdates.length))
                        message.validatorUpdates = [];
                    message.validatorUpdates.push($root.validators.ValidatorUpdate.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a SetValidatorsMsg message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof validators.SetValidatorsMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {validators.SetValidatorsMsg} SetValidatorsMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SetValidatorsMsg.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a SetValidatorsMsg message.
         * @function verify
         * @memberof validators.SetValidatorsMsg
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        SetValidatorsMsg.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.validatorUpdates != null && message.hasOwnProperty("validatorUpdates")) {
                if (!Array.isArray(message.validatorUpdates))
                    return "validatorUpdates: array expected";
                for (var i = 0; i < message.validatorUpdates.length; ++i) {
                    var error = $root.validators.ValidatorUpdate.verify(message.validatorUpdates[i]);
                    if (error)
                        return "validatorUpdates." + error;
                }
            }
            return null;
        };

        /**
         * Creates a SetValidatorsMsg message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof validators.SetValidatorsMsg
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {validators.SetValidatorsMsg} SetValidatorsMsg
         */
        SetValidatorsMsg.fromObject = function fromObject(object) {
            if (object instanceof $root.validators.SetValidatorsMsg)
                return object;
            var message = new $root.validators.SetValidatorsMsg();
            if (object.validatorUpdates) {
                if (!Array.isArray(object.validatorUpdates))
                    throw TypeError(".validators.SetValidatorsMsg.validatorUpdates: array expected");
                message.validatorUpdates = [];
                for (var i = 0; i < object.validatorUpdates.length; ++i) {
                    if (typeof object.validatorUpdates[i] !== "object")
                        throw TypeError(".validators.SetValidatorsMsg.validatorUpdates: object expected");
                    message.validatorUpdates[i] = $root.validators.ValidatorUpdate.fromObject(object.validatorUpdates[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a SetValidatorsMsg message. Also converts values to other types if specified.
         * @function toObject
         * @memberof validators.SetValidatorsMsg
         * @static
         * @param {validators.SetValidatorsMsg} message SetValidatorsMsg
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        SetValidatorsMsg.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.validatorUpdates = [];
            if (message.validatorUpdates && message.validatorUpdates.length) {
                object.validatorUpdates = [];
                for (var j = 0; j < message.validatorUpdates.length; ++j)
                    object.validatorUpdates[j] = $root.validators.ValidatorUpdate.toObject(message.validatorUpdates[j], options);
            }
            return object;
        };

        /**
         * Converts this SetValidatorsMsg to JSON.
         * @function toJSON
         * @memberof validators.SetValidatorsMsg
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        SetValidatorsMsg.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return SetValidatorsMsg;
    })();

    validators.Accounts = (function() {

        /**
         * Properties of an Accounts.
         * @memberof validators
         * @interface IAccounts
         * @property {Array.<Uint8Array>|null} [addresses] Accounts addresses
         */

        /**
         * Constructs a new Accounts.
         * @memberof validators
         * @classdesc Represents an Accounts.
         * @implements IAccounts
         * @constructor
         * @param {validators.IAccounts=} [properties] Properties to set
         */
        function Accounts(properties) {
            this.addresses = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Accounts addresses.
         * @member {Array.<Uint8Array>} addresses
         * @memberof validators.Accounts
         * @instance
         */
        Accounts.prototype.addresses = $util.emptyArray;

        /**
         * Creates a new Accounts instance using the specified properties.
         * @function create
         * @memberof validators.Accounts
         * @static
         * @param {validators.IAccounts=} [properties] Properties to set
         * @returns {validators.Accounts} Accounts instance
         */
        Accounts.create = function create(properties) {
            return new Accounts(properties);
        };

        /**
         * Encodes the specified Accounts message. Does not implicitly {@link validators.Accounts.verify|verify} messages.
         * @function encode
         * @memberof validators.Accounts
         * @static
         * @param {validators.IAccounts} message Accounts message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Accounts.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.addresses != null && message.addresses.length)
                for (var i = 0; i < message.addresses.length; ++i)
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.addresses[i]);
            return writer;
        };

        /**
         * Encodes the specified Accounts message, length delimited. Does not implicitly {@link validators.Accounts.verify|verify} messages.
         * @function encodeDelimited
         * @memberof validators.Accounts
         * @static
         * @param {validators.IAccounts} message Accounts message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Accounts.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Accounts message from the specified reader or buffer.
         * @function decode
         * @memberof validators.Accounts
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {validators.Accounts} Accounts
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Accounts.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.validators.Accounts();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.addresses && message.addresses.length))
                        message.addresses = [];
                    message.addresses.push(reader.bytes());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Accounts message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof validators.Accounts
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {validators.Accounts} Accounts
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Accounts.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Accounts message.
         * @function verify
         * @memberof validators.Accounts
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Accounts.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.addresses != null && message.hasOwnProperty("addresses")) {
                if (!Array.isArray(message.addresses))
                    return "addresses: array expected";
                for (var i = 0; i < message.addresses.length; ++i)
                    if (!(message.addresses[i] && typeof message.addresses[i].length === "number" || $util.isString(message.addresses[i])))
                        return "addresses: buffer[] expected";
            }
            return null;
        };

        /**
         * Creates an Accounts message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof validators.Accounts
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {validators.Accounts} Accounts
         */
        Accounts.fromObject = function fromObject(object) {
            if (object instanceof $root.validators.Accounts)
                return object;
            var message = new $root.validators.Accounts();
            if (object.addresses) {
                if (!Array.isArray(object.addresses))
                    throw TypeError(".validators.Accounts.addresses: array expected");
                message.addresses = [];
                for (var i = 0; i < object.addresses.length; ++i)
                    if (typeof object.addresses[i] === "string")
                        $util.base64.decode(object.addresses[i], message.addresses[i] = $util.newBuffer($util.base64.length(object.addresses[i])), 0);
                    else if (object.addresses[i].length)
                        message.addresses[i] = object.addresses[i];
            }
            return message;
        };

        /**
         * Creates a plain object from an Accounts message. Also converts values to other types if specified.
         * @function toObject
         * @memberof validators.Accounts
         * @static
         * @param {validators.Accounts} message Accounts
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Accounts.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.addresses = [];
            if (message.addresses && message.addresses.length) {
                object.addresses = [];
                for (var j = 0; j < message.addresses.length; ++j)
                    object.addresses[j] = options.bytes === String ? $util.base64.encode(message.addresses[j], 0, message.addresses[j].length) : options.bytes === Array ? Array.prototype.slice.call(message.addresses[j]) : message.addresses[j];
            }
            return object;
        };

        /**
         * Converts this Accounts to JSON.
         * @function toJSON
         * @memberof validators.Accounts
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Accounts.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Accounts;
    })();

    return validators;
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
         * @property {crypto.IPublicKey|null} [pubkey] UserData pubkey
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
         * UserData pubkey.
         * @member {crypto.IPublicKey|null|undefined} pubkey
         * @memberof sigs.UserData
         * @instance
         */
        UserData.prototype.pubkey = null;

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
            if (message.pubkey != null && message.hasOwnProperty("pubkey"))
                $root.crypto.PublicKey.encode(message.pubkey, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
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
                    message.pubkey = $root.crypto.PublicKey.decode(reader, reader.uint32());
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
            if (message.pubkey != null && message.hasOwnProperty("pubkey")) {
                var error = $root.crypto.PublicKey.verify(message.pubkey);
                if (error)
                    return "pubkey." + error;
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
            if (object.pubkey != null) {
                if (typeof object.pubkey !== "object")
                    throw TypeError(".sigs.UserData.pubkey: object expected");
                message.pubkey = $root.crypto.PublicKey.fromObject(object.pubkey);
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
                object.pubkey = null;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.sequence = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.sequence = options.longs === String ? "0" : 0;
            }
            if (message.pubkey != null && message.hasOwnProperty("pubkey"))
                object.pubkey = $root.crypto.PublicKey.toObject(message.pubkey, options);
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
         * @property {crypto.IPublicKey|null} [pubkey] StdSignature pubkey
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
         * StdSignature pubkey.
         * @member {crypto.IPublicKey|null|undefined} pubkey
         * @memberof sigs.StdSignature
         * @instance
         */
        StdSignature.prototype.pubkey = null;

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
            if (message.pubkey != null && message.hasOwnProperty("pubkey"))
                $root.crypto.PublicKey.encode(message.pubkey, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
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
                    message.pubkey = $root.crypto.PublicKey.decode(reader, reader.uint32());
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
            if (message.pubkey != null && message.hasOwnProperty("pubkey")) {
                var error = $root.crypto.PublicKey.verify(message.pubkey);
                if (error)
                    return "pubkey." + error;
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
            if (object.pubkey != null) {
                if (typeof object.pubkey !== "object")
                    throw TypeError(".sigs.StdSignature.pubkey: object expected");
                message.pubkey = $root.crypto.PublicKey.fromObject(object.pubkey);
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
                object.pubkey = null;
                object.signature = null;
            }
            if (message.sequence != null && message.hasOwnProperty("sequence"))
                if (typeof message.sequence === "number")
                    object.sequence = options.longs === String ? String(message.sequence) : message.sequence;
                else
                    object.sequence = options.longs === String ? $util.Long.prototype.toString.call(message.sequence) : options.longs === Number ? new $util.LongBits(message.sequence.low >>> 0, message.sequence.high >>> 0).toNumber() : message.sequence;
            if (message.pubkey != null && message.hasOwnProperty("pubkey"))
                object.pubkey = $root.crypto.PublicKey.toObject(message.pubkey, options);
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

module.exports = $root;

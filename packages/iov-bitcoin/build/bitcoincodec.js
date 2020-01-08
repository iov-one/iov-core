"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const address_1 = require("./address");
class BitcoinCodec {
    bytesToSign(unsigned, nonce) {
        throw new Error("not implemented");
    }
    bytesToPost(signed) {
        throw new Error("not implemented");
    }
    identifier(signed) {
        throw new Error("not implemented");
    }
    parseBytes(bytes, chainId) {
        throw new Error("not implemented");
    }
    identityToAddress(identity) {
        return address_1.pubkeyToAddress(identity.pubkey);
    }
    isValidAddress(address) {
        return address_1.isValidAddress(address);
    }
}
exports.BitcoinCodec = BitcoinCodec;
exports.bitcoinCodec = new BitcoinCodec();
//# sourceMappingURL=bitcoincodec.js.map
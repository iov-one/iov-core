import axios from "axios";

import { Address, TokenTicker } from "@iov/bcp-types";
import { Bech32, Encoding } from "@iov/encoding";

/**
 * A faucet for the blockchain of value.
 *
 * @deprecated will be removed in 0.9. Migrate to IovFaucet.
 */
export class BovFaucet {
  private readonly url: string;

  constructor(url: string) {
    if (!url.startsWith("https://")) {
      throw new Error("Expected url to start with https://");
    }
    this.url = url;
  }

  public async credit(address: Address, ticker: TokenTicker = "IOV" as TokenTicker): Promise<void> {
    const addressAsHex = Encoding.toHex(Bech32.decode(address).data);

    const body = {
      address: addressAsHex,
      tokens: [{ ticker: ticker }],
    };

    await axios.post(this.url, body);
  }
}

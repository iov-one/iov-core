import axios from "axios";

import { Address, TokenTicker } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";

export class BovFaucet {
  private readonly url: string;

  constructor(url: string) {
    if (!url.startsWith("https://")) {
      throw new Error("Expected url to start with https://");
    }
    this.url = url;
  }

  public async open(address: Address, ticker: TokenTicker = "IOV" as TokenTicker): Promise<void> {
    const body = {
      address: Encoding.toHex(address),
      tokens: [{ ticker: ticker }],
    };

    await axios.post(this.url, body);
  }
}

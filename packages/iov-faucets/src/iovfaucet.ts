import axios from "axios";

import { Address, TokenTicker } from "@iov/bcp-types";

export class IovFaucet {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    if (!baseUrl.match(/^https?:\/\//)) {
      throw new Error("Expected base url to start with http:// or https://");
    }

    // Strip trailing /
    const strippedBaseUrl = baseUrl.replace(/(\/)+$/, "");
    this.baseUrl = strippedBaseUrl;
  }

  public async credit(address: Address, ticker: TokenTicker): Promise<void> {
    const body = {
      address: address,
      ticker: ticker,
    };
    await axios.post(this.baseUrl + "/credit", body);
  }
}

import axios from "axios";

import { Address, TokenTicker } from "@iov/bcp";

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

    try {
      await axios.post(this.baseUrl + "/credit", body);
    } catch (error) {
      if (error.response) {
        // append response body to error message
        throw new Error(`${error}; response body: ${JSON.stringify(error.response.data)}`);
      } else {
        throw error;
      }
    }
  }
}

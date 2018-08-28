import axios from "axios";

import { Address } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";

export class BovFaucet {
  private readonly url: string;

  constructor(url: string) {
    if (!url.startsWith("https://")) {
      throw new Error("Expected url to start with https://");
    }
    this.url = url;
  }

  public open(address: Address): Promise<any> {
    const body = {
      address: Encoding.toHex(address),
      tokens: [{ ticker: "IOV" }],
    };

    // const postData = JSON.stringify(body);
    return axios.post(this.url, body);
  }
}

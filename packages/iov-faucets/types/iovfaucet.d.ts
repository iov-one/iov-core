import { Address, TokenTicker } from "@iov/bcp";
export declare class IovFaucet {
  private readonly baseUrl;
  constructor(baseUrl: string);
  credit(address: Address, ticker: TokenTicker): Promise<void>;
}

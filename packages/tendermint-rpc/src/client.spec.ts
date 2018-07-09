import { Encoding } from "@iov/crypto";

import { Client } from "./client";
import * as responses from "./responses";
import { HttpClient } from "./rpcclient";
import * as versions from "./versions";

const skipTests = (): boolean => !process.env.TENDERMINT_ENABLED;

const pendingWithoutTendermint = (): boolean => {
  if (skipTests()) {
    pending("Set TENDERMINT_ENABLED to run tendermint rpc tests");
    return true;
  }
  return false;
};

// TODO: make flexible, support multiple versions, etc...
const tendermintUrl = "http://localhost:12345";

describe("Verify client connects", () => {
  it("Tries to connect with known version to tendermint", done => {
    pendingWithoutTendermint();

    const client = new Client(new HttpClient(tendermintUrl), versions.v0_20);
    client
      .abciInfo()
      .catch(err => fail(err))
      .then(done);
  });

  it("Tries to auto-discover tendermint", done => {
    pendingWithoutTendermint();

    Client.detectVersion(new HttpClient(tendermintUrl))
      .then(client => client.abciInfo())
      .catch(err => fail(err))
      .then(done);
  });
});

describe("Simple interaction with kvstore app", () => {
  const client = new Client(new HttpClient(tendermintUrl), versions.v0_20);

  it("Posts a transaction", done => {
    pendingWithoutTendermint();

    const tx = Encoding.asAscii("hello=byte");

    const verifyResponse = async (res: responses.BroadcastTxCommitResponse) => {
      expect(res.height).toBeGreaterThan(2);
      expect(res.hash.length).toEqual(20);
      // verify success
      expect(res.checkTx.code).toBeFalsy();
      expect(res.deliverTx).toBeTruthy();
      if (res.deliverTx) {
        expect(res.deliverTx.code).toBeFalsy();
      }
    };

    client
      .broadcastTxCommit({ tx: tx })
      .then(verifyResponse)
      .then(done)
      .catch(err => fail(err));
  });

  it("Queries the state", () => {
    pendingWithoutTendermint();

    const key = Encoding.asAscii("hello");
    const value = Encoding.asAscii("byte");
    const queryParams = { path: "/key", data: key };

    const verifyQuery = async (res: responses.AbciQueryResponse) => {
      expect(new Uint8Array(res.key)).toEqual(key);
      expect(new Uint8Array(res.value)).toEqual(value);
      expect(res.code).toBeFalsy();
    };

    return client
      .abciQuery(queryParams)
      .then(verifyQuery)
      .catch(err => fail(err));
  });
});

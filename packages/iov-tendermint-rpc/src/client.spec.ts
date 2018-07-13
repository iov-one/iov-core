import { Encoding } from "@iov/crypto";

import { v0_20 } from "./adaptor";
import { Client } from "./client";
import { randomId } from "./common";
import { QueryString } from "./encodings";
import * as responses from "./responses";
import { HttpClient } from "./rpcclient";

const skipTests = (): boolean => !process.env.TENDERMINT_ENABLED;
// const skipTests = (): boolean => false;

const pendingWithoutTendermint = () => {
  if (skipTests()) {
    pending("Set TENDERMINT_ENABLED to run tendermint rpc tests");
  }
};

// TODO: make flexible, support multiple versions, etc...
const tendermintUrl = "http://localhost:12345";

const key = randomId();
const value = randomId();

const buildKvTx = (k: string, v: string): Uint8Array => Encoding.asAscii(`${k}=${v}`);

describe("Verify client calls on tendermint w/ kvstore app", () => {
  it("Tries to connect with known version to tendermint", async () => {
    pendingWithoutTendermint();
    const client = new Client(new HttpClient(tendermintUrl), v0_20);
    expect(await client.abciInfo().catch(fail)).toBeTruthy();
  });

  it("Tries to auto-discover tendermint", async () => {
    pendingWithoutTendermint();
    await Client.detectVersion(new HttpClient(tendermintUrl))
      .then(client => client.abciInfo())
      .then(info => expect(info).toBeTruthy())
      .catch(fail);
  });

  it("Posts a transaction", () => {
    pendingWithoutTendermint();
    const client = new Client(new HttpClient(tendermintUrl), v0_20);
    const tx = buildKvTx(key, value);

    const verifyResponse = (res: responses.BroadcastTxCommitResponse) => {
      expect(res.height).toBeGreaterThan(2);
      expect(res.hash.length).toEqual(20);
      // verify success
      expect(res.checkTx.code).toBeFalsy();
      expect(res.deliverTx).toBeTruthy();
      if (res.deliverTx) {
        expect(res.deliverTx.code).toBeFalsy();
      }
    };

    return client
      .broadcastTxCommit({ tx: tx })
      .then(verifyResponse)
      .catch(fail);
  });

  it("Queries the state", () => {
    pendingWithoutTendermint();
    const client = new Client(new HttpClient(tendermintUrl), v0_20);

    const binKey = Encoding.asAscii(key);
    const binValue = Encoding.asAscii(value);
    const queryParams = { path: "/key", data: binKey };

    const verifyQuery = (res: responses.AbciQueryResponse) => {
      expect(new Uint8Array(res.key)).toEqual(binKey);
      expect(new Uint8Array(res.value)).toEqual(binValue);
      expect(res.code).toBeFalsy();
    };

    return client
      .abciQuery(queryParams)
      .then(verifyQuery)
      .catch(fail);
  });

  it("Sanity check - calls don't error", async () => {
    pendingWithoutTendermint();
    const client = new Client(new HttpClient(tendermintUrl), v0_20);

    expect(await client.block().catch(fail)).toBeTruthy();
    expect(await client.blockchain(2, 4).catch(fail)).toBeTruthy();
    expect(await client.blockResults(3).catch(fail)).toBeTruthy();
    expect(await client.commit(4).catch(fail)).toBeTruthy();
    expect(await client.genesis().catch(fail)).toBeTruthy();
    expect(await client.health().catch(fail)).toBeNull();
    expect(await client.status().catch(fail)).toBeTruthy();
    expect(await client.validators().catch(fail)).toBeTruthy();
  });

  it("Can query a tx properly", () => {
    pendingWithoutTendermint();
    const client = new Client(new HttpClient(tendermintUrl), v0_20);

    const verifyTxResponses = async () => {
      const find = randomId();
      const me = randomId();
      const tx = buildKvTx(find, me);

      const txRes = await client.broadcastTxCommit({ tx });
      expect(responses.txCommitSuccess(txRes)).toBeTruthy();
      expect(txRes.height).toBeTruthy();
      const height: number = txRes.height || 0; // || 0 for type system
      expect(txRes.hash.length).not.toEqual(0);
      const hash = txRes.hash;

      // find by hash - does it match?
      const r = await client.tx({ hash, prove: true });
      // both values come from rpc, so same type (Buffer/Uint8Array)
      expect(r.hash).toEqual(hash);
      // force the type when comparing to locally generated value
      expect(new Uint8Array(r.tx)).toEqual(tx);
      expect(r.height).toEqual(height);
      expect(r.proof).toBeTruthy();

      // txSearch - you must enable the indexer when running
      // tendermint, else you get empty results
      const query = `app.key='${find}'` as QueryString;
      const s = await client.txSearch({ query, page: 1, per_page: 30 });
      // should find the tx
      expect(s.totalCount).toEqual(1);
      // should return same info as querying directly,
      // except without the proof
      expect(s.txs[0]).toEqual({ ...r, proof: undefined });
    };

    return verifyTxResponses().catch(fail);
  });
});

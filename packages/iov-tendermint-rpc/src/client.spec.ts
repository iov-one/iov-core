// tslint:disable:no-console readonly-array
import { ReadonlyDate } from "readonly-date";

import { Encoding } from "@iov/encoding";

import { Adaptor, adatorForVersion } from "./adaptor";
import { Client } from "./client";
import { randomId } from "./common";
import { buildTagsQuery, QueryTag } from "./requests";
import * as responses from "./responses";
import { HttpClient, RpcClient, WebsocketClient } from "./rpcclient";

function skipTests(): boolean {
  return !process.env.TENDERMINT_ENABLED;
}

function pendingWithoutTendermint(): void {
  if (skipTests()) {
    pending("Set TENDERMINT_ENABLED to enable tendermint-based tests");
  }
}

/**
 * Tendermint instances to be tested.
 *
 * Testing legacy version: as a convention, the minor version number is encoded
 * in the port 111<version>, e.g. Tendermint 0.21.0 runs on port 11121. To start
 * a legacy version use
 *   TENDERMINT_VERSION=0.21.0 TENDERMINT_PORT=11121 ./scripts/tendermint/start.sh
 *
 * When more than 1 instances of tendermint are running, stop them manually:
 *   docker container ls | grep tendermint/tendermint
 *   docker container kill <container id from 1st column>
 */
const tendermintInstances = [
  // {
  //   url: "localhost:11121",
  //   version: "0.21.x",
  // },
  {
    url: "localhost:12345",
    version: "0.25.x",
  },
];

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildKvTx(k: string, v: string): Uint8Array {
  return Encoding.toAscii(`${k}=${v}`);
}

function defaultTestSuite(rpcFactory: () => RpcClient, adaptor: Adaptor): void {
  it("can connect to tendermint with known version", async () => {
    pendingWithoutTendermint();
    const client = new Client(rpcFactory(), adaptor);
    expect(await client.abciInfo()).toBeTruthy();
    client.disconnect();
  });

  it("can auto-discover tendermint version and connect", async () => {
    pendingWithoutTendermint();
    const client = await Client.detectVersion(rpcFactory());
    const info = await client.abciInfo();
    expect(info).toBeTruthy();
    client.disconnect();
  });

  it("can post a transaction", async () => {
    pendingWithoutTendermint();
    const client = new Client(rpcFactory(), adaptor);
    const tx = buildKvTx(randomId(), randomId());

    const response = await client.broadcastTxCommit({ tx: tx });
    expect(response.height).toBeGreaterThan(2);
    expect(response.hash.length).toEqual(20);
    // verify success
    expect(response.checkTx.code).toBeFalsy();
    expect(response.deliverTx).toBeTruthy();
    if (response.deliverTx) {
      expect(response.deliverTx.code).toBeFalsy();
    }

    client.disconnect();
  });

  it("can query the state", async () => {
    pendingWithoutTendermint();
    const client = new Client(rpcFactory(), adaptor);

    const key = randomId();
    const value = randomId();
    await client.broadcastTxCommit({ tx: buildKvTx(key, value) });

    const binKey = Encoding.toAscii(key);
    const binValue = Encoding.toAscii(value);
    const queryParams = { path: "/key", data: binKey };
    const response = await client.abciQuery(queryParams);
    expect(response.key).toEqual(binKey);
    expect(response.value).toEqual(binValue);
    expect(response.code).toBeFalsy();

    client.disconnect();
  });

  it("can call a bunch of methods", async () => {
    pendingWithoutTendermint();
    const client = new Client(rpcFactory(), adaptor);

    expect(await client.block()).toBeTruthy();
    expect(await client.blockchain(2, 4)).toBeTruthy();
    expect(await client.blockResults(3)).toBeTruthy();
    expect(await client.commit(4)).toBeTruthy();
    expect(await client.genesis()).toBeTruthy();
    expect(await client.health()).toBeNull();
    expect(await client.status()).toBeTruthy();
    expect(await client.validators()).toBeTruthy();

    client.disconnect();
  });

  it("can query a tx properly", async () => {
    pendingWithoutTendermint();
    const client = new Client(rpcFactory(), adaptor);

    const find = randomId();
    const me = randomId();
    const tx = buildKvTx(find, me);

    const txRes = await client.broadcastTxCommit({ tx });
    expect(responses.broadcastTxCommitSuccess(txRes)).toEqual(true);
    expect(txRes.height).toBeTruthy();
    const height: number = txRes.height || 0; // || 0 for type system
    expect(txRes.hash.length).not.toEqual(0);
    const hash = txRes.hash;

    // find by hash - does it match?
    const r = await client.tx({ hash, prove: true });
    // both values come from rpc, so same type (Buffer/Uint8Array)
    expect(r.hash).toEqual(hash);
    // force the type when comparing to locally generated value
    expect(r.tx).toEqual(tx);
    expect(r.height).toEqual(height);
    expect(r.proof).toBeTruthy();

    // txSearch - you must enable the indexer when running
    // tendermint, else you get empty results
    const query = buildTagsQuery([{ key: "app.key", value: find }]);

    const s = await client.txSearch({ query, page: 1, per_page: 30 });
    // should find the tx
    expect(s.totalCount).toEqual(1);
    // should return same info as querying directly,
    // except without the proof
    expect(s.txs[0]).toEqual({ ...r, proof: undefined });

    // ensure txSearchAll works as well
    const sall = await client.txSearchAll({ query });
    // should find the tx
    expect(sall.totalCount).toEqual(1);
    // should return same info as querying directly,
    // except without the proof
    expect(sall.txs[0]).toEqual({ ...r, proof: undefined });

    // and let's query the block itself to see this transaction
    const block = await client.block(height);
    expect(block.blockMeta.header.numTxs).toEqual(1);
    expect(block.block.txs.length).toEqual(1);
    expect(block.block.txs[0]).toEqual(tx);

    client.disconnect();
  });

  it("can paginate over txSearch results", async () => {
    pendingWithoutTendermint();
    const client = new Client(rpcFactory(), adaptor);

    const find = randomId();
    const query = buildTagsQuery([{ key: "app.key", value: find }]);

    const sendTx = async () => {
      const me = randomId();
      const tx = buildKvTx(find, me);

      const txRes = await client.broadcastTxCommit({ tx });
      expect(responses.broadcastTxCommitSuccess(txRes)).toEqual(true);
      expect(txRes.height).toBeTruthy();
      expect(txRes.hash.length).not.toEqual(0);
    };

    // send 3 txs
    await sendTx();
    await sendTx();
    await sendTx();

    await sleep(50); // Tendermint needs some time to update search index

    // expect one page of results
    const s1 = await client.txSearch({ query, page: 1, per_page: 2 });
    expect(s1.totalCount).toEqual(3);
    expect(s1.txs.length).toEqual(2);

    // second page
    const s2 = await client.txSearch({ query, page: 2, per_page: 2 });
    expect(s2.totalCount).toEqual(3);
    expect(s2.txs.length).toEqual(1);

    // and all together now
    const sall = await client.txSearchAll({ query, per_page: 2 });
    expect(sall.totalCount).toEqual(3);
    expect(sall.txs.length).toEqual(3);
    // make sure there are in order from lowest to highest height
    const [tx1, tx2, tx3] = sall.txs;
    expect(tx2.height).toEqual(tx1.height + 1);
    expect(tx3.height).toEqual(tx2.height + 1);

    client.disconnect();
  });
}

function websocketTestSuite(rpcFactory: () => RpcClient, adaptor: Adaptor): void {
  it("can subscribe to block header events", done => {
    pendingWithoutTendermint();

    const testStart = ReadonlyDate.now();

    (async () => {
      const events: responses.NewBlockHeaderEvent[] = [];
      const client = new Client(rpcFactory(), adaptor);
      const stream = client.subscribeNewBlockHeader();
      expect(stream).toBeTruthy();
      const subscription = stream.subscribe({
        next: event => {
          expect(event.chainId).toMatch(/^[-a-zA-Z0-9]{3,30}$/);
          expect(event.height).toBeGreaterThan(0);
          // seems that tendermint just guarantees within the last second for timestamp
          expect(event.time.getTime()).toBeGreaterThan(testStart - 1000);
          // Tendermint clock is sometimes ahead of test clock. Add 10ms tolerance
          expect(event.time.getTime()).toBeLessThanOrEqual(ReadonlyDate.now() + 10);
          expect(event.numTxs).toEqual(0);
          expect(event.lastBlockId).toBeTruthy();
          expect(event.totalTxs).toBeGreaterThan(0);

          // merkle roots for proofs
          expect(event.appHash).toBeTruthy();
          expect(event.consensusHash).toBeTruthy();
          expect(event.dataHash).toBeTruthy();
          expect(event.evidenceHash).toBeTruthy();
          expect(event.lastCommitHash).toBeTruthy();
          expect(event.lastResultsHash).toBeTruthy();
          expect(event.validatorsHash).toBeTruthy();

          events.push(event);

          if (events.length === 2) {
            subscription.unsubscribe();
            expect(events.length).toEqual(2);
            expect(events[1].chainId).toEqual(events[0].chainId);
            expect(events[1].height).toEqual(events[0].height + 1);
            expect(events[1].time.getTime()).toBeGreaterThan(events[0].time.getTime());
            expect(events[1].totalTxs).toEqual(events[0].totalTxs);

            expect(events[1].appHash).toEqual(events[0].appHash);
            expect(events[1].consensusHash).toEqual(events[0].consensusHash);
            expect(events[1].dataHash).toEqual(events[0].dataHash);
            expect(events[1].evidenceHash).toEqual(events[0].evidenceHash);
            expect(events[1].lastCommitHash).not.toEqual(events[0].lastCommitHash);
            expect(events[1].lastResultsHash).not.toEqual(events[0].lastResultsHash);
            expect(events[1].validatorsHash).toEqual(events[0].validatorsHash);

            client.disconnect();
            done();
          }
        },
        error: fail,
        complete: () => fail("Stream must not close just because we don't listen anymore"),
      });
    })().catch(fail);
  });

  it("can subscribe to block events", done => {
    pendingWithoutTendermint();

    const testStart = ReadonlyDate.now();

    (async () => {
      const events: responses.NewBlockEvent[] = [];
      const client = new Client(rpcFactory(), adaptor);
      const stream = client.subscribeNewBlock();
      expect(stream).toBeTruthy();
      const subscription = stream.subscribe({
        next: event => {
          expect(event.header.chainId).toMatch(/^[-a-zA-Z0-9]{3,30}$/);
          expect(event.header.height).toBeGreaterThan(0);
          // seems that tendermint just guarantees within the last second for timestamp
          expect(event.header.time.getTime()).toBeGreaterThan(testStart - 1000);
          // Tendermint clock is sometimes ahead of test clock. Add 10ms tolerance
          expect(event.header.time.getTime()).toBeLessThanOrEqual(ReadonlyDate.now() + 10);
          expect(event.header.numTxs).toEqual(1);
          expect(event.header.lastBlockId).toBeTruthy();
          expect(event.header.totalTxs).toBeGreaterThan(0);

          // merkle roots for proofs
          expect(event.header.appHash).toBeTruthy();
          expect(event.header.consensusHash).toBeTruthy();
          expect(event.header.dataHash).toBeTruthy();
          expect(event.header.evidenceHash).toBeTruthy();
          expect(event.header.lastCommitHash).toBeTruthy();
          expect(event.header.lastResultsHash).toBeTruthy();
          expect(event.header.validatorsHash).toBeTruthy();

          events.push(event);

          if (events.length === 2) {
            subscription.unsubscribe();
            expect(events.length).toEqual(2);
            expect(events[1].header.height).toEqual(events[0].header.height + 1);
            expect(events[1].header.chainId).toEqual(events[0].header.chainId);
            expect(events[1].header.time.getTime()).toBeGreaterThan(events[0].header.time.getTime());
            expect(events[1].header.totalTxs).toEqual(events[0].header.totalTxs + 1);

            expect(events[1].header.appHash).not.toEqual(events[0].header.appHash);
            expect(events[1].header.validatorsHash).toEqual(events[0].header.validatorsHash);

            client.disconnect();
            done();
          }
        },
        error: fail,
        complete: () => fail("Stream must not close just because we don't listen anymore"),
      });

      const transaction1 = buildKvTx(randomId(), randomId());
      const transaction2 = buildKvTx(randomId(), randomId());

      await client.broadcastTxCommit({ tx: transaction1 });
      await client.broadcastTxCommit({ tx: transaction2 });
    })().catch(fail);
  });

  it("can subscribe to transaction events", done => {
    pendingWithoutTendermint();

    (async () => {
      const events: responses.TxEvent[] = [];
      const client = new Client(rpcFactory(), adaptor);
      const stream = client.subscribeTx();
      expect(stream).toBeTruthy();
      const subscription = stream.subscribe({
        next: event => {
          expect(event.height).toBeGreaterThan(0);
          expect(event.index).toEqual(0);
          expect(event.result).toBeTruthy();
          expect(event.tx.length).toBeGreaterThan(10);

          events.push(event);

          if (events.length === 2) {
            subscription.unsubscribe();
            expect(events.length).toEqual(2);
            expect(events[1].height).toEqual(events[0].height + 1);
            expect(events[1].result.tags).not.toEqual(events[0].result.tags);

            client.disconnect();
            done();
          }
        },
        error: fail,
        complete: () => fail("Stream must not close just because we don't listen anymore"),
      });

      const transaction1 = buildKvTx(randomId(), randomId());
      const transaction2 = buildKvTx(randomId(), randomId());

      await client.broadcastTxCommit({ tx: transaction1 });
      await client.broadcastTxCommit({ tx: transaction2 });
    })().catch(fail);
  });

  it("can subscribe to transaction events filtered by creator", done => {
    pendingWithoutTendermint();

    (async () => {
      const events: responses.TxEvent[] = [];
      const client = new Client(rpcFactory(), adaptor);
      const tags: ReadonlyArray<QueryTag> = [{ key: "app.creator", value: "jae" }];
      const stream = client.subscribeTx(tags);
      expect(stream).toBeTruthy();
      const subscription = stream.subscribe({
        next: event => {
          expect(event.height).toBeGreaterThan(0);
          expect(event.index).toEqual(0);
          expect(event.result).toBeTruthy();
          expect(event.tx.length).toBeGreaterThan(10);

          events.push(event);

          if (events.length === 2) {
            subscription.unsubscribe();
            expect(events.length).toEqual(2);
            expect(events[1].height).toEqual(events[0].height + 1);
            expect(events[1].result.tags).not.toEqual(events[0].result.tags);

            client.disconnect();
            done();
          }
        },
        error: fail,
        complete: () => fail("Stream must not close just because we don't listen anymore"),
      });

      const transaction1 = buildKvTx(randomId(), randomId());
      const transaction2 = buildKvTx(randomId(), randomId());

      await client.broadcastTxCommit({ tx: transaction1 });
      await client.broadcastTxCommit({ tx: transaction2 });
    })().catch(fail);
  });
}

for (const { url, version } of tendermintInstances) {
  describe(`Client ${version}`, () => {
    it("can connect to a given url", async () => {
      pendingWithoutTendermint();

      // default connection
      {
        const client = await Client.connect(url);
        const info = await client.abciInfo();
        expect(info).toBeTruthy();
        client.disconnect();
      }

      // http connection
      {
        const client = await Client.connect("http://" + url);
        const info = await client.abciInfo();
        expect(info).toBeTruthy();
        client.disconnect();
      }

      // ws connection
      {
        const client = await Client.connect("ws://" + url);
        const info = await client.abciInfo();
        expect(info).toBeTruthy();
        client.disconnect();
      }
    });

    describe("With HttpClient", () => {
      const adaptor = adatorForVersion(version);
      defaultTestSuite(() => new HttpClient(url), adaptor);
    });

    describe("With WebsocketClient", () => {
      // don't print out WebSocket errors if marked pending
      const onError = skipTests() ? () => 0 : console.log;
      const factory = () => new WebsocketClient(url, onError);
      const adaptor = adatorForVersion(version);
      defaultTestSuite(factory, adaptor);
      websocketTestSuite(factory, adaptor);
    });
  });
}

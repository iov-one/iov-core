import { asArray } from "@iov/stream";

import { localConnectionPair } from "./connection";
import { envelope, MessageKind, RequestMessage } from "./messages";

const sleep = (t: number): Promise<void> => new Promise(resolve => setTimeout(resolve, t));

describe("Local connections work", () => {
  it("Can send both directions", async () => {
    const [a, b] = localConnectionPair();
    const gotA = asArray(a.receive);
    const gotB = asArray(b.receive);
    expect(gotA.value().length).toEqual(0);
    expect(gotB.value().length).toEqual(0);

    // send something
    const req: RequestMessage = {
      ...envelope(),
      kind: MessageKind.REQUEST,
      method: "ping",
      params: {},
    };
    a.send(req);
    await sleep(50);
    expect(gotA.value().length).toEqual(0);
    expect(gotB.value().length).toEqual(1);

    const got = gotB.value()[0];
    expect(got.kind).toEqual(req.kind);
    expect(got.id).toEqual(req.id);
  });
});

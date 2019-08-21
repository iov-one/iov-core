import { Random } from "./random";

describe("Random", () => {
  it("creates random bytes", async () => {
    {
      const bytes = await Random.getBytes(0);
      expect(bytes.length).toEqual(0);
    }

    {
      const bytes = await Random.getBytes(1);
      expect(bytes.length).toEqual(1);
    }

    {
      const bytes = await Random.getBytes(32);
      expect(bytes.length).toEqual(32);
    }

    {
      const bytes = await Random.getBytes(4096);
      expect(bytes.length).toEqual(4096);
    }

    {
      const bytes1 = await Random.getBytes(32);
      const bytes2 = await Random.getBytes(32);
      expect(bytes1).not.toEqual(bytes2);
    }
  });
});

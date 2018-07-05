import { DefaultValueProducer, ValueAndUpdates } from "./valueandupdates";

describe("ValueAndUpdates", () => {
  it("can be constructed", () => {
    {
      const vau = new ValueAndUpdates(new DefaultValueProducer("a"));
      expect(vau).toBeTruthy();
    }
    {
      const vau = new ValueAndUpdates(new DefaultValueProducer(123));
      expect(vau).toBeTruthy();
    }
    {
      const vau = new ValueAndUpdates(new DefaultValueProducer(true));
      expect(vau).toBeTruthy();
    }
    {
      const vau = new ValueAndUpdates(new DefaultValueProducer(null));
      expect(vau).toBeTruthy();
    }
  });

  it("contains initial value", () => {
    {
      const vau = new ValueAndUpdates(new DefaultValueProducer("a"));
      expect(vau.value).toEqual("a");
    }
    {
      const vau = new ValueAndUpdates(new DefaultValueProducer(123));
      expect(vau.value).toEqual(123);
    }
    {
      const vau = new ValueAndUpdates(new DefaultValueProducer(true));
      expect(vau.value).toEqual(true);
    }
    {
      const vau = new ValueAndUpdates(new DefaultValueProducer(null));
      expect(vau.value).toEqual(null);
    }
  });

  it("can be updated", () => {
    {
      const producer = new DefaultValueProducer("a");
      const vau = new ValueAndUpdates(producer);
      expect(vau.value).toEqual("a");
      producer.update("b");
      expect(vau.value).toEqual("b");
    }
    {
      const producer = new DefaultValueProducer(123);
      const vau = new ValueAndUpdates(producer);
      expect(vau.value).toEqual(123);
      producer.update(44);
      expect(vau.value).toEqual(44);
    }
    {
      const producer = new DefaultValueProducer(true);
      const vau = new ValueAndUpdates(producer);
      expect(vau.value).toEqual(true);
      producer.update(false);
      expect(vau.value).toEqual(false);
    }
    {
      const producer = new DefaultValueProducer(null);
      const vau = new ValueAndUpdates(producer);
      expect(vau.value).toEqual(null);
      producer.update(null);
      expect(vau.value).toEqual(null);
    }
  });
});

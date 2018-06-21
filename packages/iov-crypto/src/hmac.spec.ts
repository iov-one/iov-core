import { Encoding } from "./encoding";
import { Hmac } from "./hmac";
import { Sha1 } from "./sha";

const fromHex = Encoding.fromHex;

describe("HMAC", () => {
  it("can perform HMAC(SHA1) according to Botan test vectors", () => {
    // https://github.com/randombit/botan/blob/a5a260c/src/tests/data/mac/hmac.vec
    {
      const hmac = new Hmac(Sha1, fromHex("0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B"));
      hmac.update(fromHex("4869205468657265"));
      expect(hmac.digest()).toEqual(fromHex("B617318655057264E28BC0B6FB378C8EF146BE00"));
    }
    {
      const hmac = new Hmac(Sha1, fromHex("0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C"));
      hmac.update(fromHex("546573742057697468205472756E636174696F6E"));
      expect(hmac.digest()).toEqual(fromHex("4C1A03424B55E07FE7F27BE1D58BB9324A9A5A04"));
    }
    {
      const hmac = new Hmac(Sha1, fromHex("4CA0EF38F1794B28A8F8EE110EE79D48CE13BE25"));
      hmac.update(fromHex("54657374205573696E67204C6172676572205468616E20426C6F636B2D53697A65204B6579202D2048617368204B6579204669727374"));
      expect(hmac.digest()).toEqual(fromHex("AA4AE5E15272D00E95705637CE8A3B55ED402112"));
    }
    {
      const hmac = new Hmac(Sha1, fromHex("4CA0EF38F1794B28A8F8EE110EE79D48CE13BE25"));
      hmac.update(fromHex("54657374205573696E67204C6172676572205468616E20426C6F636B2D53697A65204B657920616E64204C6172676572205468616E204F6E6520426C6F636B2D53697A652044617461"));
      expect(hmac.digest()).toEqual(fromHex("E8E99D0F45237D786D6BBAA7965C7808BBFF1A91"));
    }
    {
      const hmac = new Hmac(Sha1, fromHex("0102030405060708090A0B0C0D0E0F10111213141516171819"));
      hmac.update(fromHex("CDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCD"));
      expect(hmac.digest()).toEqual(fromHex("4C9007F4026250C6BC8414F9BF50C86C2D7235DA"));
    }
    {
      const hmac = new Hmac(Sha1, fromHex("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"));
      hmac.update(fromHex("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD"));
      expect(hmac.digest()).toEqual(fromHex("125D7342B9AC11CD91A39AF48AA17B4F63F175D3"));
    }
  });

  it("can perform incremental hashing", () => {
    const hmac = new Hmac(Sha1, fromHex("0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B"));
    // full message: 4869205468657265
    hmac.update(fromHex(""));
    hmac.update(fromHex("48"));
    hmac.update(fromHex(""));
    hmac.update(fromHex(""));
    hmac.update(fromHex("69"));
    hmac.update(fromHex("20"));
    hmac.update(fromHex("5468"));
    hmac.update(fromHex("657265"));
    hmac.update(fromHex(""));
    expect(hmac.digest()).toEqual(fromHex("B617318655057264E28BC0B6FB378C8EF146BE00"));
  });
});

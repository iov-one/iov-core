import { Bip39 } from "./bip39";
import { Encoding } from "./encoding";

const fromHex = Encoding.fromHex;

describe("Bip39", () => {
  it("can encode to mnemonic", () => {
    // Test vectors from
    // https://github.com/trezor/python-mnemonic/blob/b502451a33a440783926e04428115e0bed87d01f/vectors.json
    expect(Bip39.encode(fromHex("00000000000000000000000000000000"))).toEqual("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about");
    expect(Bip39.encode(fromHex("7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f"))).toEqual("legal winner thank year wave sausage worth useful legal winner thank yellow");
    expect(Bip39.encode(fromHex("80808080808080808080808080808080"))).toEqual("letter advice cage absurd amount doctor acoustic avoid letter advice cage above");
    expect(Bip39.encode(fromHex("ffffffffffffffffffffffffffffffff"))).toEqual("zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong");
    expect(Bip39.encode(fromHex("000000000000000000000000000000000000000000000000"))).toEqual("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon agent");
    expect(Bip39.encode(fromHex("7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f"))).toEqual("legal winner thank year wave sausage worth useful legal winner thank year wave sausage worth useful legal will");
    expect(Bip39.encode(fromHex("808080808080808080808080808080808080808080808080"))).toEqual("letter advice cage absurd amount doctor acoustic avoid letter advice cage absurd amount doctor acoustic avoid letter always");
    expect(Bip39.encode(fromHex("ffffffffffffffffffffffffffffffffffffffffffffffff"))).toEqual("zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo when");
    expect(Bip39.encode(fromHex("0000000000000000000000000000000000000000000000000000000000000000"))).toEqual("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art");
    expect(Bip39.encode(fromHex("7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f"))).toEqual("legal winner thank year wave sausage worth useful legal winner thank year wave sausage worth useful legal winner thank year wave sausage worth title");
    expect(Bip39.encode(fromHex("8080808080808080808080808080808080808080808080808080808080808080"))).toEqual("letter advice cage absurd amount doctor acoustic avoid letter advice cage absurd amount doctor acoustic avoid letter advice cage absurd amount doctor acoustic bless");
    expect(Bip39.encode(fromHex("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"))).toEqual("zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo vote");
    expect(Bip39.encode(fromHex("9e885d952ad362caeb4efe34a8e91bd2"))).toEqual("ozone drill grab fiber curtain grace pudding thank cruise elder eight picnic");
    expect(Bip39.encode(fromHex("6610b25967cdcca9d59875f5cb50b0ea75433311869e930b"))).toEqual("gravity machine north sort system female filter attitude volume fold club stay feature office ecology stable narrow fog");
    expect(Bip39.encode(fromHex("68a79eaca2324873eacc50cb9c6eca8cc68ea5d936f98787c60c7ebc74e6ce7c"))).toEqual("hamster diagram private dutch cause delay private meat slide toddler razor book happy fancy gospel tennis maple dilemma loan word shrug inflict delay length");
    expect(Bip39.encode(fromHex("c0ba5a8e914111210f2bd131f3d5e08d"))).toEqual("scheme spot photo card baby mountain device kick cradle pact join borrow");
    expect(Bip39.encode(fromHex("6d9be1ee6ebd27a258115aad99b7317b9c8d28b6d76431c3"))).toEqual("horn tenant knee talent sponsor spell gate clip pulse soap slush warm silver nephew swap uncle crack brave");
    expect(Bip39.encode(fromHex("9f6a2878b2520799a44ef18bc7df394e7061a224d2c33cd015b157d746869863"))).toEqual("panda eyebrow bullet gorilla call smoke muffin taste mesh discover soft ostrich alcohol speed nation flash devote level hobby quick inner drive ghost inside");
    expect(Bip39.encode(fromHex("23db8160a31d3e0dca3688ed941adbf3"))).toEqual("cat swing flag economy stadium alone churn speed unique patch report train");
    expect(Bip39.encode(fromHex("8197a4a47f0425faeaa69deebc05ca29c0a5b5cc76ceacc0"))).toEqual("light rule cinnamon wrap drastic word pride squirrel upgrade then income fatal apart sustain crack supply proud access");
    expect(Bip39.encode(fromHex("066dca1a2bb7e8a1db2832148ce9933eea0f3ac9548d793112d9a95c9407efad"))).toEqual("all hour make first leader extend hole alien behind guard gospel lava path output census museum junior mass reopen famous sing advance salt reform");
    expect(Bip39.encode(fromHex("f30f8c1da665478f49b001d94c5fc452"))).toEqual("vessel ladder alter error federal sibling chat ability sun glass valve picture");
    expect(Bip39.encode(fromHex("c10ec20dc3cd9f652c7fac2f1230f7a3c828389a14392f05"))).toEqual("scissors invite lock maple supreme raw rapid void congress muscle digital elegant little brisk hair mango congress clump");
    expect(Bip39.encode(fromHex("f585c11aec520db57dd353c69554b21a89b20fb0650966fa0a9d6f74fd989d8f"))).toEqual("void come effort suffer camp survey warrior heavy shoot primary clutch crush open amazing screen patrol group space point ten exist slush involve unfold");

    // invalid input length
    expect(() => {
      Bip39.encode(fromHex(""));
    }).toThrowError(/invalid input length/);
    expect(() => {
      Bip39.encode(fromHex("00"));
    }).toThrowError(/invalid input length/);
    expect(() => {
      Bip39.encode(fromHex("000000000000000000000000000000"));
    }).toThrowError(/invalid input length/);
    expect(() => {
      Bip39.encode(fromHex("0000000000000000000000000000000000"));
    }).toThrowError(/invalid input length/);
    expect(() => {
      Bip39.encode(fromHex("0000000000000000000000000000000000000000000000"));
    }).toThrowError(/invalid input length/);
    expect(() => {
      Bip39.encode(fromHex("00000000000000000000000000000000000000000000000000"));
    }).toThrowError(/invalid input length/);
    expect(() => {
      Bip39.encode(fromHex("00000000000000000000000000000000000000000000000000000000000000"));
    }).toThrowError(/invalid input length/);
    expect(() => {
      Bip39.encode(fromHex("000000000000000000000000000000000000000000000000000000000000000000"));
    }).toThrowError(/invalid input length/);
  });
});

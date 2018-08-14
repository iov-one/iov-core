/* tslint:disable:no-bitwise */
import { Encoding } from "@iov/encoding";

import { Argon2id, Argon2idOptions, Chacha20poly1305Ietf, Chacha20poly1305IetfCiphertext, Chacha20poly1305IetfKey, Chacha20poly1305IetfMessage, Chacha20poly1305IetfNonce, Ed25519, Ed25519Keypair, Random } from "./libsodium";

const { toAscii, fromHex } = Encoding;

describe("Libsodium", () => {
  describe("Argon2id", () => {
    // we use relatively week values here to avoid slowing down test execution

    it("works for 1 MiB memory and opsLimit = 5", async () => {
      const options: Argon2idOptions = {
        outputLength: 32,
        opsLimit: 5,
        memLimitKib: 1024,
      };
      const salt = toAscii("ABCDEFGHIJKLMNOP");

      // echo -n "123" | ./argon2 ABCDEFGHIJKLMNOP -id -v 13 -k 1024 -t 5
      await Argon2id.execute("123", salt, options).then(result => expect(result).toEqual(fromHex("3c5d010180ba0cf5b6b858cba23b318e42d33088983c404598599c3b029ecac6")));
      await Argon2id.execute("!'§$%&/()", salt, options).then(result => expect(result).toEqual(fromHex("b0268bd63015c3d8f866f9be385507b466a9bfc75f271c2c1e97c00bf53224ba")));
      await Argon2id.execute("ö", salt, options).then(result => expect(result).toEqual(fromHex("b113fc7863dbc87b7d1366c3b468d3864a2473ce46e90ed3641fff87ada561f7")));
      await Argon2id.execute("😎", salt, options).then(result => expect(result).toEqual(fromHex("dc92db2a69a5607a75472e1581ac0851292ed9a2606f1000f62fa2efc97964e0")));
    });

    it("works for 8 MiB memory and opsLimit = 2", async () => {
      const options: Argon2idOptions = {
        outputLength: 32,
        opsLimit: 2,
        memLimitKib: 8 * 1024,
      };
      const salt = toAscii("ABCDEFGHIJKLMNOP");

      // echo -n "123" | ./argon2 ABCDEFGHIJKLMNOP -id -v 13 -k 8192 -t 2
      await Argon2id.execute("123", salt, options).then(result => expect(result).toEqual(fromHex("3ee950488d26ce691657b1d753f562139857b61a58f234d6cb0ce84c4cc27328")));
      await Argon2id.execute("!'§$%&/()", salt, options).then(result => expect(result).toEqual(fromHex("ab410498b44942a28f9d0dde72f0398edf104021ee41bb80412464975817a8a1")));
      await Argon2id.execute("ö", salt, options).then(result => expect(result).toEqual(fromHex("f80c502bc3fe7b191f6e7e06359955d5dbd23f532548b7058ecbcf77a58e683d")));
      await Argon2id.execute("😎", salt, options).then(result => expect(result).toEqual(fromHex("474d9445596d2600ba3dc9bbe87d21ed4879e2445cafb10fcb69c5c3ab8ecbc7")));
    });

    it("works for 10 MiB memory and opsLimit = 1", async () => {
      const options: Argon2idOptions = {
        outputLength: 32,
        opsLimit: 1,
        memLimitKib: 10 * 1024,
      };
      const salt = toAscii("ABCDEFGHIJKLMNOP");

      // echo -n "123" | ./argon2 ABCDEFGHIJKLMNOP -id -v 13 -k 10240 -t 1
      await Argon2id.execute("123", salt, options).then(result => expect(result).toEqual(fromHex("f1832edbd41c209546eafd01f3aae28390de39bc13ff38981c4fc0c1ceaa05e3")));
      await Argon2id.execute("!'§$%&/()", salt, options).then(result => expect(result).toEqual(fromHex("30c74f405d148fd5c882a0f4238aad9ed85ef255adc102411d22736d68f76f76")));
      await Argon2id.execute("ö", salt, options).then(result => expect(result).toEqual(fromHex("b80a62f11e7a058194a8ddd80d341c47e0f3b6c41c72ee15b7926788e9963e8f")));
      await Argon2id.execute("😎", salt, options).then(result => expect(result).toEqual(fromHex("b868aa1875de2edc57bc22de1fc75f9d19f451067c529565f73c61958088b5e9")));
    });

    it("works for different output lengths", async () => {
      // echo -n "123" | ./argon2 ABCDEFGHIJKLMNOP -id -v 13 -k 1024 -t 5 -l 16
      const salt = toAscii("ABCDEFGHIJKLMNOP");

      // libsodium does not support output length < 16
      const data = new Map<number, string>();
      data.set(16, "01a5ea70c68132b474bdb7f996f55a5a");
      data.set(24, "14cf66110e167ebdbea968328bba3f40113077bc359acbe8");
      data.set(32, "3c5d010180ba0cf5b6b858cba23b318e42d33088983c404598599c3b029ecac6");
      data.set(48, "1141dc209086803b06fe0835be055ed592289c9baf9a9db6cd584cd63c2712ca0efc989017a73d6dafb7211a9d09413f");
      data.set(96, "cdb42cddd7190d0ab2453571f644ebf1214177886a51639f23518e1c92d73a196cadddf927bbc8fac59ab3615325642920d7dd73171c7b63f17e1ae173a7b6372bac7525a3230ab1edf6e3ed5c971321186c00a544c79d96bc65263eb5a85d50");
      data.set(128, "c0108a962f59c30b6af298025ad8b8027791cc91f74b96a01a92993e41871e391516e831210bdd3ae20fe501b9c2279d59d42ebc777286088d56a87f30eea04829b9903cb05a468f320e4aced531c7b10631463141a9cbd903dbad4c9b43b2ca0c56ff5a0093179924685e061979e49a593719bb3373152856df922b0007bd9f");
      data.set(192, "092aeca103de921794a97abfd4f0dd1e51de29c62f372e2a984f72d280c12067316db192e47d37ccfd07243bb1ea9a14f7a361a1ab3f5c4be70fb33fea868d9047bdf9ccc52cde1f1cefbb77923b236a690f30f03ebd2ebf72cd47e2acf28627d64b6bd0fe1f8fb2e598017c4892413b83df2ab4c210b51bd730644fa042fee64653a33fbc81dc715c1e05ed4592b71dee1b3fa080b3d332bd96b50c9a1b1c71b7b4e131517dcb63ab628679d20a386f98948d8b9ecf99f32611c9f747abb2d5");
      data.set(256, "94aaf5677f2c0ad13d504bbbfe9b05bbcb8194c8415c119c9d3c170fbcff0e0a42ffa48c11085c6c61f0942d88d32e0da3408099991148db876e29fc5ca80b8425ac0a09987393d7c67fc62ff21fb9713442f3a67690350a871d99bedaecb7c86c357410631c89eedf04c97e386ecb5c0028d53f2d1d6aacba67d2e7bd23792689367dfd777eb28ff4de1753955dcb5f85f34a03684089590927ebd09c251cec4abb7f717ebed22690116938c5ca8404ae7814e9391c4f3c023bafad92b26899f94b6b3dc13ebc7fa693a9233a73f3b2f06b337af3a848b006e8c53bf24b79ca50df8f638304a8671f6949fde9239e0bfa78b5a7ddf424b808a0bfcd2b4fbb20");

      for (const length of data.keys()) {
        const options: Argon2idOptions = {
          outputLength: length,
          opsLimit: 5,
          memLimitKib: 1024,
        };
        await Argon2id.execute("123", salt, options).then(result => expect(result).toEqual(fromHex(data.get(length)!)));
      }
    });

    it("throw for invalid salt lengths", async () => {
      const password = "123";
      const options: Argon2idOptions = {
        outputLength: 32,
        opsLimit: 1,
        memLimitKib: 10 * 1024,
      };

      // 8 bytes
      await Argon2id.execute(password, fromHex("aabbccddeeff0011"), options)
        .then(() => fail("Argon2id with invalid salt length must not resolve"))
        .catch(e => expect(e).toMatch(/invalid salt length/));
      // 15 bytes
      await Argon2id.execute(password, fromHex("aabbccddeeff001122334455667788"), options)
        .then(() => fail("Argon2id with invalid salt length must not resolve"))
        .catch(e => expect(e).toMatch(/invalid salt length/));
      // 17 bytes
      await Argon2id.execute(password, fromHex("aabbccddeeff00112233445566778899aa"), options)
        .then(() => fail("Argon2id with invalid salt length must not resolve"))
        .catch(e => expect(e).toMatch(/invalid salt length/));
      // 32 bytes
      await Argon2id.execute(password, fromHex("aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899"), options)
        .then(() => fail("Argon2id with invalid salt length must not resolve"))
        .catch(e => expect(e).toMatch(/invalid salt length/));
    });
  });

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

  describe("Ed25519Keypair", () => {
    it("loads from Libsodium private key", () => {
      const keypair = Ed25519Keypair.fromLibsodiumPrivkey(fromHex("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"));
      expect(keypair.privkey).toEqual(fromHex("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"));
      expect(keypair.pubkey).toEqual(fromHex("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"));
    });

    it("exports Libsodium private key", () => {
      const keypair = new Ed25519Keypair(fromHex("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"), fromHex("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"));
      expect(keypair.toLibsodiumPrivkey()).toEqual(fromHex("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"));
    });
  });

  describe("Ed25519", () => {
    it("exists", () => {
      expect(Ed25519).toBeTruthy();
    });

    it("generates keypairs", async () => {
      {
        // ok
        const seed = fromHex("43a9c17ccbb0e767ea29ce1f10813afde5f1e0a7a504e89b4d2cc2b952b8e0b9");
        const keypair = await Ed25519.makeKeypair(seed);
        expect(keypair).toBeTruthy();
        expect(keypair.pubkey).toBeTruthy();
        expect(keypair.privkey).toBeTruthy();
        expect(keypair.pubkey.byteLength).toEqual(32);
        expect(keypair.privkey.byteLength).toEqual(32);
        expect(keypair.privkey).toEqual(seed);
      }

      {
        // Test secret to public conversion (TEST 1–4 from https://tools.ietf.org/html/rfc8032#section-7.1)
        const privkey1 = fromHex("9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60");
        const pubkey1 = (await Ed25519.makeKeypair(privkey1)).pubkey;
        expect(pubkey1).toEqual(fromHex("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a"));

        const privkey2 = fromHex("4ccd089b28ff96da9db6c346ec114e0f5b8a319f35aba624da8cf6ed4fb8a6fb");
        const pubkey2 = (await Ed25519.makeKeypair(privkey2)).pubkey;
        expect(pubkey2).toEqual(fromHex("3d4017c3e843895a92b70aa74d1b7ebc9c982ccf2ec4968cc0cd55f12af4660c"));

        const privkey3 = fromHex("c5aa8df43f9f837bedb7442f31dcb7b166d38535076f094b85ce3a2e0b4458f7");
        const pubkey3 = (await Ed25519.makeKeypair(privkey3)).pubkey;
        expect(pubkey3).toEqual(fromHex("fc51cd8e6218a1a38da47ed00230f0580816ed13ba3303ac5deb911548908025"));

        const privkey4 = fromHex("f5e5767cf153319517630f226876b86c8160cc583bc013744c6bf255f5cc0ee5");
        const pubkey4 = (await Ed25519.makeKeypair(privkey4)).pubkey;
        expect(pubkey4).toEqual(fromHex("278117fc144c72340f67d0f2316e8386ceffbf2b2428c9c51fef7c597f1d426e"));
      }

      {
        // seed too short
        const seed = fromHex("43a9c17ccbb0e767ea29ce1f10813afde5f1e0a7a504e89b4d2cc2b952b8e0");
        await Ed25519.makeKeypair(seed)
          .then(() => {
            fail("promise must not resolve");
          })
          .catch(error => {
            expect(error.message).toContain("invalid seed length");
          });
      }

      {
        // seed too long
        const seed = fromHex("43a9c17ccbb0e767ea29ce1f10813afde5f1e0a7a504e89b4d2cc2b952b8e0b9aa");
        await Ed25519.makeKeypair(seed)
          .then(() => {
            fail("promise must not resolve");
          })
          .catch(error => {
            expect(error.message).toContain("invalid seed length");
          });
      }
    });

    it("generates keypairs deterministically", async () => {
      const seedA1 = fromHex("43a9c17ccbb0e767ea29ce1f10813afde5f1e0a7a504e89b4d2cc2b952b8e0b9");
      const seedA2 = fromHex("43a9c17ccbb0e767ea29ce1f10813afde5f1e0a7a504e89b4d2cc2b952b8e0b9");
      const seedB1 = fromHex("c0c42a0276d456ee007faae2cc7d1bc8925dd74983726d548e10da14c3aed12a");
      const seedB2 = fromHex("c0c42a0276d456ee007faae2cc7d1bc8925dd74983726d548e10da14c3aed12a");

      const keypairA1 = await Ed25519.makeKeypair(seedA1);
      const keypairA2 = await Ed25519.makeKeypair(seedA2);
      const keypairB1 = await Ed25519.makeKeypair(seedB1);
      const keypairB2 = await Ed25519.makeKeypair(seedB2);

      expect(keypairA1).toEqual(keypairA2);
      expect(keypairB1).toEqual(keypairB2);
      expect(keypairA1).not.toEqual(keypairB1);
      expect(keypairA2).not.toEqual(keypairB2);
    });

    it("creates signatures", async () => {
      const seed = fromHex("43a9c17ccbb0e767ea29ce1f10813afde5f1e0a7a504e89b4d2cc2b952b8e0b9");
      const keypair = await Ed25519.makeKeypair(seed);
      const message = new Uint8Array([0x11, 0x22]);
      const signature = await Ed25519.createSignature(message, keypair);
      expect(signature).toBeTruthy();
      expect(signature.byteLength).toEqual(64);
    });

    it("creates signatures deterministically", async () => {
      const seed = fromHex("43a9c17ccbb0e767ea29ce1f10813afde5f1e0a7a504e89b4d2cc2b952b8e0b9");
      const keypair = await Ed25519.makeKeypair(seed);
      const message = new Uint8Array([0x11, 0x22]);

      const signature1 = await Ed25519.createSignature(message, keypair);
      const signature2 = await Ed25519.createSignature(message, keypair);
      expect(signature1).toEqual(signature2);
    });

    it("verifies signatures", async () => {
      const seed = fromHex("43a9c17ccbb0e767ea29ce1f10813afde5f1e0a7a504e89b4d2cc2b952b8e0b9");
      const keypair = await Ed25519.makeKeypair(seed);
      const message = new Uint8Array([0x11, 0x22]);
      const signature = await Ed25519.createSignature(message, keypair);

      {
        // valid
        const ok = await Ed25519.verifySignature(signature, message, keypair.pubkey);
        expect(ok).toEqual(true);
      }

      {
        // message corrupted
        const corruptedMessage = message.map((x, i) => (i === 0 ? x ^ 0x01 : x));
        const ok = await Ed25519.verifySignature(signature, corruptedMessage, keypair.pubkey);
        expect(ok).toEqual(false);
      }

      {
        // signature corrupted
        const corruptedSignature = signature.map((x, i) => (i === 0 ? x ^ 0x01 : x));
        const ok = await Ed25519.verifySignature(corruptedSignature, message, keypair.pubkey);
        expect(ok).toEqual(false);
      }

      {
        // wrong pubkey
        const otherSeed = fromHex("91099374790843e29552c3cfa5e9286d6c77e00a2c109aaf3d0a307081314a09");
        const wrongPubkey = (await Ed25519.makeKeypair(otherSeed)).pubkey;
        const ok = await Ed25519.verifySignature(signature, message, wrongPubkey);
        expect(ok).toEqual(false);
      }
    });

    it("works with RFC8032 test vectors", async () => {
      {
        // TEST 1 from https://tools.ietf.org/html/rfc8032#section-7.1
        const keypair = new Ed25519Keypair(fromHex("9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60"), fromHex("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a"));
        const message = fromHex("");
        const signature = await Ed25519.createSignature(message, keypair);
        expect(signature).toEqual(fromHex("e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b"));
        const valid = await Ed25519.verifySignature(signature, message, keypair.pubkey);
        expect(valid).toEqual(true);
      }

      {
        // TEST 2 from https://tools.ietf.org/html/rfc8032#section-7.1
        const keypair = new Ed25519Keypair(fromHex("4ccd089b28ff96da9db6c346ec114e0f5b8a319f35aba624da8cf6ed4fb8a6fb"), fromHex("3d4017c3e843895a92b70aa74d1b7ebc9c982ccf2ec4968cc0cd55f12af4660c"));
        const message = fromHex("72");
        const signature = await Ed25519.createSignature(message, keypair);
        expect(signature).toEqual(fromHex("92a009a9f0d4cab8720e820b5f642540a2b27b5416503f8fb3762223ebdb69da085ac1e43e15996e458f3613d0f11d8c387b2eaeb4302aeeb00d291612bb0c00"));
        const valid = await Ed25519.verifySignature(signature, message, keypair.pubkey);
        expect(valid).toEqual(true);
      }

      {
        // TEST 3 from https://tools.ietf.org/html/rfc8032#section-7.1
        const keypair = new Ed25519Keypair(fromHex("c5aa8df43f9f837bedb7442f31dcb7b166d38535076f094b85ce3a2e0b4458f7"), fromHex("fc51cd8e6218a1a38da47ed00230f0580816ed13ba3303ac5deb911548908025"));
        const message = fromHex("af82");
        const signature = await Ed25519.createSignature(message, keypair);
        expect(signature).toEqual(fromHex("6291d657deec24024827e69c3abe01a30ce548a284743a445e3680d7db5ac3ac18ff9b538d16f290ae67f760984dc6594a7c15e9716ed28dc027beceea1ec40a"));
        const valid = await Ed25519.verifySignature(signature, message, keypair.pubkey);
        expect(valid).toEqual(true);
      }

      {
        // TEST 1024 from https://tools.ietf.org/html/rfc8032#section-7.1
        const keypair = new Ed25519Keypair(fromHex("f5e5767cf153319517630f226876b86c8160cc583bc013744c6bf255f5cc0ee5"), fromHex("278117fc144c72340f67d0f2316e8386ceffbf2b2428c9c51fef7c597f1d426e"));
        const message = fromHex("08b8b2b733424243760fe426a4b54908632110a66c2f6591eabd3345e3e4eb98fa6e264bf09efe12ee50f8f54e9f77b1e355f6c50544e23fb1433ddf73be84d879de7c0046dc4996d9e773f4bc9efe5738829adb26c81b37c93a1b270b20329d658675fc6ea534e0810a4432826bf58c941efb65d57a338bbd2e26640f89ffbc1a858efcb8550ee3a5e1998bd177e93a7363c344fe6b199ee5d02e82d522c4feba15452f80288a821a579116ec6dad2b3b310da903401aa62100ab5d1a36553e06203b33890cc9b832f79ef80560ccb9a39ce767967ed628c6ad573cb116dbefefd75499da96bd68a8a97b928a8bbc103b6621fcde2beca1231d206be6cd9ec7aff6f6c94fcd7204ed3455c68c83f4a41da4af2b74ef5c53f1d8ac70bdcb7ed185ce81bd84359d44254d95629e9855a94a7c1958d1f8ada5d0532ed8a5aa3fb2d17ba70eb6248e594e1a2297acbbb39d502f1a8c6eb6f1ce22b3de1a1f40cc24554119a831a9aad6079cad88425de6bde1a9187ebb6092cf67bf2b13fd65f27088d78b7e883c8759d2c4f5c65adb7553878ad575f9fad878e80a0c9ba63bcbcc2732e69485bbc9c90bfbd62481d9089beccf80cfe2df16a2cf65bd92dd597b0707e0917af48bbb75fed413d238f5555a7a569d80c3414a8d0859dc65a46128bab27af87a71314f318c782b23ebfe808b82b0ce26401d2e22f04d83d1255dc51addd3b75a2b1ae0784504df543af8969be3ea7082ff7fc9888c144da2af58429ec96031dbcad3dad9af0dcbaaaf268cb8fcffead94f3c7ca495e056a9b47acdb751fb73e666c6c655ade8297297d07ad1ba5e43f1bca32301651339e22904cc8c42f58c30c04aafdb038dda0847dd988dcda6f3bfd15c4b4c4525004aa06eeff8ca61783aacec57fb3d1f92b0fe2fd1a85f6724517b65e614ad6808d6f6ee34dff7310fdc82aebfd904b01e1dc54b2927094b2db68d6f903b68401adebf5a7e08d78ff4ef5d63653a65040cf9bfd4aca7984a74d37145986780fc0b16ac451649de6188a7dbdf191f64b5fc5e2ab47b57f7f7276cd419c17a3ca8e1b939ae49e488acba6b965610b5480109c8b17b80e1b7b750dfc7598d5d5011fd2dcc5600a32ef5b52a1ecc820e308aa342721aac0943bf6686b64b2579376504ccc493d97e6aed3fb0f9cd71a43dd497f01f17c0e2cb3797aa2a2f256656168e6c496afc5fb93246f6b1116398a346f1a641f3b041e989f7914f90cc2c7fff357876e506b50d334ba77c225bc307ba537152f3f1610e4eafe595f6d9d90d11faa933a15ef1369546868a7f3a45a96768d40fd9d03412c091c6315cf4fde7cb68606937380db2eaaa707b4c4185c32eddcdd306705e4dc1ffc872eeee475a64dfac86aba41c0618983f8741c5ef68d3a101e8a3b8cac60c905c15fc910840b94c00a0b9d0");
        const signature = await Ed25519.createSignature(message, keypair);
        expect(signature).toEqual(fromHex("0aab4c900501b3e24d7cdf4663326a3a87df5e4843b2cbdb67cbf6e460fec350aa5371b1508f9f4528ecea23c436d94b5e8fcd4f681e30a6ac00a9704a188a03"));
        const valid = await Ed25519.verifySignature(signature, message, keypair.pubkey);
        expect(valid).toEqual(true);
      }
    });
  });

  describe("Chacha20poly1305Ietf", () => {
    const makeMessage = (hex: string): Chacha20poly1305IetfMessage => fromHex(hex) as Chacha20poly1305IetfMessage;
    const makeCiphertext = (hex: string): Chacha20poly1305IetfCiphertext => fromHex(hex) as Chacha20poly1305IetfCiphertext;

    it("can encrypt and decypt simple data", async () => {
      const key = fromHex("1324cdddc4b94e625bbabcac862c9429ba011e2184a1ccad60e7c3f6ff4916d8") as Chacha20poly1305IetfKey;
      const nonce = fromHex("7dfcbef658b1fe6edaf258be") as Chacha20poly1305IetfNonce;

      const originalMessage = new Uint8Array([0x11, 0x22, 0x33, 0x44]) as Chacha20poly1305IetfMessage;
      const ciphertext = await Chacha20poly1305Ietf.encrypt(originalMessage, key, nonce);
      expect(ciphertext).toBeTruthy();
      expect(ciphertext.length).toBeTruthy(4 /* message length */ + 32 /* tag length*/);

      const decrypted = await Chacha20poly1305Ietf.decrypt(ciphertext, key, nonce);
      expect(decrypted).toBeTruthy();
      expect(decrypted).toEqual(originalMessage);
    });

    it("throws when encrypting with wrong key length", async () => {
      const nonce = fromHex("7dfcbef658b1fe6edaf258be") as Chacha20poly1305IetfNonce;
      const message = new Uint8Array([]) as Chacha20poly1305IetfMessage;

      {
        // empty
        const key = fromHex("") as Chacha20poly1305IetfKey;
        await Chacha20poly1305Ietf.encrypt(message, key, nonce)
          .then(() => fail("encryption must not succeed"))
          .catch(error => expect(error).toMatch(/invalid key length/));
      }

      {
        // 31 bytes
        const key = fromHex("1324cdddc4b94e625bbabcac862c9429ba011e2184a1ccad60e7c3f6ff4916") as Chacha20poly1305IetfKey;
        await Chacha20poly1305Ietf.encrypt(message, key, nonce)
          .then(() => fail("encryption must not succeed"))
          .catch(error => expect(error).toMatch(/invalid key length/));
      }
      {
        // 33 bytes
        const key = fromHex("1324cdddc4b94e625bbabcac862c9429ba011e2184a1ccad60e7c3f6ff4916d8aa") as Chacha20poly1305IetfKey;
        await Chacha20poly1305Ietf.encrypt(message, key, nonce)
          .then(() => fail("encryption must not succeed"))
          .catch(error => expect(error).toMatch(/invalid key length/));
      }
      {
        // 64 bytes
        const key = fromHex("1324cdddc4b94e625bbabcac862c9429ba011e2184a1ccad60e7c3f6ff4916d81324cdddc4b94e625bbabcac862c9429ba011e2184a1ccad60e7c3f6ff4916d8") as Chacha20poly1305IetfKey;
        await Chacha20poly1305Ietf.encrypt(message, key, nonce)
          .then(() => fail("encryption must not succeed"))
          .catch(error => expect(error).toMatch(/invalid key length/));
      }
    });

    it("decryption fails with wrong ciphertext/key/nonce", async () => {
      const key = fromHex("1324cdddc4b94e625bbabcac862c9429ba011e2184a1ccad60e7c3f6ff4916d8") as Chacha20poly1305IetfKey;
      const nonce = fromHex("7dfcbef658b1fe6edaf258be") as Chacha20poly1305IetfNonce;

      const originalMessage = new Uint8Array([0x11, 0x22, 0x33, 0x44]) as Chacha20poly1305IetfMessage;
      const ciphertext = await Chacha20poly1305Ietf.encrypt(originalMessage, key, nonce);
      expect(ciphertext).toBeTruthy();
      expect(ciphertext.length).toBeTruthy(4 /* message length */ + 32 /* tag length*/);

      {
        // baseline
        const decryptedPromise = Chacha20poly1305Ietf.decrypt(ciphertext, key, nonce);
        expect(await decryptedPromise).toEqual(originalMessage);
      }

      {
        // corrupted ciphertext
        const corruptedCiphertext = ciphertext.map((x, i) => (i === 0 ? x ^ 0x01 : x)) as Chacha20poly1305IetfCiphertext;
        const decryptedPromise = Chacha20poly1305Ietf.decrypt(corruptedCiphertext, key, nonce);

        await decryptedPromise
          .then(() => {
            fail("promise must not resolve");
          })
          .catch(error => {
            expect(error.message).toContain("invalid usage");
          });
      }

      {
        // corrupted key
        const corruptedKey = key.map((x, i) => (i === 0 ? x ^ 0x01 : x)) as Chacha20poly1305IetfKey;
        const decryptedPromise = Chacha20poly1305Ietf.decrypt(ciphertext, corruptedKey, nonce);

        await decryptedPromise
          .then(() => {
            fail("promise must not resolve");
          })
          .catch(error => {
            expect(error.message).toContain("invalid usage");
          });
      }

      {
        // corrupted nonce
        const corruptedNonce = nonce.map((x, i) => (i === 0 ? x ^ 0x01 : x)) as Chacha20poly1305IetfNonce;
        const decryptedPromise = Chacha20poly1305Ietf.decrypt(ciphertext, key, corruptedNonce);

        await decryptedPromise
          .then(() => {
            fail("promise must not resolve");
          })
          .catch(error => {
            expect(error.message).toContain("invalid usage");
          });
      }
    });

    it("encrypt conforms to Botan implementation ", async () => {
      // Test data generated by
      // echo -n "<message>" | ./botan encryption --mode=chacha20poly1305 --iv=000000000000000000000000 --ad= --key=0000000000000000000000000000000000000000000000000000000000000000 | xxd -p

      {
        // zero key, zero nonce
        const key = fromHex("0000000000000000000000000000000000000000000000000000000000000000") as Chacha20poly1305IetfKey;
        const nonce = fromHex("000000000000000000000000") as Chacha20poly1305IetfNonce;

        expect(await Chacha20poly1305Ietf.encrypt(makeMessage(""), key, nonce)).toEqual(fromHex("4eb972c9a8fb3a1b382bb4d36f5ffad1"));
        expect(await Chacha20poly1305Ietf.encrypt(makeMessage("31"), key, nonce)).toEqual(fromHex("ae6a27b6da4558d07cdcedbbfb492835ef"));
        expect(await Chacha20poly1305Ietf.encrypt(makeMessage("3132"), key, nonce)).toEqual(fromHex("ae350370fac13c7de718c12b32e14cd5ca49"));
        expect(await Chacha20poly1305Ietf.encrypt(makeMessage("09b7b8c14569057a7c4cdc611b839bda48123c1aba86a3e1ac6ca981c7a8c1885c9d95c661d3ff530aaf9f07f8233049ebe92297fb3a708352c59fa703087011117215142f10843b976862579be7cea3d8112d3ae69f58ed9d9684da5c51123a73e5b08627ef83b1f8feb3ef91ca8f1be327468e0cc2b3bffc1a8ef1291cedf80ff8320b90f0d17fb623c447e65f4fa48a17327d427d1aa6bb445c61dda9cc9b5c1611675e618fe6b79ab9bf045cfe0b1295aa72ff1c73d6641fb942a831506c0d268c628abff8925c011d222c443b73f18e994077f1c7a893123ed400cf2f11b8fa144c0d8fc5afcd2960281f067f1329cd4abf15a1a701762121b1e103db9538f989443fbc824d39fab22b622ec98632e957adbb39dd956f31b42af3629d8fcd461c9d4519105c0f308c7c45888583832c3c659b17b0733bc7257a9c00899a4ba9933c211579480e5c30d6837241a59d044280df466d55d0b46dcfa2db4c809023d77c2503ed3afd82489c98b0949baac0a00403af770e65c45607b615912eaf7c727b15cf976e742c1cb75fc160966dda4504edc7322a9479cb2617286c85b1412b9ffc067be3f9d2fd49568a29fe40115cf76de6dd7cc3f7e833bafbdffc39097150fe14960582a39d10102aa86718f59b102c89441806c80acfe300ea415be03162e729bd92a75b4e18a33470409034bc7fc7e9fb6c4823d6bfc77d75046c0927922dae805c7ced7a4a6fb4f46a15ee6b145e0dae56e6480ac726f7ccd5296fb2c82b5ebc2239eac2d81cea4fa789e0187134a270b6e74fc7932983e6e993e391ecc0dc9cb5963a644c6ece2eba6564533a330861eaac6120f84959e5b41ccbbe2255db17106a9955a94964ba07c5b1d1a0159f3f1e8f76f65181c17e3d616398df19fe6d8625922f5a0fd384b3238761a2003e5b5101c0c795c48ceb3ec72d9f7f5cf42df449075153f642f0ffb01414a5f6c7985855d752fd7c5a71d8eead5cf51681bb67adf267d5fb290933dff2aa25eff736616cb6437738b0121e4d14bdaf5e7e8009631ecb1f30bf574c7e3c6a79cd571dd08a38054cec4dce6fb7805a0fc8c729d75f1233bc85149e0bd1d13895855f71f2f57eda6101ed274c9e41468c28b97f5f969cc849ef5027c5afd57c24ae85e16e9659cd3954c9535d3218b20f191982df2dfad4fd13d0e33b24d83274ed6066814d70d41f84874c6072b9515aa5d2f0716d851a84533fd43f21c902fb54320e04fd0b7d05d169137482f82d46b275672a7c8aa51e4546ab494f0aa2dee67d5ea2476c0a7463af609727d52ac54054ee7f454f9420d5e9f5e28357c2b0745a466087d505919ae4923586649b5b3e845929c78ff4c22c6d5f8a31eb8eedb3351e6d5f9ce68dbb318a5d62bc116bdea32a77c46492a3ca52f06a00a14420daee72b97673ef6d4a3bc35a"), key, nonce)).toEqual(fromHex("96b05f7f10383d00e4f64b1d68ae93d7831d15baf265c688beaafabff546bb65752ab4b0fd35b110dfdeacb78cfb099cda043dbfaa308bc6fe2495b848713d7e3c7bb5f24c36e8da3916b35f828f6ed65660a3a39d4c3a2b2d55c2eef5f1a16772c287ee3894debed0e089127592330590f5959dc50d277fa3e9ff9369bea50a1cd892534743871463031eedd88df0ae4faf835db9f83dd57827cb5569f55d3f71c2dae4a6e582c85a2be1ac143e52340db9528d92d16b808c75a72e99564612e8800416a1f83d3fa758c9fd5ab926c21490797b6b583f825905000f8bbdbc56f6448c439dc2d566db6d4b6f9ca69697afc1fc7642123b399bae707e1ba551d8d8e9ace7a3ecc70b8026a62dc5c5e1932cb8077a093d673276e544bbf1708a5491b7a9550956b74688a69cdde31d29d1ff776a12d17c3a52912fa3ff1a8e80d6b93767352be2d044ce22b8c12920c6c6e4797eb3f421a71e11a409e3838aa0c77ea71cf067dbb22a1f2a83845b07a7c48c28639e111ecbcf15b521b0d72de20042d6c536b48e98ae21c61a3bc628469ca63972cbb0f932cf275ac4d8cc23f5823691ec91f7f83a7b13b5a5940cebd2a1ac3ca5769efd329d900ff524acec5b2725815385c2c578783791ab5838975c63a8b533cce9abb7cbdf52e684635707f90be900c02304929ef0530908a863249a6c6b01c75352147665c276c04cddb1bd753937f4c012853707a5643063f2dd11aeb6f689fbbbdbf094761fe97894681b2a212c4bced4bd18c90df7f7ab7acab36a53c97539a9c9d554da8cf042dc3256fee93c5638c9e1b3bcf14054afb88acf347f66f9c529ebbcc48b7b3ebc126236e478fed25f1aa9aa34fb98ca63185d8759c387a8b93ad0a1f3370466e5fe78fdf8119fc804160a7ff3059004a9d29e0fedebed79212dcf83c1ed176ea457b112d081a2b7048c84ffa43f58884f2c5aab96e89a0bfbeafd9c7f90cdf5fa12cff526ac84df20ee66a742d125b63b9f484e806f0e3df84fbb09895032e2fd71fc2ed8fc9c5d7b5a32028702204634adb351b874ee4664e8f1aab7f764e7e90c995ca153a08e99a5bad4a18572eaabc4fbd09f6d38c56a0af2965bffc82b2918e75f8d62693061d482d5b3f4ad32873d55d197ff66243eb5f6b33f304abd167309a2c4798d5a25a2a1e3c9974e1380776457d131da5dffd1ea2cbdc3973836670e1ebddfe694121261fca9fec5757939fee026da32f29a4850586c757c6de1081ac349b1487cdf59c9da7954dd24dfdd554c771473ea6be9b2c7cf03967f0233325274ed2a742cd78f0dfc1e16fb100735a03bc9e0416e521d131de3145c1767f22d429b6be35286b44feaa2d1e04817408396597703165b604dee6c8a4062ff4923599131eaf35043e0425250858c32c61f80e0405487c7e55bfb8637496096da924147eef4584af4b7b2d7f0b99a73246c"));
      }

      {
        // zero key, random nonce
        const key = fromHex("0000000000000000000000000000000000000000000000000000000000000000") as Chacha20poly1305IetfKey;
        const nonce = fromHex("c6a7bc35cf9464e827fd2b73") as Chacha20poly1305IetfNonce;

        expect(await Chacha20poly1305Ietf.encrypt(makeMessage(""), key, nonce)).toEqual(fromHex("2d7490b8739cd0ef887076a911f15cf6"));
        expect(await Chacha20poly1305Ietf.encrypt(makeMessage("31"), key, nonce)).toEqual(fromHex("3f56b75279314daed9e5b004c1bda2c05c"));
        expect(await Chacha20poly1305Ietf.encrypt(makeMessage("3132"), key, nonce)).toEqual(fromHex("3f1444b409520fccfbcae0e437792a6bc859"));
        expect(await Chacha20poly1305Ietf.encrypt(makeMessage("09b7b8c14569057a7c4cdc611b839bda48123c1aba86a3e1ac6ca981c7a8c1885c9d95c661d3ff530aaf9f07f8233049ebe92297fb3a708352c59fa703087011117215142f10843b976862579be7cea3d8112d3ae69f58ed9d9684da5c51123a73e5b08627ef83b1f8feb3ef91ca8f1be327468e0cc2b3bffc1a8ef1291cedf80ff8320b90f0d17fb623c447e65f4fa48a17327d427d1aa6bb445c61dda9cc9b5c1611675e618fe6b79ab9bf045cfe0b1295aa72ff1c73d6641fb942a831506c0d268c628abff8925c011d222c443b73f18e994077f1c7a893123ed400cf2f11b8fa144c0d8fc5afcd2960281f067f1329cd4abf15a1a701762121b1e103db9538f989443fbc824d39fab22b622ec98632e957adbb39dd956f31b42af3629d8fcd461c9d4519105c0f308c7c45888583832c3c659b17b0733bc7257a9c00899a4ba9933c211579480e5c30d6837241a59d044280df466d55d0b46dcfa2db4c809023d77c2503ed3afd82489c98b0949baac0a00403af770e65c45607b615912eaf7c727b15cf976e742c1cb75fc160966dda4504edc7322a9479cb2617286c85b1412b9ffc067be3f9d2fd49568a29fe40115cf76de6dd7cc3f7e833bafbdffc39097150fe14960582a39d10102aa86718f59b102c89441806c80acfe300ea415be03162e729bd92a75b4e18a33470409034bc7fc7e9fb6c4823d6bfc77d75046c0927922dae805c7ced7a4a6fb4f46a15ee6b145e0dae56e6480ac726f7ccd5296fb2c82b5ebc2239eac2d81cea4fa789e0187134a270b6e74fc7932983e6e993e391ecc0dc9cb5963a644c6ece2eba6564533a330861eaac6120f84959e5b41ccbbe2255db17106a9955a94964ba07c5b1d1a0159f3f1e8f76f65181c17e3d616398df19fe6d8625922f5a0fd384b3238761a2003e5b5101c0c795c48ceb3ec72d9f7f5cf42df449075153f642f0ffb01414a5f6c7985855d752fd7c5a71d8eead5cf51681bb67adf267d5fb290933dff2aa25eff736616cb6437738b0121e4d14bdaf5e7e8009631ecb1f30bf574c7e3c6a79cd571dd08a38054cec4dce6fb7805a0fc8c729d75f1233bc85149e0bd1d13895855f71f2f57eda6101ed274c9e41468c28b97f5f969cc849ef5027c5afd57c24ae85e16e9659cd3954c9535d3218b20f191982df2dfad4fd13d0e33b24d83274ed6066814d70d41f84874c6072b9515aa5d2f0716d851a84533fd43f21c902fb54320e04fd0b7d05d169137482f82d46b275672a7c8aa51e4546ab494f0aa2dee67d5ea2476c0a7463af609727d52ac54054ee7f454f9420d5e9f5e28357c2b0745a466087d505919ae4923586649b5b3e845929c78ff4c22c6d5f8a31eb8eedb3351e6d5f9ce68dbb318a5d62bc116bdea32a77c46492a3ca52f06a00a14420daee72b97673ef6d4a3bc35a"), key, nonce)).toEqual(fromHex("07916aadc8c2faba0f570b32b149b21586225de407e903f04e2f80707b49abcb739d72ed85101e06a089231d475fa13155043685b97dd955ba7d4bf32b5db388a8a2fa8e42afc9a86abe32b92752e48daf6fc357617fa38749761412e1d68484650596d23a4122e29caa0b750c2711fdd31da15d1ade620675ac5ef89f817c1fea28ec6a0672d69d6dedfb38c3466f994910273e2f3fdbb65e347fac6fc24f3d85458cfaa60cbd69613bc5de546c5e507204de3cb4a4680b90be3f1b019b55d50fc1dd15c41ef518d0e0a5d02046a7fd4af641ec252c96eb4e367b3d5619e4a9635c93804ab27150b8a13c49bf23c848bb2d3c9779cc59268ab1aa5fc67e242e332898141b77bd21814a2e788b93cf86b2e2e90e4e7dfe1fdc099638b43cd950d48ba9c50976dfecbbf1d786d488ca7d210cb572995b210caa60eb5b7d91e26c33fc0edc862b1e8fc1e999f883b16a139ecb59a91ab7f68d60a05dc21d065dcacd3b5471825e79fc0b29f3f984a4680173260ee813d3e67db6b1d8565cb06e74790a19da90354d1458515de4d657f8713ce51b92971eb2ca88f3ed5dafdda2564400ee21ed1b8ebf4813fac48389d669186be7f3f72325e16d07e9a555d5bc5b17098bb66cf4750c8e1ee295f08a8d4ed9df9969c65ff46097fc885861243e29b61abfa62447b650cb63fa6d4642eb1b20f253d2ae0348c2540d362fe065be569ba29d6423cbc20c632f29994589d6f4cf61fea3283c1da6f1b67c407dec780da2983375a61f534fc5aecc6181debdda538213e24722b5027e1cd829e54accae40d7749c2c06bc6a34a2a81afd102ce50a7d896443d8ea5a0072c0a445a4e086409b4449aaf5e6185d0b7edfdcdb29cc4bcfa84b6d683ed73c19387df3336e348bfab3131d7fc188e1683d4b387d4659a99fc51bac9e39548ceee288c5ac1c14de4dd0ba2238aaa5717d25914ed44b079fe87e4bdeab1653129ff8eb0ea7e7f1841d3c6eedb8dd39b7c98672e53735dd45d650de84dc668c6e6e4f451383cc1d59de7f0b1737be1b0b6d449986ea25a15ca890ad5a113bf2db3ec5360b66320e13e335781ecc2d9267a7a0a6cef11a0666343c384583911ae94706b7ca56a2146980323542cc8aa3f8b9f6bc7f6830e2ec12b357a27711227dbb70973887629b6363b33c23400015ac43805d00f002f421fcdadeb0064a26946bf64adb0d097a94961618974c76539f91ea987edb6f007e2292f332b5938c046c03bf3d6cc93e949552896bf17f5420c3821b3f23f9cdf7400cf9f4c22089e28537a30731b946c3ba99235f50afb04a014aa008f90a6f3a43313ae24581ff340c6755f8b498675d53c143863487ca54077977e9d0e18e7e61ff3eeeec8b09cd6f1fedd252285f9c0b5e4b2b5fe7c50f6f85255fbeb9a00f6812b791256a5d6eacf3a80b1da4c4a45e201025ca3854253cf0aadd53bf7d"));
      }

      {
        // random key, zero nonce
        const key = fromHex("1e1d2cd50e63f38a81275236f5ccc04c06dbe7a9b050eb1e38cb196c4125bbe2") as Chacha20poly1305IetfKey;
        const nonce = fromHex("000000000000000000000000") as Chacha20poly1305IetfNonce;

        expect(await Chacha20poly1305Ietf.encrypt(makeMessage(""), key, nonce)).toEqual(fromHex("3efebc6509ba053589e3cc5b8f5ba686"));
        expect(await Chacha20poly1305Ietf.encrypt(makeMessage("31"), key, nonce)).toEqual(fromHex("22ea30196acb7422f8fe1be0ae65fc7f60"));
        expect(await Chacha20poly1305Ietf.encrypt(makeMessage("3132"), key, nonce)).toEqual(fromHex("22a5f2078a30e18b38b32d200609e7ceee35"));
        expect(await Chacha20poly1305Ietf.encrypt(makeMessage("09b7b8c14569057a7c4cdc611b839bda48123c1aba86a3e1ac6ca981c7a8c1885c9d95c661d3ff530aaf9f07f8233049ebe92297fb3a708352c59fa703087011117215142f10843b976862579be7cea3d8112d3ae69f58ed9d9684da5c51123a73e5b08627ef83b1f8feb3ef91ca8f1be327468e0cc2b3bffc1a8ef1291cedf80ff8320b90f0d17fb623c447e65f4fa48a17327d427d1aa6bb445c61dda9cc9b5c1611675e618fe6b79ab9bf045cfe0b1295aa72ff1c73d6641fb942a831506c0d268c628abff8925c011d222c443b73f18e994077f1c7a893123ed400cf2f11b8fa144c0d8fc5afcd2960281f067f1329cd4abf15a1a701762121b1e103db9538f989443fbc824d39fab22b622ec98632e957adbb39dd956f31b42af3629d8fcd461c9d4519105c0f308c7c45888583832c3c659b17b0733bc7257a9c00899a4ba9933c211579480e5c30d6837241a59d044280df466d55d0b46dcfa2db4c809023d77c2503ed3afd82489c98b0949baac0a00403af770e65c45607b615912eaf7c727b15cf976e742c1cb75fc160966dda4504edc7322a9479cb2617286c85b1412b9ffc067be3f9d2fd49568a29fe40115cf76de6dd7cc3f7e833bafbdffc39097150fe14960582a39d10102aa86718f59b102c89441806c80acfe300ea415be03162e729bd92a75b4e18a33470409034bc7fc7e9fb6c4823d6bfc77d75046c0927922dae805c7ced7a4a6fb4f46a15ee6b145e0dae56e6480ac726f7ccd5296fb2c82b5ebc2239eac2d81cea4fa789e0187134a270b6e74fc7932983e6e993e391ecc0dc9cb5963a644c6ece2eba6564533a330861eaac6120f84959e5b41ccbbe2255db17106a9955a94964ba07c5b1d1a0159f3f1e8f76f65181c17e3d616398df19fe6d8625922f5a0fd384b3238761a2003e5b5101c0c795c48ceb3ec72d9f7f5cf42df449075153f642f0ffb01414a5f6c7985855d752fd7c5a71d8eead5cf51681bb67adf267d5fb290933dff2aa25eff736616cb6437738b0121e4d14bdaf5e7e8009631ecb1f30bf574c7e3c6a79cd571dd08a38054cec4dce6fb7805a0fc8c729d75f1233bc85149e0bd1d13895855f71f2f57eda6101ed274c9e41468c28b97f5f969cc849ef5027c5afd57c24ae85e16e9659cd3954c9535d3218b20f191982df2dfad4fd13d0e33b24d83274ed6066814d70d41f84874c6072b9515aa5d2f0716d851a84533fd43f21c902fb54320e04fd0b7d05d169137482f82d46b275672a7c8aa51e4546ab494f0aa2dee67d5ea2476c0a7463af609727d52ac54054ee7f454f9420d5e9f5e28357c2b0745a466087d505919ae4923586649b5b3e845929c78ff4c22c6d5f8a31eb8eedb3351e6d5f9ce68dbb318a5d62bc116bdea32a77c46492a3ca52f06a00a14420daee72b97673ef6d4a3bc35a"), key, nonce)).toEqual(fromHex("1a2026bbc63a1f0693acb0ed69f5594155fb8da9b8e009f069b81e517473fad3fff88192ec2cdabea9d78ef7d5c981483df312502664dda6890018ab9886fa2f25c9eee9828a4af40c2bc939c4435e864458b44746744a2aa1cdc722e5f5aa83d108dfedd9d96b1c5c2998dc42fbfe9c280e390f1b342e3b3132596631d8702d3ddf93b0f813536df45640261f8b68ee1f2c255712af45c21cfb84177c47e7cda748d86ca487c60111c26a3e3fb8f39aa0b1d5b81c9cddb8c61dc7afb31042ae87646822fb83fcb124366eb44562a0599fba4188af516aeed72be715e9b71aa6fb7a9c9c18380fc45aa9d50b2937f54e5f4a0f3a4d334e80a55dd3b6b5c0e003f744072f4f7e3f60c5f9cb11ea237b1d750ef9305401cbd8c511e9491374f78d2ece5ea24344dfec34cd5485c43caa282765c7d0b0185f979e5ae6b14ef362907f57fab6eae0849d7e9e08853e8137b157cdc12930373814438ae9623ab6a31d612f0aa8e94bceea9cf35d284de2f004381ee40e0b925d5606371fa17458328fa5b2485aeb022aa5acb02e4a81f23d0f62e5a68d759bd0c149915ff2fa5b387bea476d6e71143aa0a9453485c862ca2385ab48ce35776d834d42607dafb97d42e15b5537a7b86e861e78e78d16bc54bdcb2e63c3258a9835cbd0ec5b029ba421b04261d683c0235852454a5cf38cb8538265869c1b0a94f24bee1a04159acc9996f3241a3220674f5bf4d2485dcadb29a8297e1d17841fc45f920939550d58a843304cce1781da3d928b1404d8b2c44ef7453407e99faad7d6970639fd7c6312e71c1a07fcee3aafcd7f510b11d4182d71c139edc2585030dca11277f6e89f167a92af0ced07f5b1b045b8f4f6ff6260846e9dcb05a8c72980f79e0acfe0ab254ad685d62e78d4d3f1a3e1b6064cb8c0030b4d3f3a4a72cd151f26436ddcfd1ee73d9b7b66ef02269f5436abbcd741bebc7bc3270b61d4bb68c5f96c96ed6f9614b5a4a9792d156e1353a5ff268e0902ee09c512612f1f1631fc784500ae20795eedf37e64a3cebb8fbdf8728bc1a7b1c01fe52f1a846c6b8571ae36503d26e05a56280d006c8ca36d0310c411f3a5771a4779ff19a6b6197e7335a42a6b921036eafc1ea514aaf8524109eb56ba8bac6024226711ce5d57f22cafb6c506cf5d328c2a97f801145df37a1bb036f85fdd47523142153d4de8d446daeabf9958cac2d88f128e3436bdb07fa434c993742071b6b95d473e1968ba77a1d0cdf8181749f40202791df4b3a6c53894d1d0c6474119fc40295f96a43bbdab217e014c3bafe64a5a95e1934a63a2522dd124edf899549a922a1fced76b442600ca311f929beeeb232c963f6d33d9c55968d4b3108bfa64d5e78b076e88dfa12c87ef1323bf11f7ee6124a14be3b5158dac19a6ac7183a1f5d1e630bbe7a3a210715c5ec496b68fd1b076dfb37cbdb8c24acc3283"));
      }

      {
        // random key, random nonce
        const key = fromHex("1e1d2cd50e63f38a81275236f5ccc04c06dbe7a9b050eb1e38cb196c4125bbe2") as Chacha20poly1305IetfKey;
        const nonce = fromHex("c6a7bc35cf9464e827fd2b73") as Chacha20poly1305IetfNonce;

        expect(await Chacha20poly1305Ietf.encrypt(makeMessage(""), key, nonce)).toEqual(fromHex("fd4781da3c6ca2edcdaa1158b445882e"));
        expect(await Chacha20poly1305Ietf.encrypt(makeMessage("31"), key, nonce)).toEqual(fromHex("827690c1aba07471bb1fcb877cb68fc6fb"));
        expect(await Chacha20poly1305Ietf.encrypt(makeMessage("3132"), key, nonce)).toEqual(fromHex("829cb534287df9e6ca9dcc71b5dcaeedb4d0"));
        expect(await Chacha20poly1305Ietf.encrypt(makeMessage("09b7b8c14569057a7c4cdc611b839bda48123c1aba86a3e1ac6ca981c7a8c1885c9d95c661d3ff530aaf9f07f8233049ebe92297fb3a708352c59fa703087011117215142f10843b976862579be7cea3d8112d3ae69f58ed9d9684da5c51123a73e5b08627ef83b1f8feb3ef91ca8f1be327468e0cc2b3bffc1a8ef1291cedf80ff8320b90f0d17fb623c447e65f4fa48a17327d427d1aa6bb445c61dda9cc9b5c1611675e618fe6b79ab9bf045cfe0b1295aa72ff1c73d6641fb942a831506c0d268c628abff8925c011d222c443b73f18e994077f1c7a893123ed400cf2f11b8fa144c0d8fc5afcd2960281f067f1329cd4abf15a1a701762121b1e103db9538f989443fbc824d39fab22b622ec98632e957adbb39dd956f31b42af3629d8fcd461c9d4519105c0f308c7c45888583832c3c659b17b0733bc7257a9c00899a4ba9933c211579480e5c30d6837241a59d044280df466d55d0b46dcfa2db4c809023d77c2503ed3afd82489c98b0949baac0a00403af770e65c45607b615912eaf7c727b15cf976e742c1cb75fc160966dda4504edc7322a9479cb2617286c85b1412b9ffc067be3f9d2fd49568a29fe40115cf76de6dd7cc3f7e833bafbdffc39097150fe14960582a39d10102aa86718f59b102c89441806c80acfe300ea415be03162e729bd92a75b4e18a33470409034bc7fc7e9fb6c4823d6bfc77d75046c0927922dae805c7ced7a4a6fb4f46a15ee6b145e0dae56e6480ac726f7ccd5296fb2c82b5ebc2239eac2d81cea4fa789e0187134a270b6e74fc7932983e6e993e391ecc0dc9cb5963a644c6ece2eba6564533a330861eaac6120f84959e5b41ccbbe2255db17106a9955a94964ba07c5b1d1a0159f3f1e8f76f65181c17e3d616398df19fe6d8625922f5a0fd384b3238761a2003e5b5101c0c795c48ceb3ec72d9f7f5cf42df449075153f642f0ffb01414a5f6c7985855d752fd7c5a71d8eead5cf51681bb67adf267d5fb290933dff2aa25eff736616cb6437738b0121e4d14bdaf5e7e8009631ecb1f30bf574c7e3c6a79cd571dd08a38054cec4dce6fb7805a0fc8c729d75f1233bc85149e0bd1d13895855f71f2f57eda6101ed274c9e41468c28b97f5f969cc849ef5027c5afd57c24ae85e16e9659cd3954c9535d3218b20f191982df2dfad4fd13d0e33b24d83274ed6066814d70d41f84874c6072b9515aa5d2f0716d851a84533fd43f21c902fb54320e04fd0b7d05d169137482f82d46b275672a7c8aa51e4546ab494f0aa2dee67d5ea2476c0a7463af609727d52ac54054ee7f454f9420d5e9f5e28357c2b0745a466087d505919ae4923586649b5b3e845929c78ff4c22c6d5f8a31eb8eedb3351e6d5f9ce68dbb318a5d62bc116bdea32a77c46492a3ca52f06a00a14420daee72b97673ef6d4a3bc35a"), key, nonce)).toEqual(fromHex("ba1976d9d8b14c6a3121b27bac95ea7f008ec09391b370cfdfff31f09dff08bc266c402c51174f0414323cc21f7bf8b68de8518586eb328df0f75b5fdaae629dacbda60d948aafbcd6f6c8422e8cef4e7b4f90fe1ae6ae32884e691ef58c60d0fa342ab668e6d7e94426f21acf76fbe8890b6333dbd1e94d52f4dea8142ea36ff2945bef1b42b4a56677b74b63dae62c5ee682fd4b8476d773df25640ac8c4f98878334bab132c83c565757e5d83d257af5960780b7fe0b20ef3c9688572dd2a66ab24ddd224e6ffb0d585a9355a3c713f750fc4b8ab318ee1b3804df1a60ab42b4f8ca607f5e9337c259000cb248f1fb9155afc7d7979dc9c030000a98506a78e00623a898ad2380815244cf077cc750844cea78ed61bd8ef48d25caf89b27f48b3c2517ada34bf76beb335cdf84f4f86158b71e16a0092a7ae8c45dc541689f7a4c899152cc0010d81f707f3010f7b7e905b3520cb10bd2e14f852f4346e9ec36f36b87d9992abc1ffb7298a76c28b5a5a5d0a8afa4d79ef2baece548340a2da7fc271d4d7e2b68eab4e74a9322f470266d4263b68ecf6140f16308f8d71a007d0c3be7efa3b86e46c2c23b40d2ce34a6b0f1c1aebe8634b9550489498ed2f568f4c79e32fd6349eadaf0194d5c415171066210692c963f1e716d3bb7dd122f5de907024cabc3586749910ac3c845e1c790effcf228b49b890ea33db83e90c586636b5c7faf8268e66e15ca49be80e5b22dd664ce0099dbd82f86edffd56ba253650b43c2b9936afa9053acb61a79bd7640ccd03768e5825c547ad0a91a989e767fb903725e839218068f1a7dc72e07edad36b3064fd01bd1dd87c34a6271e1ed765a79199b4ac82b40fabe972d637733ff52c4cd1ea82c187ff480db0331de9498177610ca58d90c1adb936e677f4b6e6e35b641de34001f44c61b634ce0e5c84b6148dda76c33212776f653963ddaf0669dfed65438b8ab60bb64f37086f602946735a8bf9fc1d91fb0ce9afd77e994f00d7f55805c454f79895c9939aec680c841b019c3b2ffcf25dabee6e31447470381dcf4765ab6a28647501f897b3c19599edfd24a89ab5388956074a04a977883081f019973e31fc3a1abc9bdd1356a5f3a59363560dbfc614ded6b8b783d4f3c40dc5aaf2001770b61f237252f3e94230fb2b81188c93e8d6e40122ee9248636d5492c95712852eb421b2d4e7b56ea984e7db0bafe03aa2077a59f3c24607fdcd23b5109a435c870eccc986b8635bc5e0e9cd0032f3ca2bd5b8d62fa0098833fa9ebb23446e0a531331d8b67804bba2591bb830732da83ad625f27f30f4d6c62225fa416f29048b11794fb3d408ed972d5c8d9e0545122315167264cadbce11950ddb4cd3674ddb791d2033781b2955ae8175a5f05fcd4aa6042e96eea60427b2670222b73960e65401f90ea6bb1861ba60afef630570c6c8390540ff0a"));
      }
    });

    it("decrypt conforms to Botan implementation ", async () => {
      // same data as in the encryption tests, but reversed

      {
        // zero key, zero nonce
        const key = fromHex("0000000000000000000000000000000000000000000000000000000000000000") as Chacha20poly1305IetfKey;
        const nonce = fromHex("000000000000000000000000") as Chacha20poly1305IetfNonce;

        expect(await Chacha20poly1305Ietf.decrypt(makeCiphertext("4eb972c9a8fb3a1b382bb4d36f5ffad1"), key, nonce)).toEqual(fromHex(""));
        expect(await Chacha20poly1305Ietf.decrypt(makeCiphertext("ae6a27b6da4558d07cdcedbbfb492835ef"), key, nonce)).toEqual(fromHex("31"));
        expect(await Chacha20poly1305Ietf.decrypt(makeCiphertext("ae350370fac13c7de718c12b32e14cd5ca49"), key, nonce)).toEqual(fromHex("3132"));
        expect(await Chacha20poly1305Ietf.decrypt(makeCiphertext("96b05f7f10383d00e4f64b1d68ae93d7831d15baf265c688beaafabff546bb65752ab4b0fd35b110dfdeacb78cfb099cda043dbfaa308bc6fe2495b848713d7e3c7bb5f24c36e8da3916b35f828f6ed65660a3a39d4c3a2b2d55c2eef5f1a16772c287ee3894debed0e089127592330590f5959dc50d277fa3e9ff9369bea50a1cd892534743871463031eedd88df0ae4faf835db9f83dd57827cb5569f55d3f71c2dae4a6e582c85a2be1ac143e52340db9528d92d16b808c75a72e99564612e8800416a1f83d3fa758c9fd5ab926c21490797b6b583f825905000f8bbdbc56f6448c439dc2d566db6d4b6f9ca69697afc1fc7642123b399bae707e1ba551d8d8e9ace7a3ecc70b8026a62dc5c5e1932cb8077a093d673276e544bbf1708a5491b7a9550956b74688a69cdde31d29d1ff776a12d17c3a52912fa3ff1a8e80d6b93767352be2d044ce22b8c12920c6c6e4797eb3f421a71e11a409e3838aa0c77ea71cf067dbb22a1f2a83845b07a7c48c28639e111ecbcf15b521b0d72de20042d6c536b48e98ae21c61a3bc628469ca63972cbb0f932cf275ac4d8cc23f5823691ec91f7f83a7b13b5a5940cebd2a1ac3ca5769efd329d900ff524acec5b2725815385c2c578783791ab5838975c63a8b533cce9abb7cbdf52e684635707f90be900c02304929ef0530908a863249a6c6b01c75352147665c276c04cddb1bd753937f4c012853707a5643063f2dd11aeb6f689fbbbdbf094761fe97894681b2a212c4bced4bd18c90df7f7ab7acab36a53c97539a9c9d554da8cf042dc3256fee93c5638c9e1b3bcf14054afb88acf347f66f9c529ebbcc48b7b3ebc126236e478fed25f1aa9aa34fb98ca63185d8759c387a8b93ad0a1f3370466e5fe78fdf8119fc804160a7ff3059004a9d29e0fedebed79212dcf83c1ed176ea457b112d081a2b7048c84ffa43f58884f2c5aab96e89a0bfbeafd9c7f90cdf5fa12cff526ac84df20ee66a742d125b63b9f484e806f0e3df84fbb09895032e2fd71fc2ed8fc9c5d7b5a32028702204634adb351b874ee4664e8f1aab7f764e7e90c995ca153a08e99a5bad4a18572eaabc4fbd09f6d38c56a0af2965bffc82b2918e75f8d62693061d482d5b3f4ad32873d55d197ff66243eb5f6b33f304abd167309a2c4798d5a25a2a1e3c9974e1380776457d131da5dffd1ea2cbdc3973836670e1ebddfe694121261fca9fec5757939fee026da32f29a4850586c757c6de1081ac349b1487cdf59c9da7954dd24dfdd554c771473ea6be9b2c7cf03967f0233325274ed2a742cd78f0dfc1e16fb100735a03bc9e0416e521d131de3145c1767f22d429b6be35286b44feaa2d1e04817408396597703165b604dee6c8a4062ff4923599131eaf35043e0425250858c32c61f80e0405487c7e55bfb8637496096da924147eef4584af4b7b2d7f0b99a73246c"), key, nonce)).toEqual(fromHex("09b7b8c14569057a7c4cdc611b839bda48123c1aba86a3e1ac6ca981c7a8c1885c9d95c661d3ff530aaf9f07f8233049ebe92297fb3a708352c59fa703087011117215142f10843b976862579be7cea3d8112d3ae69f58ed9d9684da5c51123a73e5b08627ef83b1f8feb3ef91ca8f1be327468e0cc2b3bffc1a8ef1291cedf80ff8320b90f0d17fb623c447e65f4fa48a17327d427d1aa6bb445c61dda9cc9b5c1611675e618fe6b79ab9bf045cfe0b1295aa72ff1c73d6641fb942a831506c0d268c628abff8925c011d222c443b73f18e994077f1c7a893123ed400cf2f11b8fa144c0d8fc5afcd2960281f067f1329cd4abf15a1a701762121b1e103db9538f989443fbc824d39fab22b622ec98632e957adbb39dd956f31b42af3629d8fcd461c9d4519105c0f308c7c45888583832c3c659b17b0733bc7257a9c00899a4ba9933c211579480e5c30d6837241a59d044280df466d55d0b46dcfa2db4c809023d77c2503ed3afd82489c98b0949baac0a00403af770e65c45607b615912eaf7c727b15cf976e742c1cb75fc160966dda4504edc7322a9479cb2617286c85b1412b9ffc067be3f9d2fd49568a29fe40115cf76de6dd7cc3f7e833bafbdffc39097150fe14960582a39d10102aa86718f59b102c89441806c80acfe300ea415be03162e729bd92a75b4e18a33470409034bc7fc7e9fb6c4823d6bfc77d75046c0927922dae805c7ced7a4a6fb4f46a15ee6b145e0dae56e6480ac726f7ccd5296fb2c82b5ebc2239eac2d81cea4fa789e0187134a270b6e74fc7932983e6e993e391ecc0dc9cb5963a644c6ece2eba6564533a330861eaac6120f84959e5b41ccbbe2255db17106a9955a94964ba07c5b1d1a0159f3f1e8f76f65181c17e3d616398df19fe6d8625922f5a0fd384b3238761a2003e5b5101c0c795c48ceb3ec72d9f7f5cf42df449075153f642f0ffb01414a5f6c7985855d752fd7c5a71d8eead5cf51681bb67adf267d5fb290933dff2aa25eff736616cb6437738b0121e4d14bdaf5e7e8009631ecb1f30bf574c7e3c6a79cd571dd08a38054cec4dce6fb7805a0fc8c729d75f1233bc85149e0bd1d13895855f71f2f57eda6101ed274c9e41468c28b97f5f969cc849ef5027c5afd57c24ae85e16e9659cd3954c9535d3218b20f191982df2dfad4fd13d0e33b24d83274ed6066814d70d41f84874c6072b9515aa5d2f0716d851a84533fd43f21c902fb54320e04fd0b7d05d169137482f82d46b275672a7c8aa51e4546ab494f0aa2dee67d5ea2476c0a7463af609727d52ac54054ee7f454f9420d5e9f5e28357c2b0745a466087d505919ae4923586649b5b3e845929c78ff4c22c6d5f8a31eb8eedb3351e6d5f9ce68dbb318a5d62bc116bdea32a77c46492a3ca52f06a00a14420daee72b97673ef6d4a3bc35a"));
      }

      {
        // zero key, random nonce
        const key = fromHex("0000000000000000000000000000000000000000000000000000000000000000") as Chacha20poly1305IetfKey;
        const nonce = fromHex("c6a7bc35cf9464e827fd2b73") as Chacha20poly1305IetfNonce;

        expect(await Chacha20poly1305Ietf.decrypt(makeCiphertext("2d7490b8739cd0ef887076a911f15cf6"), key, nonce)).toEqual(fromHex(""));
        expect(await Chacha20poly1305Ietf.decrypt(makeCiphertext("3f56b75279314daed9e5b004c1bda2c05c"), key, nonce)).toEqual(fromHex("31"));
        expect(await Chacha20poly1305Ietf.decrypt(makeCiphertext("3f1444b409520fccfbcae0e437792a6bc859"), key, nonce)).toEqual(fromHex("3132"));
        expect(await Chacha20poly1305Ietf.decrypt(makeCiphertext("07916aadc8c2faba0f570b32b149b21586225de407e903f04e2f80707b49abcb739d72ed85101e06a089231d475fa13155043685b97dd955ba7d4bf32b5db388a8a2fa8e42afc9a86abe32b92752e48daf6fc357617fa38749761412e1d68484650596d23a4122e29caa0b750c2711fdd31da15d1ade620675ac5ef89f817c1fea28ec6a0672d69d6dedfb38c3466f994910273e2f3fdbb65e347fac6fc24f3d85458cfaa60cbd69613bc5de546c5e507204de3cb4a4680b90be3f1b019b55d50fc1dd15c41ef518d0e0a5d02046a7fd4af641ec252c96eb4e367b3d5619e4a9635c93804ab27150b8a13c49bf23c848bb2d3c9779cc59268ab1aa5fc67e242e332898141b77bd21814a2e788b93cf86b2e2e90e4e7dfe1fdc099638b43cd950d48ba9c50976dfecbbf1d786d488ca7d210cb572995b210caa60eb5b7d91e26c33fc0edc862b1e8fc1e999f883b16a139ecb59a91ab7f68d60a05dc21d065dcacd3b5471825e79fc0b29f3f984a4680173260ee813d3e67db6b1d8565cb06e74790a19da90354d1458515de4d657f8713ce51b92971eb2ca88f3ed5dafdda2564400ee21ed1b8ebf4813fac48389d669186be7f3f72325e16d07e9a555d5bc5b17098bb66cf4750c8e1ee295f08a8d4ed9df9969c65ff46097fc885861243e29b61abfa62447b650cb63fa6d4642eb1b20f253d2ae0348c2540d362fe065be569ba29d6423cbc20c632f29994589d6f4cf61fea3283c1da6f1b67c407dec780da2983375a61f534fc5aecc6181debdda538213e24722b5027e1cd829e54accae40d7749c2c06bc6a34a2a81afd102ce50a7d896443d8ea5a0072c0a445a4e086409b4449aaf5e6185d0b7edfdcdb29cc4bcfa84b6d683ed73c19387df3336e348bfab3131d7fc188e1683d4b387d4659a99fc51bac9e39548ceee288c5ac1c14de4dd0ba2238aaa5717d25914ed44b079fe87e4bdeab1653129ff8eb0ea7e7f1841d3c6eedb8dd39b7c98672e53735dd45d650de84dc668c6e6e4f451383cc1d59de7f0b1737be1b0b6d449986ea25a15ca890ad5a113bf2db3ec5360b66320e13e335781ecc2d9267a7a0a6cef11a0666343c384583911ae94706b7ca56a2146980323542cc8aa3f8b9f6bc7f6830e2ec12b357a27711227dbb70973887629b6363b33c23400015ac43805d00f002f421fcdadeb0064a26946bf64adb0d097a94961618974c76539f91ea987edb6f007e2292f332b5938c046c03bf3d6cc93e949552896bf17f5420c3821b3f23f9cdf7400cf9f4c22089e28537a30731b946c3ba99235f50afb04a014aa008f90a6f3a43313ae24581ff340c6755f8b498675d53c143863487ca54077977e9d0e18e7e61ff3eeeec8b09cd6f1fedd252285f9c0b5e4b2b5fe7c50f6f85255fbeb9a00f6812b791256a5d6eacf3a80b1da4c4a45e201025ca3854253cf0aadd53bf7d"), key, nonce)).toEqual(fromHex("09b7b8c14569057a7c4cdc611b839bda48123c1aba86a3e1ac6ca981c7a8c1885c9d95c661d3ff530aaf9f07f8233049ebe92297fb3a708352c59fa703087011117215142f10843b976862579be7cea3d8112d3ae69f58ed9d9684da5c51123a73e5b08627ef83b1f8feb3ef91ca8f1be327468e0cc2b3bffc1a8ef1291cedf80ff8320b90f0d17fb623c447e65f4fa48a17327d427d1aa6bb445c61dda9cc9b5c1611675e618fe6b79ab9bf045cfe0b1295aa72ff1c73d6641fb942a831506c0d268c628abff8925c011d222c443b73f18e994077f1c7a893123ed400cf2f11b8fa144c0d8fc5afcd2960281f067f1329cd4abf15a1a701762121b1e103db9538f989443fbc824d39fab22b622ec98632e957adbb39dd956f31b42af3629d8fcd461c9d4519105c0f308c7c45888583832c3c659b17b0733bc7257a9c00899a4ba9933c211579480e5c30d6837241a59d044280df466d55d0b46dcfa2db4c809023d77c2503ed3afd82489c98b0949baac0a00403af770e65c45607b615912eaf7c727b15cf976e742c1cb75fc160966dda4504edc7322a9479cb2617286c85b1412b9ffc067be3f9d2fd49568a29fe40115cf76de6dd7cc3f7e833bafbdffc39097150fe14960582a39d10102aa86718f59b102c89441806c80acfe300ea415be03162e729bd92a75b4e18a33470409034bc7fc7e9fb6c4823d6bfc77d75046c0927922dae805c7ced7a4a6fb4f46a15ee6b145e0dae56e6480ac726f7ccd5296fb2c82b5ebc2239eac2d81cea4fa789e0187134a270b6e74fc7932983e6e993e391ecc0dc9cb5963a644c6ece2eba6564533a330861eaac6120f84959e5b41ccbbe2255db17106a9955a94964ba07c5b1d1a0159f3f1e8f76f65181c17e3d616398df19fe6d8625922f5a0fd384b3238761a2003e5b5101c0c795c48ceb3ec72d9f7f5cf42df449075153f642f0ffb01414a5f6c7985855d752fd7c5a71d8eead5cf51681bb67adf267d5fb290933dff2aa25eff736616cb6437738b0121e4d14bdaf5e7e8009631ecb1f30bf574c7e3c6a79cd571dd08a38054cec4dce6fb7805a0fc8c729d75f1233bc85149e0bd1d13895855f71f2f57eda6101ed274c9e41468c28b97f5f969cc849ef5027c5afd57c24ae85e16e9659cd3954c9535d3218b20f191982df2dfad4fd13d0e33b24d83274ed6066814d70d41f84874c6072b9515aa5d2f0716d851a84533fd43f21c902fb54320e04fd0b7d05d169137482f82d46b275672a7c8aa51e4546ab494f0aa2dee67d5ea2476c0a7463af609727d52ac54054ee7f454f9420d5e9f5e28357c2b0745a466087d505919ae4923586649b5b3e845929c78ff4c22c6d5f8a31eb8eedb3351e6d5f9ce68dbb318a5d62bc116bdea32a77c46492a3ca52f06a00a14420daee72b97673ef6d4a3bc35a"));
      }

      {
        // random key, zero nonce
        const key = fromHex("1e1d2cd50e63f38a81275236f5ccc04c06dbe7a9b050eb1e38cb196c4125bbe2") as Chacha20poly1305IetfKey;
        const nonce = fromHex("000000000000000000000000") as Chacha20poly1305IetfNonce;

        expect(await Chacha20poly1305Ietf.decrypt(makeCiphertext("3efebc6509ba053589e3cc5b8f5ba686"), key, nonce)).toEqual(fromHex(""));
        expect(await Chacha20poly1305Ietf.decrypt(makeCiphertext("22ea30196acb7422f8fe1be0ae65fc7f60"), key, nonce)).toEqual(fromHex("31"));
        expect(await Chacha20poly1305Ietf.decrypt(makeCiphertext("22a5f2078a30e18b38b32d200609e7ceee35"), key, nonce)).toEqual(fromHex("3132"));
        expect(await Chacha20poly1305Ietf.decrypt(makeCiphertext("1a2026bbc63a1f0693acb0ed69f5594155fb8da9b8e009f069b81e517473fad3fff88192ec2cdabea9d78ef7d5c981483df312502664dda6890018ab9886fa2f25c9eee9828a4af40c2bc939c4435e864458b44746744a2aa1cdc722e5f5aa83d108dfedd9d96b1c5c2998dc42fbfe9c280e390f1b342e3b3132596631d8702d3ddf93b0f813536df45640261f8b68ee1f2c255712af45c21cfb84177c47e7cda748d86ca487c60111c26a3e3fb8f39aa0b1d5b81c9cddb8c61dc7afb31042ae87646822fb83fcb124366eb44562a0599fba4188af516aeed72be715e9b71aa6fb7a9c9c18380fc45aa9d50b2937f54e5f4a0f3a4d334e80a55dd3b6b5c0e003f744072f4f7e3f60c5f9cb11ea237b1d750ef9305401cbd8c511e9491374f78d2ece5ea24344dfec34cd5485c43caa282765c7d0b0185f979e5ae6b14ef362907f57fab6eae0849d7e9e08853e8137b157cdc12930373814438ae9623ab6a31d612f0aa8e94bceea9cf35d284de2f004381ee40e0b925d5606371fa17458328fa5b2485aeb022aa5acb02e4a81f23d0f62e5a68d759bd0c149915ff2fa5b387bea476d6e71143aa0a9453485c862ca2385ab48ce35776d834d42607dafb97d42e15b5537a7b86e861e78e78d16bc54bdcb2e63c3258a9835cbd0ec5b029ba421b04261d683c0235852454a5cf38cb8538265869c1b0a94f24bee1a04159acc9996f3241a3220674f5bf4d2485dcadb29a8297e1d17841fc45f920939550d58a843304cce1781da3d928b1404d8b2c44ef7453407e99faad7d6970639fd7c6312e71c1a07fcee3aafcd7f510b11d4182d71c139edc2585030dca11277f6e89f167a92af0ced07f5b1b045b8f4f6ff6260846e9dcb05a8c72980f79e0acfe0ab254ad685d62e78d4d3f1a3e1b6064cb8c0030b4d3f3a4a72cd151f26436ddcfd1ee73d9b7b66ef02269f5436abbcd741bebc7bc3270b61d4bb68c5f96c96ed6f9614b5a4a9792d156e1353a5ff268e0902ee09c512612f1f1631fc784500ae20795eedf37e64a3cebb8fbdf8728bc1a7b1c01fe52f1a846c6b8571ae36503d26e05a56280d006c8ca36d0310c411f3a5771a4779ff19a6b6197e7335a42a6b921036eafc1ea514aaf8524109eb56ba8bac6024226711ce5d57f22cafb6c506cf5d328c2a97f801145df37a1bb036f85fdd47523142153d4de8d446daeabf9958cac2d88f128e3436bdb07fa434c993742071b6b95d473e1968ba77a1d0cdf8181749f40202791df4b3a6c53894d1d0c6474119fc40295f96a43bbdab217e014c3bafe64a5a95e1934a63a2522dd124edf899549a922a1fced76b442600ca311f929beeeb232c963f6d33d9c55968d4b3108bfa64d5e78b076e88dfa12c87ef1323bf11f7ee6124a14be3b5158dac19a6ac7183a1f5d1e630bbe7a3a210715c5ec496b68fd1b076dfb37cbdb8c24acc3283"), key, nonce)).toEqual(fromHex("09b7b8c14569057a7c4cdc611b839bda48123c1aba86a3e1ac6ca981c7a8c1885c9d95c661d3ff530aaf9f07f8233049ebe92297fb3a708352c59fa703087011117215142f10843b976862579be7cea3d8112d3ae69f58ed9d9684da5c51123a73e5b08627ef83b1f8feb3ef91ca8f1be327468e0cc2b3bffc1a8ef1291cedf80ff8320b90f0d17fb623c447e65f4fa48a17327d427d1aa6bb445c61dda9cc9b5c1611675e618fe6b79ab9bf045cfe0b1295aa72ff1c73d6641fb942a831506c0d268c628abff8925c011d222c443b73f18e994077f1c7a893123ed400cf2f11b8fa144c0d8fc5afcd2960281f067f1329cd4abf15a1a701762121b1e103db9538f989443fbc824d39fab22b622ec98632e957adbb39dd956f31b42af3629d8fcd461c9d4519105c0f308c7c45888583832c3c659b17b0733bc7257a9c00899a4ba9933c211579480e5c30d6837241a59d044280df466d55d0b46dcfa2db4c809023d77c2503ed3afd82489c98b0949baac0a00403af770e65c45607b615912eaf7c727b15cf976e742c1cb75fc160966dda4504edc7322a9479cb2617286c85b1412b9ffc067be3f9d2fd49568a29fe40115cf76de6dd7cc3f7e833bafbdffc39097150fe14960582a39d10102aa86718f59b102c89441806c80acfe300ea415be03162e729bd92a75b4e18a33470409034bc7fc7e9fb6c4823d6bfc77d75046c0927922dae805c7ced7a4a6fb4f46a15ee6b145e0dae56e6480ac726f7ccd5296fb2c82b5ebc2239eac2d81cea4fa789e0187134a270b6e74fc7932983e6e993e391ecc0dc9cb5963a644c6ece2eba6564533a330861eaac6120f84959e5b41ccbbe2255db17106a9955a94964ba07c5b1d1a0159f3f1e8f76f65181c17e3d616398df19fe6d8625922f5a0fd384b3238761a2003e5b5101c0c795c48ceb3ec72d9f7f5cf42df449075153f642f0ffb01414a5f6c7985855d752fd7c5a71d8eead5cf51681bb67adf267d5fb290933dff2aa25eff736616cb6437738b0121e4d14bdaf5e7e8009631ecb1f30bf574c7e3c6a79cd571dd08a38054cec4dce6fb7805a0fc8c729d75f1233bc85149e0bd1d13895855f71f2f57eda6101ed274c9e41468c28b97f5f969cc849ef5027c5afd57c24ae85e16e9659cd3954c9535d3218b20f191982df2dfad4fd13d0e33b24d83274ed6066814d70d41f84874c6072b9515aa5d2f0716d851a84533fd43f21c902fb54320e04fd0b7d05d169137482f82d46b275672a7c8aa51e4546ab494f0aa2dee67d5ea2476c0a7463af609727d52ac54054ee7f454f9420d5e9f5e28357c2b0745a466087d505919ae4923586649b5b3e845929c78ff4c22c6d5f8a31eb8eedb3351e6d5f9ce68dbb318a5d62bc116bdea32a77c46492a3ca52f06a00a14420daee72b97673ef6d4a3bc35a"));
      }

      {
        // random key, random nonce
        const key = fromHex("1e1d2cd50e63f38a81275236f5ccc04c06dbe7a9b050eb1e38cb196c4125bbe2") as Chacha20poly1305IetfKey;
        const nonce = fromHex("c6a7bc35cf9464e827fd2b73") as Chacha20poly1305IetfNonce;

        expect(await Chacha20poly1305Ietf.decrypt(makeCiphertext("fd4781da3c6ca2edcdaa1158b445882e"), key, nonce)).toEqual(fromHex(""));
        expect(await Chacha20poly1305Ietf.decrypt(makeCiphertext("827690c1aba07471bb1fcb877cb68fc6fb"), key, nonce)).toEqual(fromHex("31"));
        expect(await Chacha20poly1305Ietf.decrypt(makeCiphertext("829cb534287df9e6ca9dcc71b5dcaeedb4d0"), key, nonce)).toEqual(fromHex("3132"));
        expect(await Chacha20poly1305Ietf.decrypt(makeCiphertext("ba1976d9d8b14c6a3121b27bac95ea7f008ec09391b370cfdfff31f09dff08bc266c402c51174f0414323cc21f7bf8b68de8518586eb328df0f75b5fdaae629dacbda60d948aafbcd6f6c8422e8cef4e7b4f90fe1ae6ae32884e691ef58c60d0fa342ab668e6d7e94426f21acf76fbe8890b6333dbd1e94d52f4dea8142ea36ff2945bef1b42b4a56677b74b63dae62c5ee682fd4b8476d773df25640ac8c4f98878334bab132c83c565757e5d83d257af5960780b7fe0b20ef3c9688572dd2a66ab24ddd224e6ffb0d585a9355a3c713f750fc4b8ab318ee1b3804df1a60ab42b4f8ca607f5e9337c259000cb248f1fb9155afc7d7979dc9c030000a98506a78e00623a898ad2380815244cf077cc750844cea78ed61bd8ef48d25caf89b27f48b3c2517ada34bf76beb335cdf84f4f86158b71e16a0092a7ae8c45dc541689f7a4c899152cc0010d81f707f3010f7b7e905b3520cb10bd2e14f852f4346e9ec36f36b87d9992abc1ffb7298a76c28b5a5a5d0a8afa4d79ef2baece548340a2da7fc271d4d7e2b68eab4e74a9322f470266d4263b68ecf6140f16308f8d71a007d0c3be7efa3b86e46c2c23b40d2ce34a6b0f1c1aebe8634b9550489498ed2f568f4c79e32fd6349eadaf0194d5c415171066210692c963f1e716d3bb7dd122f5de907024cabc3586749910ac3c845e1c790effcf228b49b890ea33db83e90c586636b5c7faf8268e66e15ca49be80e5b22dd664ce0099dbd82f86edffd56ba253650b43c2b9936afa9053acb61a79bd7640ccd03768e5825c547ad0a91a989e767fb903725e839218068f1a7dc72e07edad36b3064fd01bd1dd87c34a6271e1ed765a79199b4ac82b40fabe972d637733ff52c4cd1ea82c187ff480db0331de9498177610ca58d90c1adb936e677f4b6e6e35b641de34001f44c61b634ce0e5c84b6148dda76c33212776f653963ddaf0669dfed65438b8ab60bb64f37086f602946735a8bf9fc1d91fb0ce9afd77e994f00d7f55805c454f79895c9939aec680c841b019c3b2ffcf25dabee6e31447470381dcf4765ab6a28647501f897b3c19599edfd24a89ab5388956074a04a977883081f019973e31fc3a1abc9bdd1356a5f3a59363560dbfc614ded6b8b783d4f3c40dc5aaf2001770b61f237252f3e94230fb2b81188c93e8d6e40122ee9248636d5492c95712852eb421b2d4e7b56ea984e7db0bafe03aa2077a59f3c24607fdcd23b5109a435c870eccc986b8635bc5e0e9cd0032f3ca2bd5b8d62fa0098833fa9ebb23446e0a531331d8b67804bba2591bb830732da83ad625f27f30f4d6c62225fa416f29048b11794fb3d408ed972d5c8d9e0545122315167264cadbce11950ddb4cd3674ddb791d2033781b2955ae8175a5f05fcd4aa6042e96eea60427b2670222b73960e65401f90ea6bb1861ba60afef630570c6c8390540ff0a"), key, nonce)).toEqual(fromHex("09b7b8c14569057a7c4cdc611b839bda48123c1aba86a3e1ac6ca981c7a8c1885c9d95c661d3ff530aaf9f07f8233049ebe92297fb3a708352c59fa703087011117215142f10843b976862579be7cea3d8112d3ae69f58ed9d9684da5c51123a73e5b08627ef83b1f8feb3ef91ca8f1be327468e0cc2b3bffc1a8ef1291cedf80ff8320b90f0d17fb623c447e65f4fa48a17327d427d1aa6bb445c61dda9cc9b5c1611675e618fe6b79ab9bf045cfe0b1295aa72ff1c73d6641fb942a831506c0d268c628abff8925c011d222c443b73f18e994077f1c7a893123ed400cf2f11b8fa144c0d8fc5afcd2960281f067f1329cd4abf15a1a701762121b1e103db9538f989443fbc824d39fab22b622ec98632e957adbb39dd956f31b42af3629d8fcd461c9d4519105c0f308c7c45888583832c3c659b17b0733bc7257a9c00899a4ba9933c211579480e5c30d6837241a59d044280df466d55d0b46dcfa2db4c809023d77c2503ed3afd82489c98b0949baac0a00403af770e65c45607b615912eaf7c727b15cf976e742c1cb75fc160966dda4504edc7322a9479cb2617286c85b1412b9ffc067be3f9d2fd49568a29fe40115cf76de6dd7cc3f7e833bafbdffc39097150fe14960582a39d10102aa86718f59b102c89441806c80acfe300ea415be03162e729bd92a75b4e18a33470409034bc7fc7e9fb6c4823d6bfc77d75046c0927922dae805c7ced7a4a6fb4f46a15ee6b145e0dae56e6480ac726f7ccd5296fb2c82b5ebc2239eac2d81cea4fa789e0187134a270b6e74fc7932983e6e993e391ecc0dc9cb5963a644c6ece2eba6564533a330861eaac6120f84959e5b41ccbbe2255db17106a9955a94964ba07c5b1d1a0159f3f1e8f76f65181c17e3d616398df19fe6d8625922f5a0fd384b3238761a2003e5b5101c0c795c48ceb3ec72d9f7f5cf42df449075153f642f0ffb01414a5f6c7985855d752fd7c5a71d8eead5cf51681bb67adf267d5fb290933dff2aa25eff736616cb6437738b0121e4d14bdaf5e7e8009631ecb1f30bf574c7e3c6a79cd571dd08a38054cec4dce6fb7805a0fc8c729d75f1233bc85149e0bd1d13895855f71f2f57eda6101ed274c9e41468c28b97f5f969cc849ef5027c5afd57c24ae85e16e9659cd3954c9535d3218b20f191982df2dfad4fd13d0e33b24d83274ed6066814d70d41f84874c6072b9515aa5d2f0716d851a84533fd43f21c902fb54320e04fd0b7d05d169137482f82d46b275672a7c8aa51e4546ab494f0aa2dee67d5ea2476c0a7463af609727d52ac54054ee7f454f9420d5e9f5e28357c2b0745a466087d505919ae4923586649b5b3e845929c78ff4c22c6d5f8a31eb8eedb3351e6d5f9ce68dbb318a5d62bc116bdea32a77c46492a3ca52f06a00a14420daee72b97673ef6d4a3bc35a"));
      }
    });
  });
});

# Protobuf helper

All the serialization codecs are generated protobuf code, with the original
definitions remaining in the [weave repo](https://github.com/iov-one/weave). To
update and wrap the codecs, you should have a basic understanding of the
[protobuf format](https://developers.google.com/protocol-buffers/docs/proto3),
as well as the weave repo.

Assuming some basic knowledge, this document will attempt to guide you in
updating the codecs.

## Preparing Weave

You will need to have a local copy of weave checked out, and on the proper tag
that you want to build. You can do this by hand or make use of the helper
script.

eg. `bash ./scripts/weave.sh v0.10.0`

This will checkout the named tag (eg. v0.10.0) in a subdirectory called weave.

## Compiling the protobuf

One you have checked out weave, there are a few steps to compile the protobuf.
We wrap them all in a helper script, but here they are for your understanding.

`./scripts/cleaned_protos.sh`: will produce a list of all proto files we care
about in the weave directory you checked out before. We ignore the examples, but
do want to compile all available ./cmd directories, which we support. (or just
bnsd?) This also prepares .proto files for further processing.

There is currently an issue here, as package name is used to differentiate the
objects in the compiled javascript. And `./app`, `./cmd/bnsd/app` and
`./cmd/bcpd/app` all define protobuf with the `package app` definition. These
can be combined, but as bcpd and bnsd define the same type (`Tx`), this is a
conflict.

**TODO**: update weave to provide unique package names, not just different
paths. At this point, we can compile `./cmd/bnsd` and `./cmd/bcpd` together. We
will have to update package names in calling code.

`yarn pack-proto`: will compile all the protobuf files returned by
`./scripts/cleaned_protos.sh` into a javascript module located at
`./src/generated/codecimpl.js`. This contains the codecs to serialize and
deserialize everything.

`yarn define-proto`: will generate typescript definitions for
`./src/generated/codecimpl.js` and save them under
`src/generated/codecimpl.d.ts`. This allows us to properly use all the codecs
from typescript.

## Quick setup

To pull this all together, you can just use the helper function `protoc`... This
will perform the entire normal usecase of updating weave, compiling the named
`*.proto` files, generating type definitions, and formating them nicely. Just
pass the VERSION you want to compile as an environmental variable, and call:

`VERSION=v0.10.0 yarn protoc`

## Generating test vectors

[testdata.spec.ts](./src/testdata.spec.ts) contains a number of examples of
encodings generated from the golang binary to help ensure compatibility in the
serialization without requiring posting to a running blockchain. If there are
breaking changes to the protobuf format, or you want to add more examples, you
need to follow these steps.

### Generate a set of testvectors

You must first have a proper golang development setup, ideally with golang 1.10
or 1.11 installed. You will compile and run some golang code.

Before starting make sure you have run `weave.sh` and there is a locally checked
out copy of the codebase. You already have this if you successfully performed
the above commands or ran `yarn protoc`

Now, it is time to build and run it:

```shell
# build the binary
./scripts/build_bnsd.sh
# run it to generate testvectors
rm -rf ./testvectors
./go/bin/bnsd testgen ./testvectors
```

Keep the address mentioned there, you will need it in updating
[testdata.spec.ts](./src/testdata.spec.ts). I would suggest going through the
existing file and for every binary mentioned there, you will want to run
something like:

```shell
./scripts/tohex ./testvectors/pub_key.bin
```

For json, you can just view it, and use that to construct the object. However,
there are various binary fields that are base64 encoded. The simplest approach
to extract them into hex is:

```shell
cat ./testvectors/pub_key.json | jq .
./scripts/jsonbytes ./testvectors/pub_key.json .Pub.Ed25519
```

There is often a bit of adjusting to adapt the json to the internal object
format, but it should be straight-forward.

Note, you will also have to compile and install this script as a bech32 helper
to generate the addresses: https://github.com/nym-zone/bech32

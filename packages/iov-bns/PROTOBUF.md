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

## Test vectors

[testdata.spec.ts](./src/testdata.spec.ts) contains a number of examples of
encodings generated from the golang binary to help ensure compatibility in the
serialization without requiring posting to a running blockchain. If there are
breaking changes to the protobuf format, or you want to add more examples, you
need to follow these steps.

```shell
$ ./scripts/weave.sh v0.15.0
$ ./scripts/collect_testdata.sh > src/testdata/bnsd.json
```

Note, you will also have to compile and install this script as a bech32 helper
to generate the addresses: https://github.com/nym-zone/bech32

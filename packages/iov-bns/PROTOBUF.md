# Protobuf helper

All the serialization codecs are generated protobuf code, with the original definitions remaining
in the [weave repo](https://github.com/iov-one/weave). To update and wrap the codecs, you should
have a basic understanding of the [protobuf format](https://developers.google.com/protocol-buffers/docs/proto3),
as well as the weave repo.

Assuming some basic knowledge, this document will attempt to guide you in updating the codecs.

## Preparing Weave

You will need to have a local copy of weave checked out, and on the proper tag that you want to build.
You can do this by hand or make use of the helper script.

eg. `bash ./scripts/weave.sh v0.9.2`

This will checkout the named tag (eg. v0.9.2) in a subdirectory called weave.

## Compiling the protobuf

One you have checked out weave, there are a few steps to compile the protobuf.
We wrap them all in a helper script, but here they are for your understanding...

`yarn find-proto`: will produce a list of all proto files we care about in the weave directory you
checked out before. We ignore the examples, but do want to compile all available ./cmd directories,
which we support. (or just bnsd?)


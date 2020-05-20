# @iov/encoding

[![npm version](https://img.shields.io/npm/v/@iov/encoding.svg)](https://www.npmjs.com/package/@iov/encoding)

This package is an extension to the JavaScript standard library that is not
bound to IOV products. It provides basic hex/base64/ascii/integer encoding to
Uint8Array that doesn't rely on Buffer and also provides better error messages
on invalid input.

## Convert between bech32 and hex addresses

```
>> Bech32.encode("tiov", fromHex("1234ABCD0000AA0000FFFF0000AA00001234ABCD"))
'tiov1zg62hngqqz4qqq8lluqqp2sqqqfrf27dzrrmea'
>> toHex(Bech32.decode("tiov1zg62hngqqz4qqq8lluqqp2sqqqfrf27dzrrmea").data)
'1234abcd0000aa0000ffff0000aa00001234abcd'
```

## API Documentation

[https://iov-one.github.io/iov-core-docs/latest/iov-encoding/](https://iov-one.github.io/iov-core-docs/latest/iov-encoding/)

## License

This package is part of the IOV-Core repository, licensed under the Apache License 2.0
(see [NOTICE](https://github.com/iov-one/iov-core/blob/master/NOTICE) and [LICENSE](https://github.com/iov-one/iov-core/blob/master/LICENSE)).

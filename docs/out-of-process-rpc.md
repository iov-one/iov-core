# Out of process RPC interface

The following interface is used to communicate between and application (RPC
client) and an isolated key store (RPC server). The interface description is
technology-agnostic and can be implemented for example in JavaScript messages or
deep-link URLs.

## Types

| Name                | Definition                                                                |
| ------------------- | ------------------------------------------------------------------------- |
| `null`              | A representation of _no value_                                            |
| List{T}             | A list of elements of type T                                              |
| String              | A list of unicode codepoints                                              |
| Identity            | An identity on a blockchain, defined as a pair of chain ID and public key |
| UnsignedTransaction | A transaction to be signed                                                |

## Methods

| Name          | Input parameters                                                             | Return type                       | Description                                                                                                                                                                                                                                                                                                                          |
| ------------- | ---------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| getIdentities | `reason`: String<br>`chainIds`: List{String}                                 | `identities`: List{Identity}      | Request available identities for the specified chains. The user can choose which of the matching identities they want to reveal to the client.                                                                                                                                                                                       |
| signAndPost   | `reason`: String<br>`signer`: Identity<br>`transaction`: UnsignedTransaction | `transactionId`: String or `null` | Request signing and posting a transaction prepared by the client. User is asked to confirm the signing after reviewing the transaction content. In case of successful post to the blockchain, the transaction ID is returned to the client to allow tracking the confirmation status. When the request is denied, `null` is retruned |

## TODO

1. signAndPost could take a list of unsigned transactions. Do we want that?

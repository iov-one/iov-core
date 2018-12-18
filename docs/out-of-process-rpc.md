# Out of process RPC interface

The following interface is used to communicate between and application
and an isolated key store. The interface description is technology-agnostic
and can be implemented for example in JavaScript messages or deep-link URLs.

## Types

| Name                | Definition                        |
|---------------------|-----------------------------------|
| List{T}             | A list of elements of type T      |
| String              | A list of unicode codepoints      |
| Identity            | An identity on a blockchain, primarily described by a public key |
| UnsignedTransaction | A transaction to be signed        |

## Methods

| Name          | Input parameters   | Return type   |
|---------------|--------------------|---------------|
| getIdentities | `reason`: String<br>`chainId`: String | `identities`: List{Identity} |
| signAndPost   | `reason`: String<br>`chainId`: String<br>`transaction`: UnsignedTransaction | `transactionId`: string |

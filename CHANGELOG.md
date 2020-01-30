# Changelog

## 2.0.0

- @iov/bcp: Add optional payer field to `Fee` type.
- @iov/bcp: Add optional feePayer parameter to
  `BlockchainConnection.withDefaultFee`.
- @iov/bcp: Add optional senderPubkey parameter to `SendTransaction`.
- @iov/bcp: Add `isSignedTransaction` helper.
- @iov/bcp: Add `isConfirmedAndSignedTransaction` helper.
- @iov/bcp: Add `NonEmptyArray` and `isNonEmptyArray`/`newNonEmptyArray` helper
  functions.
- @iov/bns: Add support for weave v0.24.0.
- @iov/bns: Add support for weave v0.25.0.
- @iov/bns: Support ExecuteMigration in CreateProposal transactions.
- @iov/bns: Add optional payer parameter to `BnsConnection.withDefaultFee`.
- @iov/bns: `BnsConnection.searchTx` now resolves to an array of
  `ConfirmedAndSignedTransaction<UnsignedTransaction> | FailedTransaction`.
- @iov/bns: Add `BnsConnection.estimateTxSize` and
  `BnsConnection.getTxConfiguration` methods.
- @iov/bns: Include transaction size fee in `BnsConnection.getFeeQuote`, which
  now includes optional parameters `numberOfSignatures` and `nonce` for more
  accurate estimates.
- @iov/bns-governance: Add proposal type `ExecuteMigration`.
- @iov/bns-governance: Make `Governor.identity` public.
- @iov/cosmos: New package to support Cosmos.
- @iov/lisk: Export `pubkeyToAddress`.
- @iov/utils: New package added that includes utils.

Breaking changes

- ALL: With v2.0.0 we are moving to the new native `BigInt` type. As a result
  the minimum Node.js version is now 10.13. Only browsers which support `BigInt`
  will be compatible with IOV Core. This currently includes Chrome, Firefox and
  Opera, but not Edge, Internet Explorer or Safari.
- ALL: Upgrade TypeScript from 3.5 to 3.7. This changes the signature of getters
  in declaration files (see
  https://devblogs.microsoft.com/typescript/announcing-typescript-3-6/#get-and-set-accessors-allowed-in-ambient-contexts)
- @iov/bcp: Remove `LightTransaction` and `WithCreator` types and helpers.
- @iov/bcp: `UnsignedTransaction` now has a `chainId` field instead of
  `creator`.
- @iov/bcp: Replace `primarySignature` and `otherSignatures` in
  `SignedTransaction` with a single `signatures` field of type `NonEmptyArray`.
- @iov/bcp: Convert getter function `BlockchainConnection.chainId()` into
  read-only property `.chainId`.
- @iov/bcp: Add required `BlockchainConnection.codec` property.
- @iov/bns: Require fee payer to be specified when encoding a transaction with a
  fee.
- @iov/bns: Use single `signatures` field in `SignedTransaction`s.
- @iov/bns: The new field `VoteTx.voter` must be set for new transactions.
- @iov/dpos: Package removed due to the removal of @iov/rise.
- @iov/ethereum: Use single `signatures` field in `SignedTransaction`s.
- @iov/keycontrol: `UserProfile.signTransaction` now requires the signing
  identity as an argument, just like `UserProfile.appendSignature`.
- @iov/keycontrol: Deprecate `HdPaths.iovFaucet`.
- @iov/keycontrol: Use single `signatures` field in `SignedTransaction`s.
- @iov/lisk: Require `senderPubkey` in `SendTransaction`s.
- @iov/lisk: Use single `signatures` field in `SignedTransaction`s.
- @iov/multichain: The `Profile` type required to create a `MultiChainSigner`
  has been updated to match the `UserProfile` change in @iov/keycontrol.
- @iov/multichain: `MultiChainSigner.signAndPost` and `SigningServerCore` now
  both require a signing `identity` argument.
- @iov/rise: Package removed.

## 1.2.0

- @iov/bns: Upgrade weave to v0.22.0.
- @iov/bns: Support SetMsgFee in CreateProposal transactions.
- @iov/crypto: Upgrade to libsodium-wrappers v0.7.6. This means @iov/cli now
  supports Node v12.

## 1.1.0

- @iov/tendermint-rpc: Add support for Tendermint RPC v0.32.

## 1.0.0

- @iov/bns: Populate the correct block ID in `BnsConnection.watchBlockHeaders`.
- @iov/bns: Export `Condition`, `buildCondition` and `conditionToAddress`.
- @iov/cli: Add missing `tsconfig_repl.json` to the npm package, which prevented
  the tool from starting when installed via npm.
- @iov/cli: Automatically import types necessary for working with escrows.
- @iov/encoding: Add `Uint32.toBytesLittleEndian`.
- @iov/tendermint-rpc: Add `hashBlock` to `Adaptor` type and implement for
  `v0-31`.
- @iov/tendermint-rpc: Add `ReadonlyDateWithNanoseconds` and `Version` types.
- @iov/tendermint-rpc: Fill out `Header` type with missing fields and use new
  `ReadonlyDateWithNanoseconds` type for `time` field.

Breaking changes

- @iov/bcp: Add connection type parameter to `ChainConnector` and adapt
  `createBnsConnector`, `createEthereumConnector`, `createLiskConnector`,
  `createRiseConnector` accordingly.
- @iov/bns: Change multisig ID type to `number` in `multisignatureIdToAddress`.
- @iov/bns: Make escrow IDs numeric in transaction/action types.
- @iov/bns: Take a numeric escrow ID as an argument in `escrowIdToAddress`.
- @iov/bns-governance: Remove `CommitteeIds` type as well as `committeeIds` and
  `guaranteeFundEscrowIds` constants. These are now the responsibility of the
  consumer.
- @iov/bns-governance: Remove `TreasurySend` proposal type,
  `TreasurySendOptions` type and `GovernorOptions.treasuryAddress`.
- @iov/bns-governance: Make `guaranteeFundEscrowId` `Governor` option numeric.
- @iov/bns-governance: Require a non-empty list of recipients when building a
  `DistributeFunds` create proposal tx.
- @iov/encoding: Remove deprecated `EnglishMnemonic.asString` use `.toString`
  instead.
- @iov/encoding: Change return type of `Uint32.toBytesBigEndian`,
  `Uint64.toBytesBigEndian` and `Uint64.toBytesLittleEndian` to `Uint8Array`.
- @iov/keycontrol: Remove unused `ReadonlyWallet.canSign` from interface and
  implementations.
- @iov/keycontrol: Remove deprecated `HdPaths.simpleAddress`.
- @iov/tendermint-rpc: Remove support for Tendermint 0.29.x – 0.30.x.

## 0.17.8

- @iov/cli: Automatically import types necessary for creating and updating
  multisignature contracts
- @iov/encoding: Add missing integer check on input bytes in
  `Uint32.fromBigEndianBytes` and `Uint64.fromBytesBigEndian`
- @iov/encoding: Add `Decimal.fractionalDigits`, `.plus` and
  `.toFloatApproximation`.

## 0.17.7

- @iov/bcp: Add `isFullSignature` typechecker.
- @iov/bns: Validate memo length when encoding transactions.
- @iov/bns: Validate pubkey length when encoding.
- @iov/bns: Export escrow transaction types.
- @iov/bns: Export proposal action checkers.
- @iov/bns: Fixed a bug where memo fields of swap offer transactions were not
  parsed during decoding.
- @iov/bns-governance: `Governor.getElectionRules` now returns an empty array
  instead of throwing if no election rules are found.
- @iov/encoding: Add `Decimal` class.

## 0.17.6

- @iov/bns: Create exported `electionRuleIdToAddress`

## 0.17.5

- @iov/bns: Create exported `swapToAddress`, `multisignatureIdToAddress` and
  `escrowIdToAddress`

## 0.17.4

- @iov/bns-governance: Let `Governor.getElectorates` return latest version only
  (like `.getElectionRules`).

## 0.17.3

- @iov/bns-governance: Allow skipping filter in `Governor.getElectorates`.

## 0.17.2

- @iov/bns-governance: Make `Governor.address` public

## 0.17.1

- @iov/bns: Add `MultisignatureTx` type and `isMultisignatureTx` helper function
  to BNS.
- @iov/bns: Support encoding/decoding multisignature transactions.
- @iov/bns-governance: Add `TreasurySend` proposal type and export
  `TreasurySendOptions`.
- @iov/bns-governance: Support `TreasurySend` proposals in
  `Governor.buildCreateProposalTx`.

## 0.17.0

- @iov/bns: Export `pubkeyToAddress` for address generation with prefix instead
  of chain ID.

Breaking changes

- @iov/bcp: `ChainConnector` type `client` property has been renamed to
  `establishConnection` and `expectedChainId` property has been changed from
  optional to `ChainId | undefined`.
- @iov/bns: Remove support for weave 0.19.x and 0.20.x; add support for weave
  0.21.x.
- @iov/bns: `bnsConnector` has been renamed to `createBnsConnector`.
- @iov/bns: `CashConfiguration.minimalFee` is now nullable.
- @iov/bns: `BnsConnection.getDefaultFee` can resolve to `undefined`.
- @iov/core: Re-implement `Random.getBytes` to use crypto APIs directly. It is
  now synchronous.
- @iov/ethereum: `ethereumConnector` has been renamed to
  `createEthereumConnector`.
- @iov/jsonrpc: Remove deprecated types: `jsonRpcCodeInternalError`,
  `jsonRpcCodeInvalidParams`, `jsonRpcCodeInvalidRequest`,
  `jsonRpcCodeMethodNotFound`, `jsonRpcCodeParseError`,
  `jsonRpcCodeServerErrorDefault`.
- @iov/jsonrpc: Rename `parseJsonRpcResponse2` to `parseJsonRpcResponse`.
- @iov/lisk: `liskConnector` has been renamed to `createLiskConnector`.
- @iov/rise: `riseConnector` has been renamed to `createRiseConnector`.

## 0.16.3

- @iov/keycontrol: Add `UserProfile.identityExists`

## 0.16.2

- @iov/bns: Add `getVotes` by voter address method to `BnsConnection` class.
- @iov/bns-governance: Add `getVotes` method to `Governor` class.
- @iov/crypto: Add `EnglishMnemonic.wordlist`.

## 0.16.1

- @iov/bns: Set chain ID for IOV mainnet (`iov-mainnet`).
- @iov/cli: Import `UpdateTargetsOfUsernameTx`/`ChainAddressPair` by default.

## 0.16.0

- @iov/bcp: Migrate to a `Uint8Array` check that works across multiple
  instantiations of the JavaScript standard library.
- @iov/bns: Add `BnsConnection.getValidators`.
- @iov/bns: Add `ProposalAction` union type and specific proposal action types.
- @iov/bns: Add `TransferUsernameTx` type and `isTransferUsernameTx` helper
  function.
- @iov/bns-governance: Add new package to help with common governance tasks.
  Includes `Governor` class (with `GovernorOptions`); `ProposalType` along with
  the union type `ProposalOptions` and individual options types for each
  proposal type; `CommitteeId` and `CommitteeIds` types along with constants
  `committeeIds` and `guaranteeFundEscrowIds` to be populated with known
  committee IDs on a per-chain basis.
- @iov/encoding: Add standard library type checks `isNonNullObject` and
  `isUint8Array`.
- @iov/encoding: `TransactionEncoder` now skips dictionary entries with value
  `undefined` instead of throwing an error.
- @iov/ethereum: Fix transactions data in `EthereumConnection.liveTx`.
- @iov/keycontrol: Add `HdPaths.iovFaucet`.
- @iov/multichain: Add optional error logging callback to `SigningServerCore`.

Breaking changes

- @iov/bcp: `ConfirmedTransaction` does not extend `SignedTransaction` anymore,
  allowing `BlockchainConnection.searchTx`, `.listenTx` and `.liveTx` to use
  scrapers as a data source, that do not include signatures. The new type
  `ConfirmedAndSignedTransaction` was added for cases when all data needs to be
  available, like in `BlockchainConnection.getTx`.
- @iov/bns: `ElectionRule`, `Proposal` and `VersionedId` all use numeric IDs now
  to conform with `Electorate`.
- @iov/bns: Remove support for weave 0.16.x; add support for weave 0.19.x and
  0.20.x.
- @iov/bns: Remove `AddAddressToUsernameTx` and `UpdateTargetsOfUsernameTx` in
  favour of the new `UpdateTargetsOfUsernameTx`.
- @iov/bns: Rename `BnsUsernameNft.addresses` to `.targets`.
- @iov/bns: Rename `RegisterUsernameTx.addresses` to `.targets`.
- @iov/bns: `RegisterUsernameTx.username` now has to include a \*iov suffix.
- @iov/bns: Remove `TallyTx` as tallies will now be performed automatically.
- @iov/core: Move `TransactionEncoder` into @iov/encoding.
- @iov/core: Rename package to @iov/multichain.
- @iov/jsonrpc: Move basic json types `JsonCompatibleValue`,
  `isJsonCompatibleValue`, `JsonCompatibleDictionary`,
  `isJsonCompatibleDictionary`, `JsonCompatibleArray`, `isJsonCompatibleArray`
  into @iov/encoding.

## 0.15.1

- @iov/bns: Export `CreateProposalTx` and `isCreateProposalTx`.

## 0.15.0

- @iov/bcp: Add `isSwapTransaction` helper function.
- @iov/bcp: Add `isOpenSwap`, `isClaimedSwap` and `isAbortedSwap` helper
  functions.
- @iov/bcp: Add `LightTransaction` and `WithCreator` types, and
  `isLightTransaction` helper function.
- @iov/bcp: `ConfirmedTransaction` and `SignedTransaction` now take a type
  argument that extends `LightTransaction` (`UnsignedTransaction` is still the
  default).
- @iov/bcp: Helper methods `isConfirmedTransaction` and `isFailedTransaction`
  now take a type argument that extends`LightTransaction`(`UnsignedTransaction`
  is still the default).
- @iov/bcp: Add `getTx` method to `BlockchainConnection`.
- @iov/bns: Add support for multisignature transactions.
- @iov/bns: Add `CreateMultisignatureTx` and `UpdateMultisignatureTx` types
  along with `Participant`.
- @iov/bns: Add `getTx` method to `BnsConnection`.
- @iov/bns: Add support for escrow transactions.
- @iov/bns: Add `CreateEscrowTx`, `ReleaseEscrowTx`, `ReturnEscrowTx` and
  `UpdateEscrowPartiesTx` types.
- @iov/bns: Add support for governance functionality: add `CreateProposalTx`,
  `VoteTx`, `TallyTx` and related types as well as
  `BnsConnection.getElectorates`, `.getElectionRules`, `.getProposals`.
- @iov/ethereum: Add `createEtherSwapId` and `createErc20SwapId` static methods.
- @iov/ethereum: Add `SwapIdPrefix` enum.
- @iov/ethereum: Add `Erc20TokensMap` type.
- @iov/ethereum: Add `Erc20ApproveTransaction` type and
  `isErc20ApproveTransaction` helper function.
- @iov/ethereum: Add support for ERC 20 `approve` transactions.
- @iov/ethereum: Add support for ERC20 atomic swap transactions.
- @iov/ethereum: Add `getTx` method to `EthereumConnection`.
- @iov/lisk: Add `getTx` method to `LiskConnection`.
- @iov/rise: Add `getTx` method to `RiseConnection`.
- @iov/socket: Add 10 second timeout to `SocketWrapper`. Value can be configured
  using an optional constructor argument.
- @iov/socket: Add 10 second timeout to `StreamingSocket`. Value can be
  configured using an optional constructor argument.
- @iov/socket: Add `QueueingStreamingSocket` and `ReconnectingSocket` class.
- @iov/stream: `ValueAndUpdates.waitFor` now rejects the promise if the
  underlying stream emits an error before the search value was found.
- @iov/tendermint-rpc: Add support for Tendermint 0.30.x. and 0.31.x

Breaking changes

- @iov/bcp: Remove unused type `SwapIdString`.
- @iov/bcp: Remove `AtomicSwapHelpers.createId`, which is now the responsibility
  of individual blockchain connections.
- @iov/bcp: Add `SwapId` type, and use where appropriate. This is an interface
  containing `SwapIdBytes` and can be extended on a per-chain basis.
- @iov/bcp: Rename `AtomicSwapIdQuery.swapid` to `AtomicSwapIdQuery.id`.
- @iov/bcp: Rename `AtomicSwapHashlockQuery.hashlock` to
  `AtomicSwapHashQuery.hash` and change to type `Hash`; rename
  `isAtomicSwapHashlockQuery` to `isAtomicSwapHashQuery`.
- @iov/bcp: Rename `PublicIdentity` to `Identity`, `isPublicIdentity` to
  `isIdentity` and `publicIdentityEquals` to `identityEquals`.
- @iov/bcp: Several transaction types now extend `LightTransaction` instead of
  `UnsignedTransaction` (i.e. they have no `creator` field): `SendTransaction`,
  `SwapOfferTransaction`, `SwapClaimTransaction`, and `SwapAbortTransaction`.
- @iov/bcp: Add `sender` field to `SendTransaction`.
- @iov/bcp: `BlockchainConnection` methods `listenTx`, `liveTx` and `searchTx`
  now all resolve to confirmed `LightTransaction`s instead of
  `UnsignedTransaction`s.
- @iov/bcp: Rename `PublicKeyBundle`, `isPublicKeyBundle` and
  `publicKeyBundleEquals` to `PubkeyBundle`, `isPubkeyBundle` and
  `pubkeyBundleEquals`.
- @iov/bcp: Rename `PublicKeyBytes` to `PubkeyBytes`.
- @iov/bns: Remove obsolete types `BnsBlockchainNft`,
  `BnsBlockchainsByChainIdQuery`, `BnsBlockchainsQuery`.
- @iov/bns: Switch to new `SwapId` type instead of `SwapIdBytes` where
  appropriate.
- @iov/bns: `BnsConnection` methods `listenTx`, `liveTx` and `searchTx` now all
  resolve to confirmed `LightTransaction`s instead of `UnsignedTransaction`s.
- @iov/bns: Remove support for weave 0.14.x; add support for weave 0.16.x.
- @iov/bns: Remove `BnsUsernamesByChainAndAddressQuery` and
  `isBnsUsernamesByChainAndAddressQuery`, since reverse lookup is not supported
  anymore.
- @iov/bns: Rename `BnsUsernamesByOwnerAddressQuery` to
  `BnsUsernamesByOwnerQuery`.
- @iov/core: Remove `JsRpcSigningServer` and all related JS-RPC types.
- @iov/core: Change return type of `SigningServerCore.signAndPost` to
  `TransactionId | null`.
- @iov/core: Remove re-exports `Address`, `ChainId`, `Nonce`, `SendTransaction`,
  `TokenTicker` from @iov/bcp and `Ed25519HdWallet`, `Ed25519Wallet`, `HdPaths`,
  `Keyring`, `Secp256k1HdWallet`, `UserProfile`, `Wallet`, `WalletId`,
  `WalletImplementationIdString`, `WalletSerializationString` from
  @iov/keycontrol.
- @iov/crypto: Remove `Secp256k1KeypairSymbol`. `Secp256k1Keypair` now uses
  type-tagger instead.
- @iov/ethereum: Switch to new `SwapId` type instead of `SwapIdBytes` where
  appropriate.
- @iov/ethereum: `Erc20ApproveTransaction` now extends `LightTransaction`
  instead of `UnsignedTransaction` (i.e. it has no `creator` field).
- @iov/ethereum: Remove `wsUrl` from `connectionOptions`. Pass either WS or HTTP
  URLs via `baseUrl` instead.
- @iov/ethereum: `EthereumConnection` methods `listenTx`, `liveTx` and
  `searchTx` now all resolve to confirmed `LightTransaction`s instead of
  `UnsignedTransaction`s.
- @iov/keycontrol: The `UserProfile` storage format version was bumped to 2.
  Profiles stored in this version can only be opened with IOV-Core 0.14.4 and
  above.
- @iov/jsonrpc: The `id` field of `JsonRpcRequest`, `JsonRpcSuccessResponse` and
  `JsonRpcErrorResponse` is now of type `JsonRpcId`, which can be a string or a
  number.
- @iov/jsonrpc: Remove `parseJsonRpcResponse` and `parseJsonRpcError`.
- @iov/lisk: `LiskConnection` methods `listenTx`, `liveTx` and `searchTx` now
  all resolve to confirmed `LightTransaction`s instead of
  `UnsignedTransaction`s.
- @iov/lisk: Switch to new chain ID format: `lisk-%s` where `%s` is the first 10
  hex-digits of the nethash.
- @iov/rise: `RiseConnection` methods `listenTx`, `liveTx` and `searchTx` now
  all resolve to confirmed `LightTransaction`s instead of
  `UnsignedTransaction`s.
- @iov/rise: Switch to new chain ID format: `rise-%s` where `%s` is the first 10
  hex-digits of the nethash.
- @iov/tendermint-rpc: Remove support for Tendermint 0.25.x – 0.28.x.
- @iov/tendermint-rpc: Rename `v0_27` to `v0_29`, which is now the adaptor for
  0.29.x and 0.30.x.
- @iov/tendermint-rpc: Rename `ConsensusParams.blockSize` to `.block` and
  `BlockSizeParams` to `BlockParams`.

## 0.14.5

- @iov/bns: Export `isBnsTx`, `isRegisterUsernameTx`,
  `isAddAddressToUsernameTx`, `isRemoveAddressFromUsernameTx`.
- @iov/cli: Automatically import `TransactionId` from @iov/bcp.
- @iov/crypto: Add `EnglishMnemonic.toString`; deprecate `.asString`.

## 0.14.4

- @iov/ethereum: EthereumConnection now accepts a ws:// url as its baseUrl.
- @iov/keycontrol: Add missing `UserProfileOptions` export.
- @iov/keycontrol: Add `UserProfile.deriveEncryptionKey`, which lets the caller
  create and cache a `UserProfileEncryptionKey`, in order to speed up `.storeIn`
  and `.loadFrom` operations with the same password.
- @iov/keycontrol: `UserProfile.loadFrom` and `.storeIn` now accept
  `string | UserProfileEncryptionKey` as a secret.

## 0.14.3

- @iov/bns: Automatically normalize empty memo strings for weave compatibility.
- @iov/socket: Fix bug in `SocketWrapper` where the timeout error was triggered
  even if the connection was successfully established.

## 0.14.2

- @iov/jsonrpc: Add `makeJsonRpcId`.
- @iov/socket: Add 10 second timeout to `SocketWrapper`. Value can be configured
  using an optional constructor argument.
- @iov/socket: Add 10 second timeout to `StreamingSocket`. Value can be
  configured using an optional constructor argument.
- @iov/core: Add an optional argument `meta` to `GetIdentitiesAuthorization`,
  `SignAndPostAuthorization`, `SigningServerCore.getIdentities`,
  `SigningServerCore.signAndPost`, `JsonRpcSigningServer.handleUnchecked` and
  `JsonRpcSigningServer.handleChecked` which allows passing request meta
  information from the request handler to the authorization callbacks.

## 0.13.8

- @iov/socket: Fix bug in `SocketWrapper` where the timeout error was triggered
  even if the connection was successfully established.

## 0.13.7

- @iov/jsonrpc: Add `makeJsonRpcId`.
- @iov/socket: Add 10 second timeout to `SocketWrapper`. Value can be configured
  using an optional constructor argument.
- @iov/socket: Add 10 second timeout to `StreamingSocket`. Value can be
  configured using an optional constructor argument.
- @iov/core: Add an optional argument `meta` to `GetIdentitiesAuthorization`,
  `SignAndPostAuthorization`, `SigningServerCore.getIdentities`,
  `SigningServerCore.signAndPost`, `JsonRpcSigningServer.handleUnchecked` and
  `JsonRpcSigningServer.handleChecked` which allows passing request meta
  information from the request handler to the authorization callbacks.

## 0.14.1

- @iov/core: Add `JsonRpcSigningServer`.
- @iov/core: Deprecate `JsRpcSigningServer` and related types in favour of
  `JsonRpcSigningServer`.
- @iov/core: Add `SigningServerCore.signedAndPosted`.
- @iov/core: In `JsonRpcSigningServer`, decode all application level parameters
  via `TransactionEncoder.fromJson`. Before this was done inconsistently for
  `transaction` in `getIdentities` only.
- @iov/ethereum: Support serialization of atomic swap transactions (ETH and
  ERC20).
- @iov/jsonrpc: Add `jsonRpcCode` constant object. Deprecate old `jsonRpcCode*`
  constants in favour of `jsonRpcCode`.
- @iov/jsonrpc: Create `isJsonRpcSuccessResponse` analogue to
  `isJsonRpcErrorResponse`.
- @iov/jsonrpc: Create `parseJsonRpcErrorResponse`.
- @iov/jsonrpc: Create `parseJsonRpcSuccessResponse`.
- @iov/jsonrpc: Deprecate `parseJsonRpcError` and `parseJsonRpcResponse`.
- @iov/jsonrpc: Create `parseJsonRpcResponse2`, which combines
  `parseJsonRpcErrorResponse` and `parseJsonRpcSuccessResponse`. It will be
  renamed to `parseJsonRpcResponse` as soon as the existing
  `parseJsonRpcResponse` is removed.
- @iov/keycontrol: Export `ReadonlyWallet`.
- @iov/keycontrol: Deprecate `HdPaths.simpleAddress`.

## 0.13.6

- @iov/jsonrpc: Create `parseJsonRpcResponse2`, which combines
  `parseJsonRpcErrorResponse` and `parseJsonRpcSuccessResponse`. It will be
  renamed to `parseJsonRpcResponse` as soon as the existing
  `parseJsonRpcResponse` is removed.

## 0.13.5

- @iov/core: In `JsonRpcSigningServer`, decode all application level parameters
  via `TransactionEncoder.fromJson`. Before this was done inconsistently for
  `transaction` in `getIdentities` only.
- @iov/jsonrpc: Create `isJsonRpcSuccessResponse` analogue to
  `isJsonRpcErrorResponse`.
- @iov/jsonrpc: Create `parseJsonRpcErrorResponse`.
- @iov/jsonrpc: Create `parseJsonRpcSuccessResponse`.
- @iov/jsonrpc: Deprecate `parseJsonRpcError` and `parseJsonRpcResponse`.

## 0.13.4

- @iov/keycontrol: Export `ReadonlyWallet`.
- @iov/jsonrpc: Add `jsonRpcCode` constant object. Deprecate old `jsonRpcCode*`
  constants in favour of `jsonRpcCode`.
- @iov/core: Add `JsonRpcSigningServer`.
- @iov/core: Deprecate `JsRpcSigningServer` and related types in favour of
  `JsonRpcSigningServer`.
- @iov/core: Add `SigningServerCore.signedAndPosted`.

## 0.14.0

- @iov/bcp: Add `AtomicSwapHelpers.createId`.
- @iov/bns: Cache token data from chain.
- @iov/ethereum: Export `SwapContractEvent` enum and related helpers.
- @iov/ethereum: Export `EthereumLog` interface.
- @iov/ethereum: Add `decodeSwapProcessState` and `decodeEventSignature` ABI
  methods.
- @iov/ethereum: Add `atomicSwapEtherContractAddress` property to
  `EthereumConnectionOptions`.
- @iov/ethereum: Add optional `minHeight` and `maxHeight` parameters to
  `EthereumConnection.getSwaps`.
- @iov/stream: Create stream operator `dropDuplicates`.

Breaking changes

- @iov/bcp: Change type of `SwapData.timeout` and `SwapOfferTransaction.timeout`
  to `SwapTimeout = BlockHeightTimeout | TimestampTimeout`.
- @iov/bcp: Rename `SwapState.Expired` to `.Aborted` and `ExpiredSwap` to
  `AbortedSwap`.
- @iov/bcp: New type `Hash` used for atomic swap hashes. Use
  `AtomicSwapHelpers.hashPreimage` to create those hashes.
- @iov/bcp: Rename `SwapState` to `SwapProcessState`.
- @iov/bcp: Change type of `Fee.gasLimit` to string.
- @iov/bcp: Change type of `Account.balance` to array of `Amount`, i.e. remove
  the `tokenName` field.
- @iov/bcp: Remove obsolete type `BcpCoin`.
- @iov/bcp: Rename `BcpQueryTag` to `QueryTag` and `BcpTxQuery` to
  `TransactionQuery`.
- @iov/bcp: Rename `BcpAtomicSwapConnection` to `AtomicSwapConnection` and
  `BcpConnection` to `BlockchainConnection`.
- @iov/bcp: Rename `BcpTicker` to `Token`.
- @iov/bcp: Rename `BcpConnection.getTicker` to `getToken` and
  `BcpConnection.getAllTickers` to `.getAllTokens`.
- @iov/bns: Upgrade codec for compatibility with weave 0.14.x.
- @iov/ethereum: Options argument in `ethereumConnector`, `EthereumConnection`
  and `EthereumConnection.establish` is now required. Can be `{}`.

## 0.13.3

- @iov/ethereum: Export `Erc20Options`.
- @iov/ethereum: Set ERC20 tokens in codec of `ethereumConnector`.
- @iov/ethereum: Deduplicate transaction events in `liveTx`/`listenTx`.

## 0.13.2

- @iov/ethereum: Avoid dependency on `@types/bn.js` from `index.d.ts`.

## 0.13.1

- @iov/ethereum: Allow querying of ERC20 token balances
- @iov/ethereum: Allow sending of ERC20 tokens
- @iov/ethereum: Support ERC20 tokens in `searchTx`, `listenTx` and `liveTx`.
- @iov/ethereum: Export instantiable `EthereumCodec` with `EthereumCodecOptions`
  argument. The old `ethereumCodec` is now a backward compatible instance of
  `EthereumCodec` with default options.
- @iov/ethereum: Implement `getFeeQuote` method on `EthereumConnection`.
- @iov/ethereum: Fix transaction fee parsing for transactions from RPC/scraper.
- @iov/ethereum: In `parseBytes`, convert on-chain `input`/memo data into hex
  representation when it is no valid UTF-8.
- @iov/ethereum: Add `pollInterval` to `EthereumConnectionOptions`.
- @iov/dpos: Let `Serialization.serializeTransaction` accept transactions with
  fee set.

## 0.13.0

- @iov/bcp: Add `AtomicSwapMerger`
- @iov/bcp: `AtomicSwapHelpers.createPreimage` and `.hashPreimage` are now
  available to perform BCP specific atomic swap operations
- @iov/bcp: Add `signedBy` field to `BcpTxQuery`.
- @iov/bcp: Add `memo` field to `SwapOfferTransaction`.
- @iov/bcp: Add `Fee` type and `isFee` helper function.
- @iov/bcp: Add `getFeeQuote` method to `BcpConnection`.
- @iov/bns: Implement `getFeeQuote` method on `BnsConnection`.
- @iov/keycontrol: Add `Keyring.getAllIdentities` and
  `Keyring.getWalletByIdentity`
- @iov/keycontrol: Add `UserProfile.getAllIdentities`
- @iov/keycontrol: Add `.previewIdentity` to the `ReadonlyWallet`/`Wallet`
  interfaces
- @iov/jsonrpc: Let `isJsonCompatibleDictionary` not accept non-simple objects
- @iov/lisk: Implement `watchBlockHeaders` method on `LiskConnection`.
- @iov/lisk: Implement `getFeeQuote` method on `LiskConnection`.
- @iov/rise: Implement `getFeeQuote` method on `RiseConnection`.

Breaking changes

- @iov/bcp-types: Renamed to @iov/bcp
- @iov/bcp: Pluralize `.amounts` property and change to `Amount` array in
  `SwapOfferTransaction`, `SwapData`
- @iov/bcp: Rename `BcpAtomicSwap` to `AtomicSwap`
- @iov/bcp: Rename atomic swap query types to `AtomicSwapQuery`,
  `AtomicSwapRecipientQuery`, `AtomicSwapSenderQuery`, `AtomicSwapIdQuery`,
  `AtomicSwapHashlockQuery`, `isAtomicSwap*Query`.
- @iov/bcp: Rename `bnsSwapQueryTags` to `bnsSwapQueryTag`
- @iov/bcp: Let `SwapOfferTransaction` take a `hash` instead of a `preimage`.
- @iov/bcp: Rename `SwapData.hashlock` to `SwapData.hash`
- @iov/bcp: Remove `SwapCounterTransaction` in favour of `SwapOfferTransaction`
  for both offer and counter offer.
- @iov/bcp: Transaction fee data (including gas data) is now stored under a
  `fee` key.
- @iov/bcp: Rename `SwapTimeoutTransaction` to `SwapAbortTransaction` and
  `isSwapTimeoutTransaction` to `isSwapAbortTransaction`.
- @iov/bcp: Convert type `Nonce` from Int53 to number to simplify use over
  JavaScript and JSON interfaces.
- @iov/bns: Remove `bnsNonceTag` in favour of `BcpTxQuery.signedBy`.
- @iov/core: Remove wallet ID argument from `MultiChainSigner.signAndPost`
- @iov/core: Rename `JsonRpcSigningServer` to `JsRpcSigningServer` and convert
  interface from JSON to JavaScript.
- @iov/encoding: Remove `Uint32.asNumber`. Use `Uint32.toNumber` instead.
- @iov/ethereum: The `options` parameter of `ethereumConnector` does not allow
  strings anymore. Use `{ wsUrl: myWebsocketUrl }` instead.
- @iov/jsonrpc: Make request and response types generic in
  `SimpleMessagingConnection`.
- @iov/keycontrol: Remove `HdPaths.metamaskHdKeyTree`. Use `HdPaths.ethereum`
  instead.
- @iov/keycontrol: `Keyring.getWallet` and `Keyring.getWallets` return the
  immutable type ReadonlyWallet now. New functions to mutate wallets are added:
  `Keyring.setWalletLabel`, `.createIdentity`, `.setIdentityLabel` are added.
- @iov/keycontrol: Let `Keyring.addWallet` return a `WalletInfo` object
- @iov/keycontrol: `Keyring.addWallet` now stores a copy of the wallet
- @iov/keycontrol: Identities now must be unique in `Keyring`.
- @iov/keycontrol: Remove identity argument from `UserProfile.signTransaction`
- @iov/keycontrol: Remove wallet ID argument from `UserProfile.signTransaction`,
  `.appendSignature`, `.setIdentityLabel` and `.getIdentityLabel` as well as
  `Keyring.setIdentityLabel`.
- @iov/ledger-bns: Package removed from this monorepo and now available at
  https://github.com/iov-one/iov-ledger-bns
- @iov/iov-core: Constructor of `SigningServerCore` now takes two arguments for
  authozization callbacks.

## 0.12.3

- @iov/ethereum: Add missing dependencies on @iov/socket and @iov/stream
- @iov/ethereum: Export `toChecksummedAddress`

## 0.12.2

- @iov/crypto: Add `Secp256k1.recoverPubkey` to recover pubkey from signature
  and message
- @iov/ethereum: Implement pubkey recovery when parsing transaction in search by
  transaction ID.
- @iov/ethereum: Transaction parsing now works for pre-EIP155 signatures
- @iov/ethereum: Let listenTx/liveTx return signer's pubkey
- @iov/ethereum: Let `.getAccount` return undefined when balance is 0

## 0.12.1

- @iov/bns: Encode transaction fees
- @iov/bns: Export `ChainAddressPair`
- @iov/ethereum: Allow passing `EthereumConnectionOptions` instead of websocket
  URL into second `ethereumConnector` parameter.

## 0.11.3

- @iov/ethereum: Allow passing `EthereumConnectionOptions` instead of websocket
  URL into second `ethereumConnector` parameter.

## 0.12.0

Breaking changes

- @iov/bcp-types: Remove `Bcp*` prefix from `BcpAccount`, `BcpAccountQuery`,
  `BcpAddressQuery`, `BcpPubkeyQuery`
- @iov/bcp-types: Remove `Account.name` in favour of BNS' username NFTs.
- @iov/bcp-types: Remove `BcpConnection.changeBlock` along with its
  implementations in favour of `BcpConnection.watchBlockHeaders`.
- @iov/bcp-types: Remove `BcpQueryEnvelope` and `dummyEnvelope`
- @iov/bcp-types: Change return type of `BcpAtomicSwapConnection.getSwap` to
  promise of `ReadonlyArray<BcpAtomicSwap>`.
- @iov/bcp-types: Rename methods to plural: `BcpAtomicSwapConnection.getSwaps`
  and `.watchSwaps`.
- @iov/bns: Binary compatibility for weave v0.10.x+ (breaks for all earlier
  versions)
- @iov/bns: Remove obsolete `SetNameTx`
- @iov/bns: Remove `BnsConnection.status`

## 0.11.2

- @iov/cli: Import Lisk, RISE and Ethereum symbols automatically
- @iov/ethereum: Expose `pubkeyToAddress`

## 0.11.1

- @iov/ethereum: Fix error reporting when signing and sending transactions
- @iov/keycontrol: Add `HdPaths.ethereum` for Ethereum HD path derivation
- @iov/keycontrol: Deprecate `HdPaths.metamaskHdKeyTree` in favour of
  `HdPaths.ethereum`

## 0.11.0

- @iov/bcp-types: `BcpConnection.getNonce` now returns a `Promise<Nonce>` and
  implementations set a default value on their own.
- @iov/bcp-types: Expose `publicKeyBundleEquals`
- @iov/bcp-types: Add `fractionalDigits` to `BcpTicker`
- @iov/ethereum: Add new package with Ethereum support
- @iov/jsonrpc: Add new package for type-safe JSON-RPC 2.0 interfaces and
  response parsers. This is used for out-of-process signing and can be reused in
  @iov/ethereum and @iov/tendermint-rpc later on.
- @iov/keycontrol: Add `HdPaths.bip44Like` and `HdPaths.iov`
- @iov/iov-core: Add `MultiChainSigner.shutdown` to shutdown the signer.
- @iov/iov-core: Add `MultiChainSigner.isValidAddress` for chain-specific
  address input validation.
- @iov/stream: Add an implementation of `concat` that buffers stream events
- @iov/stream: Add `firstEvent` as a special case of `toListPromise` with one
  element
- @iov/tendermint-rpc: Add support for Tendermint 0.27.x

Breaking changes

- @iov/tendermint-rpc: Changed some interfaces to remove dependency on
  base-types. `PostableBytes` -> `TxBytes`, `PublicKeyBundle` ->
  `ValidatorPubkey`, `ChainId` -> `string`.
- @iov/base-types: Package removed and all its types are now in @iov/bcp-types.
- @iov/bcp-types: Convert `TxReadCodec.keyToAddress` into
  `identityToAddress(identity: PublicIdentity)`
- @iov/bcp-types: `BcpConnection.watchNonce` and all its implementations were
  removed
- @iov/bcp-types: Return type of `BcpConnection.getAccount` was changed to
  `BcpAccount | undefined` to better represent the one-or-none result.
- @iov/bcp-types: Remove `BcpValueNameQuery` from `.getAccount` and
  `.watchAccount` as we're migrating from wallet nicknames to username NFTs.
- @iov/bcp-types: Convert `BcpQueryEnvelope` to `ReadonlyArray` in return type
  of `BcpConnection.getAllTickers`.
- @iov/bcp-types: Convert `BcpQueryEnvelope` to `BcpTicker | undefined` in
  return type of `BcpConnection.getTicker`.
- @iov/bcp-types: Migrate `UnsignedTransaction.chainId` and `.signer` into
  `.creator`
- @iov/bcp-types: Add `BcpConnection.getNonces`
- @iov/bcp-types: Add `BcpTxQuery.sentFromOrTo` in favour of package-specific
  address tags
- @iov/bcp-types: Removed `Bcp` prefix from `BcpTransactionState`,
  `BcpBlockInfoPending`, `BcpBlockInfoInBlock`, `BcpBlockInfo`.
- @iov/bcp-types: Add block info state `BlockInfoFailed`.
- @iov/bcp-types: Handle failed transactions in `searchTx`/`listenTx`/`liveTx`
  and `postTx`.
- @iov/bns: Convert `.owner` in `BnsUsernameNft` and `BnsBlockchainNft` to
  `Address`
- @iov/bns: In `BncConnection.watchBlockHeaders`, the block header events
  temporarily contain a dummy `id` string until ID calculation is implemented
- @iov/core: Remove `MultiChainSigner.getNonce`. If you really need this, use
  `signer.connection(chainId).getNonce({ address: addr })` instead.
- @iov/core: Removed BNS re-exports `bnsConnector`, `bnsFromOrToTag`,
  `bnsNonceTag`, `bnsSwapQueryTags`. Import them from @iov/bns.
- @iov/core: Convert `MultiChainSigner.keyToAddress` into
  `identityToAddress(identity: PublicIdentity)`
- @iov/keycontrol: Move `PublicIdentity` into @iov/bcp-types; add `chainId`
- @iov/keycontrol: Add chain ID argument to `UserProfile.createIdentity` and
  `Wallet.createIdentity`
- @iov/keycontrol: Remove redundant chainId parameter from
  `Wallet.createTransactionSignature`
- @iov/keycontrol: Remove `LocalIdentity`/`LocalIdentityId` and create
  `UserProdile.getIdentityLabel` to provide labels
- @iov/tendermint-rpc: Remove support for Tendermint 0.20 and 0.21
- @iov/tendermint-rpc: Rename `TxResponse.txResult` -> `.result`
- @iov/crypto: Remove support for ripemd160

## 0.10.4

- @iov/lisk: Implement `LiskConnection.watchAccount`
- @iov/lisk: Support search by address tag in `LiskConnection.searchTx`
- @iov/lisk: Support search by minHeight/maxHeight in `LiskConnection.searchTx`
- @iov/lisk: Implement `LiskConnection.liveTx`
- @iov/rise: Implement `RiseConnection.watchAccount`
- @iov/rise: Support search by address tag in `RiseConnection.searchTx`
- @iov/keycontrol: Fix parameter type of `UserProfile.createIdentity` to allow
  creating identities using `Ed25519Keypair`.

## 0.10.3

- @iov/cli: Fix levelup import

## 0.10.2

- @iov/bcp-types: Add `BcpAccount.pubkey` and implement in Lisk, RISE and BNS.
- @iov/core: `MultiChainSigner.getNonce` was deprecated.

## 0.10.1

- @iov/tendermint-rpc: convert `const enum`s to `enum`s in public interface to
  allow callers to use `--isolatedModules`.

## 0.10.0

- @iov/bcp-types: `BcpTransactionResponse` now contains a `blockInfo` property
  that allows you to get block related data associated with the transactions and
  subscribing to updates. `metadata` was deprecated in favour of `blockInfo`.
- @iov/bcp-types: the new interfaces `getBlockHeader` and `watchBlockHeaders`
  provide block header information.
- @iov/bns: Fix encoding of `BcpTxQuery.hash` in `listenTx` and `liveTx`
- @iov/socket: New package with wrappers around WebSockets: `SocketWrapper` and
  `StreamingSocket` used by tendermint-rpc and Ethereum.
- @iov/stream: Add `toListPromise` that collects stream events and returns a
  list when done.
- @iov/stream: `ValueAndUpdates.waitFor` now returns the values that matched the
  search condition.
- @iov/stream: `DefaultValueProducerCallsbacks.error` added to produce errors.
- @iov/tendermint-rpc: Gracefully handle duplicate subscriptions.

Breaking changes

- @iov/base-types: Remove `TxId` in favour of `TxHash` in @iov/tendermint-rpc.
- @iov/bcp-types: An `Amount` is now a `quantity` expressed as a string, a
  `fractionalDigits` number and a `tokenTicker`. This replaces the `whole`,
  `fractional` pair. `BcpTicker` does not contain `sigFigs` anymore because it
  is not needed there. `BcpCoin` is now an `Amount` and a `BcpTicker`.
- @iov/bcp-types: Wrapper type `BcpNonce` was dropped from all interfaces in
  favour of just `Nonce`.
- @iov/bcp-types: `BcpConnection.getNonce`/`.watchNonce` now only accept
  `BcpAddressQuery` or `BcpPubkeyQuery` as argument type.
- @iov/bcp-types: `BcpConnection.listenTx` now takes an `BcpTxQuery` argument
  analogue to `.searchTx` and `.liveTx`.
- @iov/bcp-types: `BcpTransactionResponse` was removed in favour of the new
  `PostTxResponse`.
- @iov/bcp-types: Change binary `TransactionIdBytes` to printable
  `TransactionId` and use in `TxCodec.identifier`, `PostTxResponse` and
  `BcpTxQuery`.
- @iov/bcp-types: `BcpTxQuery.tags` is now optional
- @iov/bcp-types: Remove type `RecipientId`; use `Address` instead.
- @iov/bcp-types: Remove unused `BaseTx.ttl` and `TtlBytes`
- @iov/bcp-types: Allow extension of transaction types: move BNS transactions
  into @iov/bns, rename generic ones to `SendTransaction` and
  `Swap{Offer,Claim,Counter,Timeout}Transaction`. Property `kind` is now a
  string in the format "{domain}/{concrete_type}", e.g. "bcp/send" or
  "bns/set_name".
- @iov/bns: `BnsConnection.postTx` now resolves before a transaction is in a
  block. The field `blockInfo` of its response can be used to track the
  transaction state.
- @iov/bns: `getHeader`/`watchHeaders` were removed in favour of
  `getBlockHeader`/`watchBlockHeaders` from BCP.
- @iov/core: Rename `MultiChainSigner.signAndCommit` -> `.signAndPost`
- @iov/crpto: the new types `Secp256k1Signature` and
  `ExtendedSecp256k1Signature` replace DER encoded signatures in `Secp256k1`.
- @iov/faucets: Remove `BovFaucet`. Use `IovFaucet` instead.
- @iov/keycontrol: `Secp256k1HdWallet.createTransactionSignature` now uses the
  custom fixed length encoding instead of DER to allow blockchains utilizing the
  recovery parameter.
- @iov/stream: `streamPromise` was renamed to `fromListPromise`.
- @iov/tendermint-rpc: Rename `txCommitSuccess` to `broadcastTxCommitSuccess`
  and add `broadcastTxSyncSuccess`
- @iov/tendermint-rpc: Remove all fields from `BroadcastTxAsyncResponse`
- @iov/tendermint-rpc: Change type of `BroadcastTxSyncResponse.hash` to `TxId`
- @iov/tendermint-rpc: Un-export interface `RpcTxEvent`
- @iov/tendermint-rpc: Change all `Method` enum names to PascalCase
- @iov/tendermint-rpc: `Client.subscribeTx` now takes a `QueryString` argument
- @iov/tendermint-rpc: Support for Tendermint version 0.20.0 and 0.21.0 is
  deprecated and will be removed in the next version of IOV-Core. If you need
  support for Tendermint < 0.25.0, please open an issue on Github and we'll
  maintain it.

## 0.9.3

- @iov/bns: Add missing error propagation from `searchTx`/`listenTx` into
  `liveTx` stream.

## 0.9.2

- @iov/bns: Add `getHeader` and `watchHeaders` methods to access block headers

## 0.9.1

- @iov/stream: Generalize `streamPromise` to take a promise of an iterable
- @iov/bns: Fix order of events in `listenTx`. All history tx events are now
  emitted before updates.

## 0.9.0

- @iov/core: Export `Secp256k1HdWallet` and import by default in @iov/cli.
- @iov/faucets: Postpone removal of `BovFaucet` to 0.10.x

Breaking changes

- @iov/bcp-types: Rename `FungibleToken` to `Amount`
- @iov/bns: Re-generate BNS codec from weave v0.9.0 and adapt wrapper types.
- @iov/bns: Add support for blockchain and username NFTs
- @iov/crypto: Convert pubkey of Secp256k1Keypair into uncompressed format with
  prefix `04`.
- @iov/crypto: Secp256k1.createSignature/.verifySignature now comsume a message
  hash and do no hashing internally.
- @iov/dpos: Rename `Amount`/`parseAmount` to `Quantity`/`parseQuantity`
- @iov/keycontrol: Let `Secp256k1HdWallet` work on uncompressed pubkeys. Since
  `Secp256k1HdWallet` was not used yet, there is no migration for existing
  `Secp256k1HdWallet`.
- @iov/tendermint-types: Move types `PrivateKeyBundle`, `PrivateKeyBytes` into
  @iov/bns; split `Tag` into `BcpQueryTag` in @iov/bcp-types and `QueryTag` in
  @iov/tendermint-rpc; rename `TxQuery` into `BcpTxQuery` in @iov/bcp-types;
  make `SignatureBundle` available in @iov/tendermint-rcp only and rename to
  `VoteSignatureBundle`; move `buildTxQuery` into @iov/bns.
- @iov/tendermint-types: renamed to @iov/base-types

## 0.8.1

- @iov/dpos: Deduplicate `Serialization` from Lisk and RISE
- @iov/keycontrol: Add `Wallet.printableSecret` and
  `UserProfile.printableSecret`
- @iov/keycontrol: Add `HdPaths.bip44` and `HdPaths.metamaskHdKeyTree` HD path
  builders
- @iov/tendermint-rpc: Ensure transaction search results are sorted by height

## 0.8.0

- @iov/dpos: Add new package with shared code for Lisk and RISE. Don't use this
  directly. No code change necessary for users of @iov/lisk and @iov/rise.
- @iov/faucets: add `IovFaucet` to connect to the new faucet application
- @iov/keycontrol: add format versioning to `Wallet`, `Keyring`, keyring
  encryption and `UserProfile`

Deprecations

- @iov/faucets: `BovFaucet` is deprecated and will be removed in 0.9. Migrate to
  the `IovFaucet`.

Breaking changes

- @iov/lisk: LiskConnection.postTx does not wait for block anymore (analogue to
  RiseConnection.postTx), making it faster and more reliable. Transaction state
  tracking will improve in the future.
- Due to updates in all serialization formats, UserProfiles stored with earlier
  versions of IOV-Core cannot be opened with 0.8.0. To migrate to the new
  version, extract the secret data using an older version and create a new
  UserProfile in 0.8.0.

## 0.7.1

- @iov/lisk: Implement `LiskConnection.getTicker` and `.getAllTickers`
- @iov/rise: Implement `RiseConnection.getTicker` and `.getAllTickers`

## 0.7.0

- @iov/bcp-types: optional field `expectedChainId` added to `ChainConnector`
- @iov/bcp-types: `BcpConnection.getAccount` can now be called with a pubkey
  input
- @iov/bcp-types: `TxReadCodec` and all its implementations now contain a
  `isValidAddress` method
- @iov/core: `MultiChainSigner.addChain` now returns chain information of the
  chain added
- @iov/lisk: new package to connect to the Lisk blockchain
- @iov/rise: new package to connect to the RISE blockchain
- @iov/encoding: bech32 encoding support for address bytes
- @iov/keycontrol: `UserProfile.setEntry()` now returns `WalletInfo` of new
  wallet added, for ease of use

Breaking changes

- @iov/bcp-types: `Address` is now a `string` instead of an `Uint8Array`
- @iov/bcp-types: `BcpTransactionResponse.metadata.success` was removed since
  failures are reported as promise rejections
- @iov/bcp-types: `Nonce` is now implemented by `Int53` from @iov/encoding
  instead of `Long`
- @iov/bns: `Client` was renamed to `BnsConnection`. The `connect()` function
  was renamed to `BnsConnection.establish()`
- @iov/core: rename `IovWriter` to `MultiChainSigner`
- @iov/core: rename the getter `reader` to `connection` in `MultiChainSigner`
- @iov/faucets: `BovFaucet.credit` now expects an address in bech32 format
- @iov/keycontrol: `Ed25519KeyringEntry` now takes a keypair as an argument in
  `createIdentity()`
- @iov/keycontrol: `Ed25519SimpleAddressKeyringEntry` was removed in favour of
  `Ed25519HdWallet` together with `HdPaths.simpleAddress`
- @iov/keycontrol: in `UserProfile`, `.entriesCount`, `.entryLabels` and
  `.entryIds` have been merged into `.wallets`
- @iov/keycontrol: in `UserProfile`, `.setEntryLabel`, `.createIdentity`,
  `.setIdentityLabel`, `.getIdentities`, `.signTransaction`, `.appendSignature`
  now only accept string IDs for the entry/wallet argument
- @iov/keycontrol: `DefaultValueProducer` and `ValueAndUpdates` moved into
  @iov/stream
- @iov/keycontrol: `KeyringEntry.createIdentity` now takes a required options
  argument of type
  `Ed25519KeyringEntry | ReadonlyArray<Slip10RawIndex> | number`
- @iov/keycontrol: rename symbols to `Wallet`, `WalletId`,
  `WalletImplementationIdString`, `WalletSerializationString`
- @iov/keycontrol: rename `Ed25519KeyringEntry` to `Ed25519WalletId`
- @iov/keycontrol: in `Keyring`, rename `.getEntries/.getEntryById` to
  `.getWallets/.getWallet`
- @iov/keycontrol: in `Keyring`, remove obsolete `.getEntryByIndex`
- @iov/keycontrol: in `UserProfile`, rename `.addEntry/.setEntryLabel` to
  `.addWallet/.setWalletLabel`
- @iov/ledger-bns: in `LedgerSimpleAddressKeyringEntry`, `.createIdentity` takes
  an index argument
- @iov/ledger-bns: rename `LedgerSimpleAddressKeyringEntry` to
  `LedgerSimpleAddressWallet`
- Due to updates in the Keyring serialization, UserProfiles stored with earlier
  versions of IOV-Core cannot be opened with 0.7.0. To migrate to the new
  version, extract the secret data using an older version and create a new
  UserProfile in 0.7.0.

## 0.6.1

- @iov/keycontrol: add Ed25519HdWallet and Secp256k1HdWallet that work like
  Ed25519SimpleAddressKeyringEntry but allow derivation of arbirtary SLIP-0010
  paths
- @iov/core: move ChainConnector into @iov/bcp-types to avoid new chains to
  depend on @iov/core
- @iov/bcp-types: various refactorings to improve multi chain support

Other notes

- The new name for keyring entries is "wallet". A keyring contains multiple
  wallets. This transition was started with the intoduction of Ed25519HdWallet
  and Secp256k1HdWallet and other incompatible API changes will follow in 0.7.
- We welcome our first external code contributor @SpasZahariev! If you want to
  get familiar woth the codebase, check the issues labeled with "good first
  issue".

## 0.6.0

- @iov/core: expose Ed25519KeyringEntry
- @iov/keycontrol: refactor entry ID generation
- @iov/bcp-types: rename interface IovReader -> BcpConnection
- @iov/bcp-types: make BcpConnection.chainId() synchronous for easier use by
  clients
- @iov/bns: expose transaction result
- @iov/bns: expose atomic swap queries on the bns client
- @iov/bns: transaction search can handle unlimited number of results

Breaking changes

- Due to updates in the Keyring serialization, UserProfiles stored with earlier
  versions of IOV-Core cannot be opened with 0.6.0. To migrate to the new
  version, extract the secret data using an older version and create a new
  UserProfile in 0.6.0.

## 0.5.4

- @iov/cli: fix global installation support

## 0.5.3

- @iov/core and @iov/keycontrol: use strict types for keyring entry IDs

## 0.5.2

- @iov/bns: increase transaction search results to 100 items
- @iov/core and @iov/keycontrol: add keyring entry IDs
- @iov/keycontrol: ensure Ed25519SimpleAddressKeyringEntry.fromEntropyWithCurve/
  and .fromMnemonicWithCurve return the correct type

**Note: this version was published with an outdated build and should not be
used**

## 0.5.1

- @iov/bns: expose transaction IDs

## 0.5.0

- @iov/bns: Add support of listening to change events, watching accounts, txs
- @iov/core: Simplify construction of IovWriter
- @iov/crypto: Rename all `Slip0010*` symbols to `Slip10*`
- @iov/crypto: Fix keypair representation of Secp256k1.makeKeypair
- @iov/tendermint: Add support for subscribing to events

Breaking changes

- Due to multi curve support in keyring entries, UserProfiles stored with
  earlier versions of IOV-Core cannot be opened with 0.5.0. To migrate to the
  new version, extract the secret data using 0.4.1 and create a new UserProfile
  in 0.5.0.
- The IovWriter construction is changed. You can probably save a line there.
  Please look at @iov/core README to see how to build it.

## 0.4.1

- @iov/faucets: package added to provide easy access to a BovFaucet

## 0.4.0

- @iov/core: Add disconnect method to IovReader
- @iov/tendermint-rpc: Add disconnect method to WebsocketClient
- @iov/ledger-bns: Improved USB connectivity due to hw-transport-node-hid
  upgrade

Breaking changes

- @iov/cli: wait() helper function removed
- @iov/ledger-bns: LedgerSimpleAddressKeyringEntry.startDeviceTracking() must be
  called before getting device state or calling
  createIdentity()/createTransactionSignature()
- The name field from the `getAccount` result data does not contain the chain ID
  anymore. Before

      [ { name: 'admin*test-chain-HexTMJ',
      address:
       Uint8Array [
         177,
         202, ...

  Now:

      [ { name: 'admin',
      address:
       Uint8Array [
         177,
         202, ...

## 0.3.1

- @iov/core: Export SetNameTx
- Improve Windows compatibility of build system and add Edge tests

## 0.3.0

- @iov/ledger-bns: Implement LedgerSimpleAddressKeyringEntry.canSign
- @iov/ledger-bns: Add LedgerSimpleAddressKeyringEntry.deviceState
- @iov/keycontrol: Encrypt UserProfile using XChaCha20-Poly1305
- @iov/crypto: Add support for unhardened Secp256k1 HD derivation
- @iov/cli: Add support for top level await

Breaking changes

- Due to an enhanced encryption mechanism, UserProfiles stored with IOV-Core
  0.2.0 cannot be opened with 0.3.0. To migrate to the new version, extract the
  secret data using 0.2.0 and create a new UserProfile in 0.3.0.

## 0.2.0

Finalize library name, add documentation and open source

## 0.1.1

Expose type TransactionKind

## 0.1.0

The beginning of versioning

## 0.0.0

Initial development

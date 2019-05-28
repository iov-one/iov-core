# IOV atomic swap protocol version 1

| Status | Author                    | Created    | Last updated | License   |
| ------ | ------------------------- | ---------- | ------------ | --------- |
| Draft  | The document contributors | 2019-03-27 | 2019-05-28   | CC-BY-4.0 |

## Abstract

This is a cross-chain atomic swap protocol used by IOV. It is based on hash time
locked contracts (HTLCs).

IOV provides reference implementations for Ether and ERC20 tokens on Ethereum
and any token on weave-based blockchains. Any third party is free to use this
specification to build compatible components.

## Overview

Two actors Alice and Bob agreed on a token exchange off-chain. Both have one
address on each blockchain X and Y.

- Alice creates a secret key locally (called a "preimage") and stores it.
- Alice creates a swap offer on X, the blockchain where her tokens live. This is
  a HTLC that contains the recipient address of Bob on X (b<sub>X</sub>), the
  amount of tokens offered, the hash of the preimage and a timeout. This
  contract locks her tokens and sends them to b<sub>X</sub> if the preimage is
  revealed on-chain.
- Bob creates a swap offer on Y, the blockchain where his tokens live. This is a
  HTLC that contains the recipient address of Alice on Y (a<sub>Y</sub>), the
  amount of tokens offered, the hash copied from Alice's offer and a timeout.
  This contract locks his tokens and sends them to a<sub>Y</sub> if the preimage
  is revealed on-chain.
- (Variant 1): Alice now uses her preimage to claim Bob's swap offer on Y,
  triggering the token transfer from b<sub>Y</sub> to a<sub>Y</sub>. Bob looks
  up this now public preimage on Y to claim Alice's swap offer on X, triggering
  the token transfer from a<sub>X</sub> to b<sub>X</sub>.
- (Variant 2): Alice decides not to reveal her preimage before the timeout of
  Bob's offer is reached. As soon as the timeout is reached, Bob aborts his
  offer and gets back his tokens. Alice also needs to wait for the timeout of
  her offer to be reached in order to abort and get back her tokens.

## Actor positions

As soon as both offers are created, the actor that created the preimage has the
one-sided option to execute the atomic swap or to let it expire. Thus this actor
is described as being _in long position_. The other actor is described as being
_in short position_.

Being in long position has two advantages:

1. having the free option to execute the swap or not and
2. claiming the other actor's swap offer first, which reduces the risk of losing
   tokens in the case of a half executed swap.

Being in short position has the advantage of being able to review the other
actor's swap offer before creating an offer oneself.

## The swap offer

A swap offer is a HTLC with the following properties:

- The amount of tokens is fixed. Implementations may support including multiple
  different tokens at once.
- The recipient address is fixed.
- Creating the contract locks the funds.
- A hash of the preimage is fixed.
- A timeout expressed as absolute time or block height is fixed.
- At any point in time before the timeout, the swap offer can be claimed.
- As soon as the timeout is reached, the funds can be returned to the creator.

Common synonyms: _swap_, _contract_, _escrow_.

### Preimage and hashing

The preimage is exactly 32 bytes of raw binary data. It is locally created by
the long position and must be kept a secret. It is in the creator's own interest
to use a sufficiently good source of entropy to generate it, but this is not
required by the protocol.

The hashing algorithm is fixed to SHA-256. The hash is 32 bytes of raw binary
data with `hash = sha256(preimage)`.

### Timeouts

A timeout is the first point in time, when the HTLC is expired. It is measured
in one of the two types: absolute time or block height.

- **Absolute time** is a [UNIX time](https://en.wikipedia.org/wiki/Unix_time)
  with a resolution of one second. It is used for blockchains that have a strong
  guarantee for correct and fair timestamps with reasonable precision (e.g.
  Tendermint-based blockchains).
- **Block height** is an integer counting the number of blocks created. It is
  used when absolute time is not appropriate.

Note: Since the type of timeout is fixed in the HTLC, which belongs to the
blockchain, a cross-chain atomic swap may need to use different types of
timeouts for the initial offer and the counter offer.

The counter offer is claimed first. I.e. the time between the counter offer's
timeout and the initial offer's timeout is the minimal time the actor in short
position has to claim the initial offer.

### Swap offer actions

Actions are mutations of the on-chain state triggered by transactions.

- **Create:** By creating a swap offer, the funds are locked in the contract. A
  timeout and a hash must be specified.
- **Claim:** By revealing a preimage for the hash before the timeout is reached,
  the contract transfers the tokens to the recipient. Requires a preimage of
  exactly 32 bytes.
- **Abort:** Withdraws the tokens from the contract to the creator. Requires
  timeout to be reached.

Every account must have permission to perform the _claim_ and _abort_ action to
allow claiming and aborting when the swap recipient cannot access their keys
temporarily or has insufficient funds to pay transaction fees.

Common synonyms: _release = claim_, _execute = claim_.

### Swap offer process state

Each swap offer individually is either _open_, _claimed_ or _aborted_. The
process state can only be changed by performing an action via a transaction.

- **Open:** This is the initial process state.
- **Claimed:** An _open_ swap becomes _claimed_ by performing the claim action.
- **Aborted:** An _open_ swap becomes _aborted_ by performing the abort action.

A swap offer which has been claimed or aborted cannot change to another process
state, i.e. the only possible transitions are _open → claimed_ and _open →
aborted_.

Common synonyms: _settled = (claimed or aborted)_, _closed = claimed_.

### Swap offer expiry state

Each swap offer individually is either _non-expired_ or _expired_. The state
automatically changes on-chain as the underlying time (wall time or block
height) increases. A state can switch from _non-expired_ to _expired_ but not
vice versa.

- **Non-expired:** In the half-open interval `[creation, timeout)`, the swap
  offer is _non-expired_. This is the default state for most offers. However, an
  offer can be created in _expired_ state directly if the above interval is
  empty.
- **Expired** In the interval `[timeout, ∞)`, the swap offer is _expired_.

Common synonym: _abortable = expired_.

#### Note on process and expiry state

Both states are independent of each other. A swap offer can be open and expired
at the same time.

## Risks

The following risks for cross-chain atomic swaps have been identified. Some of
them are fully avoided by this protocol but still documented for tranparancy.
Others need to be mitigated by the user's choice of parameters.

### Pre-image attacks

The actor in short position copies the hash without knowing the preimage. This
means the actor in long position could use a very long preimage that is either
expensive or impossible to process on one chain but works easily on the other
chain. This can make it unprofitable or impossible for the actor in short to
claim their tokens, leading to free tokens for the actor in long.

This risk is avoided in this protocol by having a fixed preimage length.

### No counter offer created

The actor in short position can pretend to have the intention to create a
counter offer but not do it. In this case the actor in long loses access to the
locked tokens until the timeout is reached.

### Half executed atomic swaps

1. **Timeout difference:** The actor in short position needs to ensure there is
   a sufficient amount of time to claim the initial offer, even if the preimage
   is revealed by claiming the counter offer at the very last possible point in
   time. This should cover all risks that can delay the execution of the claim
   transaction like different time zones, temporary loss of power, internet
   connection, access to key material as well as downtimes of the default
   blockchain nodes and blockchain-related issues.
2. **Block height based timeout calculation:** The above timeout difference is
   even harder to calculate when timeouts are measured in terms of block height.
   Especially with non-constant block times one needs to calculate the expected
   block height at the desired timeout time and take into account a safety
   margin.
3. **Chain stops:** When one chain in a cross-chain atomic swap stops, two
   things can happen that lead to half executed atomic swaps. (a) A timeout
   measured in absolute time is reached without the chance to get a claim
   transaction processed. (b) An initial offer's block height based timeout is
   pushed unexpectedly far into the future, such that the timeout difference for
   the actor in short position to claim is 0 or negative (i.e. impossible to
   claim).

## Contributors

Substantial contributions by the following people in the form of text, review
and ideas made this document possible:

- Simon Warta
- Ethan Frey
- Isabella Dell
- Will Clark

## License

This document is licensed under a
[Creative Commons Attribution 4.0 International license](https://creativecommons.org/licenses/by/4.0/).

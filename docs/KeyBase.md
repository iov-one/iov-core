# Web4 KeyBase architecture

## UserProfileController

The `UserProfileController` houses the logic to decrypt a user profile, when provided a valid `username:password` pair.

The following functions are called by the `User`, through the `UserProfileController`

- CreateUser: Creates a new user in the `UserProfileController`
- LoginUser: Passes `username:password` pair to the `UserProfileController`
- DeleteUser: Requests deletion of a `UserProfile` to the `UserProfileController`
- ExportUser: Requests the plaintext export of `UserProfile` details, requires a correct `login`

## UserProfile

A `UserProfile` contains a `Keyring`, `AddressBook` and other user specific details that need to be kept separate from other users. This is a `1:N` relation, where `N` is each `UserProfile` created by the `UserProfileController`.

- AddressBook: Holds common `PublicPersonality` mappings the user interacts with
- Keyring: Hold all of the users `KeyringEntry`s that hold private keys.

## AddressBook

Contains a list of addresses a user has interacted with, or added for frequent use.

- AddContact: Adds a contact to a `AddressBook` with the specified information. EX: `chain:address:humanName`
- DeleteContact: Deletes a contact from a `AddressBook`
- GetContact: Returns the `chain:address:humanName` for use in the application.

## Keyring

The `Keyring` acts as a central loop, which holds all of the `UserProfile`'s `KeyringEntry`s. A `Keyring` contains all of the `KeyringEntry`s that as user has added. This is a `1:1` relation inside of a `UserProfile`.

- GetKeyringEntry: Returns a requested `KeyringEntry`'s details, such as `PublicIdentity` or `PublicPersonality`
- AddKeyringEntry: Adds a new `KeyringEntry` to the `Keyring`.
- DeleteKeyringEntry: Removes an existing `KeyringEntry`
- ExportKeyringEntry: Exports a `KeyringEntry` in plain text


## KeyringEntry

A `KeyringEntry` contains all of the related identity and personality information for an associated `SecretIdentity`. A `SecretIdentity` is only an HD Seed value (`Mnemonic Passphrase`) or a hardware device identifier for a `Ledger`. This is a `1:N` relation inside of a `Keyring`, where `N` is each `SecretIdentity` added by a user.

- GetPublicIdentity: Returns `PublicIdentity` details for a specific algorithm.

## PublicIdentity

A `PublicIdentity` is a derived `Algo:Data` pair, which can be used to create a `PublicPersonality`. This is a `1:1` relation, created by the root `KeyringEntry` for which the `PublicIdentity` is related.  For example, to interact with Lisk, a `ed25519` public key is needed. This pair would then be represented as follows:

```
"publicKey": {
  "algo": ed25519,
  "data": "52b96095d265a93308fcf5cb9627085f029546be8b31eccb00bad386a92544d7"
}
```

- GetPublicPersonality: Returns a `PublicPersonality` for a desired `chain:PublicIdentity` pair

## PublicPersonality

The `PublicPersonality` is the result of a chain specific mapping, which requires a `PublicIdentity` derived from a `SecretIdentity`. From this `PublicIdentity`, a `Personality` can be generated, following chain specific rules for addressing. `PublicPersonality`s are a `1:N` relation, where `N` is a blockchain address system.

- AddPublicPersonality: Creates a `PublicPersonality`, based on a `PublicIdentity:chain` pair
- DeletePublicPersonality: Removes a `PublicPersonality` from the store.

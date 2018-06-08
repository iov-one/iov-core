# BCP specification

# SecureElementController

The `SecureElementController` provides all of the top level functionality and entry mechanisms into the `KeyBase`. This controller contains the logic to pass login details to the user profile controller.

The following functions are exposed through the `SecureElementController`.

- CreateUser: Creates a new user in the `UserProfileController`
- LoginUser: Passes `username:password` pair to the `UserProfileController`
- DeleteUser: Requests deletion of a `UserProfile` to the `UserProfileController`
- ExportUser: Requests the plaintext export of `UserProfile` details, requires a correct `login`

## UserProfileController

The `UserProfileController` houses the logic to decrypt a user profile, when provided a valid `username:password` pair.

The following functions are called from the `SecureElementController`, through the `UserProfileController0`

- DecryptProfile: Completes the login process, using the `username:password` pair provided by the `SecureElementController`
- CreateProfile: Creates a new `UserProfile` using information passed by the `SecureElementController`
- DeleteProfile: Deletes a `UserProfile` using information passed by the `SecureElementController`
- ExportProfile: Calls `DecryptProfile`, and provides a plaintext copy to the `SecureElementController`


## UserProfile

A `UserProfile` contains a `Keyring` entry, `AddressBook` and other user specific details that need to be kept seperate from other users.

- AddressBook: Holds common `PublicPersonality` mappings the user interacts with
- Keyring: Hold all of the users `KeyringEntry`s that hold private keys.

## AddressBook

Contains a list of addresses a user has interacted with, or added for frequent use.

- AddContact: Adds a contact to a `UserProfile` with the specified information. EX: `chain:address:humanName`
- DeleteContact: Deletes a contact from a `UserProfile`
- GetContact: Returns the `chain:address:humanName` for use in the application.

## Keyring

The `Keyring` acts as a central loop, which holds all of the `User`'s `KeyringEntry`s.

- GetKeyringEntry: Returns a requested `KeyringEntry`'s details, such as `PublicIdentity` or `PublicPersonality`
- AddKeyringEntry: Adds a new `KeyringEntry` to the `Keyring`.
- DeleteKeyringEntry: Removes an existing `KeyringEntry`
- ExportKeyringEntry: Exports a `KeyringEntry` in plain text


## KeyringEntry

A `KeyringEntry` contains all of the related identity and personality information for an associated `SecretIdentity`. A `SecretIdentity` can be a plaintext `PrivateKey`, `Mnemonic Passphrase` or even a hardware device identifier for a `Ledger`.

- GetPublicIdentity: Returns `PublicIdentity` details for a specific algorithm.

## PublicIdentity

A `PublicIdentity` is a derived `Algo:Data` pair, which can be used to create a `PublicPersonality`. For example, to interact with Lisk, a `ed25519` public key is needed. This pair would then be represented as follows:

```
"publicKey": {
  "algo": ed25519,
  "data": "52b96095d265a93308fcf5cb9627085f029546be8b31eccb00bad386a92544d7"
}
```

- GetPublicPersonality: Returns a `PublicPersonality` for a desired `chain:PublicIdentity` pair

## PublicPersonality

The `PublicPersonality` is the result of a chain specific mapping, which requires a `PublicIdentity` derived from a `SecretIdentity` and cryptographic algorithm for creating a `publicKey`. From this `PublicIdentity`, a `Personality` can be generated, following chain specific rules for addressing.

- AddPublicPersonality: Creates a `PublicPersonality`, based on a `PublicIdentity:chain` pair
- DeletePublicPersonality: Removes a `PublicPersonality` from the store.

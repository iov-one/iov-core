# User Stories

Below is a list of User Stories that can guide a developer on an End Users work
flow when using the Keybase. It is broken down into stories around the following
topics:

- User Management
- Identity Management
- Usage
- Export / Backup

# User Management

This section details what a User may want to do with their User profile, or
situations the system may encounter.

#### I want to Add a Profile

Create a profile with `username`, `label`, and a `password`.

This has an empty `addressBook` and `keyring`. The `securityModel` is
initialized from the system defaults.

#### I have Profile and want to Login.

Request login using supplied `username` and `password`.

This decrypts the associated profile.

#### I want to delete my Profile.

Request profile deletion using supplied `username` and `password`.

This removes the `UserProfile` from the store and logs the `User` out.

#### I am a User who is away from my computer for X time.

The profile should lock according to the timeout set in the `User`'s
`securityModel`.

#### I want to logout of my `UserProfile`

Flush in memory changes to disk, after encrypting the `UserProfile`.

# Identity Management

The following entries discuss the routes a User will take to make identities.

#### I don't have a `SeedIdentity` and want to Add one

Create a new a `keyringEntry` with a generated `SeedIdentity`. This
`keyringEntry` is added to the `keyringEntries` array.

#### I want to Import a `SeedIdentity` from an `HD Seed`

Create a new `keyringEntry`. The `HD Seed` is inserted into the `SeedIdentity`
of the `keyringEntry`, and its `type` set to `seed`.

#### I want to add a Hardware `SeedIdentity` to the `Keyring`.

Create a `keyringEntry` and scrape hardware identifiers from the device to
populate the `SeedIdentity`.

#### I want to create an Universal Address Pair

Add two `publicIdentity`s, one for `ed25519` and one for `secp256k1`, to
`publicIdentities` using the `SeedIdentity`. These identities use only the BIP32
standard.

#### I want to create an Extended Address

Add a `publicIdentity` to `publicIdentities` using the `SeedIdentity`. This
identity uses the full BIP44 and BIP32 standards.

# Usage

The following entries discuss the routes a User will take to use their profile.

#### I want to add a `contact` to my `AddressBook`

Add a `contact` to the `addressBook` in the `UserProfile`

#### I have a populated `KeyringEntry` and want to sign a something

Create a signature from `bytes`, a `SeedIdentity` and `PublicIdentity` pair.
Return a `signature`.

#### I have a populated `KeyringEntry` and want to get a balance

Return an `address` and a `chain` from a `PublicIdentity`. These will be used
query the associated chain.

# Export / Backup

Users will need a way to pull material out of the system. This is usually done
for backup purposes, but other reasons may include:

- Setting up a watch only wallet on a device
- Making an alternate installation on another machine
- Recreating a profile on the same device

#### I want to export my `UserProfile`

Return a JSON file with the contents of the `UserProfile`

#### I want to export the whole `Keyring`

Return a JSON file with the contents of the `Keyring`

#### I want to export a `SeedIdentity` from a `KeyringEntry`

Return the `seed` in plain text from the `SeedIdentity`.

#### I want to export a `PublicIdentity` from a `KeyringEntry`

Return the `PublicIdentity` as a JSON file.

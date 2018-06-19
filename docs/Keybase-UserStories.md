
# User Stories

Below is a list of User Stories that can guide a developer on an End Users work
flow when using the Keybase.

## User Profiles

### I want to Add a Profile

Create a profile with `username`, `label`, and a `password` calling
`UserProfileController.CreateUser`.

This has an empty `addressBook` and `keyring`. The `securityModel` is
initialized from the system defaults.

### I have Profile and want to Login.

Request login using supplied `username` and `password` by calling
`UserProfileController.LoginUser`. This password needs to match against the hash
in the `UserProfile.securityModel.password`.

### I want to delete my User Profile.

Request profile deletion using supplied `username` and `password` by calling
`UserProfileController.DeleteUser`. This password needs to match against the
hash in the `UserProfile.securityModel.password`.

### I want to export my profile

Request profile export using supplied `username` and `password` by calling
`UserProfileController.DeleteUser`. This password needs to match against the
hash in the `UserProfile.securityModel.password`.

## SecretIdentity

### I don't have a `SecretIdentity` and want to Add one

Create a new a `keyringEntry` populated with a `SecretIdentity`. This
`keyringEntry` is added to the `keyringEntries` array.

## I have a `SecretIdentity` and I want to create an address

Add a `publicIdentity` to `publicIdentities` using the `SecretIdentity`.

# Keyring Architecture

Web4 needs to support a variety of chains, each with their own specifications for how addresses (accounts) are derived.

Key Terms:

- UserProfile: A collection of User materials. Includes multiple `keyringEntries` associated with a UserProfile.
- SecretIdentity: Private material, used for signing transactions and deriving PublicIdentities. Examples:  Secret Mnemonic (HD Seed/Passphrase), Hardware Device
- PublicIdentity: Public materials. Contains the master publicKey for the `SecretIdentity + Algo` pair, and any extended keys.
- Personality: Derived Addresses that are chain specific. Usually defined via the HD specifications. Used for end user queries for balances and transaction histories.


Feature set:

## Hierarchical Deterministic Wallets
HD wallets will be created through this standard to yield a master publickey:privatekey pair.

- BIP32: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki

## Multi-Account Hierarchy for Deterministic Wallets
HD Wallets for chain specific support will be created through the following standards for each algorithm.

### secp256k1
- BIP43: https://github.com/bitcoin/bips/blob/master/bip-0043.mediawiki
- BIP44: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki

### ed25519
- SLIP0010: https://github.com/satoshilabs/slips/blob/master/slip-0010.md

### Both
- SLIP0044: https://github.com/satoshilabs/slips/blob/master/slip-0044.md

## Seed Generation:
Seed generation will be performed through the BIP39 specification for HD seeds

- BIP39: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki

## What we should support

- HD Seeds as the root SecretIdentity
- Importing HD Seeds
- HW Wallets as a lookup mechanism in the Keyring
- Sending HW Wallet TX for compatible BCP Chains
- The Full HD Spec defined by BIPs 32/44/84 (maybe 141?)

## What we shouldn't support right now

- Importing raw private keys
- Using raw private keys
- Sending HW Wallet TX for non supported chains

## What will we support in the future

- Sending HW Wallet TX for compatible chains, non BCP

## What users will have to deal with

- Moving coins from non HD wallets into HD Seed based wallets implemented by the BCP
- Using other clients for their non HD keys, not unifying but necessary for some applications (ex: lisk delegates)

# Code Architecture
The code for keyring management is broken down into logical units, each performing a specific task. The design can be visualized as follows:

```
UserProfileController (1 UserProfileController)
  |
  | > UserProfile (1 UserProfile : N Users)
      |
      | > AddressBook (1 Address Book : 1 UserProfile)
      | > Keyring (1 Keyring : 1 UserProfile)
          |
          | > keyringEntries (1 Keyring : N KeyringEntries)
              |
              | > SecretIdentity (1 KeyringEntry : 1 SecretIdentity)
                  |
                  | > PublicIdentities (1 SecretIdentity : N PublicIdentities)
```


## UserProfileController

The `UserProfileController` houses the logic to decrypt a user profile, when provided a valid `username:password` pair.

The following functions are called by the `User`, through the `UserProfileController`

### Functions:

- CreateUser: Creates a new user in the `UserProfileController`
- LoginUser: Passes `username:password` pair to the `UserProfileController`
- DeleteUser: Requests deletion of a `UserProfile` to the `UserProfileController`
- ExportUser: Requests the plaintext export of `UserProfile` details, requires a correct `login`

### Object Definition:

```
{
  "UserProfiles": []
}
```

## UserProfile

 A `UserProfile` contains an array called `keyringEntries`, an object called
`addressBook`, and an object called `securityModel`. This is a `1:N` relation,
where `N` is each `UserProfile` created by the `UserProfileController`.

### Object Definition:
- username: The name used for login
- label: Display name for application side logic.
- addressBook: Holds user specified addresses
- keyringEntries: Hold all of the users `KeyringEntries` that hold private keys.
- securityModel: Contains account specific security parameters

```
"UserProfile": {
  "username": "isabella",
  "label": "My Profile"
  "email": "isabella@iov.one",
  "created": "2018-06-18T14:52:26+00:00" #  ISO 8601 compatible
  "securityModel": {
    "password": "010000000105287a343ffb315b1...",
    "timeout": 3600,
    "retries": 100
  },
  "keyring": {
    "keyringEntries": [],
  },
  "addressBook": {
    "addressBookEntries": []
  }
}
```

## addressBook

Contains a list of addresses a user has interacted with, or added for frequent use.

### Functions:
- AddContact: Adds a contact to a `AddressBook` with the specified information. EX: `chain:address:humanName`
- DeleteContact: Deletes a contact from a `AddressBook`
- GetContact: Returns the `chain:address:humanName` for use in the application.

### Object Definition:
```
"addressBook": {
  "addressBookEntries": [
    {
      "address": "0x52b96095d265a93308fcf5cb9627085f029546be8b3",
      "chain": "ETH", # Up for debate, can be coin_type instead
      "created": "2018-06-18T14:52:26+00:00" #  ISO 8601 compatible,
      "label": "Friend's Account"
    }
  ]
}
```

## Keyring

The `Keyring` is an object that houses `keyringEntries`. This Object holds all
of the `UserProfile`'s `KeyringEntries`. This is a `1:1` relation inside of a
`UserProfile`.

### Functions:
- GetKeyringEntry: Returns a requested `KeyringEntry`'s details, such as `PublicIdentity` or `PublicPersonality`
- AddKeyringEntry: Adds a new `KeyringEntry` to the `Keyring`.
- DeleteKeyringEntry: Removes an existing `KeyringEntry`
- ExportKeyringEntry: Exports a `KeyringEntry` in plain text

### Object Definition:
```
"keyring": {
  "keyringEntries": []
},
```

## KeyringEntry

A `KeyringEntry` contains all of the related `SecretIdentity`,
`PublicIdentities` and personality information for an associated `SecretIdentity`.

A `SecretIdentity` is only an HD Seed value (`Mnemonic Passphrase`) or a
hardware device identifier for a `Ledger`.

This is a `1:1` relation, where each `KeyringEntry` has one `SecretIdentity`.

### Functions:
- GetPublicIdentity: Returns `PublicIdentity` details for a specific algorithm.

### Object Definition:
```
"KeyringEntry": {
  "SecretIdentity": {
   "label": "My Account",
   "seed": "shift nature mean excess demise mule winter between swing success bitter patch",
   "type": "HD" || "hardware"
  },
  "PublicIdentities": [
    "PublicIdentity": {}
  ]
}
```

## PublicIdentities

A `PublicIdentities` are derived from `seed:curve` pairs, which are used to
create a `PublicIdentity`.

This is a `1:N` relation, where 1 is the `SecretIdentity` for which the
`PublicIdentity` is related and N are the generated `PublicIdentities`.  


### Functions:

- GetPublicIdentity: Returns a `PublicIdentity` for a desired `chain:PublicIdentity` pair
- CreatePublicIdentity: Returns a `PublicIdentity` for a desired `chain:PublicIdentity` pair
- DeletePublicIdentity: Removes a `PublicIdentity` from the store.

### Object Definition:
```
"PublicIdentities": [
  "PublicIdentity": {
    "address": "0x6806ea1d9b2eb59DAc7fdcdf28bf8d5a12AD84Bc",
    "label": "Wells Fargo",
    "publicKey": {
      "algo": ed25519,
      "data": "52b96095d265a93308fcf5cb9627085f029546be8b31eccb00bad386a92544d7"
    },
    "curve": {
      "root": "m",
      "purpose": "44'",
      "coin_type": "60'", # Defined here: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
      "account": "0'",
      "change": "0'",
      "address_index": "0"
    }
  }
]
```

## Complete Object Definition
```
"UserProfile": {
  "username": "isabella",
  "label": "My Profile"
  "email": "isabella@iov.one",
  "created": "2018-06-18T14:52:26+00:00" #  ISO 8601 compatible
  "securityModel": {
    "password": "010000000105287a343ffb315b1...",
    "timeout": 3600,
    "retries": 100
  },
  "keyring": {
    "keyringEntries": [
      "KeyringEntry": {
        "SecretIdentity": {
         "label": "My Account",
         "seed": "shift nature mean excess demise mule winter between swing success bitter patch",
         "type": "HD" || "hardware"
        },
        "PublicIdentities": [
          "PublicIdentity": {
            "address": "0x6806ea1d9b2eb59DAc7fdcdf28bf8d5a12AD84Bc",
            "label": "Wells Fargo",
            "publicKey": {
              "algo": ed25519,
              "data": "52b96095d265a93308fcf5cb9627085f029546be8b31eccb00bad386a92544d7"
            },
            "curve": {
              "root": "m",
              "purpose": "44'",
              "coin_type": "60'", # Defined here: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
              "account": "0'",
              "change": "0'",
              "address_index": "0"
            }
          }
        ]
      }
    ],
  },
  "addressBook": {
    "addressBookEntries": [
      {
        "address": "0x52b96095d265a93308fcf5cb9627085f029546be8b3",
        "chain": "ETH", # Up for debate, can be coin_type instead
        "created": "2018-06-18T14:52:26+00:00" #  ISO 8601 compatible,
        "label": "Friend's Account"
      }
    ]
  }
}
```

# Address Architecture

## Universal Address:

The BCP and BNS will both support the standard cryptography algorithms found in the majority of blockchain ecosystems. This includes `ed25519` and `secp256k1`. While these algorithms are different, we can use some key features of Bitcoin that have propogated and become standard throughout many implementations.

### Default Key Path (Purpose 0)

BIP32 describes the standard HD path specification. It reserves Purpose 0 for this purpose, below is a quote from BIP44 about this claimed position.

> Note that m / 0' / * is already taken by BIP32 (default account), which preceded this BIP.

We can use this knowledge of default account from BIP32 to establish the universal wallet independent of coin_type, which resides at Purpose 0, and coin_type 0. This can be then used to derive a public key for both support cryptographic algorithms, and provides us the highest level of compatibility, as only BIP32 is required for support.

## Extended Addresses:

In many circumstances, users will want a chain specific key that can be portable if needed. We can provide them access to these keys using the full BIP43/44 specifications.

> m / purpose' / coin_type' / account' / change / address_index

Purpose MUST follow the BIP44 specification and as such, be set to be `44'`. `coin_type` MUST be supported according to the SLIP list. This will provide the greatest compatibility, especially if a user needs to exit the system.

Users MAY use these individual chain specific addresses.

This is support is also critical for users who are importing HD seeds from other software, so that we can locate existing tokens for that user. During the import process, that user should be given a choice of supported tokens to add to the list and the software can automatically derive the addresses that are already used. In the case of many addresses, the user can use a `load more` button.

### Keyring Mappings

Each UserProfile will MAY contain Multiple `keyringEntries` under its `Keyring`. Each `keyringEntry` will contain an HD Seed, or HW wallet identifier and some information that has been exported from that device (pubkey, address). These entries will be referred to as `KeyringEntries`.

The `KeyringEntries` will be differentiated in the profile with a Label. This label will be user specifiable, but by default indicate the type.

- HD Seed (When decrypted): `Magic Word #` :unlock:
- HD Seed (When Encrypted): `Magic Word #` :lock:
- HW Device: `Ledger #` || `Trezor #` || `Other HW Device #`

Users can import a preexisting `seed` into the system, but Users will NOT be able to import raw private keys into the system. This is necessary to reduce code complexity and user integration. Users who wish to migrate into our system should be provided documentation on the process to generate a new HD Seed, and what is required to move their tokens into that wallet.

# Security Concerns

## Different Private Key Per Curve

We can reuse the same seed for each `Curve`, and derive different publickey/private key pairs using the instructions found in SLIP-0010. This mitigates security concerns around private key reuse. This method is how Trezor and Ledger derive keys for different curves.

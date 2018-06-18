## UserProfiles

Web4 specific way of storing and persisting collections of User data. Private materials are stored inside of these encrypted profiles.

1:N where 1=web4 instance and N=Profiles

```
{
  "userProfile": "isabella",
  "keyringEntries": []
}
```

## Keyring and KeyringEntries

A keyring is a general descriptor for the array which holds KeyringEntries, and each `KeyringEntry` is allowed to contain only one `SecretIdentity` which is a `Seed`. This `SecretIdentity` is used for creating all related identity data under the assigned Keyring.

1:N, where 1=UserProfile and N=Keyring

```
{
 "label": "Personal Savings",
 "seed": "1234",
 "type": "privateKey" || "HD" || "hardware"
 "publicIdentities": []
}
```
## PublicIdentities

An array of derived identities from the SecretIdentity. These entries are used for generating personalities.

1:N, where 1=SecretIdentity and N is the PublicIdentity set that is derived

```
 "publicIdentities": [
   {
     "algo": "secp256k1",
     "data": "03a320c4f367c61229b2264e4dd73cb7b0489c6903ada695f73179435baaadde9b"
     "personalities": []
   }
]
```

## Personalities

An entry related to a PublicIdentity, it contains all of the HD related data (if applicable), label and address information.

1:N, where 1=PublicIdentity, N=Personalities details

```
"personalities": [
  {
    "root": "m",
    "purpose": "44'",
    "coin_type": "60'", # Defined here: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
    "account": "0'",
    "change": "0'",
    "address_index": "0",
    "address": "0x6806ea1d9b2eb59DAc7fdcdf28bf8d5a12AD84Bc",
    "label": "Wells Fargo",
    "publicKey": "968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b"
  }
]
```

## All Together


```
{
  "userProfile": "isabella",
  "keyringEntries": [
    {
      "label": "Cash"
      "seed": "black warm emerge tuition merge wrap midnight settle bargain battle shaft napkin work select predict",
      "type": "HD"
      "publicIdentities": [
        {
          "algo": "ed25519",
          "data": "xpub6Bq6V7HdtJo62PGjD3K2AeGa3HhMb6H7fgQkmYxu5DZShn2X4Y5XWQHZUN8p1oC3tP66iVKY38GgrYQbsVz6sz4tk29K9pMVpASmW6TWjTo"
          "personalities": [
            {
            "root": "m",
            "purpose": "44'",
            "coin_type": "134'", # Defined here: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
            "account": "0'",
            "change": "0'",
            "address_index": "0",            
            "address": "12668885769632475474L",
            "label": "Pocket Change",
            "publicKey": "968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b"
            }
          ] # Close Personalities
        }
      ] # Close PublicIdentities
    },
    {
      "label": "Savings"
      "seed": "3a96e9e74e81c60fc60fffd83e2c8c31c369b1b11e604ab9cd858b89",
      "type": "privateKey",
      "publicIdentities": [
        {
          "algo": "secp256k1",
          "data": "03a320c4f367c61229b2264e4dd73cb7b0489c6903ada695f73179435baaadde9b"
          "personalities": [
            {
              "root": "m",
              "purpose": "44'",
              "coin_type": "60'", # Defined here: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
              "account": "0'",
              "change": "0'",
              "address_index": "0",
              "address": "0x6806ea1d9b2eb59DAc7fdcdf28bf8d5a12AD84Bc",
              "label": "Wells Fargo",
              "publicKey": "968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b",
            }
          ] # Close Personalities
        }
      ] # Close PublicIdentities
    },
    {
      "label": "ledger"
      "seed": null,
      "type": "hardware",
      "publicIdentities": [
        {
          "algo": "secp256k1",
          "data": "0231342cbbbe439c5d9e1e91e53c27a584e9966550f0d1e6c19d9cba00f965fb5b"
          "personalities": [
            {
              "root": "m",
              "purpose": "44'",
              "coin_type": "0'", # Defined here: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
              "account": "0'",
              "change": "0'",
              "address_index": "0",
              "address": "13afSJM3pChm17SBU5dsBKyXpYHGsHdYzJ",
              "label": "Cold Storage",
              "publicKey": "968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b"
            }
          ] # Close Personalities
        }
      ] # Close PublicIdentities
    }
  ] # Close Keyrings
}
```




# Example Work Flows:

## I am a User and I want to Add a Profile

Create a profile, and initialize it with an empty keyring

```
{
  "user": "isabella",
  "keyring": []
}
```

## I have a Profile and I want to add a `SecretIdentity`

Add an entry to the `keyring`
```
{
  "user": "isabella",
  "keyring": [
    {
      "label": "My Account",
      "seed": "1234",
      "type": "privateKey"
      "publicIdentity": []
    }
  ]
}
```

## I have a `SecretIdentity` and I want to create a `PublicIdentity` for a blockchain

Add a publicIdentity using the `SecretIdentity`
```
{
  "user": "isabella",
  "keyring": [
  {
    "label": "My Account",
    "seed": "1234",
    "type": "privateKey",
    "publicIdentity": [
       {
         "algo": "secp256k1",
         "data": "03a320c4f367c61229b2264e4dd73cb7b0489c6903ada695f73179435baaadde9b"
         "personality": []
       }
    ]
  }]
}
```

## I have a `PublicIdentity` and would like to create a `Personality` to receive funds on a blockchain

Create a Bip32/44 compatible `personality` object for the related `PublicIdentity`
```
{
  "user": "isabella",
  "keyring": [
  {
    "label": "My Account",
    "seed": "1234",
    "type": "privateKey",
    "publicIdentity": [
       {
         "algo": "secp256k1",
         "data": "03a320c4f367c61229b2264e4dd73cb7b0489c6903ada695f73179435baaadde9b"
         "personality": [{
            "root": "m",
            "purpose": "44'",
            "coin_type": "0'", # Defined here: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
            "account": "0'",
            "change": "0'",
            "address_index": "0",
            "address": "13afSJM3pChm17SBU5dsBKyXpYHGsHdYzJ",
            "label": "Cold Storage",
            "publicKey": "968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b"
          }]
       }
    ]
  }]
}
```

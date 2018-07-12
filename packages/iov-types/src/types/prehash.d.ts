// Prehash specifies which function to apply before the hash.
// The identity function is indicated using PH_NONE
// Otherwise, SHA256 or SHA512 may be selected.
export const enum Prehash {
  PH_NONE = "PH_NONE",
  PH_SHA512 = "PH_SHA512",
  PH_SHA256 = "PH_SHA256",
}

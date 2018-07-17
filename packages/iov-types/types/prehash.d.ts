// Prehash specifies which function to apply before the hash.
// The identity function is indicated using PH_NONE
// Otherwise, SHA256 or SHA512 may be selected.
export const enum PrehashType {
  None,
  Sha512,
  Sha256,
}

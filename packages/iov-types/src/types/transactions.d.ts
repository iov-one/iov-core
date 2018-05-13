import {
  PublicKeyString,
} from './keys'

export interface Transaction {
  readonly amount: number,
  readonly kind: string,
  readonly sender: PublicKeyString,
}

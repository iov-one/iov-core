import {
  PublicKeyString,
} from '../types/keys'
import {
  Transaction,
} from '../types/transactions';

export const transaction: Transaction = {
  amount: 123,
  kind: 'send',
  sender: '0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352' as PublicKeyString,
}

import {
  PublicKeyString,
} from '../types/keys'
import {
  NonceBuffer,
  NonceString,
  Transaction,
  TTLBuffer,
  TTLString
} from '../types/transactions';

export const nonceBuffer: NonceBuffer = new Uint8Array([0, 0, 0, 12]) as NonceBuffer
export const nonceString: NonceString = '12' as NonceString;

export const transaction: Transaction = {
  amount: 123,
  kind: 'send',
  sender: '0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352' as PublicKeyString,
}

export const ttlBuffer: TTLBuffer = new Uint8Array([0, 2, 0, 0]) as TTLBuffer
export const ttlString: TTLString = '1000' as TTLString;

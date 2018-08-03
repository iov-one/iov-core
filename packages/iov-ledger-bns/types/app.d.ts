export declare const getPublicKey: (transport: any) => Promise<Uint8Array>;
export declare const getPublicKeyWithIndex: (transport: any, i: number) => Promise<Uint8Array>;
export declare const signTransaction: (transport: any, transaction: Uint8Array) => Promise<Uint8Array>;
export declare const signTransactionWithIndex: (transport: any, transaction: Uint8Array, i: number) => Promise<Uint8Array>;
export declare const appVersion: (transport: any) => Promise<number>;

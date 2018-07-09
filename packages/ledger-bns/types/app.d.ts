export declare const getPublicKey: (transport: any) => Promise<Uint8Array>;
export declare const getPublicKeyWithPath: (transport: any, path: number) => Promise<Uint8Array>;
export declare const signTransaction: (transport: any, transaction: Uint8Array) => Promise<Uint8Array>;
export declare const signTransactionWithPath: (transport: any, transaction: Uint8Array, path: number) => Promise<Uint8Array>;
export declare const appVersion: (transport: any) => Promise<number>;

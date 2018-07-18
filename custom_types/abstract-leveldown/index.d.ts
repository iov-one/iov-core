// from https://github.com/Level/typings/tree/master/typings
// not yet uploaded to DefinitelyTyped (see https://github.com/Level/community/issues/16)

declare module "abstract-leveldown" {
  type ObjectAny = { [index: string]: any; }
  type ErrorCallback = (err: Error | undefined) => void;
  type ErrorValueCallback<V> = (err: Error | undefined, value: V) => void;
  type ErrorKeyValueCallback<K, V> = (err: Error | undefined, key: K, value: V) => void;

  export interface AbstractOpenOptions extends ObjectAny {
    createIfMissing?: boolean;
    errorIfExists?: boolean;
  }

  export interface AbstractGetOptions extends ObjectAny {
    asBuffer?: boolean;
  }

  export interface AbstractPutOptions extends ObjectAny { }

  export interface AbstractDelOptions extends ObjectAny { }

  export interface AbstractBatchOptions extends ObjectAny { }

  export interface AbstractLevelDOWN<K=any, V=any> extends ObjectAny {
    open(cb: ErrorCallback): void;
    open(options: AbstractOpenOptions, cb: ErrorCallback): void;

    close(cb: ErrorCallback): void;

    get(key: K, cb: ErrorValueCallback<V>): void;
    get(key: K, options: AbstractGetOptions, cb: ErrorValueCallback<V>): void;

    put(key: K, value: V, cb: ErrorCallback): void;
    put(key: K, value: V, options: AbstractPutOptions, cb: ErrorCallback): void;

    del(key: K, cb: ErrorCallback): void;
    del(key: K, options: AbstractDelOptions, cb: ErrorCallback): void;

    batch(): AbstractChainedBatch;
    batch(array: AbstractBatch[], cb: ErrorCallback): AbstractChainedBatch;
    batch(array: AbstractBatch[], options: AbstractBatchOptions, cb: ErrorCallback): AbstractChainedBatch;

    iterator(options?: AbstractIteratorOptions): AbstractIterator;
  }

  interface AbstractLevelDOWNConstructor {
    new <K=any, V=any>(location: string): AbstractLevelDOWN<K, V>;
    <K=any, V=any>(location: string): AbstractLevelDOWN<K, V>;
  }

  export interface AbstractIteratorOptions<K=any> extends ObjectAny {
    gt?: K;
    gte?: K;
    lt?: K;
    lte?: K;
    reverse?: boolean;
    limit?: number;
    keys?: boolean;
    values?: boolean;
    keyAsBuffer?: boolean;
    valueAsBuffer?: boolean;
  }

  export type AbstractBatch<K=any, V=any> = PutBatch<K, V> | DelBatch<K>

  export interface PutBatch<K=any, V=any> {
    type: 'put',
    key: K,
    value: V
  }

  export interface DelBatch<K=any, V=any> {
    type: 'del',
    key: K
  }

  export interface AbstractChainedBatch<K=any, V=any> extends AbstractChainedBatchConstructor, ObjectAny {
    put(key: K, value: V): this;
    del(key: K): this;
    clear(): this;
    write(cb: ErrorCallback): any
    write(options: any, cb: ErrorCallback): any
  }

  interface AbstractChainedBatchConstructor {
    new(db: any): AbstractChainedBatch;
    (db: any): AbstractChainedBatch;
  }

  export interface AbstractIterator<K=any, V=any> extends AbstractChainedBatchConstructor {
    db: AbstractLevelDOWN;
    next(cb: ErrorKeyValueCallback<K, V>): this;
    end(cb: ErrorCallback): void;
  }

  interface AbstractIteratorConstructor {
    new(db: any): AbstractIterator;
    (db: any): AbstractIterator;
  }

  export const AbstractLevelDOWN: AbstractLevelDOWNConstructor
  export const AbstractIterator: AbstractIteratorConstructor
  export const AbstractChainedBatch: AbstractChainedBatchConstructor

  //export default AbstractLevelDOWN;
}

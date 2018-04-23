export type Lazy<T> = () => T;
export type Fn<T, U> = (t: T) => U;
export type Predicate<T> = (t: T) => boolean;

export interface IChain<T> {
  readonly map: <U>(fn: Fn<T, U>) => IChain<U>;
  readonly filter: (p: Predicate<T>) => IChain<T>;
  readonly value: () => T;
}

import { Fn, IChain, Predicate } from "../types/fx.d";

export function chainify<T>(arr: ReadonlyArray<T>): IChain<T> {
  return {
    filter: (p: Predicate<T>) => chainify(arr.filter(p)),
    map: <U>(fn: Fn<T, U>) => chainify(arr.map(fn)),
    value: () => arr[0]
  };
}

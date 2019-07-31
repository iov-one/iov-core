export declare function groupByCallback<T, K>(
  values: readonly T[],
  callback: (value: T) => K,
): {
  readonly key: K;
  values: T[];
}[];
export declare function maxWithComparatorCallback<T>(
  values: readonly T[],
  callback: (value1: T, value2: T) => number,
): T;

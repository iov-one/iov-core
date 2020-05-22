export function groupByCallback<T, K>(
  values: readonly T[],
  callback: (value: T) => K,
  // tslint:disable-next-line:readonly-array readonly-keyword
): { readonly key: K; values: T[] }[] {
  return values.reduce(
    (grouped, value) => {
      const key = callback(value);
      const existing = grouped.find((group) => group.key === key);
      if (existing) {
        existing.values.push(value);
      } else {
        grouped.push({
          key: key,
          values: [value],
        });
      }
      return grouped;
    },
    // tslint:disable-next-line:readonly-array readonly-keyword
    [] as { readonly key: K; values: T[] }[],
  );
}

export function maxWithComparatorCallback<T>(
  values: readonly T[],
  callback: (value1: T, value2: T) => number,
): T {
  if (values.length === 0) throw new Error("No values to compare");
  return values
    .slice(1)
    .reduce((previous, next) => (callback(previous, next) > 0 ? previous : next), values[0]);
}

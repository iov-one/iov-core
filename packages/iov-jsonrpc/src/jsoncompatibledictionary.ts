/**
 * A single JSON value. This is the missing return type of JSON.parse().
 */
export type JsonCompatibleValue =
  | JsonCompatibleDictionary
  | JsonCompatibleArray
  | string
  | number
  | boolean
  | null;

/**
 * An array of JsonCompatibleValue
 */
// Use interface extension instead of type alias to make circular declaration possible.
export interface JsonCompatibleArray extends ReadonlyArray<JsonCompatibleValue> {}

/**
 * A string to json value dictionary.
 */
export interface JsonCompatibleDictionary {
  readonly [key: string]: JsonCompatibleValue | ReadonlyArray<JsonCompatibleValue>;
}

export function isJsonCompatibleValue(value: unknown): value is JsonCompatibleValue {
  if (Array.isArray(value)) {
    for (const item of value) {
      if (!isJsonCompatibleValue(item)) {
        return false;
      }
    }
    // all items okay
    return true;
  } else if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null ||
    isJsonCompatibleDictionary(value)
  ) {
    return true;
  } else {
    return false;
  }
}

export function isJsonCompatibleDictionary(data: unknown): data is JsonCompatibleDictionary {
  if (typeof data !== "object" || data === null) {
    // data must be a non-null object
    return false;
  }

  if (Array.isArray(data)) {
    return false;
  }

  for (const key of Object.getOwnPropertyNames(data)) {
    const value = (data as any)[key];
    if (!isJsonCompatibleValue(value)) {
      return false;
    }
  }

  return true;
}

let counter = 0;

/**
 * Creates a new ID to be used for creating a JSON-RPC request.
 *
 * Multiple calls of this produce unique values.
 *
 * The output may be any value compatible to JSON-RPC request IDs with an undefined output format and generation logic.
 */
export function makeJsonRpcId(): number {
  return (counter += 1);
}

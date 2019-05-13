let counter = 0;

export function makeId(): number {
  return (counter += 1);
}

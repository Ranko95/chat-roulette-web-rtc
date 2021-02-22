export function getLastItem<T>(set: Set<T>): T | undefined {
  if (!set.size) {
    return;
  }

  return [...set].pop();
}

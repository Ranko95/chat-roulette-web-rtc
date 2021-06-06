export default <T>(set: Set<T>, cb: (item: T) => boolean): T[] => {
  return [...set].filter(cb);
}

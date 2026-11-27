/**
 * Compares two revisions, as given in the `revision` field of a
 * `WatchMetricsResponse_Sample`.
 *
 * Returns a negative number if a is less than b, zero if they are equal, and a
 * positive number if a is greater than b. Of two samples of the same metric and
 * subject, the one with the greater revision is the more recent.
 */
export function compareRevisions(a: Uint8Array, b: Uint8Array): number {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const x = a[i]!;
    const y = b[i]!;
    if (x !== y) {
      return x - y;
    }
  }
  return a.length - b.length;
}

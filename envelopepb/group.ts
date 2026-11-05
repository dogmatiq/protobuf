import { asMultiEnvelope, tryAppendEnvelope } from "./envelope.js";
import type { Envelope, MultiEnvelope } from "./envelope_pb.js";

/**
 * Groups consecutive envelopes with equivalent headers into multi-envelopes,
 * preserving message order. Header equivalence is the same as for
 * {@link tryAppendEnvelope}, including unknown fields.
 *
 * The iterator is lazy. It reads one envelope ahead to find each group boundary
 * and stops reading when iteration stops. Empty input yields nothing. A run
 * with the same header is buffered until its end; use finite inputs to bound
 * batch sizes.
 *
 * Each output has a new bodies array but shares its header and bodies with the
 * input. Inputs are not modified and must not be mutated during iteration.
 *
 * When the header is already known, create a MultiEnvelope with that header
 * and accumulate its bodies directly rather than constructing temporary
 * envelopes for this function. This avoids wrappers and header comparisons.
 *
 * @example
 * // Envelopes that already exist:
 * const batches = [...groupEnvelopes(envelopes)];
 *
 * // A packer with a known header can build a batch directly:
 * const batch = create(MultiEnvelopeSchema, { header, bodies });
 *
 * @throws {Error} During iteration if an envelope has no body. No other
 * validation or metadata transformation is performed.
 */
export function* groupEnvelopes(
  envelopes: Iterable<Envelope>,
): Generator<MultiEnvelope, void, unknown> {
  let group: MultiEnvelope | undefined;
  for (const env of envelopes) {
    if (!env.body) {
      throw new Error("envelope must have a body");
    }
    if (group) {
      if (tryAppendEnvelope(group, env)) {
        continue;
      }
      yield group;
    }
    group = asMultiEnvelope(env);
  }
  if (group) {
    yield group;
  }
}

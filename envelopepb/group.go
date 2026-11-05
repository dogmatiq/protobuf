package envelopepb

import "iter"

// GroupEnvelopes groups consecutive envelopes with equivalent headers into
// multi-envelopes, preserving message order. Header equivalence is the same as
// for [MultiEnvelope.TryAppendEnvelope], including unknown fields.
//
// The returned sequence is lazy. It reads one envelope ahead to find each group
// boundary, and stops reading when iteration stops. Empty input yields nothing.
// A run with the same header is buffered until its end; use finite inputs to
// bound batch sizes.
//
// Each output has a new body slice but shares its header and bodies with the
// input. Inputs are not modified and must not be mutated during iteration.
//
// It panics during iteration if an envelope is nil or has no body. It does not
// otherwise validate envelopes or change their metadata.
func GroupEnvelopes(envelopes iter.Seq[*Envelope]) iter.Seq[*MultiEnvelope] {
	return func(yield func(*MultiEnvelope) bool) {
		var group *MultiEnvelope
		for env := range envelopes {
			if env.GetBody() == nil {
				panic("envelope must have a body")
			}
			if group != nil {
				if group.TryAppendEnvelope(env) {
					continue
				}
				if !yield(group) {
					return
				}
			}
			group = env.AsMultiEnvelope()
		}
		if group != nil {
			yield(group)
		}
	}
}

package envelopepb_test

import (
	"fmt"
	"slices"
	"testing"

	. "github.com/dogmatiq/protobuf/envelopepb"
)

var benchmarkMultiEnvelope *MultiEnvelope

// Compare the two intended call paths with unnecessarily manufacturing
// Envelope wrappers solely to group bodies from a known shared header.
func BenchmarkEnvelopeBatching(b *testing.B) {
	for _, count := range []int{1, 32, 128} {
		header := newEnvelope().GetHeader()
		bodies := make([]*Body, count)
		envelopes := make([]*Envelope, count)

		for i := range bodies {
			bodies[i] = newEnvelope().GetBody()
			envelopes[i] = NewEnvelopeBuilder().
				WithHeader(header).
				WithBody(bodies[i]).
				Build()
		}

		b.Run(fmt.Sprint(count), func(b *testing.B) {
			b.Run("existing-envelopes", func(b *testing.B) {
				b.ReportAllocs()

				for b.Loop() {
					for group := range AsMultiEnvelopes(slices.Values(envelopes)) {
						benchmarkMultiEnvelope = group
					}
				}
			})
			b.Run("known-header-growing-bodies", func(b *testing.B) {
				b.ReportAllocs()

				for b.Loop() {
					var packed []*Body

					for _, body := range bodies {
						packed = append(packed, body)
					}

					benchmarkMultiEnvelope = NewMultiEnvelopeBuilder().
						WithHeader(header).
						WithBodies(packed).
						Build()
				}
			})
			b.Run("known-header-existing-body-slice", func(b *testing.B) {
				b.ReportAllocs()

				for b.Loop() {
					benchmarkMultiEnvelope = NewMultiEnvelopeBuilder().
						WithHeader(header).
						WithBodies(bodies).
						Build()
				}
			})
			b.Run("known-header-through-temporary-envelopes", func(b *testing.B) {
				b.ReportAllocs()

				for b.Loop() {
					input := func(yield func(*Envelope) bool) {
						for _, body := range bodies {
							if !yield(
								NewEnvelopeBuilder().
									WithHeader(header).
									WithBody(body).
									Build(),
							) {
								return
							}
						}
					}

					for group := range AsMultiEnvelopes(input) {
						benchmarkMultiEnvelope = group
					}
				}
			})
		})
	}
}

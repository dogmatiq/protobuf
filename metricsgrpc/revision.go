package metricsgrpc

import "bytes"

// CompareRevisions compares two revisions, as given in
// [WatchMetricsResponse_Sample.GetRevision].
//
// It returns a negative number if a is less than b, zero if they are equal,
// and a positive number if a is greater than b. Of two samples of the same
// metric and subject, the one with the greater revision is the more recent.
func CompareRevisions(a, b []byte) int {
	return bytes.Compare(a, b)
}

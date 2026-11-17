package metricsgrpc_test

import (
	"testing"

	"github.com/dogmatiq/protobuf/metricsgrpc"
)

func TestCompareRevisions(t *testing.T) {
	for _, tc := range []struct {
		name string
		a, b []byte
		want int
	}{
		{"both empty", nil, nil, 0},
		{"equal", []byte{1, 2}, []byte{1, 2}, 0},
		{"empty is less", nil, []byte{0}, -1},
		{"prefix is less", []byte{1}, []byte{1, 0}, -1},
		{"first differing byte decides", []byte{1, 9}, []byte{2, 0}, -1},
		{"bytes are unsigned", []byte{0x7f}, []byte{0x80}, -1},
		{"greater", []byte{2}, []byte{1, 9}, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			got := sign(metricsgrpc.CompareRevisions(tc.a, tc.b))
			if got != tc.want {
				t.Fatalf("CompareRevisions(%v, %v): got %d, want %d", tc.a, tc.b, got, tc.want)
			}
		})
	}
}

func sign(n int) int {
	switch {
	case n < 0:
		return -1
	case n > 0:
		return 1
	default:
		return 0
	}
}

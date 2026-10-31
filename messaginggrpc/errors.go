package messaginggrpc

import (
	uuidpb "github.com/dogmatiq/protobuf/uuidpb"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
)

// UnrecognizedEventStreamError returns an error indicating that the given
// stream is not recognized by the server.
func UnrecognizedEventStreamError(id *uuidpb.UUID) error {
	s, err := status.
		New(codes.NotFound, "unrecognized event stream").
		WithDetails(
			NewUnrecognizedEventStreamBuilder().
				WithEventStreamId(id).
				Build(),
		)

	if err != nil {
		panic(err)
	}

	return s.Err()
}

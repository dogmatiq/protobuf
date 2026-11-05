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

// EventStreamConsumerTooSlowError returns an error indicating that the server
// can no longer deliver the given stream contiguously because the client cannot
// keep up.
func EventStreamConsumerTooSlowError(id *uuidpb.UUID) error {
	s, err := status.
		New(codes.ResourceExhausted, "event stream consumer too slow").
		WithDetails(
			NewEventStreamConsumerTooSlowBuilder().
				WithEventStreamId(id).
				Build(),
		)
	if err != nil {
		panic(err)
	}
	return s.Err()
}

package messaginggrpc_test

import (
	"testing"

	"github.com/dogmatiq/protobuf/messaginggrpc"
	"github.com/dogmatiq/protobuf/uuidpb"
	"google.golang.org/protobuf/types/known/emptypb"
)

func TestMessageTypeFilter_Validate(t *testing.T) {
	specific := func(ids ...*uuidpb.UUID) *messaginggrpc.MessageTypeFilter {
		return messaginggrpc.NewMessageTypeFilterBuilder().
			WithMessageTypes(messaginggrpc.NewMessageTypeFilter_MessageTypesBuilder().WithIds(ids).Build()).Build()
	}
	for _, tc := range []struct {
		name   string
		filter *messaginggrpc.MessageTypeFilter
		valid  bool
	}{
		{"missing filter", nil, false},
		{"missing selection", &messaginggrpc.MessageTypeFilter{}, false},
		{"all message types", messaginggrpc.NewMessageTypeFilterBuilder().WithAll(&emptypb.Empty{}).Build(), true},
		{"empty specific types", specific(), false},
		{"one specific type", specific(uuidpb.Generate()), true},
		{"several specific types", specific(uuidpb.Generate(), uuidpb.Generate()), true},
		{"missing type ID", specific(nil), false},
		{"invalid type ID", specific(uuidpb.MustParse("01890a5d-ac96-774b-bcce-b302099a8057")), false},
	} {
		t.Run(tc.name, func(t *testing.T) {
			err := tc.filter.Validate()
			if tc.valid && err != nil {
				t.Fatalf("valid filter rejected: %v", err)
			}
			if !tc.valid && err == nil {
				t.Fatal("invalid filter accepted")
			}
		})
	}
}

func TestEventStreamRequests_requireMessageTypeFilter(t *testing.T) {
	watch := &messaginggrpc.WatchEventsRequest{}
	read := &messaginggrpc.ReadEventsRequest{}
	if watch.GetMessageTypeFilter().Validate() == nil {
		t.Fatal("watch request with no filter accepted")
	}
	if read.GetMessageTypeFilter().Validate() == nil {
		t.Fatal("read request with no filter accepted")
	}
}

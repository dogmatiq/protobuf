package messaginggrpc

import (
	"errors"
	"fmt"
)

// Validate returns an error if x has no selection, selects an empty list of
// message type IDs, or contains an invalid message type ID.
func (x *MessageTypeFilter) Validate() error {
	if x == nil {
		return errors.New("message type filter is required")
	}
	if x.GetAll() != nil {
		return nil
	}
	types := x.GetMessageTypes()
	if types == nil {
		return errors.New("message type filter must select all or specific message types")
	}
	if len(types.GetIds()) == 0 {
		return errors.New("message type filter must contain at least one message type ID")
	}
	for i, id := range types.GetIds() {
		if err := id.Validate(); err != nil {
			return fmt.Errorf("invalid message type ID at index %d: %w", i, err)
		}
	}
	return nil
}

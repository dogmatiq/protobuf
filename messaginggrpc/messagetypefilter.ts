import { validateUUID } from "../uuidpb/uuid.js";
import type { MessageTypeFilter } from "./messagetypefilter_pb.js";

/**
 * Throws an error if x has no selection, selects an empty list of message type
 * IDs, or contains an invalid message type ID.
 */
export function validateMessageTypeFilter(
  x: MessageTypeFilter | undefined,
): void {
  if (!x) {
    throw new Error("message type filter is required");
  }
  switch (x.selection.case) {
    case "all":
      return;
    case "messageTypes": {
      const ids = x.selection.value.ids;
      if (ids.length === 0) {
        throw new Error(
          "message type filter must contain at least one message type ID",
        );
      }
      ids.forEach((id, i) => {
        try {
          validateUUID(id);
        } catch (cause) {
          throw new Error(
            `invalid message type ID at index ${i}: ${(cause as Error).message}`,
            { cause },
          );
        }
      });
      return;
    }
    default:
      throw new Error(
        "message type filter must select all or specific message types",
      );
  }
}

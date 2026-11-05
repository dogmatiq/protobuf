import { create } from "@bufbuild/protobuf";
import { EmptySchema } from "@bufbuild/protobuf/wkt";
import { describe, expect, it } from "vitest";
import { parseUUID } from "../uuidpb/uuid.js";
import { UUIDSchema, type UUID } from "../uuidpb/uuid_pb.js";
import { validateMessageTypeFilter } from "./messagetypefilter.js";
import {
  MessageTypeFilterSchema,
  MessageTypeFilter_MessageTypesSchema,
} from "./messagetypefilter_pb.js";
import {
  ReadEventsRequestSchema,
  WatchEventsRequestSchema,
} from "./eventstreamconsumer_pb.js";

const id = parseUUID("a967a8b9-3f9c-4918-9a41-19577be5fec5");
function specific(ids: UUID[]) {
  return create(MessageTypeFilterSchema, {
    selection: {
      case: "messageTypes",
      value: create(MessageTypeFilter_MessageTypesSchema, { ids }),
    },
  });
}

describe("validateMessageTypeFilter", () => {
  it("accepts an explicit all-types selection", () => {
    const filter = create(MessageTypeFilterSchema, {
      selection: { case: "all", value: create(EmptySchema) },
    });
    expect(() => validateMessageTypeFilter(filter)).not.toThrow();
  });
  it("accepts a non-empty specific-types selection", () => {
    expect(() => validateMessageTypeFilter(specific([id]))).not.toThrow();
  });
  it.each([
    ["missing filter", undefined],
    ["missing selection", create(MessageTypeFilterSchema)],
    ["empty specific types", specific([])],
    ["invalid type ID", specific([create(UUIDSchema)])],
  ])("rejects %s", (_, filter) => {
    expect(() => validateMessageTypeFilter(filter)).toThrow();
  });
  it("rejects missing filters for both RPCs", () => {
    expect(() =>
      validateMessageTypeFilter(
        create(WatchEventsRequestSchema).messageTypeFilter,
      ),
    ).toThrow();
    expect(() =>
      validateMessageTypeFilter(
        create(ReadEventsRequestSchema).messageTypeFilter,
      ),
    ).toThrow();
  });
});

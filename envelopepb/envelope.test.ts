import { readFileSync } from "node:fs";
import { create, fromBinary } from "@bufbuild/protobuf";
import { anyPack, anyUnpack, StringValueSchema } from "@bufbuild/protobuf/wkt";
import { describe, expect, it } from "vitest";
import { getBaggage, setBaggage } from "./baggage.js";
import { BodySchema, EnvelopeSchema, HeaderSchema } from "./envelope_pb.js";
import { getExtension, setExtension } from "./extensions.js";
import { EventStreamPositionSchema } from "./extensions_pb.js";

describe.each([
  ["setExtension", setExtension, "extensions"] as const,
  ["setBaggage", setBaggage, "baggage"] as const,
])("%s", (_, set, field) => {
  it("adds the value", () => {
    const body = create(BodySchema, {});

    set(body, StringValueSchema, create(StringValueSchema, { value: "a" }));

    expect(body[field]).toHaveLength(1);
    expect(anyUnpack(body[field][0], StringValueSchema)?.value).toBe("a");
  });

  it("adds the value to a header", () => {
    const header = create(HeaderSchema, {});

    set(header, StringValueSchema, create(StringValueSchema, { value: "a" }));

    expect(header[field]).toHaveLength(1);
    expect(anyUnpack(header[field][0], StringValueSchema)?.value).toBe("a");
  });

  it("replaces an existing value of the same message type", () => {
    const body = create(BodySchema, {});
    const other = anyPack(
      EventStreamPositionSchema,
      create(EventStreamPositionSchema, {}),
    );
    body[field].push(other);

    set(body, StringValueSchema, create(StringValueSchema, { value: "a" }));
    set(body, StringValueSchema, create(StringValueSchema, { value: "b" }));

    expect(body[field]).toHaveLength(2);
    expect(body[field][0]).toBe(other);
    expect(anyUnpack(body[field][1], StringValueSchema)?.value).toBe("b");
  });

  it("ignores values whose type URL has no message name", () => {
    const body = create(BodySchema, {});
    const malformed = anyPack(StringValueSchema, create(StringValueSchema, {}));
    malformed.typeUrl = "example.com/";
    body[field].push(malformed);

    set(body, StringValueSchema, create(StringValueSchema, { value: "a" }));

    expect(body[field]).toHaveLength(2);
    expect(body[field][0]).toBe(malformed);
  });

  it("replaces an existing value of the same type with a different type URL prefix", () => {
    const body = create(BodySchema, {});
    const first = anyPack(
      StringValueSchema,
      create(StringValueSchema, { value: "a" }),
    );
    first.typeUrl = "example.com/google.protobuf.StringValue";
    body[field].push(first);

    set(body, StringValueSchema, create(StringValueSchema, { value: "b" }));

    expect(body[field]).toHaveLength(1);
    expect(body[field][0].typeUrl).toBe(
      "type.googleapis.com/google.protobuf.StringValue",
    );
  });
});

describe("getExtension", () => {
  it("skips values whose type URL has no message name", () => {
    const position = create(EventStreamPositionSchema, { offset: 42n });
    const malformed = anyPack(StringValueSchema, create(StringValueSchema, {}));
    malformed.typeUrl = "example.com/";

    const env = create(EnvelopeSchema, {
      body: {
        extensions: [malformed, anyPack(EventStreamPositionSchema, position)],
      },
    });

    expect(getExtension(env, EventStreamPositionSchema)?.offset).toBe(42n);
  });
});

// The golden fixtures are shared with the Go tests, to ensure that both
// languages find the same extension and baggage values.
describe("golden Envelope fixtures", () => {
  const dir = new URL("./testdata/", import.meta.url);

  const cases: {
    file: string;
    description: string;
    values: {
      extensionOffset: number | null;
      baggageOffset: number | null;
    };
  }[] = JSON.parse(readFileSync(new URL("expectations.json", dir), "utf-8"));

  it.each(cases)("$description", ({ file, values }) => {
    const env = fromBinary(EnvelopeSchema, readFileSync(new URL(file, dir)));

    const got = {
      extensionOffset: offset(getExtension(env, EventStreamPositionSchema)),
      baggageOffset: offset(getBaggage(env, EventStreamPositionSchema)),
    };

    expect(got).toEqual(values);
  });

  function offset(x: { offset: bigint } | undefined): number | null {
    return x === undefined ? null : Number(x.offset);
  }
});

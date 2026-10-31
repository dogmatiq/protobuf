import type { DescMessage, MessageShape } from "@bufbuild/protobuf";
import { anyIs, anyPack, anyUnpack, type Any } from "@bufbuild/protobuf/wkt";

/**
 * Returns the first value matching the given schema from the given sets of
 * {@link Any} values, searching each set in order.
 *
 * @throws {Error} If a matching value is present but cannot be decoded.
 */
export function findAnyValue<Desc extends DescMessage>(
  schema: Desc,
  ...sets: (Any[] | undefined)[]
): MessageShape<Desc> | undefined {
  for (const values of sets) {
    for (const v of values ?? []) {
      if (anyIs(v, schema)) {
        return anyUnpack(v, schema);
      }
    }
  }

  return undefined;
}

/**
 * Packs value into an {@link Any} and replaces the value in values of the same
 * message type, or appends it if there is none.
 *
 * Like {@link anyIs}, it compares only the message name at the end of the type
 * URL, so values packed with different type URL prefixes are the same type.
 */
export function setAnyValue<Desc extends DescMessage>(
  values: Any[],
  schema: Desc,
  value: MessageShape<Desc>,
): void {
  const packed = anyPack(schema, value);
  const index = values.findIndex((v) => anyIs(v, schema));

  if (index === -1) {
    values.push(packed);
  } else {
    values[index] = packed;
  }
}

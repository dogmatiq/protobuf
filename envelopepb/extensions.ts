import type { DescMessage, MessageShape } from "@bufbuild/protobuf";
import { findAnyValue, setAnyValue } from "./any.js";
import type { Body, Envelope, Header } from "./envelope_pb.js";

/**
 * Returns the extension matching the given schema from an envelope's
 * extensions.
 *
 * Values in the envelope's body take precedence over those in its header. It
 * returns `undefined` if no extension of the matching type is present.
 *
 * @throws {Error} If the extension is present but cannot be decoded.
 */
export function getExtension<Desc extends DescMessage>(
  env: Envelope,
  schema: Desc,
): MessageShape<Desc> | undefined {
  return findAnyValue(schema, env.body?.extensions, env.header?.extensions);
}

/**
 * Sets value as an extension on target. If an extension of the same message
 * type is already present, it is replaced.
 */
export function setExtension<Desc extends DescMessage>(
  target: Header | Body,
  schema: Desc,
  value: MessageShape<Desc>,
): void {
  setAnyValue(target.extensions, schema, value);
}

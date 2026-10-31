import type { DescMessage, MessageShape } from "@bufbuild/protobuf";
import { findAnyValue, setAnyValue } from "./any.js";
import type { Body, Envelope } from "./envelope_pb.js";

/**
 * Returns the baggage value matching the given schema from an envelope's
 * baggage.
 *
 * Values in the envelope's body take precedence over those in its header. It
 * returns `undefined` if no baggage of the matching type is present.
 *
 * @throws {Error} If the baggage is present but cannot be decoded.
 */
export function getBaggage<Desc extends DescMessage>(
  env: Envelope,
  schema: Desc,
): MessageShape<Desc> | undefined {
  return findAnyValue(schema, env.body?.baggage, env.header?.baggage);
}

/**
 * Sets value as a baggage value on body. If a baggage value of the same message
 * type is already present, it is replaced.
 */
export function setBaggage<Desc extends DescMessage>(
  body: Body,
  schema: Desc,
  value: MessageShape<Desc>,
): void {
  setAnyValue(body.baggage, schema, value);
}

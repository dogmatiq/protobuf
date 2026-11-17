import { describe, expect, it } from "vitest";
import { compareRevisions } from "./revision.js";

describe("compareRevisions", () => {
  it.each([
    ["both empty", [], [], 0],
    ["equal", [1, 2], [1, 2], 0],
    ["empty is less", [], [0], -1],
    ["prefix is less", [1], [1, 0], -1],
    ["first differing byte decides", [1, 9], [2, 0], -1],
    ["bytes are unsigned", [0x7f], [0x80], -1],
    ["greater", [2], [1, 9], 1],
  ])("%s", (_, a, b, want) => {
    const got = Math.sign(
      compareRevisions(new Uint8Array(a), new Uint8Array(b)),
    );
    expect(got).toBe(want);
  });
});

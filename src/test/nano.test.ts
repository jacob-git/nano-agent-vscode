import assert from "node:assert/strict";
import test from "node:test";
import { analyzeText, compactPacketJson, createFixture } from "../nano.js";

test("analyzeText returns a budget report for prompt text", () => {
  const result = analyzeText([
    "Goal: answer refund request",
    "",
    "Latest request: customer was charged twice.",
    "",
    "Old context: " + "irrelevant old chat ".repeat(100),
  ].join("\n"), {
    maxInputTokens: 80,
  });

  assert.equal(result.inputTokens <= 80, true);
  assert.equal(result.originalTokens > result.inputTokens, true);
  assert.equal(result.dropped.length > 0, true);
});

test("compactPacketJson emits parseable packet", () => {
  const result = analyzeText("Goal: summarize\n\nContext: short", {
    maxInputTokens: 120,
  });
  const packet = JSON.parse(compactPacketJson(result));

  assert.equal(packet.goal.startsWith("Goal"), true);
  assert.equal(Array.isArray(packet.messages), true);
});

test("createFixture wraps prompt text for nano-agent benchmark fixtures", () => {
  const fixture = JSON.parse(createFixture("Goal: answer\n\nPolicy: keep it short", 100, "sample"));

  assert.equal(fixture.name, "sample");
  assert.equal(fixture.budget, 100);
  assert.equal(fixture.input.goal.startsWith("Goal"), true);
});

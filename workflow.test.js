const assert = require("node:assert/strict");
const test = require("node:test");

const coach = require("./app");

test("correctWriting improves the requested daily report workflow", () => {
  const result = coach.correctWriting(coach.sampleText);

  assert.match(result.text, /build a website for my daily English report/);
  assert.match(result.text, /three-step process/);
  assert.match(result.text, /higher-level English/);
  assert.match(result.text, /what percentage is exactly the same as yours/);
  assert.ok(result.notes.length > 1);
});

test("makeHigherLevel adds elevated vocabulary and a reflective close", () => {
  const elevated = coach.makeHigherLevel(coach.sampleText);

  assert.match(elevated, /I would like to/);
  assert.match(elevated, /written expression/);
  assert.match(elevated, /Overall, this process helps me/);
});

test("calculateSimilarity scores exact and partial rewrites", () => {
  const model = "I would like to refine my daily written expression.";

  assert.equal(coach.calculateSimilarity(model, model).percent, 100);

  const partial = coach.calculateSimilarity("I want to improve writing.", model);
  assert.ok(partial.percent > 0);
  assert.ok(partial.percent < 100);
});

test("buildRewriteAdvice suggests another rewrite when the text is incomplete", () => {
  const advice = coach.buildRewriteAdvice(
    "I want English.",
    "I would like to refine my daily written expression with clearer structure.",
    "I want English.",
  );

  assert.match(advice, /Rewrite once more|Good start/);
  assert.match(advice, /Try using these model words/);
});

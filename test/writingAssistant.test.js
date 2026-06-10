import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeWriting, compareRewrite, normalizeWhitespace, tokenize } from "../src/writingAssistant.js";

describe("writing assistant analysis", () => {
  it("returns starter guidance for empty drafts", () => {
    const result = analyzeWriting({ text: "" });

    assert.equal(result.stats.wordCount, 0);
    assert.equal(result.suggestedRevision, "");
    assert.equal(result.suggestions[0].title, "Start with a draft");
  });

  it("suggests improvements for weak and repetitive writing", () => {
    const text = `
      i think the project was very good because the project helped people.
      The project was really important and the project showed a lot of things.
      We learned that the project can be better.
    `;

    const result = analyzeWriting({ title: "", type: "report", text });
    const suggestionTitles = result.suggestions.map((suggestion) => suggestion.title);

    assert.ok(suggestionTitles.includes("Add a clear title"));
    assert.ok(suggestionTitles.includes("Reduce repeated words"));
    assert.ok(suggestionTitles.includes("Remove weak filler"));
    assert.match(result.suggestedRevision, /I believe/);
    assert.match(result.suggestedRevision, /many/);
  });

  it("normalizes and tokenizes writing consistently", () => {
    assert.equal(normalizeWhitespace(" Hello   world \r\n again "), "Hello world\nagain");
    assert.deepEqual(tokenize("Hello, WORLD! It's me."), ["hello", "world", "it's", "me"]);
  });
});

describe("rewrite comparison", () => {
  it("shows full alignment for identical suggested and rewritten text", () => {
    const comparison = compareRewrite({
      original: "I was very tired.",
      suggested: "I was tired.",
      rewrite: "I was tired."
    });

    assert.equal(comparison.alignmentPercent, 100);
    assert.ok(comparison.changedFromOriginalPercent > 0);
  });

  it("returns helpful feedback when no rewrite exists", () => {
    const comparison = compareRewrite({
      original: "Today I went to school.",
      suggested: "Today I went to school and learned a useful lesson.",
      rewrite: ""
    });

    assert.equal(comparison.alignmentPercent, 0);
    assert.equal(comparison.rewriteWordCount, 0);
    assert.match(comparison.note, /Add your rewritten version/);
  });
});

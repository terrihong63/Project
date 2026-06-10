const DailyEnglishCoach = (() => {
  const sampleText =
    "Hello, I want to make the website of my daily English report. I want to take three steps. First step, you correct my writing, daily writing. And then second step, you suggest more interpretive, more high-level English. Third step, I want to rewrite. And then you correct again how many percent is exactly the same as yours. And then you suggest them to rewrite too.";

  const correctionRules = [
    {
      pattern: /\bmake the website of\b/gi,
      replacement: "build a website for",
      note: 'Use "build a website for" when describing a website project.',
    },
    {
      pattern: /\bI want to take three steps\b/gi,
      replacement: "I want to use a three-step process",
      note: 'Use "three-step process" for a clearer workflow.',
    },
    {
      pattern: /\bFirst step, you correct my writing, daily writing\b/gi,
      replacement: "In the first step, you correct my daily writing",
      note: "Make step descriptions complete and natural.",
    },
    {
      pattern: /\bAnd then second step\b/gi,
      replacement: "In the second step",
      note: "Use step transitions instead of repeating \"and then.\"",
    },
    {
      pattern: /\bmore interpretive, more high-level English\b/gi,
      replacement: "more interpretive, higher-level English",
      note: 'Use "higher-level" instead of repeating "more."',
    },
    {
      pattern: /\bThird step\b/gi,
      replacement: "In the third step",
      note: "Use parallel wording for each step.",
    },
    {
      pattern: /\bcorrect again how many percent is exactly the same as yours\b/gi,
      replacement:
        "correct it again and tell me what percentage is exactly the same as yours",
      note: 'Use "what percentage" for comparison questions.',
    },
    {
      pattern: /\bsuggest them to rewrite too\b/gi,
      replacement: "suggest how I can rewrite it again",
      note: "Clarify who is rewriting and what action should happen next.",
    },
    {
      pattern: /\bdont\b/gi,
      replacement: "don't",
      note: "Add the apostrophe in common contractions.",
    },
    {
      pattern: /\bcant\b/gi,
      replacement: "can't",
      note: "Add the apostrophe in common contractions.",
    },
    {
      pattern: /\bim\b/gi,
      replacement: "I'm",
      note: "Capitalize and punctuate the contraction \"I'm.\"",
    },
    {
      pattern: /\bi\b/g,
      replacement: "I",
      note: "Capitalize the pronoun \"I.\"",
    },
  ];

  const elevatedPhrases = [
    [/\bI want to\b/gi, "I would like to"],
    [/\buse\b/gi, "apply"],
    [/\bcorrect\b/gi, "refine"],
    [/\bwriting\b/gi, "written expression"],
    [/\bsuggest\b/gi, "recommend"],
    [/\brewrite\b/gi, "revise"],
    [/\bagain\b/gi, "once more"],
    [/\bshow\b/gi, "demonstrate"],
    [/\blearned\b/gi, "gained insight into"],
    [/\bimprove\b/gi, "strengthen"],
    [/\bgood\b/gi, "effective"],
    [/\bbad\b/gi, "challenging"],
    [/\bvery\b/gi, "particularly"],
    [/\bso\b/gi, "therefore"],
    [/\bbecause\b/gi, "since"],
  ];

  function normalizeWhitespace(text) {
    return text.replace(/\s+/g, " ").trim();
  }

  function capitalizeSentences(text) {
    return text.replace(/(^\s*[a-z])|([.!?]\s+[a-z])/g, (match) =>
      match.toUpperCase(),
    );
  }

  function ensureFinalPunctuation(text) {
    if (!text) {
      return text;
    }

    return /[.!?]$/.test(text) ? text : `${text}.`;
  }

  function applySpacing(text) {
    return text
      .replace(/\s+([,.!?;:])/g, "$1")
      .replace(/([,.!?;:])([^\s"')\]])/g, "$1 $2")
      .replace(/\s{2,}/g, " ");
  }

  function correctWriting(input) {
    const notes = [];
    let corrected = normalizeWhitespace(input || "");

    if (!corrected) {
      return {
        text: "",
        notes: ["Write a report first, then run the correction step."],
      };
    }

    const spacingFixed = applySpacing(corrected);
    if (spacingFixed !== corrected) {
      notes.push("Cleaned up spacing around punctuation.");
      corrected = spacingFixed;
    }

    correctionRules.forEach((rule) => {
      rule.pattern.lastIndex = 0;
      if (rule.pattern.test(corrected)) {
        notes.push(rule.note);
        corrected = corrected.replace(rule.pattern, rule.replacement);
      }
    });

    const capitalized = capitalizeSentences(corrected);
    if (capitalized !== corrected) {
      notes.push("Capitalized sentence openings.");
      corrected = capitalized;
    }

    const punctuated = ensureFinalPunctuation(corrected);
    if (punctuated !== corrected) {
      notes.push("Added final punctuation.");
      corrected = punctuated;
    }

    return {
      text: punctuated,
      notes: notes.length
        ? [...new Set(notes)]
        : ["No common issues found. Read once more for meaning and detail."],
    };
  }

  function splitSentences(text) {
    return (normalizeWhitespace(text).match(/[^.!?]+[.!?]*/g) || [])
      .map((sentence) => sentence.trim())
      .filter(Boolean);
  }

  function makeHigherLevel(input) {
    const corrected = correctWriting(input).text;
    if (!corrected) {
      return "";
    }

    let elevated = corrected;
    elevatedPhrases.forEach(([pattern, replacement]) => {
      elevated = elevated.replace(pattern, replacement);
    });

    const sentences = splitSentences(elevated);
    if (sentences.length > 1) {
      elevated = sentences
        .map((sentence, index) => {
          if (index === 0) {
            return sentence;
          }

          if (/^(in|then|finally|overall|therefore)\b/i.test(sentence)) {
            return sentence;
          }

          return `Additionally, ${sentence.charAt(0).toLowerCase()}${sentence.slice(1)}`;
        })
        .join(" ");
    }

    if (!/\b(overall|in summary|this experience|this process)\b/i.test(elevated)) {
      elevated +=
        " Overall, this process helps me move beyond basic accuracy and develop clearer, more reflective English.";
    }

    return elevated;
  }

  function tokenize(text) {
    return (text.toLowerCase().match(/[a-z0-9']+/g) || []).filter(Boolean);
  }

  function longestCommonSubsequenceLength(leftTokens, rightTokens) {
    const previous = new Array(rightTokens.length + 1).fill(0);
    const current = new Array(rightTokens.length + 1).fill(0);

    for (let i = 1; i <= leftTokens.length; i += 1) {
      for (let j = 1; j <= rightTokens.length; j += 1) {
        current[j] =
          leftTokens[i - 1] === rightTokens[j - 1]
            ? previous[j - 1] + 1
            : Math.max(previous[j], current[j - 1]);
      }

      previous.splice(0, previous.length, ...current);
      current.fill(0);
    }

    return previous[rightTokens.length];
  }

  function calculateSimilarity(rewrite, model) {
    const rewriteTokens = tokenize(rewrite);
    const modelTokens = tokenize(model);

    if (!rewriteTokens.length || !modelTokens.length) {
      return {
        percent: 0,
        matchedWords: 0,
        modelWords: modelTokens.length,
      };
    }

    const matchedWords = longestCommonSubsequenceLength(rewriteTokens, modelTokens);

    return {
      percent: Math.round((matchedWords / modelTokens.length) * 100),
      matchedWords,
      modelWords: modelTokens.length,
    };
  }

  function findMissingKeywords(rewrite, model) {
    const rewriteWords = new Set(tokenize(rewrite));
    const modelWords = tokenize(model);
    const ignored = new Set([
      "the",
      "and",
      "that",
      "this",
      "with",
      "from",
      "into",
      "your",
      "mine",
      "would",
      "could",
      "should",
      "once",
      "more",
    ]);

    return [...new Set(modelWords)]
      .filter((word) => word.length > 5 && !ignored.has(word) && !rewriteWords.has(word))
      .slice(0, 6);
  }

  function buildRewriteAdvice(rewrite, model, correctedRewrite) {
    if (!normalizeWhitespace(rewrite)) {
      return "Write your own version first. Try to keep the model's structure while using your own memory and details.";
    }

    const similarity = calculateSimilarity(rewrite, model);
    const missingKeywords = findMissingKeywords(rewrite, model);
    const advice = [];

    if (similarity.percent >= 90) {
      advice.push(
        "Excellent match. For the next rewrite, keep the same accuracy but add one specific personal detail.",
      );
    } else if (similarity.percent >= 70) {
      advice.push(
        "Strong rewrite. Review the model again and copy its transition words more carefully.",
      );
    } else if (similarity.percent >= 45) {
      advice.push(
        "Good start. Keep the same order as the suggested version: purpose, process, comparison, then next action.",
      );
    } else {
      advice.push(
        "Rewrite once more while looking at the suggested version sentence by sentence.",
      );
    }

    if (missingKeywords.length) {
      advice.push(`Try using these model words: ${missingKeywords.join(", ")}.`);
    }

    if (correctedRewrite && correctedRewrite !== normalizeWhitespace(rewrite)) {
      advice.push("Also compare your rewrite with the corrected rewrite above for grammar and punctuation.");
    }

    return advice.join(" ");
  }

  function setNotes(notesElement, notes) {
    notesElement.innerHTML = "";
    notes.forEach((note) => {
      const item = document.createElement("li");
      item.textContent = note;
      notesElement.appendChild(item);
    });
  }

  function init() {
    const originalText = document.querySelector("#originalText");
    const correctedText = document.querySelector("#correctedText");
    const elevatedText = document.querySelector("#elevatedText");
    const rewriteText = document.querySelector("#rewriteText");
    const rewriteCorrection = document.querySelector("#rewriteCorrection");
    const correctionNotes = document.querySelector("#correctionNotes");
    const matchScore = document.querySelector("#matchScore");
    const matchMeter = document.querySelector("#matchMeter");
    const rewriteAdvice = document.querySelector("#rewriteAdvice");

    document.querySelector("#sampleButton").addEventListener("click", () => {
      originalText.value = sampleText;
      correctedText.value = "";
      elevatedText.value = "";
      rewriteText.value = "";
      rewriteCorrection.value = "";
      rewriteAdvice.textContent = "";
      matchScore.textContent = "0%";
      matchMeter.style.width = "0%";
      setNotes(correctionNotes, ["Sample loaded. Now run the correction step."]);
    });

    document.querySelector("#correctButton").addEventListener("click", () => {
      const result = correctWriting(originalText.value);
      correctedText.value = result.text;
      setNotes(correctionNotes, result.notes);
    });

    document.querySelector("#elevateButton").addEventListener("click", () => {
      const source = correctedText.value || originalText.value;
      const result = correctWriting(source);
      correctedText.value = result.text;
      setNotes(correctionNotes, result.notes);
      elevatedText.value = makeHigherLevel(result.text);
    });

    document.querySelector("#checkRewriteButton").addEventListener("click", () => {
      const model = elevatedText.value || makeHigherLevel(correctedText.value || originalText.value);
      elevatedText.value = model;

      const corrected = correctWriting(rewriteText.value).text;
      const similarity = calculateSimilarity(rewriteText.value, model);

      rewriteCorrection.value = corrected;
      matchScore.textContent = `${similarity.percent}%`;
      matchMeter.style.width = `${Math.min(similarity.percent, 100)}%`;
      rewriteAdvice.textContent = buildRewriteAdvice(
        rewriteText.value,
        model,
        corrected,
      );
    });
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", init);
  }

  return {
    buildRewriteAdvice,
    calculateSimilarity,
    correctWriting,
    makeHigherLevel,
    sampleText,
    tokenize,
  };
})();

if (typeof module !== "undefined") {
  module.exports = DailyEnglishCoach;
}

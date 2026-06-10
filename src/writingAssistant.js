const FILLER_PHRASES = [
  "very",
  "really",
  "just",
  "actually",
  "basically",
  "kind of",
  "sort of",
  "a lot",
  "things",
  "stuff"
];

const TRANSITIONS = [
  "first",
  "next",
  "then",
  "finally",
  "because",
  "therefore",
  "however",
  "for example",
  "in conclusion"
];

const TYPE_GUIDANCE = {
  diary: {
    focus: "Add one feeling, one concrete moment, and one reflection about what you learned.",
    closing: "End with what you want to remember or try next."
  },
  report: {
    focus: "State the main finding early, then support it with facts, causes, and results.",
    closing: "End with a clear next step or recommendation."
  },
  essay: {
    focus: "Make the thesis clear, organize each paragraph around one reason, and connect ideas with transitions.",
    closing: "End by returning to the thesis and explaining why it matters."
  }
};

const COMMON_REPLACEMENTS = [
  [/\ba lot of\b/gi, "many"],
  [/\bvery good\b/gi, "strong"],
  [/\bvery bad\b/gi, "serious"],
  [/\breally important\b/gi, "important"],
  [/\bthings\b/gi, "details"],
  [/\bstuff\b/gi, "details"],
  [/\bi think\b/gi, "I believe"]
];

export function analyzeWriting({ title = "", type = "diary", text = "" } = {}) {
  const normalizedText = normalizeWhitespace(text);
  const sentences = splitSentences(normalizedText);
  const words = tokenize(normalizedText);
  const paragraphs = normalizedText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const guidance = TYPE_GUIDANCE[type] ?? TYPE_GUIDANCE.diary;

  const suggestions = buildSuggestions({
    title,
    type,
    text: normalizedText,
    sentences,
    words,
    paragraphs,
    guidance
  });

  return {
    stats: {
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length || (normalizedText ? 1 : 0),
      averageSentenceLength: sentences.length ? round(words.length / sentences.length, 1) : 0,
      readability: estimateReadability(words, sentences)
    },
    suggestions,
    suggestedRevision: createSuggestedRevision(normalizedText, type)
  };
}

export function compareRewrite({ original = "", suggested = "", rewrite = "" } = {}) {
  const originalTokens = tokenize(original);
  const suggestedTokens = tokenize(suggested);
  const rewriteTokens = tokenize(rewrite);

  const alignmentPercent = similarityPercent(suggestedTokens, rewriteTokens);
  const changedFromOriginalPercent = 100 - similarityPercent(originalTokens, rewriteTokens);

  return {
    alignmentPercent,
    changedFromOriginalPercent: clampPercent(changedFromOriginalPercent),
    rewriteWordCount: rewriteTokens.length,
    note: buildRewriteNote(alignmentPercent, changedFromOriginalPercent, rewriteTokens.length)
  };
}

export function normalizeWhitespace(text) {
  return String(text)
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .trim();
}

export function tokenize(text) {
  return normalizeWhitespace(text)
    .toLowerCase()
    .match(/[a-z0-9']+/g) ?? [];
}

function buildSuggestions({ title, type, text, sentences, words, paragraphs, guidance }) {
  const suggestions = [];

  if (!text) {
    return [
      {
        title: "Start with a draft",
        detail: "Write your diary entry, report, or essay first. The assistant can suggest improvements after there is text to review."
      }
    ];
  }

  if (!title.trim()) {
    suggestions.push({
      title: "Add a clear title",
      detail: "A title helps the reader understand the topic before they start reading."
    });
  }

  if (words.length < 80) {
    suggestions.push({
      title: "Develop the draft",
      detail: `This ${type} is short. Add examples, details, or evidence so the main idea feels complete.`
    });
  }

  const longSentences = sentences.filter((sentence) => tokenize(sentence).length > 28);
  if (longSentences.length) {
    suggestions.push({
      title: "Shorten long sentences",
      detail: `${longSentences.length} sentence${longSentences.length === 1 ? "" : "s"} may be hard to follow. Split long sentences into smaller ideas.`
    });
  }

  const repeatedWords = findRepeatedWords(words);
  if (repeatedWords.length) {
    suggestions.push({
      title: "Reduce repeated words",
      detail: `Words repeated often: ${repeatedWords.join(", ")}. Replace some with more specific language.`
    });
  }

  const fillerMatches = findFillerPhrases(text);
  if (fillerMatches.length) {
    suggestions.push({
      title: "Remove weak filler",
      detail: `Consider cutting or replacing: ${fillerMatches.join(", ")}. Stronger words make the writing clearer.`
    });
  }

  if (paragraphs.length < 2 && words.length > 120) {
    suggestions.push({
      title: "Use paragraphs",
      detail: "Break the writing into paragraphs so each section has one main point."
    });
  }

  if (!containsAnyPhrase(text, TRANSITIONS) && sentences.length > 3) {
    suggestions.push({
      title: "Connect ideas",
      detail: "Add transitions such as 'first', 'then', 'however', or 'for example' to guide the reader."
    });
  }

  suggestions.push({
    title: "Strengthen the purpose",
    detail: guidance.focus
  });

  suggestions.push({
    title: "Improve the ending",
    detail: guidance.closing
  });

  return suggestions;
}

function createSuggestedRevision(text, type) {
  if (!text) {
    return "";
  }

  let revision = normalizeWhitespace(text);
  for (const [pattern, replacement] of COMMON_REPLACEMENTS) {
    revision = revision.replace(pattern, replacement);
  }

  revision = splitSentences(revision)
    .map((sentence) => capitalizeSentence(sentence))
    .join(" ");

  const guidance = TYPE_GUIDANCE[type] ?? TYPE_GUIDANCE.diary;
  const closingPrompt = guidance.closing.replace(/\.$/, "");

  if (!/[.!?]$/.test(revision)) {
    revision += ".";
  }

  return `${revision}\n\nRevision focus: ${guidance.focus} ${closingPrompt}.`;
}

function splitSentences(text) {
  if (!text) {
    return [];
  }

  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function capitalizeSentence(sentence) {
  const trimmed = sentence.trim();
  if (!trimmed) {
    return "";
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function estimateReadability(words, sentences) {
  if (!words.length || !sentences.length) {
    return "Needs text";
  }

  const averageSentenceLength = words.length / sentences.length;
  if (averageSentenceLength <= 16) {
    return "Easy to read";
  }
  if (averageSentenceLength <= 24) {
    return "Moderate";
  }
  return "Hard to read";
}

function findRepeatedWords(words) {
  const ignored = new Set([
    "the",
    "and",
    "for",
    "that",
    "with",
    "this",
    "was",
    "were",
    "are",
    "you",
    "your",
    "from",
    "have",
    "has",
    "had",
    "but",
    "not"
  ]);
  const counts = new Map();

  for (const word of words) {
    if (word.length < 4 || ignored.has(word)) {
      continue;
    }
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

function findFillerPhrases(text) {
  const lowerText = text.toLowerCase();
  return FILLER_PHRASES.filter((phrase) => {
    const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escapedPhrase}\\b`).test(lowerText);
  });
}

function containsAnyPhrase(text, phrases) {
  const lowerText = text.toLowerCase();
  return phrases.some((phrase) => lowerText.includes(phrase));
}

function similarityPercent(leftTokens, rightTokens) {
  if (!leftTokens.length && !rightTokens.length) {
    return 100;
  }
  if (!leftTokens.length || !rightTokens.length) {
    return 0;
  }

  const distance = levenshteinDistance(leftTokens, rightTokens);
  const maxLength = Math.max(leftTokens.length, rightTokens.length);
  return clampPercent(round((1 - distance / maxLength) * 100, 1));
}

function levenshteinDistance(leftTokens, rightTokens) {
  const previous = Array.from({ length: rightTokens.length + 1 }, (_, index) => index);
  const current = new Array(rightTokens.length + 1);

  for (let i = 1; i <= leftTokens.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= rightTokens.length; j += 1) {
      const cost = leftTokens[i - 1] === rightTokens[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost
      );
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[rightTokens.length];
}

function buildRewriteNote(alignmentPercent, changedFromOriginalPercent, rewriteWordCount) {
  if (!rewriteWordCount) {
    return "Add your rewritten version to calculate feedback.";
  }

  if (alignmentPercent >= 80) {
    return "Your rewrite follows most of the suggested improvements.";
  }

  if (alignmentPercent >= 50) {
    return "Your rewrite uses some of the suggested direction and still keeps your own wording.";
  }

  if (changedFromOriginalPercent < 20) {
    return "The rewrite is still close to the original. Try applying more of the suggestions.";
  }

  return "Your rewrite changes the original in a different direction than the suggested revision.";
}

function round(value, places = 0) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, round(value, 1)));
}

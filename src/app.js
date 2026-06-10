import { analyzeWriting, compareRewrite } from "./writingAssistant.js";

const STORAGE_KEY = "writing-assistant.entries";

const form = document.querySelector("#writing-form");
const titleInput = document.querySelector("#title");
const typeInput = document.querySelector("#type");
const draftInput = document.querySelector("#draft");
const rewriteInput = document.querySelector("#rewrite");
const statsPanel = document.querySelector("#stats");
const suggestionsList = document.querySelector("#suggestions");
const suggestedRevision = document.querySelector("#suggested-revision");
const comparisonPanel = document.querySelector("#comparison");
const entriesList = document.querySelector("#entries");
const saveStatus = document.querySelector("#save-status");
const compareButton = document.querySelector("#compare-button");
const newButton = document.querySelector("#new-button");
const copySuggestionButton = document.querySelector("#copy-suggestion");

let entries = loadEntries();
let activeEntryId = entries[0]?.id ?? null;

if (activeEntryId) {
  loadEntry(activeEntryId);
} else {
  renderAnalysis();
}
renderEntries();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  saveCurrentEntry();
});

compareButton.addEventListener("click", () => {
  compareCurrentRewrite();
});

newButton.addEventListener("click", () => {
  activeEntryId = null;
  form.reset();
  draftInput.value = "";
  rewriteInput.value = "";
  renderAnalysis();
  comparisonPanel.innerHTML = emptyState("Add a rewrite to compare it with the suggested revision.");
  setStatus("Started a new draft.");
});

copySuggestionButton.addEventListener("click", async () => {
  const text = suggestedRevision.value.trim();
  if (!text) {
    setStatus("There is no suggested revision to copy yet.");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    setStatus("Suggested revision copied.");
  } catch {
    rewriteInput.value = text;
    setStatus("Clipboard was unavailable, so the suggestion was placed in the rewrite box.");
  }
});

entriesList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-entry-id]");
  if (!button) {
    return;
  }
  loadEntry(button.dataset.entryId);
});

draftInput.addEventListener("input", () => {
  renderAnalysis();
});

typeInput.addEventListener("change", () => {
  renderAnalysis();
});

titleInput.addEventListener("input", () => {
  renderAnalysis();
});

function saveCurrentEntry() {
  const analysis = getCurrentAnalysis();
  const now = new Date().toISOString();
  const entry = {
    id: activeEntryId ?? crypto.randomUUID(),
    title: titleInput.value.trim() || "Untitled writing",
    type: typeInput.value,
    draft: draftInput.value,
    rewrite: rewriteInput.value,
    analysis,
    updatedAt: now,
    createdAt: entries.find((item) => item.id === activeEntryId)?.createdAt ?? now
  };

  entries = [entry, ...entries.filter((item) => item.id !== entry.id)];
  activeEntryId = entry.id;
  persistEntries();
  renderEntries();
  renderAnalysis(analysis);
  compareCurrentRewrite();
  setStatus("Saved locally in this browser.");
}

function loadEntry(entryId) {
  const entry = entries.find((item) => item.id === entryId);
  if (!entry) {
    return;
  }

  activeEntryId = entry.id;
  titleInput.value = entry.title;
  typeInput.value = entry.type;
  draftInput.value = entry.draft;
  rewriteInput.value = entry.rewrite ?? "";
  renderAnalysis();
  compareCurrentRewrite();
  renderEntries();
  setStatus(`Loaded "${entry.title}".`);
}

function renderAnalysis(existingAnalysis = null) {
  const analysis = existingAnalysis ?? getCurrentAnalysis();
  renderStats(analysis.stats);
  renderSuggestions(analysis.suggestions);
  suggestedRevision.value = analysis.suggestedRevision;
}

function getCurrentAnalysis() {
  return analyzeWriting({
    title: titleInput.value,
    type: typeInput.value,
    text: draftInput.value
  });
}

function compareCurrentRewrite() {
  const analysis = getCurrentAnalysis();
  const comparison = compareRewrite({
    original: draftInput.value,
    suggested: analysis.suggestedRevision,
    rewrite: rewriteInput.value
  });

  comparisonPanel.innerHTML = `
    <div class="metric-card">
      <span class="metric-label">Aligned with suggestion</span>
      <strong>${comparison.alignmentPercent}%</strong>
    </div>
    <div class="metric-card">
      <span class="metric-label">Changed from original</span>
      <strong>${comparison.changedFromOriginalPercent}%</strong>
    </div>
    <p>${comparison.note}</p>
  `;
}

function renderStats(stats) {
  statsPanel.innerHTML = `
    <div class="stat">
      <span>Words</span>
      <strong>${stats.wordCount}</strong>
    </div>
    <div class="stat">
      <span>Sentences</span>
      <strong>${stats.sentenceCount}</strong>
    </div>
    <div class="stat">
      <span>Paragraphs</span>
      <strong>${stats.paragraphCount}</strong>
    </div>
    <div class="stat">
      <span>Avg. sentence</span>
      <strong>${stats.averageSentenceLength}</strong>
    </div>
    <div class="stat">
      <span>Readability</span>
      <strong>${stats.readability}</strong>
    </div>
  `;
}

function renderSuggestions(suggestions) {
  suggestionsList.innerHTML = suggestions
    .map((suggestion) => `
      <li>
        <strong>${escapeHtml(suggestion.title)}</strong>
        <span>${escapeHtml(suggestion.detail)}</span>
      </li>
    `)
    .join("");
}

function renderEntries() {
  if (!entries.length) {
    entriesList.innerHTML = emptyState("Saved drafts will appear here.");
    return;
  }

  entriesList.innerHTML = entries
    .map((entry) => `
      <button class="entry ${entry.id === activeEntryId ? "active" : ""}" data-entry-id="${entry.id}" type="button">
        <span>${escapeHtml(entry.title)}</span>
        <small>${escapeHtml(entry.type)} • ${formatDate(entry.updatedAt)}</small>
      </button>
    `)
    .join("");
}

function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function persistEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function setStatus(message) {
  saveStatus.textContent = message;
}

function emptyState(message) {
  return `<p class="empty">${message}</p>`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

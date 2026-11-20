// Reads a trophy's plain-text "guide" field: its first paragraph is the summary, every line that starts with a
// number and a dot is a step, and each [n] in either is a citation of source n in data/sources.json.

const STEP_LINE = /^\s*(\d+)[.)]\s+(.*)$/;
const CITE_MARK = /\[(\d+)\]/g;

export function parseGuideText(text) {
  const lines = String(text).split(/\r?\n/);
  const summaryLines = [];
  const steps = [];
  for (const line of lines) {
    const step = STEP_LINE.exec(line);
    if (step) steps.push(makeStep(step[2]));
    else if (steps.length === 0 && line.trim()) summaryLines.push(line.trim());
    else if (steps.length && line.trim()) steps[steps.length - 1] = makeStep(`${steps[steps.length - 1].text} ${line.trim()}`);
  }
  const summary = summaryLines.join(' ');
  const cites = new Set(citeNumbers(summary));
  for (const s of steps) for (const n of s.cites) cites.add(n);
  return { summary, steps, cites: [...cites].sort((a, b) => a - b) };
}

function makeStep(text) {
  return { text, cites: citeNumbers(text) };
}

export function citeNumbers(text) {
  return [...String(text ?? '').matchAll(CITE_MARK)].map((m) => Number(m[1]));
}

/**
 * Split text into plain runs and citation runs, so a view can render "[3]" as a link to source 3.
 * Returns [{ text } | { cite: n }].
 */
export function splitCitations(text) {
  const parts = [];
  let last = 0;
  for (const match of String(text ?? '').matchAll(CITE_MARK)) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index) });
    parts.push({ cite: Number(match[1]) });
    last = match.index + match[0].length;
  }
  if (last < String(text ?? '').length) parts.push({ text: text.slice(last) });
  return parts;
}

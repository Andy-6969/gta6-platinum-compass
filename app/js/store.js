// Progress store: earned trophies, per-trophy counters, spoiler setting and revealed trophies, saved in localStorage,
// exported to a JSON file and imported back after validation. Views subscribe and re-render on every change.

export const PROGRESS_FORMAT = 'platinum-compass/progress/v1';
const STORAGE_KEY = 'platinum-compass:gta6:progress';

function emptyProgress() {
  return { earned: [], counters: {}, revealed: [], spoilers: true, savedAt: null };
}

/**
 * Create the store. In demo mode (a URL parameter) it starts from the demo state and saves to a separate demo slot,
 * so a reader's own progress under the main key is never touched.
 */
export function createProgressStore({ demoState = null } = {}) {
  const isDemo = demoState != null;
  const key = isDemo ? `${STORAGE_KEY}:demo` : STORAGE_KEY;
  let state = isDemo ? { ...emptyProgress(), ...demoState } : readSavedProgress(key);
  const listeners = new Set();

  function writeToStorage() {
    try { localStorage.setItem(key, JSON.stringify(state)); return true; } catch { return false; }
  }

  function commit(next) {
    state = { ...next, savedAt: new Date().toISOString() };
    state.saveFailed = !writeToStorage();
    for (const fn of listeners) fn(state);
  }

  if (isDemo) { state.savedAt = new Date().toISOString(); state.saveFailed = !writeToStorage(); }

  return {
    get state() { return state; },
    get isDemo() { return isDemo; },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    isEarned: (id) => state.earned.includes(id),
    isRevealed: (id) => state.revealed.includes(id),
    counterOf: (id) => state.counters[id] ?? 0,
    toggleEarned(id) {
      const earned = state.earned.includes(id) ? state.earned.filter((x) => x !== id) : [...state.earned, id].sort((a, b) => a - b);
      commit({ ...state, earned });
    },
    setCounter(id, value, target) {
      const clean = Math.max(0, Math.min(target ?? Infinity, Math.round(Number(value) || 0)));
      commit({ ...state, counters: { ...state.counters, [id]: clean } });
    },
    reveal(id) {
      if (!state.revealed.includes(id)) commit({ ...state, revealed: [...state.revealed, id] });
    },
    setSpoilers(on) { commit({ ...state, spoilers: Boolean(on) }); },
    replaceAll(progress) { commit({ ...emptyProgress(), ...progress }); },
  };
}

function readSavedProgress(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return emptyProgress();
    const saved = JSON.parse(raw);
    return { ...emptyProgress(), ...saved };
  } catch {
    return emptyProgress();
  }
}

/** The JSON document an export writes. */
export function buildExportDocument(state, trophies) {
  return {
    format: PROGRESS_FORMAT,
    game: 'Grand Theft Auto VI (PS5)',
    exportedAt: new Date().toISOString(),
    earned: state.earned,
    earnedNames: state.earned.map((id) => trophies.find((t) => t.id === id)?.name).filter(Boolean),
    counters: state.counters,
    revealed: state.revealed,
    spoilers: state.spoilers,
  };
}

/** Save the export document as a file through a local object URL (no network). */
export function downloadProgressFile(doc) {
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `platinum-compass-progress-${doc.exportedAt.slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Check an imported document against the trophy list. Returns { ok: true, progress, summary } or { ok: false, error }.
 * Unknown trophy ids, counters above their target and wrong types are refused, not silently dropped.
 */
export function validateImportedProgress(doc, trophies) {
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return { ok: false, error: 'The file is not a progress object.' };
  if (doc.format !== PROGRESS_FORMAT) return { ok: false, error: `Unknown format "${String(doc.format ?? 'none')}"; expected ${PROGRESS_FORMAT}.` };
  const byId = new Map(trophies.map((t) => [t.id, t]));
  if (!Array.isArray(doc.earned) || !doc.earned.every((id) => byId.has(id))) return { ok: false, error: 'The "earned" list names a trophy that is not in the list of 55.' };
  const counters = {};
  for (const [key, value] of Object.entries(doc.counters ?? {})) {
    const trophy = byId.get(Number(key));
    if (!trophy || !trophy.count) return { ok: false, error: `Counter for trophy ${key} does not match a counted trophy.` };
    if (!Number.isInteger(value) || value < 0 || value > trophy.count.target) return { ok: false, error: `Counter for "${trophy.name}" must be 0 to ${trophy.count.target}.` };
    counters[trophy.id] = value;
  }
  const revealed = Array.isArray(doc.revealed) ? doc.revealed.filter((id) => byId.has(id)) : [];
  const earned = [...new Set(doc.earned)].sort((a, b) => a - b);
  return {
    ok: true,
    progress: { earned, counters, revealed, spoilers: doc.spoilers !== false },
    summary: `${earned.length} earned, ${Object.keys(counters).length} counters`,
  };
}

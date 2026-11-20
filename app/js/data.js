// Loads the three local data files (trophies, sources, roadmap) and joins them into one read-only guide model.
// Only same-origin relative paths are fetched: the app never asks the network for anything else.
import { parseGuideText, citeNumbers } from './guide-text.js';

const DATA_FILES = {
  trophies: 'data/trophies.json',
  sources: 'data/sources.json',
  roadmap: 'data/roadmap.json',
};

async function fetchLocalJson(path) {
  const response = await fetch(path, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Could not read ${path} (${response.status})`);
  return response.json();
}

/** Fetch every data file and return the joined model the views read. */
export async function loadGuideModel() {
  const [trophyDoc, sourceDoc, roadmapDoc] = await Promise.all(Object.values(DATA_FILES).map(fetchLocalJson));
  const trophies = (Array.isArray(trophyDoc) ? trophyDoc : trophyDoc.trophies).map(enrichTrophy);
  const sources = sourceDoc.sources;
  const sourceById = new Map(sources.map((s) => [s.id, s]));
  const trophyById = new Map(trophies.map((t) => [t.id, t]));
  const stageById = new Map(roadmapDoc.stages.map((s) => [s.id, s]));
  return {
    meta: Array.isArray(trophyDoc) ? {} : trophyDoc,
    trophies,
    trophyById,
    sources,
    sourceById,
    chapters: roadmapDoc.chapters,
    stages: roadmapDoc.stages,
    stageById,
    roadmapNotes: roadmapDoc.notes ?? [],
    cutoffs: roadmapDoc.cutoffs ?? [],
    cutoffsNote: roadmapDoc.cutoffsNote ?? '',
  };
}

/** Attach the parsed guide (summary, numbered steps, cite numbers) to a trophy record. */
function enrichTrophy(trophy) {
  const parsed = parseGuideText(trophy.guide ?? '');
  return Object.freeze({
    ...trophy,
    kinds: trophy.kinds ?? [],
    summary: parsed.summary,
    steps: parsed.steps,
    guideCites: parsed.cites,
  });
}

/**
 * Every source number a trophy leans on: its listed sources, guide, counter basis, missable note and both sides
 * and the call of each dispute.
 */
export function citesOfTrophy(trophy) {
  const found = new Set(trophy.guideCites);
  for (const n of trophy.sources ?? []) found.add(n);
  const texts = [trophy.count?.basis, trophy.missable?.note, ...(trophy.disputes ?? []).flatMap((d) => [...d.sides, d.call])];
  for (const text of texts) for (const n of citeNumbers(text)) found.add(n);
  return [...found].sort((a, b) => a - b);
}

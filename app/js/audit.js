// The audit strip's numbers, every one counted from the data files when the page loads (none typed in by hand):
// the list's make-up against PSN's published make-up, hidden trophies, cited guides and steps, sources, missable
// flags, disputes, and any citation that points at a source number the sources file does not hold.
import { citesOfTrophy } from './data.js';
import { isMissableFlag } from './filters.js';

const GRADES = ['platinum', 'gold', 'silver', 'bronze'];

export function computeAudit(model) {
  const { trophies, sources, sourceById, meta } = model;
  const grades = Object.fromEntries(GRADES.map((g) => [g, trophies.filter((t) => t.grade === g).length]));
  const expected = meta.listMakeup ?? null;
  const officialComplete = trophies.filter((t) => t.name && t.description && GRADES.includes(t.grade)).length;
  const makeupMatches = expected
    ? expected.total === trophies.length && GRADES.every((g) => expected[g] === grades[g]) && expected.hidden === trophies.filter((t) => t.hidden).length
    : null;

  const allSteps = trophies.flatMap((t) => t.steps);
  const citedSteps = allSteps.filter((s) => s.cites.length > 0).length;
  const citedGuides = trophies.filter((t) => t.guideCites.length > 0).length;

  const usedCites = new Set(trophies.flatMap(citesOfTrophy));
  for (const stage of model.stages) for (const step of stage.steps ?? []) for (const m of String(step).matchAll(/\[(\d+)\]/g)) usedCites.add(Number(m[1]));
  const brokenCites = [...usedCites].filter((n) => !sourceById.has(n));

  const missable = trophies.filter(isMissableFlag);
  const disputes = trophies.reduce((sum, t) => sum + (t.disputes?.length ?? 0), 0);

  return {
    total: trophies.length,
    officialComplete,
    grades,
    hidden: trophies.filter((t) => t.hidden).length,
    makeupMatches,
    citedGuides,
    steps: allSteps.length,
    citedSteps,
    sources: sources.length,
    sitesRead: new Set(sources.map((s) => s.site)).size,
    sourcesUsed: [...usedCites].filter((n) => sourceById.has(n)).length,
    missable: missable.length,
    missableByStatus: countBy(missable, (t) => t.missable.status),
    disputes,
    brokenCites,
    counted: trophies.filter((t) => t.count).length,
  };
}

function countBy(items, key) {
  const out = {};
  for (const item of items) out[key(item)] = (out[key(item)] ?? 0) + 1;
  return out;
}

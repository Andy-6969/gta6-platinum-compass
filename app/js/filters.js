// Checklist filters: kind chips (one at a time), grade chips, a "not earned" switch and text search.
// Every chip shows how many trophies it would list, counted from the data at run time.
import { isMasked } from './spoilers.js';

export const KIND_FILTERS = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'story', label: 'Story', test: (t) => t.kinds.includes('story') },
  { id: 'missable', label: 'Missable', test: (t) => isMissableFlag(t) },
  { id: 'collectible', label: 'Collectibles', test: (t) => t.kinds.includes('collectible') },
  { id: 'activity', label: 'Activities', test: (t) => t.kinds.includes('activity') },
  { id: 'side', label: 'Side quests', test: (t) => t.kinds.includes('side') },
  { id: 'crime', label: 'Crime', test: (t) => t.kinds.includes('crime') },
  { id: 'online', label: 'Online', test: (t) => t.kinds.includes('online'), emptyNote: 'The PS5 list has no online trophy' },
  { id: 'hidden', label: 'PSN-hidden', test: (t) => t.hidden === true },
];

export const GRADE_FILTERS = [
  { id: 'platinum', label: 'P', title: 'Platinum' },
  { id: 'gold', label: 'G', title: 'Gold' },
  { id: 'silver', label: 'S', title: 'Silver' },
  { id: 'bronze', label: 'B', title: 'Bronze' },
];

export function isMissableFlag(trophy) {
  return ['confirmed', 'possible', 'unconfirmed'].includes(trophy.missable?.status);
}

export function defaultFilterState() {
  return { kind: 'all', grade: null, notEarned: false, query: '' };
}

/** Does the trophy pass every active filter? Masked story trophies are searched by their grade and number only. */
export function passesFilters(trophy, filter, store) {
  const kind = KIND_FILTERS.find((k) => k.id === filter.kind) ?? KIND_FILTERS[0];
  if (!kind.test(trophy)) return false;
  if (filter.grade && trophy.grade !== filter.grade) return false;
  if (filter.notEarned && store.isEarned(trophy.id)) return false;
  const query = filter.query.trim().toLowerCase();
  if (query) {
    const masked = isMasked(trophy, store);
    const haystack = masked ? `${trophy.grade} #${trophy.id}` : `${trophy.name} ${trophy.description} ${trophy.guide}`;
    if (!haystack.toLowerCase().includes(query)) return false;
  }
  return true;
}

/** Count per kind chip and per grade chip (ignoring the chip's own group, so counts read as "if you click this"). */
export function countFilterChips(trophies, filter, store) {
  const kindCounts = {};
  for (const kind of KIND_FILTERS) {
    kindCounts[kind.id] = trophies.filter((t) => passesFilters(t, { ...filter, kind: kind.id }, store)).length;
  }
  const gradeCounts = {};
  for (const grade of GRADE_FILTERS) {
    gradeCounts[grade.id] = trophies.filter((t) => passesFilters(t, { ...filter, grade: grade.id }, store)).length;
  }
  const notEarnedCount = trophies.filter((t) => passesFilters(t, { ...filter, notEarned: true }, store)).length;
  return { kindCounts, gradeCounts, notEarnedCount };
}

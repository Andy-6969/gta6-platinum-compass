// The spoiler setting: while it is on, a story trophy's name and description stay masked until it is earned or the
// reader reveals that one trophy. PSN-hidden trophies that are not story trophies are only marked, never masked.

export function isMasked(trophy, store) {
  if (!store.state.spoilers) return false;
  if (!trophy.kinds.includes('story')) return false;
  return !store.isEarned(trophy.id) && !store.isRevealed(trophy.id);
}

/** What the checklist and guide show for a trophy under the spoiler setting. */
export function visibleTitle(trophy, store) {
  return isMasked(trophy, store) ? `Story trophy #${trophy.id}` : trophy.name;
}

export function visibleDescription(trophy, store) {
  if (!isMasked(trophy, store)) return trophy.description;
  return trophy.chapterHint ? `Hidden until earned · ${trophy.chapterHint}` : 'Hidden until earned (spoiler setting)';
}

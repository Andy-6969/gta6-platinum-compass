// The narrow right column of the tracker: "Next up" from the roadmap (the first stage with trophies left) and the
// numbered sources the open trophy's guide cites, each a plain link the reader may follow (the app fetches none).
import { el } from '../dom.js';
import { citesOfTrophy } from '../data.js';
import { visibleTitle } from '../spoilers.js';
import { citedText, gradeBadge } from './cited-text.js';

export function currentStage(model, store) {
  return model.stages.find((stage) => stage.trophies.some((id) => !store.isEarned(id))) ?? model.stages.at(-1);
}

export function renderNextUp(model, store, ui) {
  const stage = currentStage(model, store);
  const left = stage.trophies.filter((id) => !store.isEarned(id)).map((id) => model.trophyById.get(id));
  const done = stage.trophies.length - left.length;
  return el('section', { id: 'next-up', class: 'side-card next-up' },
    el('h3', {}, el('span', { class: 'kicker', text: `Next up · stage ${stage.order}/${model.stages.length} · ${done}/${stage.trophies.length} done` }), el('a', { href: `#/roadmap/${stage.id}`, text: stage.title })),
    el('ul', { class: 'next-trophies' }, left.slice(0, 3).map((t) => el('li', {},
      el('button', { type: 'button', class: 'link-button', on: { click: () => ui.select(t.id) } }, gradeBadge(t.grade, 'small'), visibleTitle(t, store))))),
    el('ol', { class: 'next-steps' }, (stage.steps ?? []).slice(0, 1).map((s) => citedText(s, model, 'li'))));
}

export function renderTrophySources(trophy, model) {
  if (!trophy) return null;
  const cites = citesOfTrophy(trophy);
  return el('section', { id: 'trophy-sources', class: 'side-card trophy-sources' },
    el('h3', { text: `Sources for this guide · ${cites.length}` }),
    el('ol', { class: 'source-list compact' }, cites.map((n) => renderSourceLine(model.sourceById.get(n), n))));
}

export function renderSourceLine(source, n) {
  if (!source) return el('li', { class: 'source-missing', text: `[${n}] missing source` });
  return el('li', { id: `src-${n}`, dataset: { n } },
    el('span', { class: 'source-num', text: `[${n}]` }),
    el('span', { class: 'source-body' },
      el('a', { href: source.url, target: '_blank', rel: 'noopener noreferrer', text: `${source.site}: ${source.title}` }),
      el('span', { class: 'source-meta', text: `${source.kind} · read ${source.read}` })));
}

// The missables view: a chapter-by-chapter window matrix (open, last chance, closed, reopens) for every trophy the
// guide flags, each flag graded confirmed / possible / unconfirmed and cited. Loaded on demand.
import { el, mount } from '../dom.js';
import { isMissableFlag } from '../filters.js';
import { visibleTitle } from '../spoilers.js';
import { citedText, gradeBadge, MISSABLE_LABEL } from './cited-text.js';

const CELL = {
  before: { mark: '', label: 'not yet available' },
  open: { mark: '●', label: 'window open' },
  last: { mark: '◆', label: 'last chance' },
  closed: { mark: '✕', label: 'closed' },
  reopen: { mark: '↺', label: 'available again' },
  unknown: { mark: '?', label: 'not confirmed' },
};

/** Which state a trophy's missable window is in at chapter column `index`. */
export function windowStateAt(missable, chapters, index) {
  const pos = (id) => chapters.findIndex((c) => c.id === id);
  const from = missable.from ? pos(missable.from) : 0;
  const last = missable.last ? pos(missable.last) : -1;
  const reopen = missable.reopen ? pos(missable.reopen) : -1;
  if (index < from) return 'before';
  if (last < 0) return 'unknown';
  if (index < last) return 'open';
  if (index === last) return 'last';
  if (reopen >= 0 && index >= reopen) return 'reopen';
  return missable.after === 'unknown' ? 'unknown' : 'closed';
}

export function renderMissablesView(root, model, store) {
  const flagged = model.trophies.filter(isMissableFlag).sort((a, b) => rankStatus(a) - rankStatus(b) || a.id - b.id);
  const counts = { confirmed: 0, possible: 0, unconfirmed: 0 };
  for (const t of flagged) counts[t.missable.status] += 1;
  mount(root,
    el('div', { id: 'missables-view', class: 'missables-view' },
      el('header', { class: 'view-head' },
        el('h1', { text: 'Missable trophies by chapter' }),
        el('p', { class: 'muted', text: `${flagged.length} flags: ${counts.confirmed} confirmed, ${counts.possible} possible, ${counts.unconfirmed} unconfirmed. Built from the official descriptions plus the sources cited on each row.` }),
        el('p', { class: 'legend' }, Object.entries(CELL).filter(([k]) => k !== 'before').map(([k, c]) => el('span', { class: `legend-item cell-${k}` }, el('b', { text: c.mark }), ` ${c.label}`)))),
      el('div', { class: 'matrix-wrap' },
        el('table', { id: 'missable-matrix', class: 'missable-matrix' },
          el('thead', {}, el('tr', {}, el('th', { class: 'trophy-col', text: 'Trophy · flag' }),
            model.chapters.map((c) => el('th', { class: 'chapter-col', title: c.title ?? c.label, text: c.label })), el('th', { class: 'note-col', text: 'Last chance · why' }))),
          el('tbody', {}, flagged.map((t) => renderMatrixRow(t, model, store))))),
      renderCutoffs(model)));
}

/** Story moments where other content closes, by chapter, each cited. */
function renderCutoffs(model) {
  if (!model.cutoffs.length) return null;
  const label = (id) => model.chapters.find((c) => c.id === id)?.label ?? 'Any time';
  return el('section', { id: 'story-cutoffs', class: 'story-cutoffs' },
    el('h2', { text: `Other cut-off points · ${model.cutoffs.length}` }),
    citedText(model.cutoffsNote, model, 'p', { class: 'muted' }),
    el('ul', { class: 'cutoff-list' }, model.cutoffs.map((c) => el('li', {},
      el('span', { class: 'cutoff-chapter', text: label(c.chapter) }), citedText(c.text, model)))));
}

function rankStatus(t) {
  return { confirmed: 0, possible: 1, unconfirmed: 2 }[t.missable.status] ?? 3;
}

function renderMatrixRow(trophy, model, store) {
  const m = trophy.missable;
  return el('tr', { class: store.isEarned(trophy.id) ? 'earned' : '' },
    el('th', { class: 'trophy-col', scope: 'row' },
      el('a', { href: `#/tracker/${trophy.id}` }, gradeBadge(trophy.grade, 'small'), visibleTitle(trophy, store)),
      el('span', { class: `status-pill missable-${m.status}`, text: MISSABLE_LABEL[m.status] })),
    model.chapters.map((c, i) => {
      const state = windowStateAt(m, model.chapters, i);
      return el('td', { class: `cell cell-${state}`, title: `${c.label}: ${CELL[state].label}`, text: CELL[state].mark });
    }),
    el('td', { class: 'note-col' }, m.lastChance ? el('b', { text: `${m.lastChance}. ` }) : null, citedText(m.note ?? '', model)));
}

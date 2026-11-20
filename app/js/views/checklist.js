// The checklist column: filter chips with live counts, the search box, and one row per trophy with its earned box,
// grade badge, official name and description (masked by the spoiler setting), PSN-hidden mark, missable tag and counter.
import { el, icon } from '../dom.js';
import { KIND_FILTERS, GRADE_FILTERS, countFilterChips, passesFilters } from '../filters.js';
import { isMasked, visibleTitle, visibleDescription } from '../spoilers.js';
import { gradeBadge, missableTag } from './cited-text.js';

export function renderFilterBar(model, store, ui) {
  const { kindCounts, gradeCounts, notEarnedCount } = countFilterChips(model.trophies, ui.filter, store);
  const kindChips = KIND_FILTERS.map((kind) => {
    const count = kindCounts[kind.id];
    const disabled = count === 0 && kind.id === 'online';
    return el('button', {
      type: 'button',
      class: `chip ${ui.filter.kind === kind.id ? 'active' : ''} ${disabled ? 'disabled' : ''}`,
      disabled,
      title: disabled ? kind.emptyNote : `Show ${kind.label.toLowerCase()} trophies`,
      attrs: { 'aria-pressed': String(ui.filter.kind === kind.id) },
      on: { click: () => ui.setFilter({ kind: kind.id }) },
    }, kind.label, el('span', { class: 'chip-count', text: String(count) }));
  });
  const gradeChips = GRADE_FILTERS.map((grade) => el('button', {
    type: 'button',
    class: `chip grade-chip grade-${grade.id} ${ui.filter.grade === grade.id ? 'active' : ''}`,
    title: `${grade.title} only`,
    attrs: { 'aria-pressed': String(ui.filter.grade === grade.id) },
    on: { click: () => ui.setFilter({ grade: ui.filter.grade === grade.id ? null : grade.id }) },
  }, grade.label, el('span', { class: 'chip-count', text: String(gradeCounts[grade.id]) })));
  const notEarned = el('button', {
    type: 'button',
    class: `chip ${ui.filter.notEarned ? 'active' : ''}`,
    attrs: { 'aria-pressed': String(ui.filter.notEarned) },
    on: { click: () => ui.setFilter({ notEarned: !ui.filter.notEarned }) },
  }, 'Unearned', el('span', { class: 'chip-count', text: String(notEarnedCount) }));
  const search = el('input', {
    id: 'trophy-search',
    type: 'search',
    class: 'search-box',
    placeholder: 'Search  ( / )',
    value: ui.filter.query,
    attrs: { 'aria-label': 'Search trophies and guides' },
    on: { input: (e) => ui.setFilter({ query: e.target.value }, { keepFocus: true }) },
  });
  return {
    kindBar: el('div', { id: 'kind-filters', class: 'filter-bar chip-group', attrs: { role: 'group', 'aria-label': 'Filter by kind' } },
      el('span', { class: 'filter-label', text: 'Filter' }), kindChips),
    gradeBar: el('div', { id: 'grade-filters', class: 'grade-filters' },
      el('div', { class: 'chip-group', attrs: { role: 'group', 'aria-label': 'Grade' } }, el('span', { class: 'filter-label', text: 'Grade' }), gradeChips),
      el('div', { class: 'chip-group search-row' }, notEarned, search)),
  };
}

export function renderChecklist(model, store, ui, gradeBar) {
  const shown = model.trophies.filter((t) => passesFilters(t, ui.filter, store));
  const rows = shown.map((trophy) => renderChecklistRow(trophy, store, ui));
  return el('section', { id: 'checklist', class: 'checklist', attrs: { 'aria-label': 'Trophy checklist' } },
    gradeBar,
    el('header', { class: 'column-head' }, el('span', { text: `Checklist · ${shown.length} of ${model.trophies.length}` }), el('span', { class: 'muted', text: '☑ = earned' })),
    el('ol', { class: 'trophy-rows' }, rows.length ? rows : el('li', { class: 'empty-note', text: 'No trophy matches these filters.' })));
}

function renderChecklistRow(trophy, store, ui) {
  const earned = store.isEarned(trophy.id);
  const masked = isMasked(trophy, store);
  const selected = ui.selectedId === trophy.id;
  const checkbox = el('input', {
    type: 'checkbox',
    checked: earned,
    class: 'earned-box',
    attrs: { 'aria-label': `Earned: ${visibleTitle(trophy, store)}` },
    on: { change: () => store.toggleEarned(trophy.id), click: (e) => e.stopPropagation() },
  });
  const markers = [
    missableTag(trophy),
    trophy.hidden ? el('span', { class: 'hidden-mark', title: 'Hidden on PSN until earned' }, icon('lock')) : null,
    trophy.count ? el('span', { class: 'row-counter', text: `${store.counterOf(trophy.id)}/${trophy.count.target}` }) : null,
  ];
  return el('li', {
    class: `trophy-row ${earned ? 'earned' : ''} ${masked ? 'masked' : ''} ${selected ? 'selected' : ''}`.trim(),
    dataset: { id: trophy.id },
    tabIndex: 0,
    attrs: { 'aria-current': selected ? 'true' : null },
    on: {
      click: () => ui.select(trophy.id),
      keydown: (e) => { if (e.key === 'Enter') ui.select(trophy.id); },
    },
  },
  checkbox,
  gradeBadge(trophy.grade),
  el('div', { class: 'row-text' },
    el('span', { class: 'row-name', text: visibleTitle(trophy, store) }),
    el('span', { class: 'row-desc', text: visibleDescription(trophy, store) })),
  el('div', { class: 'row-markers' }, markers));
}

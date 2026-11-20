// Renders guide text with its [n] citation marks turned into links to the numbered source on the Sources view.
import { el } from '../dom.js';
import { splitCitations } from '../guide-text.js';

export function citedText(text, model, tag = 'span', props = {}) {
  const parts = splitCitations(text).map((part) => {
    if (part.text != null) return part.text;
    const source = model.sourceById.get(part.cite);
    return el('a', {
      class: source ? 'cite' : 'cite cite-broken',
      href: `#/sources/${part.cite}`,
      title: source ? `${source.site}: ${source.title}` : 'No such source',
      text: `[${part.cite}]`,
    });
  });
  return el(tag, props, parts);
}

export const GRADE_LETTER = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };

export function gradeBadge(grade, extraClass = '') {
  return el('span', { class: `grade-badge grade-${grade} ${extraClass}`.trim(), title: grade, attrs: { 'aria-label': `${grade} trophy` }, text: GRADE_LETTER[grade] });
}

export const MISSABLE_LABEL = { confirmed: 'Missable', possible: 'Possibly missable', unconfirmed: 'Missable? unconfirmed', no: 'Not missable' };

export function missableTag(trophy) {
  const status = trophy.missable?.status;
  if (!status || status === 'no') return null;
  return el('span', { class: `missable-tag missable-${status}`, title: MISSABLE_LABEL[status], text: status === 'confirmed' ? 'MISSABLE' : status === 'possible' ? 'MISSABLE?' : 'UNCONF.' });
}

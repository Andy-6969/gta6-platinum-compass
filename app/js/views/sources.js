// The sources register: every page read for this guide with its number, site, kind and the date it was read, how
// many trophies cite it, and the register of disputes between sources with our call. Loaded on demand.
import { el, mount } from '../dom.js';
import { citesOfTrophy } from '../data.js';
import { visibleTitle } from '../spoilers.js';
import { citedText } from './cited-text.js';

export function renderSourcesView(root, model, store, ui, focusNumber) {
  const usage = new Map(model.sources.map((s) => [s.id, []]));
  for (const t of model.trophies) for (const n of citesOfTrophy(t)) usage.get(n)?.push(t);
  const disputes = model.trophies.flatMap((t) => (t.disputes ?? []).map((d) => ({ trophy: t, dispute: d })));
  const kinds = [...new Set(model.sources.map((s) => s.kind))];
  mount(root,
    el('div', { id: 'sources-view', class: 'sources-view' },
      el('header', { class: 'view-head' },
        el('h1', { text: 'Sources register' }),
        el('p', { class: 'muted', text: `${model.sources.length} pages from ${new Set(model.sources.map((s) => s.site)).size} sites, each read for this guide; kinds: ${kinds.join(', ')}. Every step is written in our own words and ends with the numbers of the pages it rests on. Links open only if you follow them; the app itself loads nothing from them.` })),
      el('div', { class: 'sources-columns' },
        el('table', { id: 'sources-table', class: 'sources-table' },
          el('thead', {}, el('tr', {}, ['#', 'Site · page', 'Kind', 'Read', 'Cited by'].map((h) => el('th', { text: h })))),
          el('tbody', {}, model.sources.map((s) => el('tr', { id: `source-${s.id}`, class: s.id === focusNumber ? 'focused' : '' },
            el('td', { class: 'source-num', text: `[${s.id}]` }),
            el('td', {}, el('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer', text: `${s.site}: ${s.title}` }), s.note ? el('span', { class: 'source-note', text: s.note }) : null),
            el('td', { text: s.kind }),
            el('td', { text: s.read }),
            el('td', { class: 'used-by', text: String(usage.get(s.id).length) }))))),
        el('section', { id: 'dispute-register', class: 'dispute-register' },
          el('h2', { text: `Disputes · ${disputes.length}` }),
          disputes.map(({ trophy, dispute }) => el('div', { class: 'dispute compact' },
            el('a', { class: 'dispute-trophy', href: `#/tracker/${trophy.id}`, text: visibleTitle(trophy, store) }),
            el('p', { class: 'dispute-topic', text: dispute.topic }),
            dispute.sides.map((side, i) => citedText(side, model, 'p', { class: `dispute-side side-${i}` })),
            el('p', { class: 'dispute-call' }, el('b', { text: 'Our call: ' }), citedText(dispute.call, model))))))));
  if (focusNumber) root.querySelector(`#source-${focusNumber}`)?.scrollIntoView({ block: 'center' });
}

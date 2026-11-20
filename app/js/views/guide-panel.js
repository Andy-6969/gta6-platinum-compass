// The open guide: a trophy's official name, description and grade, its PSN-hidden mark, missable window, counter,
// cited summary and numbered cited steps, and any dispute between sources shown both ways with our call.
import { el, icon } from '../dom.js';
import { isMasked } from '../spoilers.js';
import { citeNumbers } from '../guide-text.js';
import { citedText, gradeBadge, MISSABLE_LABEL } from './cited-text.js';

const KIND_LABEL = { story: 'Story', collectible: 'Collectible', activity: 'Activity', side: 'Side / strangers', crime: 'Crime', misc: 'Misc', online: 'Online' };

export function renderGuidePanel(trophy, model, store) {
  if (!trophy) return el('section', { id: 'guide-panel', class: 'guide-panel empty' }, el('p', { text: 'Pick a trophy to open its guide.' }));
  if (isMasked(trophy, store)) return renderMaskedGuide(trophy, model, store);
  const stage = model.stageById.get(trophy.stage);
  return el('section', { id: 'guide-panel', class: 'guide-panel', attrs: { 'aria-label': `Guide: ${trophy.name}` } },
    el('header', { class: 'guide-head' },
      gradeBadge(trophy.grade, 'large'),
      el('div', { class: 'guide-title' },
        el('h2', { id: 'guide-name', text: trophy.name }),
        el('p', { class: 'official-desc' }, el('span', { class: 'label', text: 'Official' }), trophy.description))),
    el('div', { class: 'guide-tags' },
      renderEarnedButton(trophy, store),
      el('span', { class: `tag grade-text-${trophy.grade}`, text: trophy.grade }),
      trophy.hidden ? el('span', { class: 'tag tag-hidden' }, icon('lock'), 'Hidden on PSN') : null,
      el('span', { class: 'tag', title: 'Kind (see the filter chips)', text: trophy.kinds.map((k) => KIND_LABEL[k] ?? k).join(' · ') }),
      stage ? el('a', { class: 'tag tag-stage', href: `#/roadmap/${stage.id}`, title: stage.title, text: `Stage ${stage.order}` }) : null,
      trophy.exophaseRate ? el('span', { class: 'tag tag-rate', title: 'Share of players Exophase tracks who have it, read 2026-11-20' }, `${trophy.exophaseRate}%`, citedText('[1]', model)) : null),
    trophy.count ? renderCounter(trophy, model, store) : null,
    citedText(trophy.summary, model, 'p', { class: 'guide-summary' }),
    renderMissableBox(trophy, model),
    (trophy.disputes ?? []).map((d) => renderDispute(d, model)),
    el('h3', { class: 'steps-head', text: `How to earn it · ${trophy.steps.length} steps` }),
    renderSteps(trophy, model),
    renderUnconfirmed(trophy));
}

function renderMaskedGuide(trophy, model, store) {
  return el('section', { id: 'guide-panel', class: 'guide-panel masked' },
    el('header', { class: 'guide-head' },
      gradeBadge(trophy.grade, 'large'),
      el('div', { class: 'guide-title' },
        el('h2', { text: `Story trophy #${trophy.id}` }),
        el('p', { class: 'official-desc', text: 'Name, description and guide are hidden by the spoiler setting until you earn it.' }))),
    el('button', { type: 'button', class: 'primary reveal-button', on: { click: () => store.reveal(trophy.id) } }, icon('eye'), 'Reveal this trophy only'));
}

function renderEarnedButton(trophy, store) {
  const earned = store.isEarned(trophy.id);
  return el('button', {
    type: 'button',
    class: `earned-toggle ${earned ? 'on' : ''}`,
    attrs: { 'aria-pressed': String(earned) },
    on: { click: () => store.toggleEarned(trophy.id) },
  }, icon('check'), earned ? 'Earned' : 'Mark earned');
}

function renderCounter(trophy, model, store) {
  const { target, unit } = trophy.count;
  const value = store.counterOf(trophy.id);
  const set = (v) => store.setCounter(trophy.id, v, target);
  return el('div', { class: 'counter', title: trophy.count.basis ?? '', attrs: { role: 'group', 'aria-label': `${unit} counter` } },
    el('button', { type: 'button', class: 'step-btn', text: '−', attrs: { 'aria-label': 'One less' }, on: { click: () => set(value - 1) } }),
    el('input', { type: 'number', min: 0, max: target, value, class: 'counter-input', attrs: { 'aria-label': `${unit} done` }, on: { change: (e) => set(e.target.value) } }),
    el('span', { class: 'counter-target', text: `/ ${target} ${unit}` }),
    el('button', { type: 'button', class: 'step-btn', text: '+', attrs: { 'aria-label': 'One more' }, on: { click: () => set(value + 1) } }),
    el('span', { class: 'counter-bar' }, el('span', { style: `width:${Math.round((value / target) * 100)}%` })),
    el('span', { class: 'counter-basis' }, 'target', trophy.count.basis ? citeNumbers(trophy.count.basis).map((n) => citedText(`[${n}]`, model)) : null));
}

function renderUnconfirmed(trophy) {
  if (!trophy.unconfirmed) return null;
  return el('p', { class: 'unconfirmed-note' }, el('b', { text: 'Unconfirmed: ' }), trophy.unconfirmed);
}

function renderMissableBox(trophy, model) {
  const m = trophy.missable;
  if (!m) return null;
  const flagged = m.status !== 'no';
  return el('div', { class: `missable-box missable-${m.status}` },
    el('strong', { class: 'missable-head' }, icon('flag'), MISSABLE_LABEL[m.status] ?? m.status),
    flagged && m.lastChance ? el('span', { class: 'missable-window' }, el('b', { text: 'Last chance: ' }), m.lastChance) : null,
    flagged && m.window ? el('span', { class: 'missable-window' }, el('b', { text: 'Window: ' }), m.window) : null,
    m.note ? citedText(m.note, model, 'span', { class: 'missable-note' }) : null);
}

function renderSteps(trophy, model) {
  if (!trophy.steps.length) return null;
  return el('ol', { class: 'guide-steps' }, trophy.steps.map((step) => citedText(step.text, model, 'li')));
}

function renderDispute(dispute, model) {
  return el('div', { class: 'dispute' },
    el('p', { class: 'dispute-head' }, icon('split'), el('b', { text: ' Sources disagree: ' }), dispute.topic),
    el('div', { class: 'dispute-sides' }, dispute.sides.map((side, i) => citedText(side, model, 'p', { class: `dispute-side side-${i}` }))),
    el('p', { class: 'dispute-call' }, el('b', { text: 'Our call: ' }), citedText(dispute.call, model)));
}

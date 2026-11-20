// The header's progress meter (earned of total, percent, per-grade counts), the spoiler switch label and the
// "saved" indicator. Re-rendered whenever the store changes.
import { el, mount, byId } from '../dom.js';
import { gradeBadge } from './cited-text.js';

const GRADES = ['platinum', 'gold', 'silver', 'bronze'];

export function renderProgressSummary(model, store) {
  const { trophies } = model;
  const earned = trophies.filter((t) => store.isEarned(t.id)).length;
  const percent = Math.round((earned / trophies.length) * 100);
  const perGrade = GRADES.map((grade) => {
    const all = trophies.filter((t) => t.grade === grade);
    const got = all.filter((t) => store.isEarned(t.id)).length;
    return el('span', { class: 'grade-count' }, gradeBadge(grade, 'small'), el('b', { text: `${got}/${all.length}` }));
  });
  mount(
    byId('progress-summary'),
    el('div', { class: 'progress-figure' }, el('strong', { text: `${earned}/${trophies.length}` }), el('span', { text: ` earned · ${percent}%` })),
    el('div', { class: 'progress-bar', attrs: { role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': trophies.length, 'aria-valuenow': earned } },
      el('span', { style: `width:${percent}%` })),
    el('div', { class: 'grade-counts' }, perGrade),
  );
}

export function renderSpoilerToggle(store) {
  const button = byId('spoiler-toggle');
  const on = store.state.spoilers;
  button.setAttribute('aria-pressed', String(on));
  button.textContent = on ? 'Spoilers hidden' : 'Spoilers shown';
  button.title = on ? 'Story trophy names stay masked until earned. Click to show them.' : 'Click to mask unearned story trophies again.';
}

export function renderSaveStatus(store) {
  const status = byId('save-status');
  if (store.state.saveFailed) {
    status.textContent = '⚠ Not saved: browser storage blocked';
    status.className = 'save-status failed';
    return;
  }
  const at = store.state.savedAt ? new Date(store.state.savedAt) : null;
  const time = at ? ` ${at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '';
  status.className = store.isDemo ? 'save-status demo' : 'save-status';
  status.textContent = store.isDemo ? `✓ Saved${time} (demo)` : `✓ Saved${time}`;
  status.title = store.isDemo ? 'Demo progress is saved in its own slot; your own progress is untouched.' : 'Progress is saved in this browser (localStorage).';
}

// The roadmap to the platinum: a route strip of every stage as a waypoint with its progress, cited fact cards, then
// one card per stage (story chapters first, then cleanup) with its trophies, earned state, effort figures where a
// source gives them, and cited steps. Loaded on demand.
import { el, mount } from '../dom.js';
import { visibleTitle } from '../spoilers.js';
import { citedText, gradeBadge, missableTag } from './cited-text.js';
import { currentStage } from './side-panel.js';

export function renderRoadmapView(root, model, store, ui, focusStageId) {
  const now = currentStage(model, store);
  const earnedAll = model.trophies.filter((t) => store.isEarned(t.id)).length;
  mount(root,
    el('div', { id: 'roadmap-view', class: 'roadmap-view' },
      el('header', { class: 'view-head' },
        el('h1', { text: `Roadmap to the platinum · ${model.stages.length} stages` }),
        el('p', { class: 'muted', text: `${earnedAll}/${model.trophies.length} trophies earned · you are on stage ${now.order}. Story stages follow the chapter trophies; cleanup follows the cited roadmaps.` })),
      renderRouteStrip(model, store, now),
      el('div', { class: 'roadmap-facts' }, model.roadmapNotes.map((note) => citedText(note, model, 'p', { class: 'roadmap-note' }))),
      el('ol', { class: 'stage-list' }, model.stages.map((stage) => renderStage(stage, model, store, stage.id === now.id, stage.id === focusStageId)))));
  if (focusStageId) root.querySelector(`#stage-${focusStageId}`)?.scrollIntoView({ block: 'start' });
}

/** Every stage as a compass waypoint on one line: number, short name and earned/total, the current one ringed. */
function renderRouteStrip(model, store, now) {
  return el('ol', { id: 'route-strip', class: 'route-strip', style: `grid-template-columns:repeat(${model.stages.length},1fr)`, attrs: { 'aria-label': 'Stages at a glance' } },
    model.stages.map((stage) => {
      const done = stage.trophies.filter((id) => store.isEarned(id)).length;
      const state = done === stage.trophies.length ? 'complete' : stage.id === now.id ? 'current' : 'ahead';
      return el('li', { class: `waypoint ${state}` },
        el('a', { href: `#/roadmap/${stage.id}`, title: stage.title },
          el('span', { class: 'waypoint-dot', text: String(stage.order) }),
          el('span', { class: 'waypoint-name', text: stage.short ?? stage.title }),
          el('span', { class: 'waypoint-count', text: `${done}/${stage.trophies.length}` })));
    }));
}

function renderStage(stage, model, store, isCurrent, isFocused) {
  const trophies = stage.trophies.map((id) => model.trophyById.get(id));
  const done = trophies.filter((t) => store.isEarned(t.id)).length;
  return el('li', { id: `stage-${stage.id}`, class: `stage-card ${isCurrent ? 'current' : ''} ${isFocused ? 'focused' : ''} ${done === trophies.length ? 'complete' : ''}`.trim() },
    el('div', { class: 'stage-num', text: String(stage.order) }),
    el('div', { class: 'stage-body' },
      el('header', { class: 'stage-head' },
        el('h2', { text: stage.title }),
        el('span', { class: 'stage-progress', text: `${done}/${trophies.length}` }),
        isCurrent ? el('span', { class: 'tag tag-now', text: 'You are here' }) : null),
      el('p', { class: 'stage-when', text: stage.when }),
      el('div', { class: 'stage-bar' }, el('span', { style: `width:${Math.round((done / trophies.length) * 100)}%` })),
      stage.effort ? citedText(stage.effort, model, 'p', { class: 'stage-effort' }) : null,
      el('ul', { class: 'stage-trophies' }, trophies.map((t) => el('li', { class: store.isEarned(t.id) ? 'earned' : '' },
        el('a', { href: `#/tracker/${t.id}`, class: 'stage-trophy' }, gradeBadge(t.grade, 'small'), visibleTitle(t, store), missableTag(t))))),
      el('ol', { class: 'stage-steps' }, (stage.steps ?? []).map((s) => citedText(s, model, 'li')))));
}

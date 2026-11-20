// The roadmap to the platinum: stages in order (story chapters first, then cleanup), each with its trophies and
// their earned state, its cited steps, and effort figures only where a source gives them. Loaded on demand.
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
        el('h1', { text: 'Roadmap to the platinum' }),
        el('p', { class: 'muted', text: `${model.stages.length} stages · ${earnedAll}/${model.trophies.length} trophies earned · you are on stage ${now.order}. Story stages follow the chapter trophies' order; cleanup stages follow the sources cited.` }),
        model.roadmapNotes.map((note) => citedText(note, model, 'p', { class: 'roadmap-note' }))),
      el('ol', { class: 'stage-list' }, model.stages.map((stage) => renderStage(stage, model, store, ui, stage.id === now.id, stage.id === focusStageId)))));
  if (focusStageId) root.querySelector(`#stage-${focusStageId}`)?.scrollIntoView({ block: 'start' });
}

function renderStage(stage, model, store, ui, isCurrent, isFocused) {
  const trophies = stage.trophies.map((id) => model.trophyById.get(id));
  const done = trophies.filter((t) => store.isEarned(t.id)).length;
  return el('li', { id: `stage-${stage.id}`, class: `stage-card ${isCurrent ? 'current' : ''} ${isFocused ? 'focused' : ''} ${done === trophies.length ? 'complete' : ''}`.trim() },
    el('div', { class: 'stage-num', text: String(stage.order) }),
    el('div', { class: 'stage-body' },
      el('header', { class: 'stage-head' },
        el('h2', { text: stage.title }),
        el('span', { class: 'stage-when', text: stage.when }),
        el('span', { class: 'stage-progress', text: `${done}/${trophies.length}` }),
        isCurrent ? el('span', { class: 'tag tag-now', text: 'You are here' }) : null),
      stage.effort ? citedText(stage.effort, model, 'p', { class: 'stage-effort' }) : null,
      el('ul', { class: 'stage-trophies' }, trophies.map((t) => el('li', { class: store.isEarned(t.id) ? 'earned' : '' },
        el('a', { href: `#/tracker/${t.id}`, class: 'stage-trophy' }, gradeBadge(t.grade, 'small'), visibleTitle(t, store), missableTag(t))))),
      el('ol', { class: 'stage-steps' }, (stage.steps ?? []).map((s) => citedText(s, model, 'li')))));
}

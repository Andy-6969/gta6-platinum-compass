// The tracker view: filters across the top, then three columns side by side (checklist, open guide, next-up and
// sources), so progress, filters, a guide and where its facts come from are all visible at once.
import { el, mount } from '../dom.js';
import { renderFilterBar, renderChecklist } from './checklist.js';
import { renderGuidePanel } from './guide-panel.js';
import { renderNextUp, renderTrophySources } from './side-panel.js';

export function renderTrackerView(root, model, store, ui) {
  const trophy = model.trophyById.get(ui.selectedId) ?? null;
  const previousScroll = root.querySelector('.trophy-rows')?.scrollTop ?? null;
  const { kindBar, gradeBar } = renderFilterBar(model, store, ui);
  mount(root,
    el('div', { id: 'tracker-view', class: 'tracker-view' },
      kindBar,
      el('div', { class: 'tracker-columns' },
        renderChecklist(model, store, ui, gradeBar),
        renderGuidePanel(trophy, model, store),
        el('aside', { id: 'side-column', class: 'side-column' }, renderNextUp(model, store, ui), renderTrophySources(trophy, model)))));
  const list = root.querySelector('.trophy-rows');
  if (list && previousScroll != null) list.scrollTop = previousScroll;
  else if (list && ui.scrollSelectedIntoView) root.querySelector('.trophy-row.selected')?.scrollIntoView({ block: 'nearest' });
}

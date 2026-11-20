// Boot and routing for Platinum Compass: load the local data, create the progress store (or a demo state when the
// URL asks for one), wire the header controls (spoilers, export, import with confirmation) and route between views.
// The tracker is in the first load; roadmap, missables and sources are fetched by import() when first opened.
import { byId, mount, el } from './dom.js';
import { loadGuideModel } from './data.js';
import { computeAudit } from './audit.js';
import { createProgressStore, buildExportDocument, downloadProgressFile, validateImportedProgress } from './store.js';
import { defaultFilterState } from './filters.js';
import { demoStateFromUrl } from './demo.js';
import { renderProgressSummary, renderSpoilerToggle, renderSaveStatus } from './views/progress-header.js';
import { renderAuditStrip } from './views/audit-strip.js';
import { renderTrackerView } from './views/tracker.js';
import { showToast } from './toast.js';

const LAZY_VIEWS = {
  roadmap: () => import('./views/roadmap.js').then((m) => m.renderRoadmapView),
  missables: () => import('./views/missables.js').then((m) => m.renderMissablesView),
  sources: () => import('./views/sources.js').then((m) => m.renderSourcesView),
};

async function boot() {
  const model = await loadGuideModel();
  const params = new URLSearchParams(location.search);
  const store = createProgressStore({ demoState: demoStateFromUrl(params, model) });
  const ui = createUiState(model, params);
  const root = byId('view-root');

  renderAuditStrip(computeAudit(model));

  function renderChrome() {
    renderProgressSummary(model, store);
    renderSpoilerToggle(store);
    renderSaveStatus(store);
  }

  async function renderRoute() {
    const { view, arg } = parseRoute(location.hash);
    for (const tab of document.querySelectorAll('#view-tabs a')) tab.classList.toggle('active', tab.dataset.view === view);
    document.body.dataset.view = view;
    if (view === 'tracker') {
      if (arg && model.trophyById.has(Number(arg))) { ui.selectedId = Number(arg); ui.scrollSelectedIntoView = true; }
      renderTrackerView(root, model, store, ui);
      ui.scrollSelectedIntoView = false;
      return;
    }
    const render = await LAZY_VIEWS[view]();
    render(root, model, store, ui, view === 'sources' ? Number(arg) || null : arg ?? null);
  }

  ui.onChange = (opts = {}) => {
    const focusSearch = opts.keepFocus && document.activeElement?.id === 'trophy-search';
    const caret = focusSearch ? document.activeElement.selectionStart : null;
    renderRoute().then(() => {
      if (focusSearch) { const box = byId('trophy-search'); box?.focus(); box?.setSelectionRange(caret, caret); }
    });
  };

  store.subscribe(() => { renderChrome(); ui.onChange(); });
  window.addEventListener('hashchange', () => renderRoute());
  wireHeaderControls(model, store);
  wireKeyboard(model, ui);
  renderChrome();
  await renderRoute();
}

function parseRoute(hash) {
  const [, view = 'tracker', arg] = /^#\/(\w+)(?:\/([\w-]+))?/.exec(hash) ?? [];
  return { view: view in LAZY_VIEWS || view === 'tracker' ? view : 'tracker', arg };
}

function createUiState(model, params) {
  const ui = {
    filter: { ...defaultFilterState(), kind: params.get('kind') ?? 'all' },
    selectedId: Number(params.get('open')) || model.trophies[0].id,
    // The list opens at the top (platinum, then the story in order); deep links and j/k scroll to the selection.
    scrollSelectedIntoView: false,
    onChange: () => {},
    select(id) { ui.selectedId = id; if (!location.hash.startsWith('#/tracker')) location.hash = '#/tracker'; ui.onChange(); },
    setFilter(patch, opts) { ui.filter = { ...ui.filter, ...patch }; ui.onChange(opts); },
  };
  return ui;
}

function wireHeaderControls(model, store) {
  byId('spoiler-toggle').addEventListener('click', () => store.setSpoilers(!store.state.spoilers));
  byId('export-progress').addEventListener('click', () => {
    const doc = buildExportDocument(store.state, model.trophies);
    downloadProgressFile(doc);
    showToast(`Exported ${plural(doc.earned.length, 'earned trophy', 'earned trophies')} and ${plural(Object.keys(doc.counters).length, 'counter', 'counters')} to a JSON file.`, 'ok');
  });
  const fileInput = byId('import-file');
  byId('import-progress').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    fileInput.value = '';
    if (!file) return;
    let parsed;
    try { parsed = JSON.parse(await file.text()); } catch { showToast(`"${file.name}" is not valid JSON; nothing was changed.`, 'error'); return; }
    const result = validateImportedProgress(parsed, model.trophies);
    if (!result.ok) { showToast(`Import refused: ${result.error} Nothing was changed.`, 'error'); return; }
    confirmImport(file.name, result, store);
  });
}

function plural(n, one, many) {
  return `${n} ${n === 1 ? one : many}`;
}

function confirmImport(fileName, result, store) {
  const dialog = byId('import-dialog');
  mount(byId('import-dialog-text'),
    el('span', { text: `"${fileName}" holds ${result.summary}. ` }),
    el('span', { text: `It will replace your current progress (${store.state.earned.length} earned).` }));
  dialog.returnValue = '';
  dialog.addEventListener('close', () => {
    if (dialog.returnValue === 'replace') {
      store.replaceAll(result.progress);
      showToast(`Imported: ${result.summary}. Progress saved.`, 'ok');
    } else showToast('Import cancelled; your progress is unchanged.', 'info');
  }, { once: true });
  dialog.showModal();
}

function wireKeyboard(model, ui) {
  document.addEventListener('keydown', (e) => {
    if (e.target.matches?.('input, textarea')) return;
    if (e.key === '/') { e.preventDefault(); byId('trophy-search')?.focus(); }
    if (e.key === 'j' || e.key === 'k') {
      const ids = [...document.querySelectorAll('.trophy-row')].map((r) => Number(r.dataset.id));
      const at = ids.indexOf(ui.selectedId);
      const next = ids[Math.max(0, Math.min(ids.length - 1, at + (e.key === 'j' ? 1 : -1)))];
      if (next) { ui.scrollSelectedIntoView = true; ui.select(next); }
    }
  });
}

boot().catch((error) => {
  mount(byId('view-root'), el('p', { class: 'boot-note error', text: `Platinum Compass could not start: ${error.message}` }));
});

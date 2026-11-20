// The audit strip under the header: what the data holds, counted at run time by audit.js.
import { el, mount, byId } from '../dom.js';

export function renderAuditStrip(audit) {
  const g = audit.grades;
  const items = [
    auditItem(`${audit.officialComplete}/${audit.total}`, 'official trophies', audit.makeupMatches ? 'ok' : 'warn'),
    auditItem(`${g.platinum}P ${g.gold}G ${g.silver}S ${g.bronze}B`, audit.makeupMatches ? '= PSN list' : '≠ PSN list', audit.makeupMatches ? 'ok' : 'warn'),
    auditItem(String(audit.hidden), 'PSN-hidden'),
    auditItem(`${audit.citedGuides}/${audit.total}`, 'guides cited', audit.citedGuides === audit.total ? 'ok' : 'warn'),
    auditItem(`${audit.citedSteps}/${audit.steps}`, 'steps cited', audit.citedSteps === audit.steps ? 'ok' : 'warn'),
    auditItem(String(audit.sources), `sources · ${audit.sitesRead} sites`),
    auditItem(String(audit.missable), 'missable flags'),
    auditItem(String(audit.disputes), 'disputes'),
    auditItem(String(audit.brokenCites.length), 'broken cites', audit.brokenCites.length ? 'warn' : 'ok'),
  ];
  mount(byId('audit-strip'), el('span', { class: 'audit-title', text: 'Audit' }), items);
}

function auditItem(value, label, tone = '') {
  return el('span', { class: `audit-item ${tone}`.trim() }, el('b', { text: value }), ` ${label}`);
}

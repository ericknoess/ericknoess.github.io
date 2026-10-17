import { h } from '../lib/dom.js';
import { monthYear, yearsFigure, periodsLabel, mesNote } from '../lib/format.js';

/**
 * Cifras clave "At a glance" (RF-02). Recibe el resultado de glanceStats().
 * Cada número va en un <span data-to> para que el módulo de animación pueda contarlo;
 * los lectores de pantalla leen la versión completa en .sr-only.
 */
export function renderStats(root, stats) {
  const num = n => h('span', { 'data-to': n, text: n });
  const tile = (label, spoken, visual, note) =>
    h('div', { class: 'stat' },
      h('dt', { text: label }),
      h('dd', { class: 'value' }, h('span', { class: 'sr-only', text: spoken }), h('span', { 'aria-hidden': 'true' }, ...visual)),
      h('dd', { class: 'note', text: note })
    );

  const tiles = [];
  const exp = yearsFigure(stats.experience.months);
  if (exp.value > 0) {
    tiles.push(tile('Years of experience', `${exp.value}${exp.plus ? ' plus' : ''} years`,
      [num(exp.value), exp.plus ? '+' : ''], `since ${monthYear(stats.experience.since)}`));
  }
  const lead = yearsFigure(stats.leadership.months);
  if (lead.value > 0) {
    tiles.push(tile('Years leading teams', `${lead.value}${lead.plus ? ' plus' : ''} years`,
      [num(lead.value), lead.plus ? '+' : ''], periodsLabel(stats.leadership.periods)));
  }
  const sizes = stats.teamSizes;
  if (sizes.length > 0) {
    const first = sizes[0], last = sizes[sizes.length - 1];
    tiles.push(sizes.length > 1 && first !== last
      ? tile('Team size led', `${first} people, later ${last} people`, [num(first), ' ', h('span', { class: 'arrow', text: '→' }), ' ', num(last)], 'people')
      : tile('Team size led', `${last} people`, [num(last)], 'people'));
  }
  const mes = stats.mesDeployments;
  if (mes.total > 0) {
    tiles.push(tile('MES deployments', `${mes.total}`, [num(mes.total)], mesNote(mes)));
  }

  if (tiles.length) root.replaceChildren(h('dl', { class: 'stats', 'aria-label': 'At a glance' }, tiles));
  else root.replaceChildren();
}

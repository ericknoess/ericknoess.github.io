import { h } from '../lib/dom.js';
import { periodsLabel } from '../lib/format.js';
import { section, shortCompany } from './section.js';

/**
 * Convierte "+100%" o "50 / 12" en nodos donde cada número va en <span data-to>
 * (para la animación de conteo). Lo que sigue a " / " se muestra más pequeño.
 */
function figure(display) {
  const [main, of] = display.split(' / ');
  const tokens = str => str.split(/(\d+)/).filter(Boolean)
    .map(t => /^\d+$/.test(t) ? h('span', { 'data-to': t, text: t }) : t);
  return [...tokens(main), of && ' ', of && h('span', { class: 'of' }, '/ ', ...tokens(of))];
}

/** Impact (RF-03): una tarjeta por métrica, con el logro completo del CV como fuente. */
export function renderImpact(data) {
  const roleById = new Map(data.roles.map(r => [r.id, r]));
  const items = data.achievements.flatMap(a => (a.metrics ?? []).map(m => ({ m, a, role: roleById.get(a.roleId) })));
  if (items.length === 0) return null;

  const cite = role => `${shortCompany(role.company)} · ${periodsLabel([role]).replace('now', 'present')}`;
  const roles = [...new Set(items.map(i => i.role))];
  const lede = roles.length === 1 ? cite(roles[0]) : null;

  const cards = items.map(({ m, a, role }) =>
    h('details', { class: 'card', id: m.id },
      h('summary', {},
        h('span', { class: 'big' }, h('span', { class: 'sr-only', text: m.spoken }), h('span', { 'aria-hidden': 'true' }, ...figure(m.display))),
        h('span', { class: 'what', text: m.label }),
        h('span', { class: 'toggle', text: 'Source' })
      ),
      h('blockquote', { class: 'source' },
        h('p', { text: `“${a.text}”` }),
        h('footer', {}, h('cite', { text: cite(role) }))
      )
    ));

  return section({ id: 'impact', nav: 'Impact', title: 'Measured results', lede },
    h('div', { class: 'impact' }, cards));
}

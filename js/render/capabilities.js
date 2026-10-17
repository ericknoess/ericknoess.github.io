import { h } from '../lib/dom.js';
import { section } from './section.js';

/** Core capabilities (RF-05): cada capacidad enlaza a los logros o puestos que la respaldan. */
export function renderCapabilities(data) {
  const caps = data.capabilities ?? [];
  if (caps.length === 0) return null;

  const list = h('ol', { class: 'caps' }, caps.map((c, i) =>
    h('li', {},
      h('span', { class: 'n', 'aria-hidden': 'true', text: String(i + 1).padStart(2, '0') }),
      h('h3', { text: c.title }),
      h('div', { class: 'body' },
        h('p', { text: c.summary }),
        h('ul', { class: 'evidence', 'aria-label': `Evidence for ${c.title}` },
          c.evidence.map(ev => h('li', {}, h('a', { href: `#${ev.ref}`, text: ev.label }))))
      )
    )));

  // Al saltar a una evidencia que está dentro de un desplegable cerrado, se abre primero.
  list.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    const target = link && document.getElementById(link.getAttribute('href').slice(1));
    const details = target?.closest('details');
    if (details) details.open = true;
  });

  return section({ id: 'capabilities', nav: 'Capabilities', title: 'Core capabilities',
    lede: 'Each capability links to the achievement that supports it.' }, list);
}

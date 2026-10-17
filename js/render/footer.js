import { h } from '../lib/dom.js';
import { monthYearLong } from '../lib/format.js';

/** Pie (RF-10): fecha de actualización y el único canal de contacto (LinkedIn). */
export function renderFooter(root, data) {
  root.replaceChildren(
    h('div', { class: 'wrap' },
      h('p', {}, 'Last updated ', h('time', { datetime: data.meta.lastUpdated, text: monthYearLong(data.meta.lastUpdated) })),
      h('p', {}, h('a', { href: data.profile.linkedinUrl, target: '_blank', rel: 'noopener noreferrer' },
        'LinkedIn', h('span', { class: 'sr-only', text: ' (opens in a new tab)' })))
    ));
}

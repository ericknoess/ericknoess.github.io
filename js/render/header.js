import { h } from '../lib/dom.js';

/** Encabezado (RF-01): nombre, titular, ubicación, LinkedIn (RF-10), descarga del CV si existe (RF-09) y foto. */
export function renderHeader(root, profile) {
  const external = (href, label, cls) => h('a', { class: `btn ${cls}`, href, target: '_blank', rel: 'noopener noreferrer' },
    label, ' ', h('span', { 'aria-hidden': 'true', text: '↗' }), h('span', { class: 'sr-only', text: ' (opens in a new tab)' }));

  root.replaceChildren(
    h('div', { class: 'hero-text' },
      h('h1', { class: 'name', text: profile.name }),
      h('p', { class: 'headline', text: profile.headline }),
      h('p', { class: 'meta' }, h('span', { class: 'dot', 'aria-hidden': 'true' }), profile.location),
      h('div', { class: 'actions' },
        external(profile.linkedinUrl, 'LinkedIn', 'btn-primary'),
        // RF-09: el botón solo aparece cuando exista el CV actualizado (profile.cvUrl).
        profile.cvUrl && h('a', { class: 'btn btn-secondary', href: profile.cvUrl, download: true }, 'Download CV')
      )
    ),
    h('figure', { class: 'portrait' },
      h('div', { class: 'photo' },
        h('img', { src: profile.photo.src, alt: profile.photo.alt, width: 600, height: 600, decoding: 'async', fetchpriority: 'high' }),
        h('span', { class: 'shine', 'aria-hidden': 'true' })   // brillo que cruza la foto en la entrada
      )
    )
  );
}

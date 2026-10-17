import { h } from '../lib/dom.js';

/**
 * Envoltorio común de las secciones: id, etiqueta para la navegación, rótulo "01 · Impact",
 * título y entradilla. El número se asigna después, según el orden de las secciones visibles.
 */
export function section({ id, nav, title, lede }, ...content) {
  const titleId = `${id}-title`;
  return h('section', { id, 'data-nav': nav, 'aria-labelledby': titleId },
    h('div', { class: 'wrap' },
      h('p', { class: 'eyebrow' }, h('span', { class: 'eyebrow-label', text: nav }), h('span', { class: 'rule', 'aria-hidden': 'true' })),
      h('h2', { id: titleId, text: title }),
      lede && h('p', { class: 'lede', text: lede }),
      ...content
    )
  );
}

/** Numera las secciones visibles: "01 · Impact", "02 · Capabilities"... */
export function numberSections(sections) {
  sections.forEach((s, i) => {
    const label = s.querySelector('.eyebrow-label');
    label.textContent = `${String(i + 1).padStart(2, '0')} · ${s.dataset.nav}`;
  });
  return sections;
}

/** "Probiomed S.A. de C.V." -> "Probiomed"; "Grimann S.A. de C.V. (SANFER)" -> "Grimann". */
export function shortCompany(name) {
  return name.replace(/\s+\(.*\)$/, '').replace(/\s+S\.A\. de C\.V\.$/i, '');
}

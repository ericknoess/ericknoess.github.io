import { h } from '../lib/dom.js';

/**
 * Barra de navegación fija con un enlace por sección visible y una barra de progreso de lectura.
 * La sección activa se marca con IntersectionObserver (funciona aunque no haya animaciones).
 */
export function renderNav(sections) {
  if (sections.length === 0) return null;

  const links = sections.map(s => h('a', { href: `#${s.id}`, text: s.dataset.nav }));
  const nav = h('nav', { class: 'anchors', 'aria-label': 'Sections' },
    h('div', { class: 'wrap' }, h('ul', {}, links.map(a => h('li', {}, a)))),
    h('div', { class: 'progress', 'aria-hidden': 'true' })
  );

  const setActive = id => links.forEach(a => {
    const active = a.getAttribute('href') === `#${id}`;
    a.classList.toggle('active', active);
    if (active) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
  });
  const observer = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
  }, { rootMargin: '-45% 0px -50% 0px' });   // activa la sección que cruza el centro de la pantalla
  sections.forEach(s => observer.observe(s));

  return nav;
}

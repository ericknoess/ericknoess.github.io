import { h } from '../lib/dom.js';
import { section } from './section.js';

/** Skills (RF-06): las 3 categorías de competencias del CV, tal cual y sin niveles ni porcentajes. */
export function renderSkills(data) {
  const groups = (data.competencies ?? []).filter(g => g.items.length > 0);
  if (groups.length === 0) return null;

  return section({ id: 'skills', nav: 'Skills', title: 'Core competencies', lede: 'As listed in my CV. No self-rated levels.' },
    h('div', { class: 'skills' }, groups.map(g =>
      h('div', {},
        h('h3', { text: g.category }),
        h('ul', { class: 'tags' }, g.items.map(t => h('li', { text: t })))
      ))));
}

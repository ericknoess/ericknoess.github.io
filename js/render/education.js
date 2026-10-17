import { h } from '../lib/dom.js';
import { educationWhen } from '../lib/format.js';
import { section } from './section.js';

/** Education & languages (RF-08): estudios con fechas y estado, e idiomas con su nivel. */
export function renderEducation(data) {
  const education = data.education ?? [];
  const languages = data.languages ?? [];
  if (education.length === 0 && languages.length === 0) return null;

  const eduList = education.length > 0 && h('ul', { class: 'edu-list', 'aria-label': 'Education' }, education.map(e => {
    const when = educationWhen(e);
    return h('li', {},
      h('span', { class: 'prog', text: e.program }),
      e.status === 'in-progress' && ' ',
      e.status === 'in-progress' && h('span', { class: 'status', text: 'In progress' }),
      h('span', { class: 'inst', text: e.institution }),
      when && h('span', { class: 'when', text: when })
    );
  }));

  const langList = languages.length > 0 && h('ul', { class: 'lang', 'aria-label': 'Languages' }, languages.map(l =>
    h('li', {}, h('span', { class: 'lang-name', text: l.name }), h('span', { class: 'lang-level', text: l.level }))));

  return section({ id: 'education', nav: 'Education', title: 'Education & languages' },
    h('div', { class: 'edu' }, eduList, langList));
}

import { h } from '../lib/dom.js';
import { monthYear } from '../lib/format.js';
import { durationLabel, toMonthIndex } from '../lib/derive.js';
import { section } from './section.js';

/** Experience (RF-04): línea de tiempo vertical, del puesto más reciente al más antiguo. */
export function renderExperience(data, asOf) {
  if (data.roles.length === 0) return null;
  const achById = new Map(data.achievements.map(a => [a.id, a]));
  const roles = [...data.roles].sort((a, b) => toMonthIndex(b.start) - toMonthIndex(a.start));

  const items = roles.map((r, i) => {
    const achievements = r.achievementIds.map(id => achById.get(id)).filter(Boolean);
    const chips = [Number.isInteger(r.teamSize) && `Team of ${r.teamSize}`, ...r.chips].filter(Boolean);
    const count = achievements.length;

    return h('li', { class: `role${r.end === null ? ' current' : ''}`, id: r.id },
      h('span', { class: 'node', 'aria-hidden': 'true' }),
      h('p', { class: 'when' },
        h('time', { datetime: r.start, text: monthYear(r.start) }), ' – ',
        r.end ? h('time', { datetime: r.end, text: monthYear(r.end) }) : 'Present',
        h('small', { text: durationLabel(r.start, r.end, asOf) })
      ),
      h('div', { class: 'role-body' },
        h('h3', { class: 'role-title', text: r.title }),
        h('p', { class: 'org', text: `${r.company} · ${r.location}` }),
        chips.length > 0 && h('ul', { class: 'chips', 'aria-label': 'Highlights' }, chips.map(c => h('li', { text: c }))),
        count > 0 && h('details', { open: i === 0 },     // el puesto actual aparece desplegado
          h('summary', { text: `${count} ${count === 1 ? 'achievement' : 'achievements'}` }),
          h('ul', { class: 'ach' }, achievements.map(a => h('li', { id: a.id, text: a.text })))
        )
      )
    );
  });

  return section({ id: 'experience', nav: 'Experience', title: 'Career path', lede: 'Most recent first.' },
    h('div', { class: 'tl-wrap' },
      h('div', { class: 'tl-line', 'aria-hidden': 'true' }),
      h('ol', { class: 'timeline' }, items)
    ));
}

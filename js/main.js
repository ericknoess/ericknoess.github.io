// Punto de entrada: carga los datos, los valida y pinta cada sección.
import { validateProfile, publishable } from './lib/validate.js';
import { glanceStats, toYearMonth } from './lib/derive.js';
import { renderHeader } from './render/header.js';
import { renderStats } from './render/stats.js';
import { renderImpact } from './render/impact.js';
import { renderCapabilities } from './render/capabilities.js';
import { renderExperience } from './render/experience.js';
import { renderSkills } from './render/skills.js';
import { renderEducation } from './render/education.js';
import { renderFooter } from './render/footer.js';
import { renderNav } from './render/nav.js';
import { numberSections } from './render/section.js';
import { animate } from './anim.js';

const DATA_URL = 'content/profile.json';

async function loadProfile() {
  const res = await fetch(DATA_URL, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`No se pudo cargar ${DATA_URL} (HTTP ${res.status})`);
  return res.json();
}

function showError(error) {
  console.error(error);
  const hero = document.getElementById('hero');
  hero.removeAttribute('aria-busy');
  document.documentElement.classList.remove('anim-pending');
  hero.classList.add('is-error');      // encabezado compacto, sin hueco vacío
  document.getElementById('hero-content').replaceChildren();
  document.getElementById('app-error').hidden = false;
}

async function init() {
  try {
    const data = await loadProfile();
    const errors = validateProfile(data);
    if (errors.length) throw new Error(`profile.json no es válido:\n- ${errors.join('\n- ')}`);

    const site = publishable(data);
    const asOf = toYearMonth(new Date());

    renderHeader(document.getElementById('hero-content'), site.profile);
    renderStats(document.getElementById('glance'), glanceStats(site.roles, site.achievements, asOf));

    // Secciones en orden de lectura; las que no tienen datos publicados no se muestran.
    const sections = numberSections([
      renderImpact(site),
      renderCapabilities(site),
      renderExperience(site, asOf),
      renderSkills(site),
      renderEducation(site)
    ].filter(Boolean));
    const main = document.getElementById('main');
    main.replaceChildren(...sections);
    const nav = renderNav(sections);
    if (nav) main.before(nav);
    renderFooter(document.getElementById('site-footer'), site);

    document.getElementById('hero').removeAttribute('aria-busy');
    document.documentElement.dataset.ready = 'true';   // señal para pruebas y animaciones
    animate();
  } catch (error) {
    showError(error);
  }
}

init();

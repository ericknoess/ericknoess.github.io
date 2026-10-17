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

/**
 * Enlaces directos (p. ej. /#experience o /#a-gr-tt): el ancla no existía cuando el navegador cargó la página,
 * porque el contenido se pinta después. Se abre el desplegable que la contiene y se repite la navegación al ancla,
 * para que el navegador desplace la página y aplique :target (resaltado). location.replace no añade historial.
 */
function goToHash() {
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const target = id && document.getElementById(id);
  if (!target) return;
  const details = target.closest('details');
  if (details) details.open = true;
  const root = document.documentElement;
  root.style.scrollBehavior = 'auto';   // salto inmediato: un scroll suave lo cortaría el recálculo de las animaciones
  history.replaceState(null, '', location.pathname + location.search);
  location.replace(`#${encodeURIComponent(id)}`);
  root.style.scrollBehavior = '';
}

/** Al imprimir, los logros de cada puesto se despliegan (si no, saldrían en blanco) y después vuelven a su estado.
 *  Las tarjetas de Impact se quedan cerradas: su cita ya aparece en Experience. */
function expandForPrint() {
  let opened = [];
  window.addEventListener('beforeprint', () => {
    opened = [...document.querySelectorAll('.role details:not([open])')];
    opened.forEach(d => { d.open = true; });
  });
  window.addEventListener('afterprint', () => {
    opened.forEach(d => { d.open = false; });
    opened = [];
  });
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
    goToHash();
    expandForPrint();
    document.documentElement.dataset.ready = 'true';   // señal para pruebas y animaciones
    animate();
  } catch (error) {
    showError(error);
  }
}

init();

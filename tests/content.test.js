// Reglas de contenido acordadas con el usuario (ver decisiones de las fases 1–3).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadProfile } from './helpers.js';

const data = loadProfile();

test('las métricas publicadas son exactamente las aprobadas, tal cual', () => {
  const metrics = data.achievements.flatMap(a => (a.metrics ?? []).map(m => [m.display, m.evidence]));
  assert.deepEqual(metrics, [
    ['+100%', '100% increase in product yield'],
    ['−9%', '9% reduction in operational losses'],
    ['Zero', 'zero downtime for critical tracking tools'],
    ['50 / 12', '50 concurrent variables across 12 simultaneous production batches']
  ]);
});

test('las métricas solo provienen del CV actual', () => {
  for (const a of data.achievements.filter(a => a.metrics)) assert.deepEqual(a.source, ['cv-current']);
});

test('las etiquetas de cada puesto aparecen en el texto de sus logros (sin inventar)', () => {
  for (const r of data.roles) {
    const text = data.achievements.filter(a => a.roleId === r.id).map(a => a.text).join(' ').toLowerCase();
    for (const chip of r.chips) for (const part of chip.split(' · ')) {
      assert.ok(text.includes(part.toLowerCase()), `"${part}" (${r.id}) no aparece en sus logros`);
    }
  }
});

test('el tamaño de equipo coincide con lo confirmado por el usuario', () => {
  const size = id => data.roles.find(r => r.id === id).teamSize;
  assert.equal(size('r-pb1'), 10);
  assert.equal(size('r-pb2'), 50);
});

test('todo lo traducido del CV-2018 conserva el original y empieza sin aprobar (excepto lo ya aprobado)', () => {
  const approvedTranslations = new Set(['e-sie', 'r-pb1', 'a-pb1-scope', 'r-gr', 'a-gr-vac', 'a-gr-tt', 'a-gr-methods', 'a-gr-stats']);   // aprobados por el usuario el 2026-10-17
  const items = [...data.roles, ...data.achievements, ...data.education].filter(i => i.source.includes('cv-2018'));
  for (const i of items) {
    assert.ok(i.originalText || i.originalTitle, `${i.id} necesita el texto original`);
    if (!approvedTranslations.has(i.id)) assert.equal(i.approved, false, `${i.id} no debería estar aprobado todavía`);
  }
});

test('no se publica el programa del MIT (decisión del usuario)', () => {
  assert.ok(!JSON.stringify(data).includes('MIT'));
});

test('la formación en curso se marca como tal', () => {
  const unitec = data.education.find(e => e.id === 'e-unitec');
  assert.equal(unitec.status, 'in-progress');
  assert.equal(unitec.expected, '2028');
});

test('index.html: el enlace de respaldo a LinkedIn y el título coinciden con los datos', async () => {
  const { readFileSync } = await import('node:fs');
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const links = [...html.matchAll(/href="(https:\/\/www\.linkedin\.com[^"]+)"/g)].map(m => m[1]);
  assert.ok(links.length >= 2, 'faltan los enlaces de respaldo (noscript y error)');
  for (const l of links) assert.equal(l, data.profile.linkedinUrl);
  assert.ok(html.includes(`<title>${data.profile.name}`));
});

test('404.html: noindex, recursos con rutas absolutas y LinkedIn coincidente', async () => {
  const { readFileSync } = await import('node:fs');
  const html = readFileSync(new URL('../404.html', import.meta.url), 'utf8');
  assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
  // GitHub Pages la sirve en cualquier ruta (p. ej. /a/b/c): las rutas relativas no cargarían el CSS
  const assets = [...html.matchAll(/(?:href|src)="([^"#]+)"/g)].map(m => m[1]).filter(u => !u.startsWith('https://'));
  for (const u of assets) assert.ok(u.startsWith('/'), `ruta relativa en 404.html: ${u}`);
  const links = [...html.matchAll(/href="(https:\/\/www\.linkedin\.com[^"]+)"/g)].map(m => m[1]);
  assert.equal(links.length, 1);
  assert.equal(links[0], data.profile.linkedinUrl);
});

test('cada cifra de una capacidad está respaldada por sus propias evidencias', () => {
  const byId = new Map([...data.roles, ...data.achievements].map(i => [i.id, i]));
  for (const c of data.capabilities) {
    const backing = c.evidence.map(e => byId.get(e.ref)).map(i => `${i.text ?? i.title} ${i.teamSize ?? ''}`).join(' ');
    for (const n of c.summary.match(/\d+%?/g) ?? []) {
      assert.ok(new RegExp(`\\b${n}`).test(backing), `${c.id}: "${n}" no aparece en sus evidencias`);
    }
  }
});

test('vista previa (Open Graph): coincide con los datos y la imagen existe', async () => {
  const { readFileSync, existsSync } = await import('node:fs');
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const og = Object.fromEntries([...html.matchAll(/<meta property="og:([a-z:]+)" content="([^"]*)">/g)].map(m => [m[1], m[2].replace(/&amp;/g, '&')]));
  const site = 'https://ericknoess.github.io/';
  assert.equal(og.url, site);
  assert.equal(og.title, `${data.profile.name} · ${data.profile.headline}`);
  assert.ok(og.image.startsWith(site), 'la imagen necesita una URL absoluta del propio sitio');
  assert.ok(existsSync(new URL(`../${og.image.slice(site.length)}`, import.meta.url)), `no existe ${og.image}`);
  // Las cifras de la descripción salen de datos aprobados: tamaños de equipo y la métrica del CV
  const teams = data.roles.map(r => r.teamSize).filter(Boolean);
  for (const n of teams) assert.match(og.description, new RegExp(`\\b${n}\\b`));
  assert.ok(data.achievements.some(a => a.text.includes('100% increase in product yield')));
  assert.match(og.description, /100% increase in product yield/);
});

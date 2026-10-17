import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateProfile, publishable } from '../js/lib/validate.js';
import { loadProfile } from './helpers.js';

const clone = o => structuredClone(o);

test('profile.json es válido', () => {
  assert.deepEqual(validateProfile(loadProfile()), []);
});

test('detecta una evidencia que apunta a algo inexistente', () => {
  const d = clone(loadProfile());
  d.capabilities[0].evidence[0].ref = 'no-existe';
  assert.match(validateProfile(d).join('\n'), /evidencia "no-existe" no existe/);
});

test('detecta fechas mal formadas o invertidas', () => {
  const d = clone(loadProfile());
  const role = id => d.roles.find(r => r.id === id);   // por id: añadir puestos no rompe la prueba
  role('r-az').start = '2020-4';
  role('r-pb1').start = '2021-01';            // posterior a su fin (2020-04)
  const out = validateProfile(d).join('\n');
  assert.match(out, /formato YYYY-MM/);
  assert.match(out, /debe ser anterior/);
});

test('detecta fuentes desconocidas, ids duplicados y approved ausente', () => {
  const d = clone(loadProfile());
  d.achievements[0].source = ['inventado'];
  d.achievements[1].id = d.achievements[0].id;
  delete d.education[0].approved;
  const out = validateProfile(d).join('\n');
  assert.match(out, /source desconocido "inventado"/);
  assert.match(out, /id duplicado/);
  assert.match(out, /approved debe ser true o false/);
});

test('una métrica cuya evidencia no está en el texto del logro es un error', () => {
  const d = clone(loadProfile());
  d.achievements.find(a => a.metrics).metrics[0].evidence = '200% increase';
  assert.match(validateProfile(d).join('\n'), /no aparece literalmente/);
});

test('rechaza porcentajes en competencias', () => {
  const d = clone(loadProfile());
  d.competencies[0].items.push('Excel 90%');
  assert.match(validateProfile(d).join('\n'), /porcentajes/);
});

test('publishable oculta lo no aprobado y limpia las evidencias huérfanas', () => {
  const d = clone(loadProfile());
  const roleCount = d.roles.length;
  d.capabilities.forEach(c => { c.approved = true; });      // simula capacidades aprobadas
  for (const id of ['r-gr', 'r-pb1']) d.roles.find(r => r.id === id).approved = false;   // independiente de lo ya aprobado
  const pub = publishable(d);
  const roleIds = pub.roles.map(r => r.id);
  assert.ok(!roleIds.includes('r-gr') && !roleIds.includes('r-pb1'), 'los puestos sin aprobar no se publican');
  assert.ok(pub.achievements.every(a => roleIds.includes(a.roleId)));
  const refs = pub.capabilities.flatMap(c => c.evidence.map(e => e.ref));
  assert.ok(!refs.includes('r-pb1') && !refs.includes('a-gr-tt'), 'no quedan enlaces a elementos ocultos');
  assert.equal(d.roles.length, roleCount, 'no modifica el original');
});

test('publishable elimina una capacidad que se queda sin evidencias', () => {
  const d = clone(loadProfile());
  d.achievements.find(a => a.id === 'a-gr-tt').approved = false;   // su única evidencia queda oculta
  d.capabilities = [{ id: 'c-x', title: 'X', summary: 'Y', evidence: [{ ref: 'a-gr-tt', label: 'Z' }], approved: true }];
  assert.equal(publishable(d).capabilities.length, 0);
});

test('exige meta.lastUpdated con formato YYYY-MM', () => {
  const d = clone(loadProfile());
  d.meta.lastUpdated = 'octubre 2026';
  assert.match(validateProfile(d).join('\n'), /meta\.lastUpdated/);
});

test('cvUrl (opcional) solo admite una ruta relativa a un PDF del sitio', () => {
  const d = clone(loadProfile());
  for (const bad of ['https://example.com/cv.pdf', '/cv/cv.pdf', 'cv/cv.docx', '../cv.pdf', 'javascript:alert(1)']) {
    d.profile.cvUrl = bad;
    assert.match(validateProfile(d).join('\n'), /profile\.cvUrl/, bad);
  }
  d.profile.cvUrl = 'cv/erick-noe-sanchez-cv.pdf';
  assert.deepEqual(validateProfile(d), []);
});

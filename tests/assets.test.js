// Recursos alojados en el propio sitio (RNF-04): sin CDN ni peticiones a terceros.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');

for (const page of ['index.html', '404.html']) {
  test(`${page}: scripts, estilos y fuentes son locales y existen`, () => {
    const html = read(page);
    const refs = [...html.matchAll(/<(?:script|link)\b[^>]*?(?:src|href)="([^"]+)"/g)].map(m => m[1]);
    assert.ok(refs.length > 0);
    for (const ref of refs) {
      assert.ok(!/^(https?:)?\/\//.test(ref), `recurso externo en ${page}: ${ref}`);
      assert.ok(existsSync(new URL(ref.replace(/^\//, ''), root)), `no existe: ${ref}`);
    }
  });
}

test('GSAP alojado es la versión 3.15.0 (core, ScrollTrigger y SplitText)', () => {
  for (const [file, name] of [['gsap.min.js', 'GSAP'], ['ScrollTrigger.min.js', 'ScrollTrigger'], ['SplitText.min.js', 'SplitText']]) {
    assert.match(read(`vendor/gsap/${file}`).slice(0, 200), new RegExp(`${name} 3\\.15\\.0`), file);
  }
});

test('cada @font-face apunta a un woff2 existente y la licencia OFL acompaña a las fuentes', () => {
  const urls = [...read('css/fonts.css').matchAll(/url\(([^)]+)\)/g)].map(m => m[1]);
  assert.equal(urls.length, 6);
  for (const u of urls) assert.ok(existsSync(new URL(u, new URL('css/', root))), `no existe: ${u}`);
  assert.match(read('fonts/OFL.txt'), /SIL Open Font License, Version 1\.1/);
});

test('si el perfil enlaza un CV descargable, el archivo existe', () => {
  const { profile } = JSON.parse(read('content/profile.json'));
  if (profile.cvUrl === undefined) return;   // RF-09 aún sin activar
  assert.ok(existsSync(new URL(profile.cvUrl, root)), `no existe ${profile.cvUrl}`);
});

// Comprueba que ningún archivo que git publicaría contiene datos privados ni términos prohibidos.
// La lista de términos vive en tests/private/forbidden-terms.json, excluido de git.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const termsFile = new URL('tests/private/forbidden-terms.json', root);
const BINARY = /\.(jpe?g|png|webp|gif|ico|woff2?|ttf|otf|pdf)$/i;

const publishedFiles = () =>
  execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' })
    .split('\n').filter(Boolean);

test('los archivos privados no se publican', () => {
  const files = publishedFiles();
  const leaked = files.filter(f => /^(data|docs|\.claude|tests\/private)\//.test(f) || f === 'CLAUDE.md');
  assert.deepEqual(leaked, []);
});

test('ningún archivo publicado contiene términos prohibidos', t => {
  if (!existsSync(termsFile)) {
    t.skip('AVISO: falta tests/private/forbidden-terms.json; la comprobación de privacidad NO se ejecutó');
    return;
  }
  const { terms } = JSON.parse(readFileSync(termsFile, 'utf8'));
  const hits = [];
  for (const f of publishedFiles().filter(f => !BINARY.test(f))) {
    const text = readFileSync(new URL(f, root), 'utf8').toLowerCase();
    for (const term of terms) if (text.includes(term.toLowerCase())) hits.push(`${f}: "${term}"`);
  }
  assert.deepEqual(hits, []);
});

test('las imágenes publicadas no contienen metadatos EXIF/XMP (ubicación, cámara…)', () => {
  const images = publishedFiles().filter(f => /\.(jpe?g|png|ico)$/i.test(f));
  assert.ok(images.length > 0);
  const withMeta = images.filter(f => {
    const bytes = readFileSync(new URL(f, root)).toString('latin1');
    return bytes.includes('Exif\0') || bytes.includes('http://ns.adobe.com/xap')
      || /eXIf|iTXt|tEXt|zTXt|tIME/.test(bytes);   // bloques de metadatos de PNG (también dentro del .ico)
  });
  assert.deepEqual(withMeta, []);
});

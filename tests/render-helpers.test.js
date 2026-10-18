import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shortCompany } from '../js/render/section.js';

test('shortCompany quita la razón social y paréntesis', () => {
  assert.equal(shortCompany('Probiomed S.A. de C.V.'), 'Probiomed');
  assert.equal(shortCompany('Azteca Vacunas S.A. de C.V.'), 'Azteca Vacunas');
  assert.equal(shortCompany('Azteca Vacunas S.A. de C.V. (Sanofi)'), 'Azteca Vacunas');
  assert.equal(shortCompany('Grimann S.A. de C.V. (SANFER)'), 'Grimann');
});

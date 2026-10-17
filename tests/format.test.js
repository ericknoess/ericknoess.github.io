import { test } from 'node:test';
import assert from 'node:assert/strict';
import { monthYear, yearsFigure, periodsLabel, mesNote, monthYearLong, educationWhen } from '../js/lib/format.js';

test('monthYear', () => {
  assert.equal(monthYear('2014-05'), 'May 2014');
  assert.equal(monthYear('2022-01'), 'Jan 2022');
});

test('yearsFigure: "+" solo si hay meses extra', () => {
  assert.deepEqual(yearsFigure(141), { value: 11, plus: true });
  assert.deepEqual(yearsFigure(72), { value: 6, plus: false });
});

test('periodsLabel', () => {
  assert.equal(periodsLabel([{ start: '2018-05', end: '2020-04' }, { start: '2022-01', end: null }]), '2018–2020 · 2022–now');
});

test('mesNote omite los ceros', () => {
  assert.equal(mesNote({ led: 1, contributed: 1 }), '1 led · 1 contributed');
  assert.equal(mesNote({ led: 2, contributed: 0 }), '2 led');
});

test('monthYearLong', () => {
  assert.equal(monthYearLong('2026-10'), 'October 2026');
});

test('educationWhen: fechas, en curso o sin fechas', () => {
  assert.equal(educationWhen({ status: 'completed', start: '2008-08', end: '2013-12' }), 'Aug 2008 – Dec 2013');
  assert.equal(educationWhen({ status: 'in-progress', expected: '2028' }), 'Expected 2028');
  assert.equal(educationWhen({ status: 'completed' }), null);
});

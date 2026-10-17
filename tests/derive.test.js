import { test } from 'node:test';
import assert from 'node:assert/strict';
import { monthsBetween, durationLabel, totalMonths, glanceStats, toYearMonth } from '../js/lib/derive.js';
import { loadProfile, AS_OF } from './helpers.js';

test('monthsBetween: fin exclusivo y fin abierto hasta asOf', () => {
  assert.equal(monthsBetween('2020-04', '2022-01', AS_OF), 21);
  assert.equal(monthsBetween('2022-01', null, AS_OF), 57);
});

test('durationLabel: singular, plural y meses sueltos', () => {
  assert.equal(durationLabel('2022-01', null, AS_OF), '4 yrs 9 mos');
  assert.equal(durationLabel('2020-04', '2022-01', AS_OF), '1 yr 9 mos');
  assert.equal(durationLabel('2018-05', '2020-04', AS_OF), '1 yr 11 mos');
  assert.equal(durationLabel('2014-05', '2017-09', AS_OF), '3 yrs 4 mos');
  assert.equal(durationLabel('2020-01', '2020-02', AS_OF), '1 mo');
  assert.equal(durationLabel('2020-01', '2021-01', AS_OF), '1 yr');
});

test('totalMonths: fusiona periodos solapados sin contarlos dos veces', () => {
  const periods = [{ start: '2020-01', end: '2020-07' }, { start: '2020-04', end: '2020-10' }];
  assert.equal(totalMonths(periods, AS_OF), 9);
});

test('toYearMonth formatea con dos dígitos', () => {
  assert.equal(toYearMonth(new Date(2026, 9, 17)), '2026-10');
});

test('glanceStats con TODOS los puestos (cifras esperadas a octubre de 2026)', () => {
  const { roles, achievements } = loadProfile();
  const s = glanceStats(roles, achievements, AS_OF);
  assert.equal(s.experience.months, 141);      // 40 + 23 + 21 + 57
  assert.equal(s.experience.years, 11);
  assert.equal(s.experience.since, '2014-05');
  assert.equal(s.leadership.months, 80);       // 23 + 57
  assert.equal(s.leadership.years, 6);
  assert.deepEqual(s.teamSizes, [10, 50]);
  assert.deepEqual(s.mesDeployments, { total: 2, led: 1, contributed: 1 });
});

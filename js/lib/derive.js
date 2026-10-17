// Cifras calculadas a partir de las fechas del archivo de datos (RF-02).
// Nunca se escriben a mano: así no quedan desactualizadas.
// Se usa igual en el navegador y en las pruebas (node --test).

/** "YYYY-MM" -> número de meses absoluto (año * 12 + mes índice 0). */
export function toMonthIndex(ym) {
  const [y, m] = ym.split('-').map(Number);
  return y * 12 + (m - 1);
}

/** Fecha -> "YYYY-MM". */
export function toYearMonth(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Meses entre inicio y fin (fin exclusivo). Un fin `null` significa "hasta asOf". */
export function monthsBetween(start, end, asOf) {
  return toMonthIndex(end ?? asOf) - toMonthIndex(start);
}

/** "4 yrs 9 mos", "1 yr 11 mos", "8 mos"... */
export function durationLabel(start, end, asOf) {
  const total = monthsBetween(start, end, asOf);
  const y = Math.floor(total / 12);
  const m = total % 12;
  const parts = [];
  if (y) parts.push(`${y} ${y === 1 ? 'yr' : 'yrs'}`);
  if (m) parts.push(`${m} ${m === 1 ? 'mo' : 'mos'}`);
  return parts.join(' ') || '< 1 mo';
}

/** Suma de meses de una lista de periodos, fusionando solapamientos para no contar doble. */
export function totalMonths(periods, asOf) {
  const ranges = periods
    .map(p => [toMonthIndex(p.start), toMonthIndex(p.end ?? asOf)])
    .sort((a, b) => a[0] - b[0]);
  let total = 0;
  let cur = null;
  for (const [s, e] of ranges) {
    if (!cur || s > cur[1]) {
      if (cur) total += cur[1] - cur[0];
      cur = [s, e];
    } else {
      cur[1] = Math.max(cur[1], e);
    }
  }
  if (cur) total += cur[1] - cur[0];
  return total;
}

/** Cifras clave de la sección "At a glance". `roles` y `achievements` deben ser solo los publicados. */
export function glanceStats(roles, achievements, asOf) {
  const expMonths = totalMonths(roles, asOf);
  const ledRoles = roles.filter(r => Number.isInteger(r.teamSize));
  const leadMonths = totalMonths(ledRoles, asOf);
  const teamSizes = [...ledRoles]
    .sort((a, b) => toMonthIndex(a.start) - toMonthIndex(b.start))
    .map(r => r.teamSize);
  const firstStart = roles.map(r => r.start).sort()[0] ?? null;
  const leadPeriods = [...ledRoles]
    .sort((a, b) => toMonthIndex(a.start) - toMonthIndex(b.start))
    .map(r => ({ start: r.start, end: r.end }));
  const mes = achievements.filter(a => a.tags?.includes('mes-deployment'));

  return {
    experience: { years: Math.floor(expMonths / 12), months: expMonths, since: firstStart },
    leadership: { years: Math.floor(leadMonths / 12), months: leadMonths, periods: leadPeriods },
    teamSizes,
    mesDeployments: {
      total: mes.length,
      led: mes.filter(a => a.tags.includes('led')).length,
      contributed: mes.filter(a => a.tags.includes('contributed')).length
    }
  };
}

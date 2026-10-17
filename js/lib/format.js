// Textos derivados de los datos (sin DOM), para poder probarlos con node --test.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2014-05" -> "May 2014" */
export function monthYear(ym) {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** 141 meses -> { value: 11, plus: true }: "11+" solo si hay meses por encima de los años completos. */
export function yearsFigure(months) {
  const value = Math.floor(months / 12);
  return { value, plus: months > value * 12 };
}

/** [{start:'2018-05', end:'2020-04'}, {start:'2022-01', end:null}] -> "2018–2020 · 2022–now" */
export function periodsLabel(periods) {
  return periods
    .map(p => `${p.start.slice(0, 4)}–${p.end ? p.end.slice(0, 4) : 'now'}`)
    .join(' · ');
}

/** { led: 1, contributed: 1 } -> "1 led · 1 contributed" (omite los ceros) */
export function mesNote({ led, contributed }) {
  return [led && `${led} led`, contributed && `${contributed} contributed`].filter(Boolean).join(' · ');
}

const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "2026-10" -> "October 2026" (fecha de actualización del pie) */
export function monthYearLong(ym) {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS_LONG[m - 1]} ${y}`;
}

/** Fechas de un estudio: "Aug 2008 – Dec 2013", "Expected 2028" o null si no tiene fechas. */
export function educationWhen(e) {
  if (e.status === 'in-progress') return `Expected ${e.expected}`;
  if (e.start && e.end) return `${monthYear(e.start)} – ${monthYear(e.end)}`;
  return null;
}

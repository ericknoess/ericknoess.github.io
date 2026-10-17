import { readFileSync } from 'node:fs';

export const loadProfile = () =>
  JSON.parse(readFileSync(new URL('../content/profile.json', import.meta.url), 'utf8'));

// Fecha de referencia fija para que las pruebas no dependan del día en que se ejecutan.
export const AS_OF = '2026-10';

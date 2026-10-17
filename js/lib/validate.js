// Reglas del modelo de datos (RNF-05). Se ejecutan en las pruebas y en el navegador
// antes de pintar la página: si hay errores, la página muestra el estado de error.

export const SOURCES = ['cv-current', 'cv-2018', 'user'];
export const EDUCATION_STATUS = ['completed', 'in-progress'];
const YM = /^\d{4}-(0[1-9]|1[0-2])$/;

const isNonEmptyString = v => typeof v === 'string' && v.trim().length > 0;

/**
 * Valida la estructura y la integridad referencial de profile.json.
 * @returns {string[]} lista de errores (vacía si todo es correcto)
 */
export function validateProfile(data) {
  const errors = [];
  const err = (path, msg) => errors.push(`${path}: ${msg}`);

  if (!data || typeof data !== 'object') return ['root: no es un objeto'];

  const checkSource = (path, source) => {
    if (!Array.isArray(source) || source.length === 0) return err(path, 'source debe ser una lista no vacía');
    for (const s of source) if (!SOURCES.includes(s)) err(path, `source desconocido "${s}"`);
  };
  const checkApproved = (path, item) => {
    if (typeof item.approved !== 'boolean') err(path, 'approved debe ser true o false');
  };
  const checkDates = (path, item, { allowOpenEnd }) => {
    if (!YM.test(item.start ?? '')) err(path, `start "${item.start}" no tiene formato YYYY-MM`);
    if (item.end === null) {
      if (!allowOpenEnd) err(path, 'end no puede ser null');
    } else if (!YM.test(item.end ?? '')) {
      err(path, `end "${item.end}" no tiene formato YYYY-MM`);
    } else if (YM.test(item.start ?? '') && item.start >= item.end) {
      err(path, `start (${item.start}) debe ser anterior a end (${item.end})`);
    }
  };

  // Fecha de actualización (se muestra en el pie)
  if (!YM.test(data.meta?.lastUpdated ?? '')) err('meta.lastUpdated', 'obligatorio, con formato YYYY-MM');

  // Perfil
  const p = data.profile;
  if (!p) err('profile', 'falta');
  else {
    for (const k of ['name', 'headline', 'location', 'linkedinUrl']) if (!isNonEmptyString(p[k])) err(`profile.${k}`, 'obligatorio');
    if (p.linkedinUrl && !/^https:\/\/www\.linkedin\.com\/in\/[\x21-\x7E]+$/.test(p.linkedinUrl)) err('profile.linkedinUrl', 'debe ser una URL https de LinkedIn codificada (sin espacios ni acentos)');
    if (!p.photo || !isNonEmptyString(p.photo.src) || !isNonEmptyString(p.photo.alt)) err('profile.photo', 'requiere src y alt');
    checkSource('profile', p.source);
  }

  // Ids únicos entre puestos y logros (las evidencias pueden apuntar a ambos)
  const roles = Array.isArray(data.roles) ? data.roles : (err('roles', 'debe ser una lista'), []);
  const achievements = Array.isArray(data.achievements) ? data.achievements : (err('achievements', 'debe ser una lista'), []);
  const ids = new Map();
  for (const item of [...roles, ...achievements]) {
    if (!isNonEmptyString(item.id)) { err('id', 'falta un id'); continue; }
    if (ids.has(item.id)) err(item.id, 'id duplicado');
    ids.set(item.id, item);
  }
  const roleById = new Map(roles.map(r => [r.id, r]));

  // Puestos
  roles.forEach(r => {
    const path = `roles.${r.id}`;
    for (const k of ['company', 'title', 'location']) if (!isNonEmptyString(r[k])) err(path, `${k} obligatorio`);
    checkDates(path, r, { allowOpenEnd: true });
    if (r.teamSize !== undefined && !(Number.isInteger(r.teamSize) && r.teamSize > 0)) err(path, 'teamSize debe ser un entero positivo');
    if (!Array.isArray(r.chips)) err(path, 'chips debe ser una lista');
    if (!Array.isArray(r.achievementIds)) err(path, 'achievementIds debe ser una lista');
    else for (const aid of r.achievementIds) {
      const a = ids.get(aid);
      if (!a || roleById.has(aid)) err(path, `achievementIds apunta a "${aid}", que no es un logro`);
      else if (a.roleId !== r.id) err(path, `el logro "${aid}" pertenece a "${a.roleId}"`);
    }
    checkSource(path, r.source);
    checkApproved(path, r);
  });

  // Logros
  achievements.forEach(a => {
    const path = `achievements.${a.id}`;
    if (!roleById.has(a.roleId)) err(path, `roleId "${a.roleId}" no existe`);
    else if (!roleById.get(a.roleId).achievementIds?.includes(a.id)) err(path, `no aparece en achievementIds de "${a.roleId}"`);
    if (!isNonEmptyString(a.text)) err(path, 'text obligatorio');
    if (a.source?.includes('cv-2018') && !isNonEmptyString(a.originalText)) err(path, 'un logro traducido del CV-2018 necesita originalText');
    for (const m of a.metrics ?? []) {
      for (const k of ['id', 'display', 'label', 'spoken', 'evidence']) if (!isNonEmptyString(m[k])) err(`${path}.metrics`, `${k} obligatorio`);
      if (isNonEmptyString(m.evidence) && !a.text.includes(m.evidence)) err(`${path}.metrics.${m.id}`, 'evidence no aparece literalmente en el texto del logro');
    }
    checkSource(path, a.source);
    checkApproved(path, a);
  });

  // Capacidades
  (data.capabilities ?? []).forEach(c => {
    const path = `capabilities.${c.id}`;
    for (const k of ['id', 'title', 'summary']) if (!isNonEmptyString(c[k])) err(path, `${k} obligatorio`);
    if (!Array.isArray(c.evidence) || c.evidence.length === 0) err(path, 'necesita al menos una evidencia');
    else for (const ev of c.evidence) {
      if (!ids.has(ev.ref)) err(path, `la evidencia "${ev.ref}" no existe`);
      if (!isNonEmptyString(ev.label)) err(path, `la evidencia "${ev.ref}" necesita label`);
    }
    checkApproved(path, c);
  });

  // Competencias (texto literal del CV, sin niveles)
  (data.competencies ?? []).forEach((g, i) => {
    const path = `competencies[${i}]`;
    if (!isNonEmptyString(g.category)) err(path, 'category obligatoria');
    if (!Array.isArray(g.items) || !g.items.every(isNonEmptyString)) err(path, 'items debe ser una lista de textos');
    if (g.items?.some(t => /\d+\s*%/.test(t))) err(path, 'las competencias no llevan niveles ni porcentajes');
  });

  // Formación
  (data.education ?? []).forEach(e => {
    const path = `education.${e.id}`;
    for (const k of ['id', 'institution', 'program']) if (!isNonEmptyString(e[k])) err(path, `${k} obligatorio`);
    if (!EDUCATION_STATUS.includes(e.status)) err(path, `status "${e.status}" no válido`);
    if (e.start !== undefined || e.end !== undefined) checkDates(path, e, { allowOpenEnd: false });
    if (e.status === 'in-progress' && !/^\d{4}$/.test(e.expected ?? '')) err(path, 'en curso requiere expected (YYYY)');
    checkSource(path, e.source);
    checkApproved(path, e);
  });

  // Idiomas
  (data.languages ?? []).forEach((l, i) => {
    if (!isNonEmptyString(l.name) || !isNonEmptyString(l.level)) err(`languages[${i}]`, 'name y level obligatorios');
    checkSource(`languages[${i}]`, l.source);
  });

  return errors;
}

/**
 * Devuelve solo lo que se puede publicar:
 * - quita puestos, logros, capacidades y formación con approved = false;
 * - quita los logros de puestos no publicados;
 * - quita evidencias que apuntan a elementos no publicados, y las capacidades que se quedan sin evidencia.
 * No modifica el objeto original.
 */
export function publishable(data) {
  const roles = data.roles.filter(r => r.approved);
  const roleIds = new Set(roles.map(r => r.id));
  const achievements = data.achievements.filter(a => a.approved && roleIds.has(a.roleId));
  const achIds = new Set(achievements.map(a => a.id));
  const visible = new Set([...roleIds, ...achIds]);

  return {
    ...data,
    roles: roles.map(r => ({ ...r, achievementIds: r.achievementIds.filter(id => achIds.has(id)) })),
    achievements,
    capabilities: (data.capabilities ?? [])
      .filter(c => c.approved)
      .map(c => ({ ...c, evidence: c.evidence.filter(ev => visible.has(ev.ref)) }))
      .filter(c => c.evidence.length > 0),
    education: (data.education ?? []).filter(e => e.approved)
  };
}

// Crea elementos del DOM sin usar innerHTML: el texto siempre se inserta como texto,
// nunca como HTML, así que ningún dato puede inyectar código en la página.
//
//   h('a', { class: 'btn', href: url }, 'LinkedIn', h('span', { 'aria-hidden': 'true', text: '↗' }))
//
// Props especiales: `class` (className) y `text` (textContent). El resto son atributos;
// `true` crea un atributo vacío y `null`/`undefined`/`false` lo omiten.
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key === 'text') el.textContent = value;
    else el.setAttribute(key, value === true ? '' : String(value));
  }
  for (const child of children.flat()) {
    if (child == null || child === false) continue;
    el.append(child instanceof Node ? child : String(child));
  }
  return el;
}

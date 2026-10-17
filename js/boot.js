// Se ejecuta antes de pintar: oculta el encabezado hasta que la animación de entrada fije su estado inicial,
// para que no parpadee. Red de seguridad: si la animación no arranca en 2,5 s, el contenido se muestra igual.
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var root = document.documentElement;
  root.classList.add('anim-pending');
  setTimeout(function () { root.classList.remove('anim-pending'); }, 2500);
})();

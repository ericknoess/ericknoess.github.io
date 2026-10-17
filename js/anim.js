// Animaciones con GSAP (vendor/gsap). Son solo una capa decorativa:
// - si GSAP no carga, la página se ve completa y estática;
// - con "reducir movimiento" activado en el sistema, no se anima nada;
// - no hay scroll-jacking ni secciones fijadas: el scroll siempre es el del navegador.

const root = document.documentElement;
const reveal = () => root.classList.remove('anim-pending');

/** Lanza las animaciones. Se llama cuando el contenido ya está pintado. */
export function animate() {
  const { gsap, ScrollTrigger, SplitText } = window;
  if (!gsap || !ScrollTrigger || !SplitText) { reveal(); return; }
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // Si la red de seguridad de boot.js ya mostró el encabezado, no se repite su entrada (evita un parpadeo).
  const heroPending = root.classList.contains('anim-pending');
  const $$ = (sel, scope = document) => gsap.utils.toArray(scope.querySelectorAll(sel));

  // Cifras: cuentan desde 0 hasta el valor final, que ya está escrito en el HTML.
  // Los lectores de pantalla leen el texto accesible (sr-only), no estos números.
  const countUp = (scope, delay = 0) => $$('[data-to]', scope).forEach(el => {
    const obj = { v: 0 }, to = Number(el.dataset.to);
    gsap.to(obj, { v: to, duration: 1.4, delay, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(obj.v); } });
  });

  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const cleanups = [];   // se ejecutan si cambia la preferencia de movimiento
    // 1) Entrada del encabezado
    if (heroPending) {
      const name = document.querySelector('.hero .name');
      const photo = document.querySelector('.portrait .photo');
      const stats = $$('.stat');
      const split = SplitText.create(name, { type: 'words,chars', mask: 'words' });
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onStart: reveal, onComplete: () => split.revert() });
      tl.from('.hero-bg', { opacity: 0, duration: 1.2 }, 0)
        .from(split.chars, { yPercent: 110, duration: 0.7, stagger: 0.018 }, 0.1)
        .from('.hero .headline', { y: 16, opacity: 0, duration: 0.6 }, 0.45)
        .from('.hero .meta, .hero .actions', { y: 16, opacity: 0, duration: 0.6, stagger: 0.08 }, 0.55);
      if (photo) {
        // Cortinilla de abajo arriba con el mismo radio que el CSS (22 px en escritorio, 16 px en móvil)
        const radius = getComputedStyle(photo).borderTopLeftRadius;
        tl.from(photo, { clipPath: `inset(100% 0% 0% 0% round ${radius})`, scale: 1.08, duration: 1.0, ease: 'expo.out' }, 0.2)
          .to('.portrait .shine', { xPercent: 240, duration: 1.1, ease: 'power2.inOut' }, 1.0);
      }
      // Cifras: el panel entra completo (si se animaran las fichas, se vería su fondo gris) y luego su contenido
      if (stats.length) {
        tl.from('.stats', { y: 24, opacity: 0, duration: 0.6, onStart: () => countUp(document.querySelector('.stats')) }, 0.6)
          .from(stats.map(s => s.children), { y: 10, opacity: 0, duration: 0.5, stagger: 0.08 }, 0.7);
      }
      cleanups.push(() => split.revert());
    } else {
      reveal();
    }

    // Rejilla de fondo con deriva lenta; se pausa cuando el encabezado sale de la pantalla
    gsap.to('.hero-bg', { backgroundPosition: '44px 44px', duration: 8, ease: 'none', repeat: -1,
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', toggleActions: 'play pause resume pause' } });

    // Inclinación sutil de la foto al mover el ratón (solo con puntero fino)
    const photo = document.querySelector('.portrait .photo');
    if (photo && matchMedia('(pointer: fine)').matches) {
      const rx = gsap.quickTo(photo, 'rotationX', { duration: 0.6, ease: 'power3' });
      const ry = gsap.quickTo(photo, 'rotationY', { duration: 0.6, ease: 'power3' });
      const move = e => {
        const r = photo.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 10);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 10);
      };
      const leave = () => { rx(0); ry(0); };
      photo.addEventListener('pointermove', move);
      photo.addEventListener('pointerleave', leave);
      cleanups.push(() => { photo.removeEventListener('pointermove', move); photo.removeEventListener('pointerleave', leave); });
    }

    // 2) Progreso de lectura en la barra de navegación
    if (document.querySelector('nav.anchors .progress')) {
      gsap.to('nav.anchors .progress', { scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: '#main', start: 'top 120px', end: 'bottom bottom', scrub: 0.3 } });
    }

    // 3) Títulos de sección: la línea se dibuja y el título sube
    $$('#main section').forEach(sec => {
      gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top 80%', once: true } })
        .from(sec.querySelector('.rule'), { scaleX: 0, duration: 0.8, ease: 'power2.out' }, 0)
        .from(sec.querySelectorAll('h2, .lede'), { y: 20, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' }, 0.05);
    });

    // 4) Tarjetas de impacto con conteo
    ScrollTrigger.batch('.card', { start: 'top 85%', once: true, onEnter: els => {
      gsap.from(els, { y: 40, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' });
      els.forEach((el, i) => countUp(el, i * 0.1));
    } });

    // 5) Capacidades, competencias y formación
    ScrollTrigger.batch('.caps > li', { start: 'top 88%', once: true,
      onEnter: els => gsap.from(els, { x: -30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }) });
    ScrollTrigger.batch('.tags li', { start: 'top 92%', once: true,
      onEnter: els => gsap.from(els, { scale: 0.85, opacity: 0, duration: 0.4, stagger: 0.03, ease: 'back.out(2)' }) });
    ScrollTrigger.batch('.edu-list li, .lang li', { start: 'top 92%', once: true,
      onEnter: els => gsap.from(els, { y: 16, opacity: 0, duration: 0.5, stagger: 0.07 }) });

    // 6) Línea de tiempo: la línea crece con el scroll y los nodos se encienden
    if (document.querySelector('.tl-wrap')) {
      gsap.from('.tl-line', { scaleY: 0, ease: 'none',
        scrollTrigger: { trigger: '.tl-wrap', start: 'top 70%', end: 'bottom 70%', scrub: 0.4 } });
    }
    $$('.role').forEach(role => {
      gsap.timeline({ scrollTrigger: { trigger: role, start: 'top 75%', once: true } })
        .from(role.querySelector('.node'), { scale: 0, duration: 0.4, ease: 'back.out(3)' }, 0)
        .from(role.querySelectorAll('.when, .role-title, .org, .chips, details'), { y: 18, opacity: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' }, 0.05);
    });

    return () => cleanups.forEach(fn => fn());
  });

  // Con "reducir movimiento" no se anima nada: solo se muestra el encabezado.
  mm.add('(prefers-reduced-motion: reduce)', reveal);

  // Abrir o cerrar un desplegable cambia la altura de la página: hay que recalcular los puntos de disparo
  // (si no, al cerrar uno, el contenido del final podría no llegar a mostrarse). refresh() restaura el scroll
  // y cortaría el desplazamiento hacia una evidencia, así que se espera a que el scroll esté quieto.
  let timer;
  const refreshWhenIdle = () => {
    const y = window.scrollY;
    clearTimeout(timer);
    timer = setTimeout(() => (window.scrollY === y ? ScrollTrigger.refresh() : refreshWhenIdle()), 150);
  };
  document.addEventListener('toggle', refreshWhenIdle, true);
}

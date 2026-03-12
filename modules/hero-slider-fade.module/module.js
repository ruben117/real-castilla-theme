(function () {
  const roots = document.querySelectorAll('[data-rc-hero]');
  if (!roots.length) return;

  roots.forEach((root) => {
    const slides  = Array.from(root.querySelectorAll('[data-slide]'));
    const bullets = Array.from(root.querySelectorAll('[data-bullet]'));
    if (slides.length < 2) return;

    const autoplay = root.getAttribute('data-autoplay') === 'true';
    const interval = parseInt(root.getAttribute('data-interval') || '6500', 10);

    let index = 0;
    let timer = null;

    /**
     * Re-dispara las animaciones CSS en los elementos del slide activo.
     * Forzamos un reflow (offsetWidth) para que el navegador reinicie
     * la animación aunque el elemento ya haya pasado por ella antes.
     */
    function restartAnimations(slide) {
      const targets = slide.querySelectorAll(
        '.rc-hero-headline, .hero-subheadline, .hero-divider, .btn'
      );
      targets.forEach((el) => {
        el.style.animation = 'none';
        // Reflow — necesario para reiniciar la animación CSS
        // eslint-disable-next-line no-unused-expressions
        el.offsetWidth;
        el.style.animation = '';
      });
    }

    function setActive(i) {
      index = (i + slides.length) % slides.length;

      slides.forEach((s, si) => {
        const wasActive = s.classList.contains('is-active');
        const willBeActive = si === index;

        s.classList.toggle('is-active', willBeActive);
        s.style.pointerEvents = willBeActive ? 'auto' : 'none';

        // Relanzar animaciones sólo al slide que se activa
        if (willBeActive && !wasActive) {
          restartAnimations(s);
        }
      });

      bullets.forEach((b) => {
        const bi     = parseInt(b.getAttribute('data-bullet') || '0', 10);
        const active = bi === index;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }

    function start() {
      stop();
      if (!autoplay) return;
      timer = window.setInterval(() => setActive(index + 1), interval);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    // Navegación por bullets
    root.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-bullet]');
      if (!btn) return;
      const bi = parseInt(btn.getAttribute('data-bullet') || '0', 10);
      setActive(bi);
      start();
    });

    // Pausar en hover
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);

    // Inicializar
    setActive(0);
    start();

    // Corregir alturas en resize (algunos navegadores móviles cambian vh)
    window.addEventListener('resize', () => setActive(index), { passive: true });
  });
})();
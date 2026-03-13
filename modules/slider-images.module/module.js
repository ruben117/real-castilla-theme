(function () {
  const sliders = document.querySelectorAll('[data-rc-slider]');
  if (!sliders.length) return;

  sliders.forEach((root) => {
    const track = root.querySelector('[data-rc-track]');
    const viewport = root.querySelector('[data-rc-viewport]') || root; // por si no existe
    const slides = Array.from(root.querySelectorAll('[data-rc-slide]'));
    const btnPrev = root.querySelector('[data-rc-prev]');
    const btnNext = root.querySelector('[data-rc-next]');

    if (!track || slides.length === 0) return;

    let index = 0;

    // ===== Helpers =====
    function applyClasses() {
      slides.forEach((s) => s.classList.remove('is-active', 'is-peek'));
      if (slides[index]) slides[index].classList.add('is-active');

      const peekIndex = (index + 2) % slides.length;
      if (slides[peekIndex]) slides[peekIndex].classList.add('is-peek');
    }

    function updateMediaHeight() {
      const activeSlide = slides[index];
      if (!activeSlide) return;

      const media = activeSlide.querySelector('.rc-models-slide__media');
      if (!media) return;

      // Ajusta ratio si lo necesitas: 10/16 (0.625) o 3/4 (0.75)
      const ratio = 10 / 16;

      const w = media.getBoundingClientRect().width;
      if (!w) return;

      const h = Math.round(w * ratio);
      root.style.setProperty('--rc-media-h', `${h}px`);
    }

    function getTranslateX(el) {
      const style = window.getComputedStyle(el);
      const transform = style.transform || style.webkitTransform;
      if (!transform || transform === 'none') return 0;

      // matrix(a,b,c,d,tx,ty)
      const match2d = transform.match(/^matrix\((.+)\)$/);
      if (match2d) {
        const parts = match2d[1].split(',').map((p) => parseFloat(p.trim()));
        return parts[4] || 0;
      }

      // matrix3d(..., tx, ty, tz)
      const match3d = transform.match(/^matrix3d\((.+)\)$/);
      if (match3d) {
        const parts = match3d[1].split(',').map((p) => parseFloat(p.trim()));
        return parts[12] || 0;
      }

      return 0;
    }

    function translateToIndex() {
      const slide = slides[index];
      if (!slide) return;
      const offsetLeft = slide.offsetLeft;
      track.style.transform = `translateX(${-offsetLeft}px)`;
    }

    function goTo(newIndex) {
      index = (newIndex + slides.length) % slides.length;
      applyClasses();

      requestAnimationFrame(() => {
        updateMediaHeight();
        translateToIndex();
      });
    }

    // ===== Botones =====
    btnPrev && btnPrev.addEventListener('click', () => goTo(index - 1));
    btnNext && btnNext.addEventListener('click', () => goTo(index + 1));

    // ===== Click / Tap en slide =====
    slides.forEach((slideEl) => {
      slideEl.addEventListener('click', (e) => {
        // si el usuario está clicando un link/botón dentro del slide activo, no interferimos
        const isLink = e.target.closest('a, button');
        if (isLink) return;

        const i = parseInt(slideEl.getAttribute('data-index') || '0', 10);
        if (!Number.isNaN(i)) goTo(i);
      });
    });

    // ===== Drag / Swipe =====
    let isDown = false;
    let startX = 0;
    let lastX = 0;
    let startTranslate = 0;
    let dragged = false;

    const DRAG_THRESHOLD = 35; // px para considerar swipe
    const CLICK_SUPPRESS = 8;  // px para anular click cuando ya arrastró

    function onDown(clientX) {
      isDown = true;
      dragged = false;
      startX = clientX;
      lastX = clientX;

      // empieza desde la posición actual
      startTranslate = getTranslateX(track);

      // durante drag, sin transición
      track.style.transition = 'none';

      root.classList.add('is-dragging');
    }

    function onMove(clientX) {
      if (!isDown) return;
      lastX = clientX;

      const dx = clientX - startX;
      if (Math.abs(dx) > CLICK_SUPPRESS) dragged = true;

      // mover track según el drag
      const nextTranslate = startTranslate + dx;
      track.style.transform = `translateX(${nextTranslate}px)`;
    }

    function onUp() {
      if (!isDown) return;
      isDown = false;

      // restaurar transición
      track.style.transition = '';

      root.classList.remove('is-dragging');

      const dx = lastX - startX;

      if (Math.abs(dx) >= DRAG_THRESHOLD) {
        // swipe: dx < 0 => mover a la derecha (next)
        if (dx < 0) goTo(index + 1);
        else goTo(index - 1);
      } else {
        // snap back
        translateToIndex();
      }
    }

    // Pointer Events (mejor soporte cross-device)
    viewport.addEventListener('pointerdown', (e) => {
      // solo primary button/touch
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      // si empieza en un elemento interactivo (botones/links), no iniciamos drag
      if (e.target.closest('a, button, input, select, textarea, label')) return;

      viewport.setPointerCapture && viewport.setPointerCapture(e.pointerId);
      onDown(e.clientX);
    });

    viewport.addEventListener('pointermove', (e) => onMove(e.clientX));
    viewport.addEventListener('pointerup', onUp);
    viewport.addEventListener('pointercancel', onUp);
    viewport.addEventListener('pointerleave', () => {
      // si sale el puntero durante drag, cerramos
      if (isDown) onUp();
    });

    // Evita click fantasma después de drag (muy común en mobile)
    viewport.addEventListener('click', (e) => {
      if (!dragged) return;
      // si arrastró, cancelamos el click
      e.preventDefault();
      e.stopPropagation();
      dragged = false;
    }, true);

    // Teclado
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') goTo(index - 1);
      if (e.key === 'ArrowRight') goTo(index + 1);
    });

    // Init + resize + load
    goTo(0);
    window.addEventListener('resize', () => {
      updateMediaHeight();
      translateToIndex();
    });
    window.addEventListener('load', () => updateMediaHeight());
  });
})();
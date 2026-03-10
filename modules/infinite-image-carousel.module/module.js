(function () {
  const carousels = document.querySelectorAll('[data-rc-carousel]');
  if (!carousels.length) return;

  carousels.forEach((root) => {
    const viewport = root.querySelector('[data-rc-viewport]');
    const track = root.querySelector('[data-rc-track]');
    const btnPrev = root.querySelector('[data-rc-prev]');
    const btnNext = root.querySelector('[data-rc-next]');
    const bullets = Array.from(root.querySelectorAll('[data-rc-bullet]'));

    if (!viewport || !track) return;

    let slides = Array.from(track.querySelectorAll('[data-rc-slide]'));
    const realCount = slides.length;
    if (realCount === 0) return;

    // ===== Clone for infinite (1 at each side is enough for 1-step moves) =====
    // We clone all to make it robust even with few slides
    const fragHead = document.createDocumentFragment();
    const fragTail = document.createDocumentFragment();

    slides.forEach((s) => {
      const c1 = s.cloneNode(true);
      c1.setAttribute('data-clone', 'true');
      fragTail.appendChild(c1);

      const c2 = s.cloneNode(true);
      c2.setAttribute('data-clone', 'true');
      fragHead.appendChild(c2);
    });

    track.insertBefore(fragHead, track.firstChild);
    track.appendChild(fragTail);

    slides = Array.from(track.querySelectorAll('[data-rc-slide]'));
    const cloneCount = realCount; // at head and tail

    // Start at first real slide
    let realIndex = 0;
    let index = cloneCount + realIndex;

    // ===== Helpers =====
    function setClasses() {
      slides.forEach((s) => s.classList.remove('is-active', 'is-peek'));

      const active = slides[index];
      if (active) active.classList.add('is-active');

      const peek = slides[(index + 2) % slides.length];
      if (peek) peek.classList.add('is-peek');
    }

    function updateBullets() {
      bullets.forEach((b) => b.classList.remove('is-active'));
      const b = bullets[realIndex];
      if (b) b.classList.add('is-active');
    }

    function updateMediaHeight() {
      const active = slides[index];
      if (!active) return;
      const media = active.querySelector('.rc-img-slide__media');
      if (!media) return;

      const ratio = 10 / 16; // ajusta si quieres más alto
      const w = media.getBoundingClientRect().width;
      if (!w) return;
      root.style.setProperty('--rc-media-h', `${Math.round(w * ratio)}px`);
    }

    function translateToIndex(withAnim = true) {
      if (!withAnim) track.style.transition = 'none';
      else track.style.transition = '';

      const target = slides[index];
      if (!target) return;

      track.style.transform = `translateX(${-target.offsetLeft}px)`;
    }

    function normalizeIfNeeded() {
      // If we move into clones region, jump (no animation) to same real slide in real region
      if (index >= cloneCount + realCount) {
        index = cloneCount + realIndex;
        translateToIndex(false);
        requestAnimationFrame(() => (track.style.transition = ''));
      }
      if (index < cloneCount) {
        index = cloneCount + realIndex;
        translateToIndex(false);
        requestAnimationFrame(() => (track.style.transition = ''));
      }
    }

    function goToReal(nextRealIndex) {
      realIndex = (nextRealIndex + realCount) % realCount;
      index = cloneCount + realIndex;

      setClasses();
      updateBullets();

      requestAnimationFrame(() => {
        updateMediaHeight();
        translateToIndex(true);
      });
    }

    function step(dir) {
      realIndex = (realIndex + dir + realCount) % realCount;
      index = cloneCount + realIndex;

      setClasses();
      updateBullets();

      requestAnimationFrame(() => {
        updateMediaHeight();
        translateToIndex(true);
      });
    }

    // ===== Nav Buttons =====
    btnPrev && btnPrev.addEventListener('click', () => step(-1));
    btnNext && btnNext.addEventListener('click', () => step(1));

    // ===== Bullets =====
    bullets.forEach((b) => {
      b.addEventListener('click', () => {
        const i = parseInt(b.getAttribute('data-rc-bullet') || '0', 10);
        if (!Number.isNaN(i)) goToReal(i);
      });
    });

    // ===== Click slide to activate =====
    track.addEventListener('click', (e) => {
      const el = e.target.closest('[data-rc-slide]');
      if (!el) return;

      // avoid click when dragging
      if (root.classList.contains('is-dragging')) return;

      const real = parseInt(el.getAttribute('data-index') || '0', 10);
      if (Number.isNaN(real)) return;

      goToReal(real);
    });

    // ===== Drag / Swipe =====
    let isDown = false;
    let startX = 0;
    let lastX = 0;
    let startTranslate = 0;
    let dragged = false;

    const DRAG_THRESHOLD = 35;

    function getTranslateX() {
      const style = window.getComputedStyle(track);
      const t = style.transform;
      if (!t || t === 'none') return 0;
      const m2d = t.match(/^matrix\((.+)\)$/);
      if (m2d) return parseFloat(m2d[1].split(',')[4]) || 0;
      const m3d = t.match(/^matrix3d\((.+)\)$/);
      if (m3d) return parseFloat(m3d[1].split(',')[12]) || 0;
      return 0;
    }

    function onDown(x) {
      isDown = true;
      dragged = false;
      startX = x;
      lastX = x;
      startTranslate = getTranslateX();
      track.style.transition = 'none';
      root.classList.add('is-dragging');
    }

    function onMove(x) {
      if (!isDown) return;
      lastX = x;
      const dx = x - startX;
      if (Math.abs(dx) > 8) dragged = true;
      track.style.transform = `translateX(${startTranslate + dx}px)`;
    }

    function onUp() {
      if (!isDown) return;
      isDown = false;

      root.classList.remove('is-dragging');
      track.style.transition = '';

      const dx = lastX - startX;

      if (Math.abs(dx) >= DRAG_THRESHOLD) {
        if (dx < 0) step(1);
        else step(-1);
      } else {
        translateToIndex(true);
      }

      // normalize after transition ends
      track.addEventListener(
        'transitionend',
        () => {
          normalizeIfNeeded();
        },
        { once: true }
      );
    }

    viewport.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      viewport.setPointerCapture && viewport.setPointerCapture(e.pointerId);
      onDown(e.clientX);
    });

    viewport.addEventListener('pointermove', (e) => onMove(e.clientX));
    viewport.addEventListener('pointerup', onUp);
    viewport.addEventListener('pointercancel', onUp);

    // prevent ghost click after drag
    viewport.addEventListener(
      'click',
      (e) => {
        if (!dragged) return;
        e.preventDefault();
        e.stopPropagation();
        dragged = false;
      },
      true
    );

    // ===== Init =====
    setClasses();
    updateBullets();

    requestAnimationFrame(() => {
      updateMediaHeight();
      translateToIndex(false);
      requestAnimationFrame(() => (track.style.transition = ''));
    });

    window.addEventListener('resize', () => {
      updateMediaHeight();
      translateToIndex(false);
      requestAnimationFrame(() => (track.style.transition = ''));
    });
  });
})();
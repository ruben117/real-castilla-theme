(function () {
  const roots = document.querySelectorAll('[data-rc-hero]');
  if (!roots.length) return;

  roots.forEach((root) => {
    const slides = Array.from(root.querySelectorAll('[data-slide]'));
    const bullets = Array.from(root.querySelectorAll('[data-bullet]'));
    if (slides.length < 2) return;

    const autoplay = root.getAttribute('data-autoplay') === 'true';
    const interval = parseInt(root.getAttribute('data-interval') || '6500', 10);

    let index = 0;
    let timer = null;

    function setActive(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, si) => s.classList.toggle('is-active', si === index));
      bullets.forEach((b) => {
        const bi = parseInt(b.getAttribute('data-bullet') || '0', 10);
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

    root.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-bullet]');
      if (!btn) return;
      const bi = parseInt(btn.getAttribute('data-bullet') || '0', 10);
      setActive(bi);
      start();
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);

    setActive(0);
    start();

    window.addEventListener('resize', () => setActive(index));
  });
})();
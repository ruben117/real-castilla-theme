(function () {
  var roots = document.querySelectorAll('[data-lv-hero]');
  if (!roots.length) return;

  roots.forEach(function (root) {
    var slides  = Array.from(root.querySelectorAll('[data-lv-slide]'));
    var bullets = Array.from(root.querySelectorAll('[data-lv-bullet]'));

    if (slides.length < 2) return;

    var autoplay = root.getAttribute('data-autoplay') === 'true';
    var interval = parseInt(root.getAttribute('data-interval') || '6000', 10);
    var index    = 0;
    var timer    = null;

    function setActive(i) {
      index = (i + slides.length) % slides.length;

      slides.forEach(function (s, si) {
        var active = si === index;
        s.classList.toggle('is-active', active);
        s.setAttribute('aria-hidden', active ? 'false' : 'true');
      });

      bullets.forEach(function (b) {
        var bi     = parseInt(b.getAttribute('data-lv-bullet') || '0', 10);
        var active = bi === index;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }

    function start() {
      stop();
      if (!autoplay) return;
      timer = window.setInterval(function () { setActive(index + 1); }, interval);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    // Navegación por bullets
    root.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-lv-bullet]');
      if (!btn) return;
      setActive(parseInt(btn.getAttribute('data-lv-bullet') || '0', 10));
      start();
    });

    // Pausar en hover
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);

    setActive(0);
    start();

    window.addEventListener('resize', function () { setActive(index); }, { passive: true });
  });
}());

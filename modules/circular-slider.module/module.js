(function () {
  'use strict';

  function initCircularSlider(section) {
    var track    = section.querySelector('[data-cs-track]');
    var prevBtn  = section.querySelector('[data-cs-prev]');
    var nextBtn  = section.querySelector('[data-cs-next]');
    var slides   = section.querySelectorAll('[data-cs-slide]');
    var total    = slides.length;
    var current  = 0;

    if (!track || !prevBtn || !nextBtn || total === 0) return;

    function getVisibleCount() {
      var style = getComputedStyle(section);
      if (window.innerWidth <= 767) {
        return parseInt(style.getPropertyValue('--cs-count-mobile').trim(), 10) || 2;
      }
      return parseInt(style.getPropertyValue('--cs-count-desktop').trim(), 10) || 4;
    }

    function maxIndex() {
      return Math.max(0, total - getVisibleCount());
    }

    function update(animate) {
      if (animate === false) {
        track.style.transition = 'none';
      } else {
        track.style.transition = '';
      }

      var visible = getVisibleCount();
      var pct = (100 / visible) * current;
      track.style.transform = 'translateX(-' + pct + '%)';

      prevBtn.disabled = current <= 0;
      nextBtn.disabled = current >= maxIndex();
    }

    prevBtn.addEventListener('click', function () {
      if (current > 0) {
        current--;
        update();
      }
    });

    nextBtn.addEventListener('click', function () {
      if (current < maxIndex()) {
        current++;
        update();
      }
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        // Reajustar current si quedó fuera del nuevo rango
        var max = maxIndex();
        if (current > max) current = max;
        update(false);
        // Restaurar transición después del reposicionamiento
        requestAnimationFrame(function () {
          track.style.transition = '';
        });
      }, 150);
    });

    // Estado inicial
    update(false);
  }

  // Inicializar todos los sliders en la página
  document.querySelectorAll('[data-cs]').forEach(function (section) {
    initCircularSlider(section);
  });
}());

(function () {
  const sliders = document.querySelectorAll('[data-rc-slider]');
  if (!sliders.length) return;

  sliders.forEach((root) => {
    const track = root.querySelector('[data-rc-track]');
    const slides = Array.from(root.querySelectorAll('[data-rc-slide]'));
    const btnPrev = root.querySelector('[data-rc-prev]');
    const btnNext = root.querySelector('[data-rc-next]');

    if (!track || slides.length === 0) return;

    let index = 0;

    function applyClasses() {
      slides.forEach((s) => s.classList.remove('is-active', 'is-peek'));
      if (slides[index]) slides[index].classList.add('is-active');

      const peekIndex = (index + 2) % slides.length;
      if (slides[peekIndex]) slides[peekIndex].classList.add('is-peek');
    }

    function translate() {
      const slide = slides[index];
      if (!slide) return;
      const offsetLeft = slide.offsetLeft;
      track.style.transform = `translateX(${-offsetLeft}px)`;
    }

    function goTo(newIndex) {
      index = (newIndex + slides.length) % slides.length;
      applyClasses();
      requestAnimationFrame(translate);
    }

    btnPrev && btnPrev.addEventListener('click', () => goTo(index - 1));
    btnNext && btnNext.addEventListener('click', () => goTo(index + 1));

    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') goTo(index - 1);
      if (e.key === 'ArrowRight') goTo(index + 1);
    });

    goTo(0);
    window.addEventListener('resize', () => translate());
  });
})();
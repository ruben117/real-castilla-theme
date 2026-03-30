(function () {
  var burger = document.querySelector('.lv-nav__burger');
  var nav    = document.getElementById('lv-nav-list');

  if (!burger || !nav) return;

  burger.addEventListener('click', function () {
    var isOpen = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', String(!isOpen));
    nav.classList.toggle('lv-nav--open', !isOpen);
  });

  // Cierra el menú al hacer click en un enlace (mobile)
  nav.querySelectorAll('.lv-nav__link').forEach(function (link) {
    link.addEventListener('click', function () {
      burger.setAttribute('aria-expanded', 'false');
      nav.classList.remove('lv-nav--open');
    });
  });
}());

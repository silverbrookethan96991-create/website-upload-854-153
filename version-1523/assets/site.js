(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  var toggle = qs('[data-mobile-toggle]');
  var panel = qs('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  qsa('form[action="./search.html"]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = qs('input[name="q"]', form);
      if (input) {
        input.value = input.value.trim();
      }
    });
  });

  qsa('[data-hero]').forEach(function (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var index = 0;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  });

  qsa('[data-filter-root]').forEach(function (root) {
    var input = qs('[data-card-filter]', root);
    var cards = qsa('[data-movie-card]', root);
    var reset = qs('[data-filter-reset]', root);
    var chips = qsa('[data-filter-value]', root);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    function apply(value) {
      var needle = (value || '').trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        card.classList.toggle('is-hidden', needle.length > 0 && text.indexOf(needle) === -1);
      });
    }

    if (input) {
      if (initial && input.hasAttribute('data-query-sync')) {
        input.value = initial;
        apply(initial);
      }
      input.addEventListener('input', function () {
        apply(input.value);
      });
    }

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        apply('');
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var value = chip.getAttribute('data-filter-value') || '';
        if (input) {
          input.value = value;
        }
        apply(value);
      });
    });
  });
})();

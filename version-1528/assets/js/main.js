(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobileNav.hidden = expanded;
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var active = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === active);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === active);
    });
  }

  function startHero() {
    if (timer) {
      clearInterval(timer);
    }
    timer = setInterval(function () {
      showSlide(active + 1);
    }, 6200);
  }

  if (slides.length) {
    showSlide(0);
    startHero();
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
        startHero();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        startHero();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startHero();
      });
    });
  }

  var panel = document.querySelector('[data-filter-panel]');
  var grid = document.querySelector('[data-card-grid]');

  if (panel && grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var searchInput = panel.querySelector('[data-card-search]');
    var regionSelect = panel.querySelector('[data-card-region]');
    var typeSelect = panel.querySelector('[data-card-type]');
    var yearSelect = panel.querySelector('[data-card-year]');

    function fillSelect(select, values) {
      if (!select) {
        return;
      }
      values.filter(Boolean).sort().forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    function uniqueValues(name) {
      return Array.from(new Set(cards.map(function (card) {
        return card.getAttribute(name) || '';
      })));
    }

    fillSelect(regionSelect, uniqueValues('data-region'));
    fillSelect(typeSelect, uniqueValues('data-type'));
    fillSelect(yearSelect, uniqueValues('data-year'));

    function applyFilters() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();

        var matched = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (region && card.getAttribute('data-region') !== region) {
          matched = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          matched = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          matched = false;
        }
        card.hidden = !matched;
      });
    }

    [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  }
})();

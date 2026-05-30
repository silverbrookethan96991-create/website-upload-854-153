(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('.global-search-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        input && input.focus();
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterList = document.querySelector('[data-filter-list]');
  var activeCategory = 'all';

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function applyQueryFromUrl() {
    if (!filterInput) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      filterInput.value = query;
    }
  }

  function filterCards() {
    if (!filterList) {
      return;
    }
    var query = normalize(filterInput ? filterInput.value : '');
    var cards = filterList.querySelectorAll('[data-search-card]');
    cards.forEach(function (card) {
      var title = normalize(card.getAttribute('data-title'));
      var meta = normalize(card.getAttribute('data-meta'));
      var category = card.getAttribute('data-category') || 'all';
      var matchQuery = !query || title.indexOf(query) > -1 || meta.indexOf(query) > -1;
      var matchCategory = activeCategory === 'all' || category === activeCategory;
      card.classList.toggle('is-hidden', !(matchQuery && matchCategory));
    });
  }

  if (filterInput && filterList) {
    applyQueryFromUrl();
    filterInput.addEventListener('input', filterCards);
    filterCards();
  }

  document.querySelectorAll('[data-chip]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeCategory = chip.getAttribute('data-chip') || 'all';
      document.querySelectorAll('[data-chip]').forEach(function (other) {
        other.classList.toggle('is-active', other === chip);
      });
      filterCards();
    });
  });
})();

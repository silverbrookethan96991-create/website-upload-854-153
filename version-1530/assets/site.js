(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.menu-toggle');

    if (toggle && header) {
      toggle.addEventListener('click', function () {
        header.classList.toggle('open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var year = scope.querySelector('[data-filter-year]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-title]'));
      var empty = scope.querySelector('.empty-state');

      function applyFilter() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var selectedYear = year ? year.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region')
          ].join(' ').toLowerCase();
          var cardYear = card.getAttribute('data-year') || '';
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchYear = !selectedYear || cardYear === selectedYear;
          var ok = matchKeyword && matchYear;

          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.style.display = visible ? 'none' : 'block';
        }
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }
      if (year) {
        year.addEventListener('change', applyFilter);
      }
      applyFilter();
    });

    var searchRoot = document.querySelector('[data-search-page]');
    if (searchRoot && window.SITE_MOVIES) {
      var qInput = searchRoot.querySelector('[data-search-input]');
      var typeSelect = searchRoot.querySelector('[data-search-type]');
      var yearSelect = searchRoot.querySelector('[data-search-year]');
      var result = searchRoot.querySelector('[data-search-results]');
      var empty = searchRoot.querySelector('.empty-state');
      var params = new URLSearchParams(window.location.search);
      var firstQuery = params.get('q') || '';

      if (qInput && firstQuery) {
        qInput.value = firstQuery;
      }

      function card(movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
          return '<span>#' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
          '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '">',
          '<a class="card-media" href="' + movie.url + '">',
          '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '<span class="duration">' + escapeHtml(movie.duration) + '</span>',
          '</a>',
          '<div class="card-body">',
          '<a class="card-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
          '<p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
          '<div class="card-meta"><span>' + movie.year + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
          '<div class="tag-row">' + tags + '</div>',
          '</div>',
          '</article>'
        ].join('');
      }

      function escapeHtml(value) {
        return String(value || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function runSearch() {
        var keyword = qInput ? qInput.value.trim().toLowerCase() : '';
        var type = typeSelect ? typeSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        var list = window.SITE_MOVIES.filter(function (movie) {
          var text = [movie.title, movie.region, movie.type, movie.genre, movie.tags.join(' ')].join(' ').toLowerCase();
          var okKeyword = !keyword || text.indexOf(keyword) !== -1;
          var okType = !type || movie.type === type;
          var okYear = !year || String(movie.year) === year;
          return okKeyword && okType && okYear;
        }).slice(0, 120);

        result.innerHTML = list.map(card).join('');
        if (empty) {
          empty.style.display = list.length ? 'none' : 'block';
        }
      }

      [qInput, typeSelect, yearSelect].forEach(function (el) {
        if (el) {
          el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', runSearch);
        }
      });

      var panel = searchRoot.querySelector('.search-panel');
      if (panel) {
        panel.addEventListener('submit', function (event) {
          event.preventDefault();
          runSearch();
        });
      }

      runSearch();
    }
  });
})();

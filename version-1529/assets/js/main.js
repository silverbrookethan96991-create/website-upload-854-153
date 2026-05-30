(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initMobileMenu();
    initSearchForms();
    initHeroCarousel();
    initFilters();
    initPlayers();
  });

  function initMobileMenu() {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initSearchForms() {
    document.querySelectorAll('.site-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var target = './search.html';

        if (query) {
          target += '?q=' + encodeURIComponent(query);
        }

        window.location.href = target;
      });
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;

      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === index);
      });

      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = Number(dot.getAttribute('data-slide')) || 0;
        show(next);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    document.querySelectorAll('.js-filter-scope').forEach(function (scope) {
      var input = scope.querySelector('.js-filter-input');
      var selects = Array.prototype.slice.call(scope.querySelectorAll('.js-filter-select'));
      var reset = scope.querySelector('.js-filter-reset');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-item'));
      var result = scope.querySelector('.filter-result-count');
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q') || '';

      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function matches(card) {
        var query = input ? input.value.trim().toLowerCase() : '';
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var ok = !query || text.indexOf(query) !== -1;

        selects.forEach(function (select) {
          var value = select.value;
          var key = select.getAttribute('data-filter');

          if (value && card.getAttribute('data-' + key) !== value) {
            ok = false;
          }
        });

        return ok;
      }

      function apply() {
        var visible = 0;

        cards.forEach(function (card) {
          var show = matches(card);
          card.classList.toggle('is-hidden', !show);

          if (show) {
            visible += 1;
          }
        });

        if (result) {
          result.textContent = visible ? '筛选匹配 ' + visible + ' 部影片' : '暂无匹配影片';
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });

      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }

          selects.forEach(function (select) {
            select.value = '';
          });

          apply();
        });
      }

      apply();
    });
  }

  function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('.player-cover');
      var message = player.querySelector('.player-message');

      if (!video) {
        return;
      }

      bindStream(video, message);

      function togglePlay() {
        if (video.paused) {
          video.play().catch(function () {
            showMessage(message);
          });
        } else {
          video.pause();
        }
      }

      if (cover) {
        cover.addEventListener('click', togglePlay);
      }

      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });

      video.addEventListener('pause', function () {
        if (cover && video.currentTime === 0) {
          cover.classList.remove('is-hidden');
        }
      });

      video.addEventListener('error', function () {
        showMessage(message);
      });
    });
  }

  function bindStream(video, message) {
    var source = video.getAttribute('data-stream');

    if (!source) {
      showMessage(message);
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showMessage(message);
        }
      });
      return;
    }

    showMessage(message);
  }

  function showMessage(message) {
    if (message) {
      message.hidden = false;
    }
  }
})();

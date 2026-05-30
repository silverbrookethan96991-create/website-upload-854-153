(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function clean(value) {
    return (value || "").toString().toLowerCase().replace(/\s+/g, "");
  }

  function escapeHtml(value) {
    return (value || "").toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function buildCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\" data-card data-title=\"" + escapeHtml(movie.title) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-region=\"" + escapeHtml(movie.region) + "\" data-genre=\"" + escapeHtml(movie.genre) + "\" data-tags=\"" + escapeHtml((movie.tags || []).join(" ")) + "\">" +
      "<a href=\"" + escapeHtml(movie.file) + "\">" +
      "<div class=\"poster\"><img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"badge\">" + escapeHtml(movie.type) + "</span></div>" +
      "<div class=\"card-body\"><h3 class=\"card-title clamp-2\">" + escapeHtml(movie.title) + "</h3><p class=\"card-text clamp-2\">" + escapeHtml(movie.one_line) + "</p><div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.genre) + "</span></div><div class=\"tag-list\">" + tags + "</div></div>" +
      "</a></article>";
  }

  ready(function () {
    document.querySelectorAll("[data-mobile-toggle]").forEach(function (toggle) {
      toggle.addEventListener("click", function () {
        var menu = document.querySelector("[data-mobile-menu]");
        if (menu) {
          menu.classList.toggle("is-open");
        }
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    document.querySelectorAll("[data-filter-form]").forEach(function (form) {
      var scope = document.querySelector(form.getAttribute("data-filter-form"));
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var inputs = Array.prototype.slice.call(form.querySelectorAll("input, select"));

      function update() {
        var q = clean((form.querySelector("[name='q']") || {}).value);
        var year = (form.querySelector("[name='year']") || {}).value || "";
        var region = (form.querySelector("[name='region']") || {}).value || "";
        cards.forEach(function (item) {
          var haystack = clean([item.dataset.title, item.dataset.genre, item.dataset.tags, item.dataset.region, item.dataset.year].join(" "));
          var ok = (!q || haystack.indexOf(q) !== -1) && (!year || item.dataset.year === year) && (!region || item.dataset.region === region);
          item.classList.toggle("is-hidden-card", !ok);
        });
      }

      inputs.forEach(function (input) {
        input.addEventListener("input", update);
        input.addEventListener("change", update);
      });
      update();
    });

    var searchResults = document.getElementById("search-results");
    if (searchResults && window.SITE_MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      var input = document.getElementById("search-input");
      if (input) {
        input.value = query;
      }
      var normalized = clean(query);
      var results = window.SITE_MOVIES.filter(function (movie) {
        var haystack = clean([movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" "), movie.one_line].join(" "));
        return !normalized || haystack.indexOf(normalized) !== -1;
      }).slice(0, 240);
      searchResults.innerHTML = results.length ? results.map(buildCard).join("") : "<div class=\"search-empty\">未找到匹配影片</div>";
    }
  });
})();

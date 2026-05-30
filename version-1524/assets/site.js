document.addEventListener("DOMContentLoaded", function () {
  setupMenu();
  setupHero();
  setupFilters();
  setupPlayers();
  setupSearchPage();
});

function setupMenu() {
  var button = document.querySelector("[data-menu-toggle]");
  var panel = document.querySelector("[data-nav-panel]");
  if (!button || !panel) {
    return;
  }

  button.addEventListener("click", function () {
    panel.classList.toggle("is-open");
  });
}

function setupHero() {
  var hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }

  var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
  if (!slides.length) {
    return;
  }

  var current = 0;
  var timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === current);
    });
  }

  function restart() {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      show(index);
      restart();
    });
  });

  show(0);
  restart();
}

function setupFilters() {
  var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
  inputs.forEach(function (input) {
    var target = input.getAttribute("data-filter-input");
    var area = target ? document.querySelector(target) : document;
    if (!area) {
      return;
    }

    var cards = Array.prototype.slice.call(area.querySelectorAll("[data-card]"));
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-info") || "") + " " + card.textContent).toLowerCase();
        card.classList.toggle("is-filter-hidden", q.length > 0 && text.indexOf(q) === -1);
      });
    });
  });
}

function setupPlayers() {
  var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-video-button]"));
  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      var target = button.getAttribute("data-target");
      var url = button.getAttribute("data-video-url");
      var video = target ? document.getElementById(target) : null;
      if (!video || !url) {
        return;
      }
      playMovie(video, button, url);
    });
  });
}

function playMovie(video, button, url) {
  if (video.getAttribute("data-ready") !== "1") {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else if (window.Hls) {
      var hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }
    video.setAttribute("data-ready", "1");
  }

  button.classList.add("is-hidden");
  var result = video.play();
  if (result && typeof result.catch === "function") {
    result.catch(function () {});
  }
}

function setupSearchPage() {
  var mount = document.querySelector("[data-search-results]");
  if (!mount || typeof SEARCH_MOVIES === "undefined") {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var input = document.querySelector("[data-search-box]");
  var q = params.get("q") || "";
  if (input) {
    input.value = q;
  }

  function render(query) {
    var normalized = query.trim().toLowerCase();
    var list = SEARCH_MOVIES.filter(function (movie) {
      var text = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.category,
        movie.tags,
        movie.oneLine
      ].join(" ").toLowerCase();
      return normalized === "" || text.indexOf(normalized) !== -1;
    }).slice(0, 120);

    if (!list.length) {
      mount.innerHTML = '<div class="empty-state">没有找到匹配内容，可以换一个关键词继续搜索。</div>';
      return;
    }

    mount.innerHTML = '<div class="video-grid">' + list.map(function (movie) {
      return [
        '<a class="video-card" href="./' + escapeAttr(movie.url) + '">',
        '<div class="video-thumb">',
        '<img src="' + escapeAttr(movie.cover) + '" alt="' + escapeAttr(movie.title) + '" loading="lazy">',
        '<span class="duration-pill">' + escapeHTML(movie.duration) + '</span>',
        '</div>',
        '<div class="video-card-body">',
        '<div class="card-tags"><span class="tag">' + escapeHTML(movie.category) + '</span><span class="tag">' + escapeHTML(movie.year) + '</span></div>',
        '<h3>' + escapeHTML(movie.title) + '</h3>',
        '<p>' + escapeHTML(movie.oneLine) + '</p>',
        '<div class="card-stats"><span>' + escapeHTML(movie.region) + '</span><span>' + escapeHTML(movie.type) + '</span></div>',
        '</div>',
        '</a>'
      ].join("");
    }).join("") + '</div>';
  }

  if (input) {
    input.addEventListener("input", function () {
      render(input.value);
    });
  }

  render(q);
}

function escapeHTML(value) {
  return String(value || "").replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char];
  });
}

function escapeAttr(value) {
  return escapeHTML(value).replace(/`/g, "&#96;");
}

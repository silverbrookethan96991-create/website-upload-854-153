(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var open = mobilePanel.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var slideIndex = 0;
  var slideTimer = null;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }

    slideIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, current) {
      slide.classList.toggle("active", current === slideIndex);
    });

    dots.forEach(function (dot, current) {
      dot.classList.toggle("active", current === slideIndex);
    });
  }

  function startSlides() {
    if (slideTimer || slides.length < 2) {
      return;
    }

    slideTimer = window.setInterval(function () {
      setSlide(slideIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      window.clearInterval(slideTimer);
      slideTimer = null;
      setSlide(Number(dot.getAttribute("data-slide") || 0));
      startSlides();
    });
  });

  startSlides();

  var filterInput = document.querySelector(".filter-input");
  var filterSelects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));
  var filterCards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var filterEmpty = document.querySelector(".filter-empty");

  function applyQueryFromUrl() {
    if (!filterInput) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query) {
      filterInput.value = query;
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function filterMovies() {
    if (!filterCards.length) {
      return;
    }

    var keyword = normalize(filterInput ? filterInput.value : "");
    var filters = {};

    filterSelects.forEach(function (select) {
      var key = select.getAttribute("data-filter");
      if (key) {
        filters[key] = normalize(select.value);
      }
    });

    var visible = 0;

    filterCards.forEach(function (card) {
      var searchText = normalize(card.getAttribute("data-search"));
      var matched = true;

      if (keyword && searchText.indexOf(keyword) === -1) {
        matched = false;
      }

      Object.keys(filters).forEach(function (key) {
        if (!matched || !filters[key]) {
          return;
        }

        var value = normalize(card.getAttribute("data-" + key));

        if (value.indexOf(filters[key]) === -1) {
          matched = false;
        }
      });

      card.classList.toggle("hidden-card", !matched);

      if (matched) {
        visible += 1;
      }
    });

    if (filterEmpty) {
      filterEmpty.hidden = visible !== 0;
    }
  }

  applyQueryFromUrl();

  if (filterInput) {
    filterInput.addEventListener("input", filterMovies);
  }

  filterSelects.forEach(function (select) {
    select.addEventListener("change", filterMovies);
  });

  filterMovies();

  function attachStream(video, sourceUrl) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = sourceUrl;
  }

  window.setupMoviePlayer = function (sourceUrl) {
    var player = document.getElementById("movie-player");

    if (!player) {
      return;
    }

    var video = player.querySelector("video");
    var cover = player.querySelector(".player-cover");
    var loaded = false;

    if (!video) {
      return;
    }

    function play() {
      if (!loaded) {
        attachStream(video, sourceUrl);
        loaded = true;
      }

      if (cover) {
        cover.classList.add("hide");
      }

      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  };
})();

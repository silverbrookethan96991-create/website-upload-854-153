(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
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

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function textOf(card) {
        return [
            card.getAttribute("data-title"),
            card.getAttribute("data-category"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.textContent
        ].join(" ").toLowerCase();
    }

    function initLibrary() {
        var libraries = Array.prototype.slice.call(document.querySelectorAll("[data-library]"));
        libraries.forEach(function (library) {
            var input = library.querySelector("[data-filter-input]");
            var sortSelect = library.querySelector("[data-sort-select]");
            var categorySelect = library.querySelector("[data-category-select]");
            var list = library.querySelector("[data-card-list]");
            var categoryButtons = Array.prototype.slice.call(library.querySelectorAll("[data-filter-category]"));
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.children);

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var category = categorySelect ? categorySelect.value : "";
                cards.forEach(function (card) {
                    var matchesQuery = !query || textOf(card).indexOf(query) !== -1;
                    var matchesCategory = !category || card.getAttribute("data-category") === category;
                    card.classList.toggle("is-hidden", !(matchesQuery && matchesCategory));
                });
                sortCards(sortSelect ? sortSelect.value : "default");
            }

            function sortCards(mode) {
                if (!mode || mode === "default") {
                    cards.sort(function (a, b) {
                        return 0;
                    });
                } else {
                    cards.sort(function (a, b) {
                        var av = a.getAttribute("data-" + mode) || "0";
                        var bv = b.getAttribute("data-" + mode) || "0";
                        return Number(bv) - Number(av);
                    });
                }
                cards.forEach(function (card) {
                    list.appendChild(card);
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (sortSelect) {
                sortSelect.addEventListener("change", apply);
            }
            if (categorySelect) {
                categorySelect.addEventListener("change", apply);
            }
            categoryButtons.forEach(function (button) {
                button.addEventListener("click", function () {
                    if (categorySelect) {
                        categorySelect.value = button.getAttribute("data-filter-category");
                    }
                    if (input) {
                        input.value = button.getAttribute("data-filter-category");
                    }
                    apply();
                });
            });
            var params = new URLSearchParams(window.location.search);
            var queryParam = params.get("q");
            if (queryParam && input) {
                input.value = queryParam;
                apply();
            }
        });
    }

    function initPlayer() {
        var player = document.querySelector("[data-player]");
        if (!player) {
            return;
        }
        var video = player.querySelector("video");
        var playButton = player.querySelector("[data-play]");
        var status = player.querySelector("[data-player-status]");
        var stream = player.getAttribute("data-stream");
        var loaded = false;
        var hls = null;

        function setStatus(message) {
            if (status) {
                status.textContent = message || "";
            }
        }

        function loadStream() {
            if (loaded || !video || !stream) {
                return;
            }
            loaded = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        setStatus("视频加载失败，请稍后再试");
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        setStatus("正在恢复播放");
                        hls.recoverMediaError();
                    } else {
                        setStatus("播放暂时不可用");
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else {
                setStatus("播放暂时不可用");
            }
        }

        function play() {
            loadStream();
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    setStatus("点击后开始播放");
                });
            }
        }

        function toggle() {
            if (!video) {
                return;
            }
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        }

        if (playButton) {
            playButton.addEventListener("click", toggle);
        }
        video.addEventListener("click", toggle);
        video.addEventListener("play", function () {
            player.classList.add("is-playing");
            setStatus("");
        });
        video.addEventListener("pause", function () {
            player.classList.remove("is-playing");
        });
        video.addEventListener("ended", function () {
            player.classList.remove("is-playing");
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initLibrary();
        initPlayer();
    });
})();

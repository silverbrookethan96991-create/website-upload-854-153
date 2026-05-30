(function () {
  window.initVideoPlayer = function (sourceUrl) {
    var shell = document.querySelector('.player-shell');
    var video = document.querySelector('.player-shell video');
    var overlay = document.querySelector('.play-overlay');
    var started = false;
    var hlsInstance = null;

    if (!shell || !video || !overlay || !sourceUrl) {
      return;
    }

    function attachSource() {
      if (started) {
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function play() {
      attachSource();
      video.controls = true;
      shell.classList.add('playing');
      var promise = video.play();

      if (promise && promise.catch) {
        promise.catch(function () {
          shell.classList.remove('playing');
        });
      }
    }

    overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      shell.classList.add('playing');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        shell.classList.remove('playing');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();

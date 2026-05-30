(function () {
  function setupPlayer(wrapper) {
    var video = wrapper.querySelector('video');
    var trigger = wrapper.querySelector('.play-trigger');
    var source = video ? video.getAttribute('data-stream') : '';
    var attached = false;
    var hls = null;

    function attach() {
      if (!video || !source || attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.load();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }
      video.src = source;
      video.load();
    }

    function start(event) {
      if (event) {
        event.preventDefault();
      }
      attach();
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener('click', start);
    }

    wrapper.addEventListener('click', function (event) {
      if (event.target === video || event.target === wrapper) {
        start(event);
      }
    });

    video.addEventListener('play', function () {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(setupPlayer);
})();

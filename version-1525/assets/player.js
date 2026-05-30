import { H as Hls } from './hls.js';

function setupPlayer(root) {
  var video = root.querySelector('video');
  var overlay = root.querySelector('[data-play]');
  var hls = null;

  if (!video || !overlay) {
    return;
  }

  function attachStream() {
    var streamUrl = video.getAttribute('data-stream');

    if (!streamUrl || video.getAttribute('data-ready') === 'true') {
      return;
    }

    video.setAttribute('data-ready', 'true');

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }
        hls.destroy();
      });
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    }
  }

  function startPlayback() {
    attachStream();
    overlay.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', startPlayback);
  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

document.querySelectorAll('[data-player]').forEach(setupPlayer);

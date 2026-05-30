export function initPlayer(source, playerId) {
  const video = document.getElementById(playerId);
  if (!video) {
    return;
  }

  const shell = video.closest('[data-player]');
  const layer = shell ? shell.querySelector('[data-play-layer]') : null;
  const buttons = shell ? Array.from(shell.querySelectorAll('[data-play-button]')) : [];
  let loaded = false;

  const attach = () => {
    if (loaded) {
      return;
    }

    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  };

  const begin = (event) => {
    if (event) {
      event.preventDefault();
    }

    attach();
    if (layer) {
      layer.classList.add('is-hidden');
    }
    video.controls = true;
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {
        if (layer) {
          layer.classList.remove('is-hidden');
        }
      });
    }
  };

  buttons.forEach((button) => button.addEventListener('click', begin));
  video.addEventListener('click', () => {
    if (video.paused) {
      begin();
    }
  });
  video.addEventListener('play', () => {
    if (layer) {
      layer.classList.add('is-hidden');
    }
  });
}

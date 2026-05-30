const select = (selector, scope = document) => scope.querySelector(selector);
const selectAll = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function setupMobileMenu() {
  const toggle = select('.menu-toggle');
  const menu = select('.mobile-nav');
  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener('click', () => {
    const opened = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(opened));
  });
}

function setupHero() {
  const root = select('[data-hero]');
  if (!root) {
    return;
  }

  const slides = selectAll('[data-hero-slide]', root);
  const dots = selectAll('[data-hero-dot]', root);
  const prev = select('[data-hero-prev]', root);
  const next = select('[data-hero-next]', root);
  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    if (!slides.length) {
      return;
    }
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(index + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.dataset.heroDot || '0'));
      start();
    });
  });

  if (prev) {
    prev.addEventListener('click', () => {
      show(index - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      show(index + 1);
      start();
    });
  }

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  show(0);
  start();
}

function setupFilters() {
  const input = select('[data-filter-input]');
  const cards = selectAll('[data-card]');
  const chips = selectAll('[data-filter-value]');
  const empty = select('#search-empty');
  if (!cards.length) {
    return;
  }

  let chipValue = '';

  const normalize = (value) => String(value || '').trim().toLowerCase();

  const apply = () => {
    const words = normalize(input ? input.value : '').split(/\s+/).filter(Boolean);
    const chip = normalize(chipValue);
    let visible = 0;

    cards.forEach((card) => {
      const text = normalize(card.dataset.search || card.textContent);
      const matchesWords = words.every((word) => text.includes(word));
      const matchesChip = !chip || text.includes(chip);
      const show = matchesWords && matchesChip;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  };

  if (input) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || params.get('type') || '';
    if (query) {
      input.value = query;
    }
    input.addEventListener('input', apply);
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chipValue = chip.dataset.filterValue || '';
      chips.forEach((item) => item.classList.toggle('is-active', item === chip));
      apply();
    });
  });

  apply();
}

function setupImageState() {
  selectAll('img').forEach((image) => {
    image.addEventListener('error', () => {
      image.classList.add('is-missing');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupHero();
  setupFilters();
  setupImageState();
});

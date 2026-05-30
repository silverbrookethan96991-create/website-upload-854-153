(function () {
  var results = document.getElementById('search-results');
  var heading = document.getElementById('search-heading');
  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();
  var list = Array.isArray(window.SITE_MOVIES) ? window.SITE_MOVIES : [];

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function safe(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function createCard(movie) {
    var link = document.createElement('a');
    link.className = 'movie-card movie-card-compact';
    link.href = movie.url;
    link.innerHTML = [
      '<span class="poster-wrap">',
      '<img src="' + safe(movie.cover) + '" alt="' + safe(movie.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="score-pill">口碑 ' + safe(movie.score) + '</span>',
      '<span class="play-dot">▶</span>',
      '</span>',
      '<span class="card-body">',
      '<strong>' + safe(movie.title) + '</strong>',
      '<span class="card-meta">' + safe(movie.region) + ' · ' + safe(movie.type) + ' · ' + safe(movie.year) + '</span>',
      '<span class="line-clamp">' + safe(movie.desc) + '</span>',
      '<span class="tag-row"><span>' + safe(movie.category) + '</span></span>',
      '</span>'
    ].join('');
    return link;
  }

  function render() {
    if (!results || !heading) {
      return;
    }

    var source = list;
    if (query) {
      source = list.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.desc,
          movie.category
        ].join(' '));
        return haystack.indexOf(normalize(query)) !== -1;
      });
      heading.textContent = '“' + query + '” 的搜索结果';
    } else {
      source = list.slice(0, 48);
      heading.textContent = '热门影片推荐';
    }

    results.innerHTML = '';
    source.slice(0, 240).forEach(function (movie) {
      results.appendChild(createCard(movie));
    });

    if (!source.length) {
      heading.textContent = '没有找到匹配影片';
    }
  }

  var pageInput = document.querySelector('.page-search input[name="q"]');
  if (pageInput) {
    pageInput.value = query;
  }

  render();
})();

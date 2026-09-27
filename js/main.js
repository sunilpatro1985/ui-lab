/* js/main.js
 * Entry point. Registers every route and wires up the parts of the
 * shell (sidebar session pill, reset button, global modal close)
 * that live outside any single page.
 */
(function () {
  QA.router.register('/', QA.pages.home);
  QA.router.register('/elements', QA.pages.elements);
  QA.router.register('/forms', QA.pages.forms);
  QA.router.register('/login', QA.pages.login);
  QA.router.register('/table', QA.pages.table);
  QA.router.register('/dynamic', QA.pages.dynamic);
  QA.router.register('/windows', QA.pages.windows);
  QA.router.register('/frames', QA.pages.frames);
  QA.router.register('/broken', QA.pages.broken);
  QA.router.register('/menu', QA.pages.menubar);
  QA.router.register('/scroll', QA.pages.scrolling);
  QA.router.register('/dashboard', QA.pages.dashboard);

  function updateThemeLabel() {
    var saved = null;
    try { saved = localStorage.getItem('qa-theme'); } catch (e) { /* ignore */ }
    var label = QA.utils.qs('#themeToggleLabel');
    if (label) label.textContent = 'Theme: ' + (saved || 'system');
  }

  QA.utils.on(QA.utils.qs('#btnThemeToggle'), 'click', function () {
    var saved = null;
    try { saved = localStorage.getItem('qa-theme'); } catch (e) { /* ignore */ }
    var next = saved === 'light' ? 'dark' : saved === 'dark' ? null : 'light';
    try {
      if (next) { localStorage.setItem('qa-theme', next); } else { localStorage.removeItem('qa-theme'); }
    } catch (e) { /* ignore */ }
    if (next) {
      document.documentElement.setAttribute('data-theme', next);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    updateThemeLabel();
  });

  function updateSessionPill() {
    var pill = QA.utils.qs('#sessionPill');
    var loggedIn = QA.state.isLoggedIn();
    pill.classList.toggle('on', loggedIn);
    pill.innerHTML = '<span>' + (loggedIn ? 'logged in' : 'logged out') + '</span><span class="dot"></span>';
  }

  window.addEventListener('qa:authchange', updateSessionPill);

  QA.utils.on(QA.utils.qs('#btnResetApp'), 'click', function () {
    QA.state.resetAll();
    location.reload();
  });

  QA.utils.on(QA.utils.qs('#btnCloseModal'), 'click', function () {
    QA.utils.closeModal('modalOverlay');
  });

  // ---- global sidebar search ----
  // Matches against each page's label AND its section titles (so "shadow
  // root" or "broken link" finds the right page), but only ever lists
  // and navigates to pages — never a section directly.
  (function () {
    var input = QA.utils.qs('#globalSearchInput');
    var panel = QA.utils.qs('#globalSearchResults');
    if (!input || !panel) return;
    var results = [];
    var activeIndex = -1;

    function scoreTerm(term, q) {
      var t = term.toLowerCase();
      if (t === q) return 3;
      if (t.indexOf(q) === 0) return 2;
      if (t.indexOf(q) !== -1) return 1;
      return 0;
    }

    function search(query) {
      var q = query.trim().toLowerCase();
      if (!q) return [];
      var matches = [];
      QA.searchIndex.forEach(function (page) {
        var bestScore = 0;
        var bestTerm = null;
        var labelScore = scoreTerm(page.label, q);
        if (labelScore > bestScore) { bestScore = labelScore; bestTerm = page.label; }
        page.sections.forEach(function (section) {
          var s = scoreTerm(section, q);
          if (s > bestScore) { bestScore = s; bestTerm = section; }
        });
        if (bestScore > 0) {
          matches.push({ page: page, matchedTerm: bestTerm, score: bestScore, isLabelMatch: bestTerm === page.label });
        }
      });
      matches.sort(function (a, b) { return b.score - a.score; });
      return matches.slice(0, 8);
    }

    function routeSlug(route) { return route === '/' ? 'home' : route.replace(/\//g, ''); }

    function render(query) {
      if (!query.trim()) { panel.innerHTML = ''; panel.classList.remove('show'); return; }
      if (!results.length) {
        panel.innerHTML = '<div class="search-empty" data-testid="search-no-results">No matches for &quot;' + query + '&quot;</div>';
        panel.classList.add('show');
        return;
      }
      panel.innerHTML = results.map(function (r, i) {
        return '<div class="search-result' + (i === activeIndex ? ' active' : '') + '" ' +
          'data-route="' + r.page.route + '" data-testid="search-result-' + routeSlug(r.page.route) + '" role="option">' +
          '<span class="search-result-label">' + r.page.label + '</span>' +
          (r.isLabelMatch ? '' : '<span class="search-result-hint">' + r.matchedTerm + '</span>') +
          '</div>';
      }).join('');
      panel.classList.add('show');
    }

    function close() {
      panel.classList.remove('show');
      panel.innerHTML = '';
      activeIndex = -1;
    }

    function navigateTo(route) {
      QA.router.navigateTo(route);
      input.value = '';
      close();
      input.blur();
    }

    QA.utils.on(input, 'input', function () {
      results = search(input.value);
      activeIndex = results.length ? 0 : -1;
      render(input.value);
    });

    QA.utils.on(input, 'keydown', function (e) {
      if (!panel.classList.contains('show') || !results.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % results.length;
        render(input.value);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + results.length) % results.length;
        render(input.value);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        var pick = results[activeIndex] || results[0];
        if (pick) navigateTo(pick.page.route);
      } else if (e.key === 'Escape') {
        close();
      }
    });

    QA.utils.on(panel, 'click', function (e) {
      var row = e.target.closest('.search-result');
      if (row) navigateTo(row.getAttribute('data-route'));
    });

    QA.utils.on(document, 'click', function (e) {
      if (e.target !== input && !panel.contains(e.target)) close();
    });
  })();

  updateSessionPill();
  updateThemeLabel();
  QA.router.start('#app-content');
})();

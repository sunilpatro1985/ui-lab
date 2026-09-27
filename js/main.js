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

  updateSessionPill();
  updateThemeLabel();
  QA.router.start('#app-content');
})();

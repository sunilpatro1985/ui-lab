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
  QA.router.register('/dashboard', QA.pages.dashboard);

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
  QA.router.start('#app-content');
})();

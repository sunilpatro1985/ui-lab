/* js/router.js
 * Minimal hash router. Each route points at a "page module" that lives
 * under QA.pages.<name> and exposes { template, init(root), destroy() }.
 *   - template: a function returning an HTML string (the page markup)
 *   - init(root): called after the markup is injected; wire up listeners here
 *   - destroy(): optional; called before navigating away (clear intervals, etc.)
 *
 * To add a new page:
 *   1. Create js/pages/yourpage.js defining QA.pages.yourpage
 *   2. Add a <script src="js/pages/yourpage.js"> in index.html
 *   3. Register the route below in js/main.js
 *   4. Add a nav link with data-route="/yourpage" in index.html
 */
window.QA = window.QA || {};

QA.router = (function () {
  var routes = {};
  var mountEl = null;
  var currentPage = null;
  var notFoundRoute = '/';

  function register(path, pageModule) {
    routes[path] = pageModule;
  }

  function currentPath() {
    return window.location.hash.replace('#', '') || '/';
  }

  function renderNav() {
    var path = currentPath();
    QA.utils.qsa('#mainnav a[data-route]').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-route') === path);
    });
  }

  function navigateTo(path) {
    if (currentPage && typeof currentPage.destroy === 'function') {
      currentPage.destroy();
    }
    var page = routes[path] || routes[notFoundRoute];
    currentPage = page;
    mountEl.innerHTML = page.template();
    if (typeof page.init === 'function') page.init(mountEl);
    renderNav();
    window.scrollTo(0, 0);
  }

  function handleHashChange() {
    navigateTo(currentPath());
  }

  function start(mountSelector) {
    mountEl = QA.utils.qs(mountSelector);
    window.addEventListener('hashchange', handleHashChange);
    navigateTo(currentPath());
  }

  return { register: register, start: start, navigateTo: function (p) { window.location.hash = '#' + p; } };
})();

/* js/pages/home.js */
window.QA = window.QA || {};
QA.pages = QA.pages || {};

QA.pages.home = (function () {
  function template() {
    return (
      '<div class="eyebrow">specimen 01</div>' +
      '<h1 class="page-title">A sandbox built to be automated</h1>' +
      '<p class="page-desc">Every control on this site ships with a stable <code>data-testid</code> and <code>id</code>, printed underneath it like a lab label. Built for practicing Selenium, Playwright, Cypress, WebdriverIO, or any framework that clicks buttons for a living.</p>' +
      '<div class="grid-3">' +
        card('Elements', 'Buttons, checkboxes, selects, drag &amp; drop, tabs, modals, tooltips, hidden elements.', '/elements', 'home-link-elements') +
        card('Registration form', 'Multi-field form with client-side validation and a success summary.', '/forms', 'home-link-forms') +
        card('Login', 'Valid/invalid credential flows, lockout after repeated failures.', '/login', 'home-link-login') +
        card('Data table', '57 mock records, sortable columns, search, and full pagination.', '/table', 'home-link-table') +
        card('Dynamic &amp; alerts', 'Spinners, delayed DOM insertion, native alert/confirm/prompt, toasts.', '/dynamic', 'home-link-dynamic') +
        card('Windows &amp; tabs', 'Open new windows/tabs from links and buttons, single or many at once.', '/windows', 'home-link-windows') +
        card('Dashboard', 'Protected-style page reachable only after a successful login.', '/dashboard', 'home-link-dashboard') +
      '</div>'
    );
  }

  function card(title, desc, route, testid) {
    return (
      '<div class="card">' +
        '<h3>' + title + '</h3>' +
        '<p class="card-help">' + desc + '</p>' +
        '<a href="#' + route + '" data-testid="' + testid + '">Open &rarr;</a>' +
      '</div>'
    );
  }

  function init() { /* no dynamic behavior needed */ }
  function destroy() {}

  return { template: template, init: init, destroy: destroy };
})();

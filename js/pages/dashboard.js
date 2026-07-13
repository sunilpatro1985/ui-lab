/* js/pages/dashboard.js */
window.QA = window.QA || {};
QA.pages = QA.pages || {};

QA.pages.dashboard = (function () {
  var unbinders = [];

  function template() {
    var loggedIn = QA.state.isLoggedIn();
    return '' +
    '<div class="eyebrow">specimen 07</div>' +
    '<h1 class="page-title">Dashboard</h1>' +
    (loggedIn ?
      ('<div class="success-banner show" data-testid="dashboard-welcome">Welcome back, <span id="dashboardUsername" data-testid="dashboard-username">' + QA.state.getUsername() + '</span>! You\'re logged in.</div>' +
      '<div class="card"><h3>Session details</h3>' +
      '<p style="font-size:13px;color:var(--text-dim);">Logged in at <span id="loginTimestamp" data-testid="login-timestamp">' + QA.state.getLoginTime() + '</span></p>' +
      '<button class="danger" id="btnLogout" data-testid="btn-logout">Log out</button></div>')
      :
      '<div data-testid="dashboard-logged-out"><p class="page-desc">You\'re not logged in yet. <a href="#/login" data-testid="dashboard-login-link">Go to login &rarr;</a></p></div>'
    );
  }

  function init(root) {
    var btnLogout = QA.utils.qs('#btnLogout', root);
    if (btnLogout) {
      unbinders.push(QA.utils.on(btnLogout, 'click', function () {
        QA.state.logout();
        QA.router.navigateTo('/login');
      }));
    }
  }

  function destroy() {
    unbinders.forEach(function (u) { u(); });
    unbinders = [];
  }

  return { template: template, init: init, destroy: destroy };
})();

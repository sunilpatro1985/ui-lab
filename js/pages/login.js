/* js/pages/login.js */
window.QA = window.QA || {};
QA.pages = QA.pages || {};

QA.pages.login = (function () {
  var unbinders = [];

  function template() {
    var creds = QA.state.getValidCreds();
    var attempts = QA.state.getAttempts();
    var max = QA.state.getMaxAttempts();
    return '' +
    '<div class="eyebrow">specimen 04</div>' +
    '<h1 class="page-title">Login</h1>' +
    '<p class="page-desc">Practice both the happy path and failure states, including a simulated lockout.</p>' +
    '<div class="hint-box" data-testid="login-hint">valid credentials &rarr; username: <code>' + creds.username + '</code> &middot; password: <code>' + creds.password + '</code></div>' +
    '<div class="error-banner' + (attempts > 0 && attempts < max ? ' show' : '') + '" id="loginError" data-testid="login-error">Invalid username or password.</div>' +
    '<div class="error-banner' + (attempts >= max ? ' show' : '') + '" id="loginLocked" data-testid="login-locked">Account locked after ' + max + ' failed attempts. Click "Reset app state" to try again.</div>' +
    '<form class="card" style="max-width:380px;" id="loginForm" data-testid="login-form">' +
      '<div class="field"><label class="field-label">Username</label><input type="text" id="loginUsername" data-testid="input-username"></div>' +
      '<div class="field"><label class="field-label">Password</label><div style="position:relative;">' +
        '<input type="password" id="loginPassword" data-testid="input-password-login" style="padding-right:60px;">' +
        '<button type="button" class="ghost small" id="btnTogglePassword" data-testid="btn-toggle-password" style="position:absolute;right:4px;top:3px;">show</button>' +
      '</div></div>' +
      '<div class="checkbox-row"><input type="checkbox" id="loginRemember" data-testid="chk-remember"><label for="loginRemember">Remember me</label></div>' +
      '<div class="btn-row" style="margin-top:10px;"><button type="submit" class="primary" id="btnLogin" data-testid="btn-login">Log in</button></div>' +
      '<p style="font-size:11.5px;color:var(--text-dim);margin-top:12px;font-family:var(--mono);">attempts used: <span id="attemptCount" data-testid="login-attempt-count">' + attempts + '</span> / ' + max + '</p>' +
    '</form>';
  }

  function init(root) {
    var qs = function (sel) { return QA.utils.qs(sel, root); };

    unbinders.push(QA.utils.on(qs('#btnTogglePassword'), 'click', function () {
      var input = qs('#loginPassword');
      var showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      this.textContent = showing ? 'show' : 'hide';
    }));

    unbinders.push(QA.utils.on(qs('#loginForm'), 'submit', function (e) {
      e.preventDefault();
      if (QA.state.getAttempts() >= QA.state.getMaxAttempts()) {
        qs('#loginLocked').classList.add('show');
        return;
      }
      var u = qs('#loginUsername').value.trim();
      var p = qs('#loginPassword').value;
      var result = QA.state.attempt(u, p);
      qs('#loginError').classList.remove('show');

      if (result.ok) {
        QA.router.navigateTo('/dashboard');
      } else {
        qs('#attemptCount').textContent = QA.state.getAttempts();
        qs('#loginError').classList.add('show');
        if (result.locked) qs('#loginLocked').classList.add('show');
      }
    }));
  }

  function destroy() {
    unbinders.forEach(function (u) { u(); });
    unbinders = [];
  }

  return { template: template, init: init, destroy: destroy };
})();

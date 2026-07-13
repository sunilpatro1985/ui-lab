/* js/state.js
 * All persisted / shared state lives here so pages don't touch
 * localStorage/sessionStorage directly. Dispatches 'qa:authchange'
 * on window whenever login state changes, so any page/shell part
 * can react without being tightly coupled to the login page.
 */
window.QA = window.QA || {};

QA.state = (function () {
  var VALID_USER = 'testuser';
  var VALID_PASS = 'Test@123';
  var MAX_ATTEMPTS = 3;

  function isLoggedIn() { return localStorage.getItem('qa_logged_in') === 'true'; }
  function getUsername() { return localStorage.getItem('qa_username') || ''; }
  function getLoginTime() { return localStorage.getItem('qa_login_time') || ''; }

  function attempt(username, password) {
    var used = getAttempts();
    if (used >= MAX_ATTEMPTS) {
      return { ok: false, locked: true };
    }
    if (username === VALID_USER && password === VALID_PASS) {
      localStorage.setItem('qa_logged_in', 'true');
      localStorage.setItem('qa_username', username);
      localStorage.setItem('qa_login_time', new Date().toLocaleString());
      sessionStorage.setItem('qa_attempts', '0');
      window.dispatchEvent(new CustomEvent('qa:authchange'));
      return { ok: true };
    }
    used++;
    sessionStorage.setItem('qa_attempts', String(used));
    return { ok: false, locked: used >= MAX_ATTEMPTS, attempts: used };
  }

  function logout() {
    localStorage.removeItem('qa_logged_in');
    localStorage.removeItem('qa_username');
    localStorage.removeItem('qa_login_time');
    window.dispatchEvent(new CustomEvent('qa:authchange'));
  }

  function getAttempts() { return parseInt(sessionStorage.getItem('qa_attempts') || '0', 10); }
  function getMaxAttempts() { return MAX_ATTEMPTS; }
  function getValidCreds() { return { username: VALID_USER, password: VALID_PASS }; }

  function resetAll() {
    localStorage.clear();
    sessionStorage.clear();
    window.dispatchEvent(new CustomEvent('qa:authchange'));
  }

  return {
    isLoggedIn: isLoggedIn,
    getUsername: getUsername,
    getLoginTime: getLoginTime,
    attempt: attempt,
    logout: logout,
    getAttempts: getAttempts,
    getMaxAttempts: getMaxAttempts,
    getValidCreds: getValidCreds,
    resetAll: resetAll
  };
})();

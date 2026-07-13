/* js/utils.js
 * Small DOM + misc helpers shared across pages.
 * Everything lives under window.QA to avoid polluting globals
 * and to keep each file loadable as a plain classic <script> (no bundler,
 * no ES module CORS restrictions under file://).
 */
window.QA = window.QA || {};

QA.utils = (function () {
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function on(el, evt, handler) {
    if (!el) return function () {};
    el.addEventListener(evt, handler);
    return function unbind() { el.removeEventListener(evt, handler); };
  }

  function showToast(message, type) {
    type = type === 'error' ? 'error' : 'success';
    var container = qs('#toast-container');
    if (!container) return;
    var toast = document.createElement('div');
    toast.className = 'toast' + (type === 'error' ? ' error' : '');
    toast.setAttribute('data-testid', 'toast-' + type);
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 3000);
  }

  function openModal(id) {
    var overlay = qs('#' + id);
    if (overlay) overlay.classList.add('show');
  }
  function closeModal(id) {
    var overlay = qs('#' + id);
    if (overlay) overlay.classList.remove('show');
  }

  function nowTime() { return new Date().toLocaleTimeString(); }
  function nowDateTime() { return new Date().toLocaleString(); }

  return {
    qs: qs,
    qsa: qsa,
    on: on,
    showToast: showToast,
    openModal: openModal,
    closeModal: closeModal,
    nowTime: nowTime,
    nowDateTime: nowDateTime
  };
})();

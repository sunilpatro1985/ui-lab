/* js/pages/windows.js
 * Everything related to opening new browser windows/tabs lives here.
 * Popup documents are generated as Blob URLs (not document.write), so
 * they keep a normal window.opener reference and can postMessage back.
 */
window.QA = window.QA || {};
QA.pages = QA.pages || {};

QA.pages.windows = (function () {
  var unbinders = [];
  var openWindows = []; // { ref, name, openedAt }
  var pollTimer = null;
  var windowCounter = 0;
  var messageHandler = null;

  function template() {
    return '' +
    '<div class="eyebrow">specimen 08</div>' +
    '<h1 class="page-title">Windows &amp; tabs</h1>' +
    '<p class="page-desc">Opens real new browser windows/tabs so you can practice switching between window handles. Each popup can message this page back via <code>postMessage</code>.</p>' +

    '<div class="grid-2">' +
      '<div class="card"><h3>Open a new window</h3><p class="card-help">Each click opens a brand-new, uniquely named window.</p>' +
        '<button class="primary" id="btnOpenWindow" data-testid="btn-open-window">Open new window</button>' +
        '<div class="specimen-tag">data-testid="btn-open-window"</div></div>' +

      '<div class="card"><h3>Open in a new tab (link)</h3><p class="card-help">A plain link with <code>target="_blank"</code>.</p>' +
        '<a href="https://example.com" target="_blank" rel="opener" id="linkNewTab" data-testid="link-new-tab">Open example.com in a new tab &rarr;</a>' +
        '<div class="specimen-tag">data-testid="link-new-tab"</div></div>' +

      '<div class="card"><h3>Open multiple windows at once</h3><p class="card-help">One click opens three separate windows &mdash; good for practicing multi-handle switching.</p>' +
        '<button id="btnOpenMultiple" data-testid="btn-open-multiple-windows">Open 3 windows</button>' +
        '<div class="specimen-tag">data-testid="btn-open-multiple-windows"</div></div>' +

      '<div class="card"><h3>Reuse a named window</h3><p class="card-help">Always targets the same window name, so repeat clicks reuse one window instead of opening new ones.</p>' +
        '<button id="btnOpenNamed" data-testid="btn-open-named-window">Open / focus named window</button>' +
        '<div class="specimen-tag">data-testid="btn-open-named-window"</div></div>' +
    '</div>' +

    '<div class="card">' +
      '<h3>Open windows</h3>' +
      '<p class="card-help">Live count of windows opened from this page that are still open.</p>' +
      '<p style="font-size:20px;font-family:var(--mono);color:var(--amber);margin:0 0 14px;" id="openWindowCount" data-testid="open-window-count">0</p>' +
      '<div class="btn-row" style="margin-bottom:14px;">' +
        '<button id="btnCloseAll" data-testid="btn-close-all-windows">Close all opened windows</button>' +
      '</div>' +
      '<h3 style="margin-top:0;">Activity log</h3>' +
      '<div class="log-panel" id="windowLog" data-testid="window-log"></div>' +
    '</div>';
  }

  function popupDocument(title, testidSuffix) {
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + title + '</title>' +
      '<style>' +
      'body{font-family:system-ui,sans-serif;background:#0B1220;color:#E7ECF6;padding:28px;}' +
      'h1{font-size:18px;} button{cursor:pointer;border:none;border-radius:6px;padding:9px 14px;font-size:13px;font-weight:600;margin-right:8px;margin-top:12px;}' +
      '.primary{background:#F5A623;color:#1a1204;} .ghost{background:#182338;color:#E7ECF6;border:1px solid #243046;}' +
      '.tag{font-family:ui-monospace,monospace;font-size:11px;color:#F5A623;display:block;margin-top:6px;}' +
      '</style></head><body>' +
      '<h1 data-testid="popup-heading-' + testidSuffix + '">' + title + '</h1>' +
      '<p>This is an independent browser window. Use it to practice switching window handles.</p>' +
      '<button class="primary" id="notify" data-testid="btn-notify-opener-' + testidSuffix + '">Notify opener</button>' +
      '<span class="tag">data-testid="btn-notify-opener-' + testidSuffix + '"</span>' +
      '<button class="ghost" id="closeBtn" data-testid="btn-close-popup-' + testidSuffix + '">Close this window</button>' +
      '<span class="tag">data-testid="btn-close-popup-' + testidSuffix + '"</span>' +
      '<script>' +
      'document.getElementById("notify").addEventListener("click", function(){' +
      '  if (window.opener) { window.opener.postMessage({ source: "qa-popup", id: "' + testidSuffix + '", text: "Hello from ' + title + '" }, "*"); }' +
      '});' +
      'document.getElementById("closeBtn").addEventListener("click", function(){ window.close(); });' +
      '</script></body></html>';
  }

  function openPopup(title, name, testidSuffix) {
    var blob = new Blob([popupDocument(title, testidSuffix)], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    var ref = window.open(url, name, 'width=420,height=280');
    if (ref) {
      openWindows.push({ ref: ref, name: name, openedAt: QA.utils.nowTime() });
    }
    return ref;
  }

  function log(root, text) {
    var panel = QA.utils.qs('#windowLog', root);
    if (!panel) return;
    var entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.setAttribute('data-testid', 'window-log-entry-' + (panel.children.length + 1));
    entry.textContent = '[' + QA.utils.nowTime() + '] ' + text;
    panel.prepend(entry);
  }

  function refreshCount(root) {
    openWindows = openWindows.filter(function (w) { return w.ref && !w.ref.closed; });
    var el = QA.utils.qs('#openWindowCount', root);
    if (el) el.textContent = openWindows.length;
  }

  function init(root) {
    windowCounter = 0;

    unbinders.push(QA.utils.on(QA.utils.qs('#btnOpenWindow', root), 'click', function () {
      windowCounter++;
      var name = 'qaWindow_' + windowCounter + '_' + Date.now();
      openPopup('Popup window #' + windowCounter, name, String(windowCounter));
      log(root, 'Opened new window "' + name + '"');
      refreshCount(root);
    }));

    unbinders.push(QA.utils.on(QA.utils.qs('#linkNewTab', root), 'click', function () {
      log(root, 'Opened example.com in a new tab');
    }));

    unbinders.push(QA.utils.on(QA.utils.qs('#btnOpenMultiple', root), 'click', function () {
      for (var i = 0; i < 3; i++) {
        windowCounter++;
        (function (n) {
          var name = 'qaWindow_' + n + '_' + Date.now();
          openPopup('Popup window #' + n, name, String(n));
          log(root, 'Opened window "' + name + '" (batch)');
        })(windowCounter);
      }
      refreshCount(root);
    }));

    unbinders.push(QA.utils.on(QA.utils.qs('#btnOpenNamed', root), 'click', function () {
      var existing = openWindows.filter(function (w) { return w.name === 'qaNamedWindow' && !w.ref.closed; });
      if (existing.length) {
        existing[0].ref.focus();
        log(root, 'Focused existing named window');
      } else {
        openPopup('Named window (reused on repeat clicks)', 'qaNamedWindow', 'named');
        log(root, 'Opened named window "qaNamedWindow"');
      }
      refreshCount(root);
    }));

    unbinders.push(QA.utils.on(QA.utils.qs('#btnCloseAll', root), 'click', function () {
      openWindows.forEach(function (w) { if (w.ref && !w.ref.closed) w.ref.close(); });
      log(root, 'Closed all tracked windows');
      refreshCount(root);
    }));

    messageHandler = function (event) {
      if (event.data && event.data.source === 'qa-popup') {
        log(root, 'Message from popup #' + event.data.id + ': "' + event.data.text + '"');
      }
    };
    window.addEventListener('message', messageHandler);

    pollTimer = setInterval(function () { refreshCount(root); }, 1000);
    refreshCount(root);
  }

  function destroy() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    if (messageHandler) { window.removeEventListener('message', messageHandler); messageHandler = null; }
    unbinders.forEach(function (u) { u(); });
    unbinders = [];
  }

  return { template: template, init: init, destroy: destroy };
})();

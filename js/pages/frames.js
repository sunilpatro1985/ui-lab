/* js/pages/frames.js
 * iFrames and Shadow DOM specimens. Frame content is assigned via the
 * .srcdoc *property* (not the HTML attribute) so nested markup never has
 * to fight attribute-quoting rules. Shadow roots are created with
 * attachShadow() in init() and guarded against double-creation when the
 * router re-enters this page.
 */
window.QA = window.QA || {};
QA.pages = QA.pages || {};

QA.pages.frames = (function () {
  var unbinders = [];
  var messageHandler = null;

  function frameDoc(bodyHtml) {
    return '<!DOCTYPE html><html><head><meta charset="utf-8">' +
      '<style>' +
      'body{font-family:system-ui,sans-serif;background:#0B1220;color:#E7ECF6;padding:14px;margin:0;font-size:13px;}' +
      'button{cursor:pointer;border:none;border-radius:6px;padding:7px 12px;font-size:12.5px;font-weight:600;background:#F5A623;color:#1a1204;margin-right:8px;}' +
      'input{background:#182338;border:1px solid #243046;color:#E7ECF6;border-radius:5px;padding:6px 8px;font-size:12.5px;}' +
      '.tag{font-family:ui-monospace,monospace;font-size:10.5px;color:#F5A623;display:block;margin-top:6px;}' +
      'iframe{width:100%;height:110px;border:1px solid #243046;border-radius:6px;margin-top:10px;}' +
      '</style></head><body>' + bodyHtml + '</body></html>';
  }

  function template() {
    return '' +
    '<div class="eyebrow">specimen 09</div>' +
    '<h1 class="page-title">iFrames &amp; Shadow DOM</h1>' +
    '<p class="page-desc">Cross-boundary specimens for practicing frame switching and shadow-root piercing, plus a couple of combinations that nest one boundary inside the other.</p>' +

    '<h3 style="margin-top:26px;">iFrames</h3>' +
    '<div class="grid-2">' +

      '<div class="card"><h3>Single iframe form</h3><p class="card-help">Type in the field and click inside the frame, then check the log below &mdash; the frame posts a message back to this page.</p>' +
        '<iframe class="demo-frame" style="height:150px;" id="frameSingle" data-testid="iframe-single"></iframe>' +
        '<div class="specimen-tag">data-testid="iframe-single"</div>' +
        '<div style="margin-top:10px;"><h3 style="font-size:13px;margin-bottom:6px;">Parent log</h3>' +
        '<div class="log-panel" id="singleFrameLog" data-testid="single-frame-log"></div></div></div>' +

      '<div class="card"><h3>Nested iframes (2 levels deep)</h3><p class="card-help">An iframe whose document contains another iframe. Good for practicing repeated switch_to.frame() calls.</p>' +
        '<iframe class="demo-frame" style="height:150px;" id="frameOuter" data-testid="iframe-nested-outer"></iframe>' +
        '<div class="specimen-tag">data-testid="iframe-nested-outer"</div>' +
        '<p style="font-size:11.5px;color:var(--text-dim);margin-top:8px;">Inner frame carries <code>data-testid="iframe-nested-inner"</code>; the button inside it carries <code>data-testid="btn-inner-frame"</code>.</p></div>' +

    '</div>' +

    '<h3 style="margin-top:26px;">Shadow DOM</h3>' +
    '<div class="grid-2">' +

      '<div class="card"><h3>Open shadow root</h3><p class="card-help">Standard <code>attachShadow({mode:"open"})</code>. Its contents are reachable from outside via <code>host.shadowRoot</code>.</p>' +
        '<div id="shadowHostOpen" data-testid="shadow-host-open"></div>' +
        '<div class="specimen-tag">data-testid="shadow-host-open"</div></div>' +

      '<div class="card"><h3>Closed shadow root</h3><p class="card-help">Created with <code>mode:"closed"</code> &mdash; <code>host.shadowRoot</code> is <code>null</code> from the outside. Useful for checking whether your tool can still pierce it.</p>' +
        '<div id="shadowHostClosed" data-testid="shadow-host-closed"></div>' +
        '<div class="specimen-tag">data-testid="shadow-host-closed"</div></div>' +

    '</div>' +

    '<h3 style="margin-top:26px;">Combinations</h3>' +
    '<div class="grid-2">' +

      '<div class="card"><h3>Shadow root inside an iframe</h3><p class="card-help">Switch into the frame first, then pierce the open shadow root that lives inside its document.</p>' +
        '<iframe class="demo-frame" style="height:130px;" id="frameWithShadow" data-testid="iframe-with-shadow-root"></iframe>' +
        '<div class="specimen-tag">data-testid="iframe-with-shadow-root"</div>' +
        '<p style="font-size:11.5px;color:var(--text-dim);margin-top:8px;">Inside the frame: host <code>[data-testid="shadow-host-in-frame"]</code>, shadow button <code>[data-testid="btn-shadow-in-frame"]</code>.</p></div>' +

      '<div class="card"><h3>iFrame inside a shadow root</h3><p class="card-help">Pierce the open shadow root first, then switch into the iframe that lives inside it.</p>' +
        '<div id="shadowHostWithFrame" data-testid="shadow-host-with-frame"></div>' +
        '<div class="specimen-tag">data-testid="shadow-host-with-frame"</div>' +
        '<p style="font-size:11.5px;color:var(--text-dim);margin-top:8px;">Inside the shadow root: iframe <code>[data-testid="iframe-in-shadow-root"]</code>, button inside it <code>[data-testid="btn-frame-in-shadow"]</code>.</p></div>' +

    '</div>';
  }

  function logTo(root, selector, text) {
    var panel = QA.utils.qs(selector, root);
    if (!panel) return;
    var entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.setAttribute('data-testid', selector.replace('#', '') + '-entry-' + (panel.children.length + 1));
    entry.textContent = '[' + QA.utils.nowTime() + '] ' + text;
    panel.prepend(entry);
  }

  function setupSingleFrame(root) {
    var frame = QA.utils.qs('#frameSingle', root);
    frame.srcdoc = frameDoc(
      '<label for="innerInput">Message</label><br>' +
      '<input id="innerInput" data-testid="input-inside-frame" placeholder="Type something…"><br><br>' +
      '<button id="innerBtn" data-testid="btn-inside-frame">Send to parent</button>' +
      '<span class="tag">data-testid="input-inside-frame" / data-testid="btn-inside-frame"</span>' +
      '<script>' +
      'document.getElementById("innerBtn").addEventListener("click", function () {' +
      '  var val = document.getElementById("innerInput").value;' +
      '  window.parent.postMessage({ source: "qa-frame-single", text: val }, "*");' +
      '});' +
      '</script>'
    );
  }

  function setupNestedFrame(root) {
    var outer = QA.utils.qs('#frameOuter', root);
    var innerDoc = outer.contentDocument;
    if (!innerDoc || innerDoc.getElementById('frameInner')) return;
    innerDoc.body.innerHTML =
      '<p style="margin:0 0 8px;font-family:system-ui,sans-serif;font-size:13px;">Outer frame</p>' +
      '<iframe id="frameInner" data-testid="iframe-nested-inner" style="width:100%;height:90px;border:1px solid #243046;border-radius:6px;"></iframe>';
    var inner = innerDoc.getElementById('frameInner');
    inner.srcdoc = frameDoc(
      '<p style="margin:0 0 8px;">Inner frame</p>' +
      '<button id="innerFrameBtn" data-testid="btn-inner-frame">Click me</button>' +
      '<p id="innerFrameStatus" data-testid="inner-frame-status" style="margin-top:8px;">not clicked</p>' +
      '<script>' +
      'document.getElementById("innerFrameBtn").addEventListener("click", function () {' +
      '  document.getElementById("innerFrameStatus").textContent = "clicked";' +
      '});' +
      '</script>'
    );
  }

  function shadowTemplate(idPrefix) {
    return '' +
      '<style>' +
      '.wrap{font-family:system-ui,sans-serif;font-size:13px;}' +
      'button{cursor:pointer;border:none;border-radius:6px;padding:7px 12px;font-size:12.5px;font-weight:600;background:var(--amber,#F5A623);color:#1a1204;}' +
      '.count{font-family:ui-monospace,monospace;color:var(--amber,#F5A623);margin-left:10px;}' +
      '</style>' +
      '<div class="wrap">' +
      '<button data-testid="btn-' + idPrefix + '">Increment (in shadow root)</button>' +
      '<span class="count" data-testid="count-' + idPrefix + '">0</span>' +
      '</div>';
  }

  function setupShadowHost(root, hostSelector, mode, idPrefix) {
    var host = QA.utils.qs(hostSelector, root);
    if (!host || host.shadowRoot || host.dataset.shadowAttached) return;
    var shadow = host.attachShadow({ mode: mode });
    shadow.innerHTML = shadowTemplate(idPrefix);
    host.dataset.shadowAttached = 'true';
    var count = 0;
    shadow.querySelector('[data-testid="btn-' + idPrefix + '"]').addEventListener('click', function () {
      count++;
      shadow.querySelector('[data-testid="count-' + idPrefix + '"]').textContent = count;
    });
  }

  function setupFrameWithShadow(root) {
    var frame = QA.utils.qs('#frameWithShadow', root);
    frame.srcdoc = frameDoc('<div id="shadowHostInFrame" data-testid="shadow-host-in-frame"></div>');
    frame.addEventListener('load', function onLoad() {
      var doc = frame.contentDocument;
      var host = doc && doc.getElementById('shadowHostInFrame');
      if (!host || host.shadowRoot) return;
      var shadow = host.attachShadow({ mode: 'open' });
      shadow.innerHTML =
        '<button id="btn" data-testid="btn-shadow-in-frame" style="cursor:pointer;border:none;border-radius:6px;padding:7px 12px;background:#F5A623;color:#1a1204;font-weight:600;">Click (frame + shadow)</button>' +
        '<span id="status" data-testid="status-shadow-in-frame" style="margin-left:10px;font-family:ui-monospace,monospace;color:#F5A623;">idle</span>';
      shadow.getElementById('btn').addEventListener('click', function () {
        shadow.getElementById('status').textContent = 'clicked';
      });
    });
  }

  function setupShadowWithFrame(root) {
    var host = QA.utils.qs('#shadowHostWithFrame', root);
    if (!host || host.shadowRoot) return;
    var shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<iframe id="frameInShadow" data-testid="iframe-in-shadow-root" style="width:100%;height:110px;border:1px solid var(--border,#243046);border-radius:6px;"></iframe>';
    var frame = shadow.getElementById('frameInShadow');
    frame.srcdoc = frameDoc(
      '<button id="btn" data-testid="btn-frame-in-shadow">Click (shadow + frame)</button>' +
      '<p id="status" data-testid="status-frame-in-shadow" style="margin-top:8px;">idle</p>' +
      '<script>' +
      'document.getElementById("btn").addEventListener("click", function () {' +
      '  document.getElementById("status").textContent = "clicked";' +
      '});' +
      '</script>'
    );
  }

  function init(root) {
    setupSingleFrame(root);
    setupNestedFrame(root);
    setupShadowHost(root, '#shadowHostOpen', 'open', 'shadow-open');
    setupShadowHost(root, '#shadowHostClosed', 'closed', 'shadow-closed');
    setupFrameWithShadow(root);
    setupShadowWithFrame(root);

    messageHandler = function (event) {
      if (event.data && event.data.source === 'qa-frame-single') {
        logTo(root, '#singleFrameLog', 'Message from iframe: "' + event.data.text + '"');
      }
    };
    window.addEventListener('message', messageHandler);
  }

  function destroy() {
    if (messageHandler) { window.removeEventListener('message', messageHandler); messageHandler = null; }
    unbinders.forEach(function (u) { u(); });
    unbinders = [];
  }

  return { template: template, init: init, destroy: destroy };
})();

/* js/pages/elements.js */
window.QA = window.QA || {};
QA.pages = QA.pages || {};

QA.pages.elements = (function () {
  var liveInterval = null;
  var clickCount = 0;
  var unbinders = [];

  function template() {
    return '' +
    '<div class="eyebrow">specimen 02</div>' +
    '<h1 class="page-title">Web elements</h1>' +
    '<p class="page-desc">A menagerie of common controls, each tagged with the locator you\'d use to grab it.</p>' +
    '<div class="grid-2">' +

      '<div class="card"><h3>Buttons</h3><div class="btn-row">' +
        '<div><button class="primary" id="btnPrimary" data-testid="btn-primary">Click me</button><div class="specimen-tag">data-testid="btn-primary"</div></div>' +
        '<div><button disabled id="btnDisabled" data-testid="btn-disabled">Disabled</button><div class="specimen-tag">data-testid="btn-disabled"</div></div>' +
      '</div><p style="margin-top:12px;font-size:12.5px;color:var(--text-dim);">Clicks: <span id="clickCount" data-testid="click-count">0</span></p></div>' +

      '<div class="card"><h3>Checkbox &amp; radio</h3>' +
        '<div class="checkbox-row"><input type="checkbox" id="chkSubscribe" data-testid="chk-subscribe"><label for="chkSubscribe">Subscribe to updates</label></div>' +
        '<div class="specimen-tag">data-testid="chk-subscribe"</div>' +
        '<div class="radio-group" style="margin-top:14px;">' +
          '<div class="radio-row"><input type="radio" name="plan" id="planBasic" data-testid="radio-plan-basic" checked><label for="planBasic">Basic</label></div>' +
          '<div class="radio-row"><input type="radio" name="plan" id="planPro" data-testid="radio-plan-pro"><label for="planPro">Pro</label></div>' +
          '<div class="radio-row"><input type="radio" name="plan" id="planEnterprise" data-testid="radio-plan-enterprise"><label for="planEnterprise">Enterprise</label></div>' +
        '</div><div class="specimen-tag">data-testid="radio-plan-*"</div></div>' +

      '<div class="card"><h3>Select dropdowns</h3>' +
        '<div class="field"><label class="field-label">Country (single)</label>' +
        '<select id="selectCountry" data-testid="select-country"><option value="">Choose…</option><option value="us">United States</option><option value="in">India</option><option value="de">Germany</option><option value="jp">Japan</option></select>' +
        '<div class="specimen-tag">data-testid="select-country"</div></div>' +
        '<div class="field"><label class="field-label">Skills (multi)</label>' +
        '<select id="selectSkills" data-testid="select-skills" multiple size="4"><option value="selenium">Selenium</option><option value="playwright">Playwright</option><option value="cypress">Cypress</option><option value="appium">Appium</option></select>' +
        '<div class="specimen-tag">data-testid="select-skills"</div></div></div>' +

      '<div class="card"><h3>Text, range, color, date</h3>' +
        '<div class="field"><label class="field-label">Bio</label><textarea id="textareaBio" data-testid="textarea-bio" placeholder="Say something…"></textarea><div class="specimen-tag">data-testid="textarea-bio"</div></div>' +
        '<div class="field"><label class="field-label">Volume</label><input type="range" id="rangeVolume" data-testid="range-volume" min="0" max="100" value="40"><div class="specimen-tag">data-testid="range-volume"</div></div>' +
        '<div class="inline-group">' +
          '<div><label class="field-label">Color</label><input type="color" id="inputColor" data-testid="input-color" value="#f5a623" style="width:60px;padding:2px;"><div class="specimen-tag">data-testid="input-color"</div></div>' +
          '<div><label class="field-label">Date</label><input type="date" id="inputDate" data-testid="input-date"><div class="specimen-tag">data-testid="input-date"</div></div>' +
        '</div></div>' +

      '<div class="card"><h3>File upload &amp; toggle</h3>' +
        '<div class="field"><label class="field-label">Upload avatar</label><input type="file" id="inputFile" data-testid="input-file"><div class="specimen-tag">data-testid="input-file"</div></div>' +
        '<div class="field"><label class="field-label">Dark focus mode</label><br>' +
        '<label class="switch"><input type="checkbox" id="toggleDarkmode" data-testid="toggle-darkmode"><span class="slider-toggle"></span></label>' +
        '<div class="specimen-tag">data-testid="toggle-darkmode"</div></div></div>' +

      '<div class="card"><h3>Tooltip &amp; hidden element</h3>' +
        '<div class="tooltip-wrap" data-testid="tooltip-trigger" id="tooltipTrigger"><button>Hover me</button><span class="tooltip-bubble" data-testid="tooltip-bubble">I\'m a tooltip</span></div>' +
        '<div class="specimen-tag">data-testid="tooltip-trigger"</div>' +
        '<div style="margin-top:16px;"><button id="btnToggleHidden" data-testid="btn-toggle-hidden">Reveal hidden element</button>' +
        '<div class="specimen-tag">data-testid="btn-toggle-hidden"</div>' +
        '<div class="hidden-el" id="hiddenElement" data-testid="hidden-element">You found me. I was <code>display:none</code>.</div></div></div>' +

      '<div class="card"><h3>Drag &amp; drop</h3>' +
        '<div class="draggable" draggable="true" id="draggableItem" data-testid="draggable-item">⠿ drag me</div><div class="specimen-tag">data-testid="draggable-item"</div>' +
        '<div class="dropzone" id="dropzone" data-testid="dropzone" style="margin-top:10px;">Drop here</div><div class="specimen-tag">data-testid="dropzone"</div></div>' +

      '<div class="card"><h3>Tabs</h3>' +
        '<div class="tabs-header">' +
          '<button class="tab-btn active" data-tab="1" data-testid="tab-1">Overview</button>' +
          '<button class="tab-btn" data-tab="2" data-testid="tab-2">Details</button>' +
          '<button class="tab-btn" data-tab="3" data-testid="tab-3">Logs</button>' +
        '</div>' +
        '<div class="tab-panel active" id="tabpanel-1" data-testid="tabpanel-1">Overview panel content.</div>' +
        '<div class="tab-panel" id="tabpanel-2" data-testid="tabpanel-2">Details panel content.</div>' +
        '<div class="tab-panel" id="tabpanel-3" data-testid="tabpanel-3">Logs panel content.</div></div>' +

      '<div class="card"><h3>Accordion</h3>' +
        '<div class="acc-item"><button class="acc-header" data-testid="accordion-header-1">Section one <span>+</span></button><div class="acc-panel" id="accordion-panel-1" data-testid="accordion-panel-1">Content for section one.</div></div>' +
        '<div class="acc-item"><button class="acc-header" data-testid="accordion-header-2">Section two <span>+</span></button><div class="acc-panel" id="accordion-panel-2" data-testid="accordion-panel-2">Content for section two.</div></div></div>' +

      '<div class="card"><h3>Modal dialog</h3><button class="primary" id="btnOpenModal" data-testid="btn-open-modal">Open modal</button><div class="specimen-tag">data-testid="btn-open-modal"</div></div>' +

      '<div class="card"><h3>Links &amp; iframe</h3>' +
        '<p style="font-size:13px;"><a href="#/dashboard" data-testid="link-internal">Internal link &rarr; dashboard</a></p>' +
        '<p style="font-size:13px;"><a href="https://example.com" target="_blank" rel="noopener" data-testid="link-external">External link (opens new tab)</a></p>' +
        '<iframe class="demo-frame" data-testid="iframe-demo" srcdoc="<body style=\'font-family:sans-serif;color:#333;padding:10px;\'>Content inside an iframe</body>"></iframe></div>' +

      '<div class="card"><h3>Live-updating counter</h3><p class="card-help">Useful for practicing waits on values that change on their own.</p>' +
        '<div class="live-counter" id="liveCounter" data-testid="live-counter">0</div></div>' +

    '</div>';
  }

  function init(root) {
    var qs = QA.utils.qs, on = QA.utils.on;
    clickCount = 0;

    unbinders.push(on(qs('#btnPrimary', root), 'click', function () {
      clickCount++;
      qs('#clickCount', root).textContent = clickCount;
    }));

    unbinders.push(on(qs('#btnToggleHidden', root), 'click', function () {
      qs('#hiddenElement', root).classList.toggle('show');
    }));

    // drag & drop
    var draggable = qs('#draggableItem', root);
    var dropzone = qs('#dropzone', root);
    unbinders.push(on(draggable, 'dragstart', function (e) { e.dataTransfer.setData('text/plain', 'item'); }));
    unbinders.push(on(dropzone, 'dragover', function (e) { e.preventDefault(); dropzone.classList.add('over'); }));
    unbinders.push(on(dropzone, 'dragleave', function () { dropzone.classList.remove('over'); }));
    unbinders.push(on(dropzone, 'drop', function (e) {
      e.preventDefault();
      dropzone.classList.remove('over');
      dropzone.textContent = 'Dropped ✓';
      dropzone.setAttribute('data-dropped', 'true');
    }));

    // tabs
    QA.utils.qsa('.tab-btn', root).forEach(function (btn) {
      unbinders.push(on(btn, 'click', function () {
        QA.utils.qsa('.tab-btn', root).forEach(function (b) { b.classList.remove('active'); });
        QA.utils.qsa('.tab-panel', root).forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        qs('#tabpanel-' + btn.getAttribute('data-tab'), root).classList.add('active');
      }));
    });

    // accordion
    QA.utils.qsa('.acc-header', root).forEach(function (h, idx) {
      unbinders.push(on(h, 'click', function () {
        qs('#accordion-panel-' + (idx + 1), root).classList.toggle('open');
      }));
    });

    // modal (overlay lives in the app shell, outside root)
    unbinders.push(on(qs('#btnOpenModal', root), 'click', function () { QA.utils.openModal('modalOverlay'); }));

    // live counter
    var liveVal = 0;
    liveInterval = setInterval(function () {
      liveVal++;
      var el = qs('#liveCounter', root);
      if (el) el.textContent = liveVal;
    }, 1000);
  }

  function destroy() {
    if (liveInterval) { clearInterval(liveInterval); liveInterval = null; }
    unbinders.forEach(function (u) { u(); });
    unbinders = [];
  }

  return { template: template, init: init, destroy: destroy };
})();

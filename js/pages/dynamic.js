/* js/pages/dynamic.js */
window.QA = window.QA || {};
QA.pages = QA.pages || {};

QA.pages.dynamic = (function () {
  var unbinders = [];
  var timers = [];
  var dynamicCount = 0;

  function template() {
    return '' +
    '<div class="eyebrow">specimen 06</div>' +
    '<h1 class="page-title">Dynamic loading &amp; alerts</h1>' +
    '<p class="page-desc">Waits, spinners, delayed DOM insertion, native browser dialogs, and toast notifications.</p>' +
    '<div class="grid-2">' +

      '<div class="card"><h3>Delayed content load</h3><p class="card-help">Click to trigger a 2-second load, useful for explicit-wait practice.</p>' +
        '<button class="primary" id="btnLoadData" data-testid="btn-load-data">Load data</button>' +
        '<div style="margin-top:14px;"><div class="spinner" id="loadSpinner" data-testid="spinner" style="display:none;"></div>' +
        '<div id="loadedContent" data-testid="loaded-content" style="display:none;color:var(--teal);font-size:13px;">✓ Data loaded successfully at <span id="loadTimestamp"></span></div></div></div>' +

      '<div class="card"><h3>Progress bar</h3><button id="btnStartProgress" data-testid="btn-start-progress">Start</button>' +
        '<div class="progress-track" style="margin-top:14px;"><div class="progress-fill" id="progressFill" data-testid="progress-bar"></div></div></div>' +

      '<div class="card"><h3>Native browser dialogs</h3><div class="btn-row">' +
        '<button id="btnJsAlert" data-testid="btn-js-alert">alert()</button>' +
        '<button id="btnJsConfirm" data-testid="btn-js-confirm">confirm()</button>' +
        '<button id="btnJsPrompt" data-testid="btn-js-prompt">prompt()</button></div>' +
        '<p style="margin-top:12px;font-size:13px;">confirm result: <span id="confirmResult" data-testid="confirm-result">—</span></p>' +
        '<p style="font-size:13px;">prompt result: <span id="promptResult" data-testid="prompt-result">—</span></p></div>' +

      '<div class="card"><h3>Toast notifications</h3><div class="btn-row">' +
        '<button id="btnShowToastSuccess" data-testid="btn-show-toast-success">Show success toast</button>' +
        '<button id="btnShowToastError" data-testid="btn-show-toast-error">Show error toast</button></div></div>' +

      '<div class="card"><h3>Conditional / dependent button</h3>' +
        '<div class="checkbox-row"><input type="checkbox" id="chkUnlock" data-testid="chk-unlock-action"><label for="chkUnlock">Enable the action button</label></div>' +
        '<button id="btnConditional" data-testid="btn-conditional" disabled style="margin-top:8px;">Conditional action</button></div>' +

      '<div class="card"><h3>Dynamically appended elements</h3><p class="card-help">Each click appends a brand-new element with an incrementing id, at a random delay.</p>' +
        '<button id="btnAddDynamic" data-testid="btn-add-dynamic-element">Add element</button>' +
        '<div id="dynamicContainer" data-testid="dynamic-container" style="margin-top:12px;display:flex;flex-direction:column;gap:8px;"></div></div>' +

    '</div>';
  }

  function init(root) {
    var qs = function (sel) { return QA.utils.qs(sel, root); };

    unbinders.push(QA.utils.on(qs('#btnLoadData'), 'click', function () {
      var spinner = qs('#loadSpinner');
      var content = qs('#loadedContent');
      content.style.display = 'none';
      spinner.style.display = 'inline-block';
      timers.push(setTimeout(function () {
        spinner.style.display = 'none';
        content.style.display = 'block';
        qs('#loadTimestamp').textContent = QA.utils.nowTime();
      }, 2000));
    }));

    unbinders.push(QA.utils.on(qs('#btnStartProgress'), 'click', function () {
      var fill = qs('#progressFill');
      var pct = 0;
      fill.style.width = '0%';
      var t = setInterval(function () {
        pct += 2;
        fill.style.width = pct + '%';
        if (pct >= 100) clearInterval(t);
      }, 40);
      timers.push(t);
    }));

    unbinders.push(QA.utils.on(qs('#btnJsAlert'), 'click', function () { alert('This is a native alert.'); }));
    unbinders.push(QA.utils.on(qs('#btnJsConfirm'), 'click', function () {
      var res = confirm('Do you confirm this action?');
      qs('#confirmResult').textContent = res ? 'accepted' : 'dismissed';
    }));
    unbinders.push(QA.utils.on(qs('#btnJsPrompt'), 'click', function () {
      var res = prompt('Type something:');
      qs('#promptResult').textContent = res === null ? 'cancelled' : (res || '(empty)');
    }));

    unbinders.push(QA.utils.on(qs('#btnShowToastSuccess'), 'click', function () { QA.utils.showToast('Action completed successfully.', 'success'); }));
    unbinders.push(QA.utils.on(qs('#btnShowToastError'), 'click', function () { QA.utils.showToast('Something went wrong.', 'error'); }));

    unbinders.push(QA.utils.on(qs('#chkUnlock'), 'change', function () { qs('#btnConditional').disabled = !this.checked; }));

    unbinders.push(QA.utils.on(qs('#btnAddDynamic'), 'click', function () {
      var delay = 300 + Math.random() * 1200;
      var t = setTimeout(function () {
        dynamicCount++;
        var el = document.createElement('div');
        el.textContent = 'Dynamic element #' + dynamicCount + ' — appeared after ' + Math.round(delay) + 'ms';
        el.setAttribute('data-testid', 'dynamic-element-' + dynamicCount);
        el.style.cssText = 'padding:8px 12px;background:var(--surface-2);border-radius:6px;font-size:12.5px;border:1px solid var(--border);';
        var container = qs('#dynamicContainer');
        if (container) container.appendChild(el);
      }, delay);
      timers.push(t);
    }));
  }

  function destroy() {
    timers.forEach(function (t) { clearTimeout(t); clearInterval(t); });
    timers = [];
    unbinders.forEach(function (u) { u(); });
    unbinders = [];
  }

  return { template: template, init: init, destroy: destroy };
})();

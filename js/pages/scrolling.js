/* js/pages/scrolling.js
 * Three scroll patterns to practice against:
 *   1. A plain fixed-height scroll container (scrollTop / scrollIntoView).
 *   2. Manual "Load more" pagination (click, wait, assert new items).
 *   3. True infinite scroll — a bottom sentinel watched by an
 *      IntersectionObserver appends the next batch automatically, same
 *      mechanism real infinite-scroll feeds use.
 * Every "fetch" has a simulated network delay, so both patterns are
 * useful for practicing explicit waits rather than instant assertions.
 */
window.QA = window.QA || {};
QA.pages = QA.pages || {};

QA.pages.scrolling = (function () {
  var unbinders = [];
  var observer = null;
  var FETCH_DELAY = 500;
  var BATCH_SIZE = 10;
  var MAX_ITEMS = 60;

  function template() {
    var basicRows = [];
    for (var i = 1; i <= 60; i++) {
      basicRows.push('<div class="scroll-row" data-testid="scroll-row-' + i + '">Row ' + i + '</div>');
    }

    return '' +
    '<div class="eyebrow">specimen 12</div>' +
    '<h1 class="page-title">Scrolling: normal, load-more &amp; infinite</h1>' +
    '<p class="page-desc">Three scroll patterns testers run into constantly: a plain scrollable container, a manual "load more" button, and true infinite scroll driven by an IntersectionObserver. Every load has a simulated delay, so waits actually matter.</p>' +

    '<div class="card">' +
      '<h3>Regular scroll container</h3>' +
      '<p class="card-help">A fixed-height container with a native scrollbar. Good for practicing <code>scrollTop</code> assertions and <code>scrollIntoView()</code>.</p>' +
      '<div class="btn-row" style="margin-bottom:12px;">' +
        '<button class="small" id="btnScrollTop" data-testid="btn-scroll-top">Scroll to top</button>' +
        '<button class="small" id="btnScrollRow30" data-testid="btn-scroll-row-30">Scroll to row 30</button>' +
        '<button class="small" id="btnScrollBottom" data-testid="btn-scroll-bottom">Scroll to bottom</button>' +
        '<span class="specimen-tag" data-testid="scroll-position-basic">0% scrolled</span>' +
      '</div>' +
      '<div class="scroll-box" id="basicScrollBox" data-testid="scroll-container-basic">' + basicRows.join('') + '</div>' +
    '</div>' +

    '<div class="card">' +
      '<h3>Load more button (manual pagination)</h3>' +
      '<p class="card-help">Click loads the next ' + BATCH_SIZE + ' items after a simulated network delay, up to ' + MAX_ITEMS + ' total.</p>' +
      '<div id="loadMoreList" data-testid="load-more-list"></div>' +
      '<div class="btn-row" style="margin-top:12px;">' +
        '<button class="primary" id="btnLoadMore" data-testid="btn-load-more">Load more</button>' +
        '<div class="spinner" id="loadMoreSpinner" data-testid="load-more-spinner" style="display:none;"></div>' +
      '</div>' +
      '<p class="card-help" id="loadMoreStatus" data-testid="load-more-status" style="margin-top:10px;"></p>' +
    '</div>' +

    '<div class="card">' +
      '<h3>Infinite scroll (auto-load)</h3>' +
      '<p class="card-help">Scroll near the bottom of the box and the next batch loads on its own &mdash; no button, no click, just a sentinel element and an <code>IntersectionObserver</code>.</p>' +
      '<div class="scroll-box" id="infiniteScrollBox" data-testid="infinite-scroll-container" style="max-height:300px;">' +
        '<div id="infiniteItems" data-testid="infinite-items"></div>' +
        '<div id="infiniteSentinel" data-testid="infinite-scroll-sentinel" style="padding:14px;text-align:center;font-size:13px;color:var(--text-dim);"></div>' +
      '</div>' +
    '</div>';
  }

  function itemRow(testidPrefix, n) {
    return '<div class="scroll-row" data-testid="' + testidPrefix + '-' + n + '">Item #' + n + ' &mdash; loaded in batch ' + Math.ceil(n / BATCH_SIZE) + '</div>';
  }

  function wireBasicScroll(root) {
    var box = QA.utils.qs('#basicScrollBox', root);
    var positionTag = QA.utils.qs('[data-testid="scroll-position-basic"]', root);

    unbinders.push(QA.utils.on(QA.utils.qs('#btnScrollTop', root), 'click', function () {
      box.scrollTo({ top: 0, behavior: 'smooth' });
    }));
    unbinders.push(QA.utils.on(QA.utils.qs('#btnScrollBottom', root), 'click', function () {
      box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });
    }));
    unbinders.push(QA.utils.on(QA.utils.qs('#btnScrollRow30', root), 'click', function () {
      var row = QA.utils.qs('[data-testid="scroll-row-30"]', root);
      if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }));
    unbinders.push(QA.utils.on(box, 'scroll', function () {
      var max = box.scrollHeight - box.clientHeight;
      var pct = max <= 0 ? 100 : Math.round((box.scrollTop / max) * 100);
      positionTag.textContent = pct + '% scrolled';
    }));
  }

  function wireLoadMore(root) {
    var list = QA.utils.qs('#loadMoreList', root);
    var btn = QA.utils.qs('#btnLoadMore', root);
    var spinner = QA.utils.qs('#loadMoreSpinner', root);
    var status = QA.utils.qs('#loadMoreStatus', root);
    var loaded = 0;

    function loadBatch() {
      btn.disabled = true;
      spinner.style.display = 'block';
      setTimeout(function () {
        var html = '';
        var upTo = Math.min(loaded + BATCH_SIZE, MAX_ITEMS);
        for (var n = loaded + 1; n <= upTo; n++) html += itemRow('load-more-item', n);
        list.insertAdjacentHTML('beforeend', html);
        loaded = upTo;
        spinner.style.display = 'none';
        if (loaded >= MAX_ITEMS) {
          btn.disabled = true;
          btn.style.display = 'none';
          status.textContent = 'All ' + MAX_ITEMS + ' items loaded — no more to fetch.';
        } else {
          btn.disabled = false;
          status.textContent = loaded + ' of ' + MAX_ITEMS + ' items loaded.';
        }
      }, FETCH_DELAY);
    }

    unbinders.push(QA.utils.on(btn, 'click', loadBatch));
    loadBatch();
  }

  function wireInfiniteScroll(root) {
    var box = QA.utils.qs('#infiniteScrollBox', root);
    var items = QA.utils.qs('#infiniteItems', root);
    var sentinel = QA.utils.qs('#infiniteSentinel', root);
    var loaded = 0;
    var fetching = false;

    function loadBatch() {
      if (fetching || loaded >= MAX_ITEMS) return;
      fetching = true;
      sentinel.innerHTML = '<div class="spinner" data-testid="infinite-scroll-loading" style="margin:0 auto;"></div>';
      setTimeout(function () {
        var html = '';
        var upTo = Math.min(loaded + BATCH_SIZE, MAX_ITEMS);
        for (var n = loaded + 1; n <= upTo; n++) html += itemRow('infinite-item', n);
        items.insertAdjacentHTML('beforeend', html);
        loaded = upTo;
        fetching = false;
        if (loaded >= MAX_ITEMS) {
          sentinel.innerHTML = '';
          sentinel.textContent = "You've reached the end — no more items.";
          sentinel.setAttribute('data-testid', 'infinite-scroll-end');
          if (observer) observer.disconnect();
        } else {
          sentinel.innerHTML = '';
        }
      }, FETCH_DELAY);
    }

    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) loadBatch();
      });
    }, { root: box, threshold: 0.01 });
    observer.observe(sentinel);

    loadBatch();
  }

  function init(root) {
    wireBasicScroll(root);
    wireLoadMore(root);
    wireInfiniteScroll(root);
  }

  function destroy() {
    if (observer) { observer.disconnect(); observer = null; }
    unbinders.forEach(function (u) { u(); });
    unbinders = [];
  }

  return { template: template, init: init, destroy: destroy };
})();

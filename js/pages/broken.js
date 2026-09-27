/* js/pages/broken.js
 * Broken images & links specimens. "Working" images are inline SVG data
 * URIs (so they never depend on network access), "broken" images point
 * at relative paths that don't exist on this static server, so they 404
 * deterministically every time. Link checks use fetch() so this stays a
 * pure static app with no backend.
 */
window.QA = window.QA || {};
QA.pages = QA.pages || {};

QA.pages.broken = (function () {
  var unbinders = [];

  var PHONES = [
    { slug: 'iphone-15-pro', name: 'iPhone 15 Pro', broken: false },
    { slug: 'galaxy-s24-ultra', name: 'Galaxy S24 Ultra', broken: false },
    { slug: 'pixel-8-pro', name: 'Pixel 8 Pro', broken: true },
    { slug: 'oneplus-12', name: 'OnePlus 12', broken: true }
  ];

  var LINKS = [
    { testid: 'link-valid-internal', label: 'Dashboard (valid internal route)', href: '#/dashboard', expected: 'working' },
    { testid: 'link-valid-external', label: 'example.com (valid external site)', href: 'https://example.com', external: true, expected: 'working' },
    { testid: 'link-broken-relative', label: 'iPhone 15 spec sheet (missing file)', href: 'assets/docs/iphone-15-pro-specs.pdf', expected: 'broken' },
    { testid: 'link-broken-external', label: 'Vendor portal (dead domain)', href: 'https://qa-lab-vendor-portal-does-not-exist.example/specs', external: true, expected: 'broken' }
  ];

  function phoneSvgDataUri(name) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150">' +
      '<rect width="200" height="150" fill="#182338"/>' +
      '<rect x="78" y="20" width="44" height="110" rx="8" fill="none" stroke="#2DD4BF" stroke-width="3"/>' +
      '<text x="100" y="145" font-family="sans-serif" font-size="11" fill="#8C9BB8" text-anchor="middle">' + name + '</text>' +
      '</svg>';
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  function phoneCard(phone) {
    var src = phone.broken
      ? 'assets/img/phones/' + phone.slug + '-photo-missing.jpg'
      : phoneSvgDataUri(phone.name);
    return '' +
      '<div style="text-align:center;">' +
      '<img src="' + src + '" alt="' + phone.name + ' product photo" data-testid="img-phone-' + phone.slug + '" ' +
        'style="width:100%;max-width:160px;height:120px;object-fit:contain;background:var(--bg);border:1px solid var(--border);border-radius:8px;">' +
      '<div style="font-size:13.5px;margin-top:8px;">' + phone.name + '</div>' +
      '<span class="status-badge pending" data-testid="img-status-' + phone.slug + '">checking…</span>' +
      '</div>';
  }

  function template() {
    return '' +
    '<div class="eyebrow">specimen 10</div>' +
    '<h1 class="page-title">Broken images &amp; links</h1>' +
    '<p class="page-desc">A mix of working and intentionally-broken images and links, using real phone models as the example content. Good for practicing image-load assertions, alt-text fallbacks, and link/health checking.</p>' +

    '<div class="grid-2">' +

      '<div class="card"><h3>Phone catalogue</h3><p class="card-help">Two images load fine, two are pointed at files that don\'t exist &mdash; watch the status badge under each one flip once the browser fires its load/error event.</p>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">' +
          PHONES.map(phoneCard).join('') +
        '</div></div>' +

      '<div class="card"><h3>Link health check</h3><p class="card-help">One internal route, one real external site, one missing local file, one dead domain. Click the button to probe each with <code>fetch()</code> and log the outcome.</p>' +
        '<ul class="plain" style="margin-bottom:14px;">' +
        LINKS.map(function (l) {
          return '<li style="margin-bottom:8px;">' +
            '<a href="' + l.href + '"' + (l.external ? ' target="_blank" rel="noopener"' : '') + ' data-testid="' + l.testid + '">' + l.label + '</a> ' +
            '<span class="specimen-tag" data-expected="' + l.expected + '">expects: ' + l.expected + '</span>' +
            '</li>';
        }).join('') +
        '</ul>' +
        '<div class="btn-row" style="margin-bottom:14px;">' +
          '<button class="primary" id="btnCheckLinks" data-testid="btn-check-links">Check all links</button>' +
        '</div>' +
        '<div class="log-panel" id="linkCheckLog" data-testid="link-check-log"></div></div>' +

    '</div>' +

    '<h3 style="margin-top:26px;">Combination</h3>' +
    '<div class="card" style="max-width:340px;">' +
      '<h3>Broken thumbnail as a link</h3>' +
      '<p class="card-help">A dead product photo wrapped in a link to a page that doesn\'t exist either &mdash; the two defects testers hit together most often.</p>' +
      '<a href="#/product/pixel-9-pro" data-testid="link-broken-thumbnail" style="display:inline-block;">' +
        '<img src="assets/img/phones/pixel-9-pro-photo-missing.jpg" alt="Pixel 9 Pro product photo" data-testid="img-broken-thumbnail" ' +
          'style="width:160px;height:120px;object-fit:contain;background:var(--bg);border:1px solid var(--border);border-radius:8px;">' +
      '</a>' +
      '<div style="font-size:13.5px;margin-top:8px;">Pixel 9 Pro &rarr; <code>#/product/pixel-9-pro</code> (unregistered route)</div>' +
    '</div>';
  }

  function wireImageStatus(root) {
    PHONES.forEach(function (phone) {
      var img = QA.utils.qs('[data-testid="img-phone-' + phone.slug + '"]', root);
      var badge = QA.utils.qs('[data-testid="img-status-' + phone.slug + '"]', root);
      if (!img || !badge) return;
      var markLoaded = function () { badge.textContent = 'loaded'; badge.className = 'status-badge active'; };
      var markBroken = function () { badge.textContent = 'broken'; badge.className = 'status-badge inactive'; };
      if (img.complete) {
        (img.naturalWidth > 0 ? markLoaded : markBroken)();
      } else {
        unbinders.push(QA.utils.on(img, 'load', markLoaded));
        unbinders.push(QA.utils.on(img, 'error', markBroken));
      }
    });
  }

  function logLink(root, text) {
    var panel = QA.utils.qs('#linkCheckLog', root);
    if (!panel) return;
    var entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.setAttribute('data-testid', 'link-check-entry-' + (panel.children.length + 1));
    entry.textContent = '[' + QA.utils.nowTime() + '] ' + text;
    panel.prepend(entry);
  }

  function checkLink(link) {
    if (link.href.indexOf('#') === 0) {
      return Promise.resolve(link.label + ' — internal route, no network request needed');
    }
    if (link.external) {
      // Cross-origin responses are opaque without CORS headers, but the
      // fetch still resolves if the host is reachable and only rejects
      // on a real network/DNS failure — enough to tell "up" from "dead".
      return fetch(link.href, { method: 'HEAD', mode: 'no-cors' })
        .then(function () { return link.label + ' — reachable (cross-origin, opaque response)'; })
        .catch(function () { return link.label + ' — unreachable (network/DNS failure)'; });
    }
    return fetch(link.href, { method: 'HEAD' })
      .then(function (res) { return link.label + ' — HTTP ' + res.status + (res.ok ? ' (reachable)' : ' (error status)'); })
      .catch(function () { return link.label + ' — request failed'; });
  }

  function init(root) {
    wireImageStatus(root);

    unbinders.push(QA.utils.on(QA.utils.qs('#btnCheckLinks', root), 'click', function () {
      logLink(root, 'Checking ' + LINKS.length + ' links…');
      LINKS.forEach(function (link) {
        checkLink(link).then(function (msg) { logLink(root, msg); });
      });
    }));
  }

  function destroy() {
    unbinders.forEach(function (u) { u(); });
    unbinders = [];
  }

  return { template: template, init: init, destroy: destroy };
})();

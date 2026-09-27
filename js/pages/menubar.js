/* js/pages/menubar.js
 * A desktop-app-style menu bar: top-level items open a dropdown on
 * hover, and dropdown items that themselves have children open a
 * flyout submenu on hover, to any nesting depth.
 *
 * Submenus are NOT sitting in the DOM hidden behind CSS — each <ul> is
 * created and inserted only on mouseenter of its parent, and removed
 * again on mouseleave. That mirrors a lazily-rendered menu (React/Vue
 * conditional render, a virtualized menu, etc.): a locator for a
 * submenu item genuinely does not exist until the parent is hovered,
 * so this is good practice for explicit waits ("hover, then wait for
 * the element to appear") rather than elements that are merely hidden.
 */
window.QA = window.QA || {};
QA.pages = QA.pages || {};

QA.pages.menubar = (function () {
  var unbinders = [];
  var frozen = false;

  var MENUS = [
    {
      id: 'file', label: 'File',
      items: [
        { id: 'new', label: 'New document' },
        { id: 'open', label: 'Open…' },
        { id: 'save', label: 'Save' },
        { id: 'export', label: 'Export', items: [
          { id: 'pdf', label: 'Export as PDF' },
          { id: 'csv', label: 'Export as CSV' },
          { id: 'png', label: 'Export as PNG' }
        ] }
      ]
    },
    {
      id: 'edit', label: 'Edit',
      items: [
        { id: 'cut', label: 'Cut' },
        { id: 'copy', label: 'Copy' },
        { id: 'paste', label: 'Paste' },
        { id: 'find', label: 'Find & replace', items: [
          { id: 'find', label: 'Find' },
          { id: 'replace', label: 'Replace' }
        ] }
      ]
    },
    {
      id: 'view', label: 'View',
      items: [
        { id: 'zoomin', label: 'Zoom in' },
        { id: 'zoomout', label: 'Zoom out' },
        { id: 'theme', label: 'Theme', items: [
          { id: 'light', label: 'Light' },
          { id: 'dark', label: 'Dark' },
          { id: 'system', label: 'System' }
        ] }
      ]
    },
    {
      id: 'help', label: 'Help',
      items: [
        { id: 'docs', label: 'Documentation' },
        { id: 'shortcuts', label: 'Keyboard shortcuts' },
        { id: 'about', label: 'About' }
      ]
    }
  ];

  function template() {
    return '' +
    '<div class="eyebrow">specimen 11</div>' +
    '<h1 class="page-title">Menu bar &amp; nested submenus</h1>' +
    '<p class="page-desc">A classic desktop-app menu bar. Hover a top-level item to open its dropdown, then hover an item with a &#9656; caret to open its flyout submenu &mdash; three levels deep in places.</p>' +

    '<div class="card">' +
      '<h3>Application menu</h3>' +
      '<p class="card-help">Each submenu is created and inserted into the DOM on <code>mouseenter</code> and removed again on <code>mouseleave</code> &mdash; a submenu item\'s locator genuinely doesn\'t exist until its parent is hovered, so this is a good one for practicing explicit "hover, then wait for element" waits rather than just unhiding a pre-rendered node.</p>' +
      '<div class="btn-row" style="margin-bottom:16px;">' +
        '<label class="switch"><input type="checkbox" id="toggleFreezeMenu" data-testid="toggle-freeze-menu"><span class="slider-toggle"></span></label>' +
        '<span style="font-size:13.5px;color:var(--text-dim);">Freeze menus open (for inspecting in DevTools)</span>' +
        '<button class="small" id="btnCloseAllMenus" data-testid="btn-close-all-menus">Close all menus</button>' +
      '</div>' +
      '<nav class="menubar" data-testid="menu-bar">' +
        MENUS.map(function (menu) {
          return '<div class="menu-item" data-testid="menu-' + menu.id + '">' +
            '<span class="menu-text">' + menu.label + '</span>' +
            '</div>';
        }).join('') +
      '</nav>' +
      '<div style="margin-top:18px;">' +
        '<h3 style="font-size:13px;">Selection log</h3>' +
        '<div class="log-panel" id="menuSelectionLog" data-testid="menu-selection-log"></div>' +
      '</div>' +
    '</div>';
  }

  function log(root, text) {
    var panel = QA.utils.qs('#menuSelectionLog', root);
    if (!panel) return;
    var entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.setAttribute('data-testid', 'menu-selection-entry-' + (panel.children.length + 1));
    entry.textContent = '[' + QA.utils.nowTime() + '] ' + text;
    panel.prepend(entry);
  }

  function itemHtml(pathId, item) {
    var testid = 'menu-' + pathId + '-' + item.id;
    if (item.items) {
      return '<li class="has-submenu" data-testid="' + testid + '">' +
        '<span class="menu-text">' + item.label + ' <span class="menu-caret">&#9656;</span></span>' +
        '</li>';
    }
    return '<li data-testid="' + testid + '"><span class="menu-text">' + item.label + '</span></li>';
  }

  // Wires a trigger element (a top-level .menu-item, or a nested
  // .has-submenu <li>) so its <ul class="submenu"> is built and
  // inserted only while the mouse is over the trigger. Always checks
  // the live DOM (rather than a closure variable) for whether a submenu
  // is already open, so an externally-removed node (the "close all"
  // button, or unfreezing) can't get out of sync with this element's
  // own idea of its state.
  function wireHoverInsert(el, pathId, items) {
    unbinders.push(QA.utils.on(el, 'mouseenter', function () {
      if (el.querySelector(':scope > .submenu')) return;
      var ul = document.createElement('ul');
      ul.className = 'submenu';
      ul.setAttribute('data-testid', 'submenu-' + pathId);
      ul.innerHTML = items.map(function (item) { return itemHtml(pathId, item); }).join('');
      el.appendChild(ul);

      items.forEach(function (item) {
        if (!item.items) return;
        var childPath = pathId + '-' + item.id;
        var li = ul.querySelector('[data-testid="menu-' + childPath + '"]');
        wireHoverInsert(li, childPath, item.items);
      });
    }));

    unbinders.push(QA.utils.on(el, 'mouseleave', function () {
      if (frozen) return;
      var ul = el.querySelector(':scope > .submenu');
      if (ul) ul.remove();
    }));
  }

  function init(root) {
    var bar = QA.utils.qs('[data-testid="menu-bar"]', root);
    frozen = false;

    MENUS.forEach(function (menu) {
      var el = QA.utils.qs('[data-testid="menu-' + menu.id + '"]', root);
      wireHoverInsert(el, menu.id, menu.items);
    });

    unbinders.push(QA.utils.on(bar, 'click', function (e) {
      var li = e.target.closest('li[data-testid]');
      if (!li || li.classList.contains('has-submenu')) return;
      var text = li.querySelector(':scope > .menu-text').textContent.trim();
      log(root, 'Selected "' + text + '" (' + li.getAttribute('data-testid') + ')');
    }));

    unbinders.push(QA.utils.on(QA.utils.qs('#toggleFreezeMenu', root), 'change', function (e) {
      frozen = e.target.checked;
    }));

    unbinders.push(QA.utils.on(QA.utils.qs('#btnCloseAllMenus', root), 'click', function () {
      QA.utils.qsa('.submenu', bar).forEach(function (ul) { ul.remove(); });
    }));
  }

  function destroy() {
    unbinders.forEach(function (u) { u(); });
    unbinders = [];
  }

  return { template: template, init: init, destroy: destroy };
})();

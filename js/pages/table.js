/* js/pages/table.js */
window.QA = window.QA || {};
QA.pages = QA.pages || {};

QA.pages.table = (function () {
  var unbinders = [];
  var rows = QA.data.generateUsers(57);
  var state = { page: 1, pageSize: 10, sortKey: 'id', sortDir: 1, search: '' };

  function template() {
    return '' +
    '<div class="eyebrow">specimen 05</div>' +
    '<h1 class="page-title">Data table with pagination</h1>' +
    '<p class="page-desc">57 generated records. Sort by clicking a column header, filter with search, change page size, and page through results.</p>' +
    '<div class="card">' +
      '<div class="table-toolbar">' +
        '<input type="text" id="tableSearch" data-testid="input-table-search" placeholder="Search by name…">' +
        '<div class="btn-row"><label class="field-label" style="margin:0;">Rows per page</label>' +
        '<select id="pageSizeSelect" data-testid="select-page-size"><option value="5">5</option><option value="10" selected>10</option><option value="20">20</option></select></div>' +
      '</div>' +
      '<table class="data-table" data-testid="data-table"><thead><tr>' +
        '<th data-sort="id" data-testid="th-sort-id">ID</th>' +
        '<th data-sort="name" data-testid="th-sort-name">Name</th>' +
        '<th data-sort="email" data-testid="th-sort-email">Email</th>' +
        '<th data-sort="role" data-testid="th-sort-role">Role</th>' +
        '<th data-sort="status" data-testid="th-sort-status">Status</th>' +
      '</tr></thead><tbody id="tableBody" data-testid="table-body"></tbody></table>' +
      '<div class="pagination" id="pagination" data-testid="pagination"></div>' +
      '<p style="text-align:center;font-size:11.5px;color:var(--text-dim);margin-top:10px;font-family:var(--mono);" id="currentPageLabel" data-testid="current-page-label"></p>' +
    '</div>';
  }

  function getFilteredSorted() {
    var data = rows.filter(function (r) {
      return r.name.toLowerCase().indexOf(state.search.toLowerCase()) !== -1;
    });
    data.sort(function (a, b) {
      var av = a[state.sortKey], bv = b[state.sortKey];
      if (av < bv) return -1 * state.sortDir;
      if (av > bv) return 1 * state.sortDir;
      return 0;
    });
    return data;
  }

  function render(root) {
    var qs = function (sel) { return QA.utils.qs(sel, root); };
    var data = getFilteredSorted();
    var totalPages = Math.max(1, Math.ceil(data.length / state.pageSize));
    if (state.page > totalPages) state.page = totalPages;
    var start = (state.page - 1) * state.pageSize;
    var pageRows = data.slice(start, start + state.pageSize);

    qs('#tableBody').innerHTML = pageRows.map(function (r) {
      return '<tr data-testid="table-row-' + r.id + '">' +
        '<td data-testid="cell-id-' + r.id + '">' + r.id + '</td>' +
        '<td data-testid="cell-name-' + r.id + '">' + r.name + '</td>' +
        '<td data-testid="cell-email-' + r.id + '">' + r.email + '</td>' +
        '<td data-testid="cell-role-' + r.id + '">' + r.role + '</td>' +
        '<td data-testid="cell-status-' + r.id + '"><span class="status-badge ' + r.status + '">' + r.status + '</span></td>' +
        '</tr>';
    }).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--text-dim);">No matching records</td></tr>';

    var pag = qs('#pagination');
    var html = '<button class="page-btn" data-testid="btn-prev-page" ' + (state.page === 1 ? 'disabled' : '') + '>&lsaquo; Prev</button>';
    var maxButtons = 7;
    var startPg = Math.max(1, state.page - 3);
    var endPg = Math.min(totalPages, startPg + maxButtons - 1);
    for (var p = startPg; p <= endPg; p++) {
      html += '<button class="page-btn' + (p === state.page ? ' current' : '') + '" data-testid="page-btn-' + p + '" data-page="' + p + '">' + p + '</button>';
    }
    html += '<button class="page-btn" data-testid="btn-next-page" ' + (state.page === totalPages ? 'disabled' : '') + '>Next &rsaquo;</button>';
    pag.innerHTML = html;

    qs('#currentPageLabel').textContent = 'page ' + state.page + ' of ' + totalPages + ' · ' + data.length + ' records';

    QA.utils.qsa('[data-page]', pag).forEach(function (btn) {
      unbinders.push(QA.utils.on(btn, 'click', function () { state.page = parseInt(this.getAttribute('data-page'), 10); render(root); }));
    });
    unbinders.push(QA.utils.on(pag.querySelector('[data-testid="btn-prev-page"]'), 'click', function () { if (state.page > 1) { state.page--; render(root); } }));
    unbinders.push(QA.utils.on(pag.querySelector('[data-testid="btn-next-page"]'), 'click', function () { if (state.page < totalPages) { state.page++; render(root); } }));
  }

  function init(root) {
    state = { page: 1, pageSize: 10, sortKey: 'id', sortDir: 1, search: '' };
    var qs = function (sel) { return QA.utils.qs(sel, root); };

    unbinders.push(QA.utils.on(qs('#pageSizeSelect'), 'change', function () {
      state.pageSize = parseInt(this.value, 10);
      state.page = 1;
      render(root);
    }));
    unbinders.push(QA.utils.on(qs('#tableSearch'), 'input', function () {
      state.search = this.value;
      state.page = 1;
      render(root);
    }));
    QA.utils.qsa('th[data-sort]', root).forEach(function (th) {
      unbinders.push(QA.utils.on(th, 'click', function () {
        var key = th.getAttribute('data-sort');
        if (state.sortKey === key) { state.sortDir *= -1; } else { state.sortKey = key; state.sortDir = 1; }
        render(root);
      }));
    });

    render(root);
  }

  function destroy() {
    unbinders.forEach(function (u) { u(); });
    unbinders = [];
  }

  return { template: template, init: init, destroy: destroy };
})();

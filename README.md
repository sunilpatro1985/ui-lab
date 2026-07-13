# QA Sandbox — Automation Testing Ground

A demo site for practicing UI automation (Selenium, Playwright, Cypress,
WebdriverIO, etc). Every interactive control has a stable `data-testid`
and matching `id`.

## Running it

Just open `index.html` in a browser — double-click it, no server or
build step required. All JS files are loaded as classic `<script>` tags
under a shared `QA` namespace, so there's no ES-module/CORS restriction
that would otherwise force you to run a local server under `file://`.

If you prefer serving it anyway (e.g. to test against `http://localhost`):

```
python3 -m http.server 8000
# then open http://localhost:8000
```

## Project structure

```
index.html            shell: sidebar, nav, mount point, global modal/toast, script tags
css/
  styles.css          all styles
js/
  utils.js            DOM helpers, toasts, modal open/close
  state.js            login/session state (localStorage/sessionStorage), dispatches 'qa:authchange'
  data.js             mock dataset generator for the table page
  router.js            hash router: mounts one page module at a time, calls destroy() on navigate-away
  pages/
    home.js
    elements.js        buttons, checkboxes, selects, drag&drop, tabs, accordion, modal, tooltip, iframe...
    forms.js           registration form + validation
    login.js           login form, valid/invalid credentials, lockout
    table.js           57-row mock table: sorting, search, pagination
    dynamic.js         spinners, delayed DOM insertion, native alert/confirm/prompt, toasts
    windows.js          NEW: opening new windows/tabs (see below)
    dashboard.js       shown only once logged in
  main.js              registers routes, wires shell-level bits (session pill, reset button)
```

## How each page module works

Every file in `js/pages/` defines `QA.pages.<name>` with three parts:

```js
QA.pages.example = (function () {
  function template() { return '<div>...</div>'; }   // returns markup as a string
  function init(root) { /* attach listeners scoped to root */ }
  function destroy() { /* clear intervals/timeouts, unbind listeners */ }
  return { template, init, destroy };
})();
```

The router injects `template()` into `#app-content`, calls `init(root)`,
and calls the *previous* page's `destroy()` before doing so — so timers
like the live counter or progress bar don't keep running after you
navigate away.

## Adding a new page

1. Create `js/pages/yourpage.js` following the pattern above.
2. Add `<script src="js/pages/yourpage.js"></script>` in `index.html`,
   before `main.js`.
3. Register it in `js/main.js`: `QA.router.register('/yourpage', QA.pages.yourpage);`
4. Add a nav link in `index.html`: `<a href="#/yourpage" data-testid="nav-yourpage" data-route="/yourpage">...</a>`

No other file needs to change.

## Windows & tabs (new)

The **Windows & Tabs** page (`#/windows`) covers opening new browser
windows/tabs from both a button and a link:

- **`btn-open-window`** — opens one new, uniquely-named window per click.
- **`link-new-tab`** — a plain `target="_blank"` link.
- **`btn-open-multiple-windows`** — opens three windows in a single click,
  for practicing multi-window-handle switching.
- **`btn-open-named-window`** — always targets the same window name, so
  repeated clicks focus the existing window instead of opening new ones.
- **`btn-close-all-windows`** — closes every window opened from this page.
- **`open-window-count`** — a live count of windows still open (polled
  every second, since browsers don't fire a reliable "closed" event).
- **`window-log`** — an activity log, including messages sent back from
  a popup via `window.opener.postMessage(...)`.

Popup documents are generated as `Blob` URLs (not `document.write`), so
each popup keeps a normal `window.opener` reference and can message back
to the page that opened it. Each popup has its own `btn-notify-opener-*`
and `btn-close-popup-*` controls.

## Credentials for the login page

```
username: testuser
password: Test@123
```

Three failed attempts locks the form until you click **Reset app state**
in the sidebar (clears `localStorage`/`sessionStorage`).

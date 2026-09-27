/* js/searchIndex.js
 * Static search index for the sidebar global search. Each page lists
 * its route/label plus the card/section titles inside it, so a query
 * like "shadow root" or "broken link" matches a section but the
 * suggestion list only ever shows (and navigates to) the page.
 */
window.QA = window.QA || {};

QA.searchIndex = [
  { route: '/', label: 'Home', sections: ['A sandbox built to be automated'] },
  { route: '/elements', label: 'Elements', sections: [
    'Buttons', 'Checkbox & radio', 'Select dropdowns', 'Text, range, color, date',
    'File upload & toggle', 'Tooltip & hidden element', 'Drag & drop', 'Tabs',
    'Accordion', 'Modal dialog', 'Links & iframe', 'Live-updating counter'
  ] },
  { route: '/forms', label: 'Registration', sections: [
    'First name', 'Last name', 'Email', 'Phone', 'Password', 'Confirm password',
    'Date of birth', 'Country', 'Gender', 'Skills', 'Bio', 'Submitted data'
  ] },
  { route: '/login', label: 'Login', sections: [
    'Username', 'Password', 'Valid and invalid credential flows', 'Lockout after repeated failures'
  ] },
  { route: '/table', label: 'Data Table', sections: [
    'Sortable columns', 'Search', 'Pagination', '57 mock records'
  ] },
  { route: '/dynamic', label: 'Dynamic & Alerts', sections: [
    'Delayed content load', 'Progress bar', 'Native browser dialogs',
    'Toast notifications', 'Conditional / dependent button', 'Dynamically appended elements'
  ] },
  { route: '/windows', label: 'Windows & Tabs', sections: [
    'Open a new window', 'Open in a new tab (link)', 'Open multiple windows at once',
    'Reuse a named window', 'Activity log'
  ] },
  { route: '/frames', label: 'iFrames & Shadow DOM', sections: [
    'Single iframe form', 'Nested iframes (2 levels deep)', 'Open shadow root',
    'Closed shadow root', 'Shadow root inside an iframe', 'iFrame inside a shadow root'
  ] },
  { route: '/broken', label: 'Broken Images & Links', sections: [
    'Phone catalogue', 'Link health check', 'Broken thumbnail as a link'
  ] },
  { route: '/menu', label: 'Menu Bar', sections: [
    'Application menu', 'Export submenu', 'Find & replace submenu', 'Theme submenu', 'Selection log'
  ] },
  { route: '/scroll', label: 'Scrolling', sections: [
    'Regular scroll container', 'Load more button (manual pagination)', 'Infinite scroll (auto-load)'
  ] },
  { route: '/dashboard', label: 'Dashboard', sections: ['Session details'] }
];

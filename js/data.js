/* js/data.js
 * Mock dataset generator. Kept separate from the table page so the
 * "data source" can be swapped out (e.g. for a real API) without
 * touching any rendering or pagination logic.
 */
window.QA = window.QA || {};

QA.data = (function () {
  var FIRST = ['Alex','Jordan','Sam','Taylor','Casey','Riley','Morgan','Jamie','Avery','Quinn','Drew','Skyler','Reese','Rowan','Emerson'];
  var LAST = ['Chen','Patel','Garcia','Kim','Novak','Silva','Muller','Rossi','Nakamura','Ivanov','Dubois','Santos','Haas','Kowalski'];
  var ROLES = ['QA Engineer','Developer','Product Manager','Designer','DevOps','Support'];
  var STATUSES = ['active','inactive','pending'];

  function generateUsers(count) {
    var rows = [];
    for (var i = 1; i <= count; i++) {
      var fn = FIRST[i % FIRST.length];
      var ln = LAST[(i * 3) % LAST.length];
      rows.push({
        id: i,
        name: fn + ' ' + ln,
        email: (fn + '.' + ln + i + '@example.com').toLowerCase(),
        role: ROLES[i % ROLES.length],
        status: STATUSES[i % STATUSES.length]
      });
    }
    return rows;
  }

  return { generateUsers: generateUsers };
})();

/* js/pages/forms.js */
window.QA = window.QA || {};
QA.pages = QA.pages || {};

QA.pages.forms = (function () {
  var unbinders = [];

  function template() {
    return '' +
    '<div class="eyebrow">specimen 03</div>' +
    '<h1 class="page-title">Registration form</h1>' +
    '<p class="page-desc">Full client-side validation. Leave required fields empty or mismatch the passwords to see inline errors.</p>' +
    '<div class="success-banner" id="registrationSuccess" data-testid="registration-success">Registration successful! Summary below.</div>' +
    '<form class="card" id="registrationForm" data-testid="registration-form" novalidate>' +
      '<div class="grid-2">' +
        '<div class="field"><label class="field-label">First name</label><input type="text" id="regFirstName" data-testid="input-firstname"><div class="error-text" id="err-firstname" data-testid="error-firstname">First name is required.</div></div>' +
        '<div class="field"><label class="field-label">Last name</label><input type="text" id="regLastName" data-testid="input-lastname"><div class="error-text" id="err-lastname" data-testid="error-lastname">Last name is required.</div></div>' +
      '</div>' +
      '<div class="grid-2">' +
        '<div class="field"><label class="field-label">Email</label><input type="email" id="regEmail" data-testid="input-email"><div class="error-text" id="err-email" data-testid="error-email">Enter a valid email address.</div></div>' +
        '<div class="field"><label class="field-label">Phone</label><input type="tel" id="regPhone" data-testid="input-phone" placeholder="+1 555 000 0000"><div class="error-text" id="err-phone" data-testid="error-phone">Enter a valid phone number.</div></div>' +
      '</div>' +
      '<div class="grid-2">' +
        '<div class="field"><label class="field-label">Password</label><input type="password" id="regPassword" data-testid="input-password"><div class="error-text" id="err-password" data-testid="error-password">Minimum 8 characters.</div></div>' +
        '<div class="field"><label class="field-label">Confirm password</label><input type="password" id="regPasswordConfirm" data-testid="input-password-confirm"><div class="error-text" id="err-password-confirm" data-testid="error-password-confirm">Passwords do not match.</div></div>' +
      '</div>' +
      '<div class="grid-2">' +
        '<div class="field"><label class="field-label">Date of birth</label><input type="date" id="regDob" data-testid="input-dob"></div>' +
        '<div class="field"><label class="field-label">Country</label><select id="regCountry" data-testid="input-country"><option value="">Choose…</option><option value="us">United States</option><option value="in">India</option><option value="de">Germany</option><option value="jp">Japan</option></select></div>' +
      '</div>' +
      '<div class="field"><label class="field-label">Gender</label><div class="inline-group">' +
        '<div class="radio-row"><input type="radio" name="gender" id="genderF" data-testid="radio-gender-female"><label for="genderF">Female</label></div>' +
        '<div class="radio-row"><input type="radio" name="gender" id="genderM" data-testid="radio-gender-male"><label for="genderM">Male</label></div>' +
        '<div class="radio-row"><input type="radio" name="gender" id="genderO" data-testid="radio-gender-other"><label for="genderO">Other</label></div>' +
      '</div></div>' +
      '<div class="field"><label class="field-label">Skills</label><div class="inline-group">' +
        '<div class="checkbox-row"><input type="checkbox" id="skillSel" data-testid="chk-skill-selenium"><label for="skillSel">Selenium</label></div>' +
        '<div class="checkbox-row"><input type="checkbox" id="skillPw" data-testid="chk-skill-playwright"><label for="skillPw">Playwright</label></div>' +
        '<div class="checkbox-row"><input type="checkbox" id="skillCy" data-testid="chk-skill-cypress"><label for="skillCy">Cypress</label></div>' +
      '</div></div>' +
      '<div class="field"><label class="field-label">Bio</label><textarea id="regBio" data-testid="input-bio" placeholder="Optional"></textarea></div>' +
      '<div class="checkbox-row"><input type="checkbox" id="regTerms" data-testid="chk-terms"><label for="regTerms">I agree to the terms and conditions</label></div>' +
      '<div class="error-text" id="err-terms" data-testid="error-terms">You must accept the terms.</div>' +
      '<div class="btn-row" style="margin-top:16px;">' +
        '<button type="submit" class="primary" id="btnRegisterSubmit" data-testid="btn-register-submit">Create account</button>' +
        '<button type="reset" id="btnRegisterReset" data-testid="btn-register-reset">Reset</button>' +
      '</div>' +
    '</form>' +
    '<div class="card" id="registrationSummaryCard" data-testid="registration-summary" style="display:none;">' +
      '<h3>Submitted data</h3>' +
      '<pre id="registrationSummaryText" data-testid="registration-summary-text" style="white-space:pre-wrap;font-family:var(--mono);font-size:12px;color:var(--text-dim);"></pre>' +
    '</div>';
  }

  function init(root) {
    var qs = function (sel) { return QA.utils.qs(sel, root); };
    var form = qs('#registrationForm');

    unbinders.push(QA.utils.on(form, 'submit', function (e) {
      e.preventDefault();
      var valid = true;
      function setErr(fieldId, errId, condition) {
        var f = qs('#' + fieldId), errEl = qs('#' + errId);
        if (condition) { f.classList.add('invalid'); errEl.classList.add('show'); valid = false; }
        else { f.classList.remove('invalid'); errEl.classList.remove('show'); }
      }

      var firstName = qs('#regFirstName').value.trim();
      var lastName = qs('#regLastName').value.trim();
      var email = qs('#regEmail').value.trim();
      var phone = qs('#regPhone').value.trim();
      var pwd = qs('#regPassword').value;
      var pwdConfirm = qs('#regPasswordConfirm').value;
      var terms = qs('#regTerms').checked;

      setErr('regFirstName', 'err-firstname', firstName === '');
      setErr('regLastName', 'err-lastname', lastName === '');
      setErr('regEmail', 'err-email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
      setErr('regPhone', 'err-phone', phone !== '' && !/^[+\d][\d\s-]{6,}$/.test(phone));
      setErr('regPassword', 'err-password', pwd.length < 8);
      setErr('regPasswordConfirm', 'err-password-confirm', pwd !== pwdConfirm || pwdConfirm === '');
      qs('#err-terms').classList.toggle('show', !terms);
      if (!terms) valid = false;

      if (!valid) return;

      var summary = {
        name: firstName + ' ' + lastName,
        email: email,
        phone: phone,
        dob: qs('#regDob').value,
        country: qs('#regCountry').value,
        gender: (root.querySelector('input[name=gender]:checked') || {}).id || 'not specified',
        skills: ['skillSel', 'skillPw', 'skillCy'].filter(function (id) { return qs('#' + id).checked; })
                  .map(function (id) { return qs('#' + id).nextElementSibling.textContent; }),
        bio: qs('#regBio').value
      };
      qs('#registrationSuccess').classList.add('show');
      var card = qs('#registrationSummaryCard');
      card.style.display = 'block';
      qs('#registrationSummaryText').textContent = JSON.stringify(summary, null, 2);
    }));
  }

  function destroy() {
    unbinders.forEach(function (u) { u(); });
    unbinders = [];
  }

  return { template: template, init: init, destroy: destroy };
})();

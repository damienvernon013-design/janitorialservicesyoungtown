(function () {
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  var STORAGE_KEY = 'qjs_utm';

  function captureUtm() {
    var params = new URLSearchParams(window.location.search);
    var hasUtm = UTM_KEYS.some(function (key) { return params.has(key); });
    if (hasUtm) {
      var utm = {};
      UTM_KEYS.forEach(function (key) {
        if (params.has(key)) utm[key] = params.get(key);
      });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
      } catch (e) {}
    }
  }

  function getStoredUtmSource() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return '';
      var utm = JSON.parse(raw);
      return utm.utm_source || '';
    } catch (e) {
      return '';
    }
  }

  captureUtm();

  function setStatus(box, message, isError) {
    var status = box.querySelector('.form-status');
    if (!status) {
      status = document.createElement('p');
      status.className = 'form-status';
      box.appendChild(status);
    }
    status.textContent = message;
    status.style.color = isError ? '#b3261e' : '#1a6b2f';
  }

  function initForm(box) {
    var button = box.querySelector('button.btn-primary');
    if (!button) return;

    button.addEventListener('click', function () {
      var name = box.querySelector('#name');
      var phone = box.querySelector('#phone');
      var email = box.querySelector('#email');
      var facility = box.querySelector('#facility');
      var sqft = box.querySelector('#sqft');
      var notes = box.querySelector('#notes');
      var zip = box.querySelector('#zip');

      if (!phone || !phone.value.trim()) {
        setStatus(box, 'Please enter a phone number so we can call you back.', true);
        if (phone) phone.focus();
        return;
      }

      var payload = {
        name: name ? name.value.trim() : '',
        phone: phone.value.trim(),
        email: email ? email.value.trim() : '',
        zip: zip ? zip.value.trim() : '',
        facility: facility ? facility.value : '',
        sqft: sqft ? sqft.value.trim() : '',
        notes: notes ? notes.value.trim() : '',
        utm_source: getStoredUtmSource(),
      };

      button.disabled = true;
      var originalText = button.textContent;
      button.textContent = 'Sending...';
      setStatus(box, '', false);

      fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
        .then(function (result) {
          if (result.ok && result.data && result.data.ok) {
            setStatus(box, 'Thank you. We will call you the next business day.', false);
            box.querySelectorAll('input, select, textarea').forEach(function (el) { el.value = ''; });
          } else {
            setStatus(box, 'Something went wrong. Please call (866) 958-8773 instead.', true);
          }
        })
        .catch(function () {
          setStatus(box, 'Something went wrong. Please call (866) 958-8773 instead.', true);
        })
        .finally(function () {
          button.disabled = false;
          button.textContent = originalText;
        });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.quote-form-box').forEach(initForm);
  });
})();

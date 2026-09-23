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

  captureUtm();
})();

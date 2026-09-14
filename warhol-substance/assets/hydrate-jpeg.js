(function () {
  async function fetchB64(path) {
    var b64res = await fetch(path + '.b64');
    if (b64res.ok) {
      var t = (await b64res.text()).trim().replace(/\s+/g, '');
      // Reject tiny/corrupt placeholders; fall through to multipart
      if (t.length >= 1000 && /^[A-Za-z0-9+/=]+$/.test(t)) return t;
    }
    var parts = [];
    for (var i = 0; i < 32; i++) {
      var pr = await fetch(path + '.b64.' + i);
      if (!pr.ok) break;
      parts.push((await pr.text()).trim().replace(/\s+/g, ''));
    }
    return parts.length ? parts.join('') : null;
  }
  async function hydrate(img) {
    var path = img.getAttribute('src');
    if (!path || path.indexOf('data:') === 0) return;
    try {
      var res = await fetch(path);
      if (res.ok) {
        var buf = new Uint8Array(await res.arrayBuffer());
        if (buf[0] === 0xFF && buf[1] === 0xD8) return;
      }
      var text = await fetchB64(path);
      if (!text) return;
      img.src = 'data:image/jpeg;base64,' + text;
    } catch (e) { console.warn('jpeg hydrate failed', path, e); }
  }
  function run() {
    document.querySelectorAll('img[src*=".jpeg"], img[src*=".jpg"]').forEach(hydrate);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();

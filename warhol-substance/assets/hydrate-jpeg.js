(function () {
  async function hydrate(img) {
    var path = img.getAttribute('src');
    if (!path || path.indexOf('data:') === 0) return;
    try {
      var res = await fetch(path);
      if (res.ok) {
        var buf = new Uint8Array(await res.arrayBuffer());
        // JPEG SOI
        if (buf[0] === 0xFF && buf[1] === 0xD8) return;
      }
      var b64res = await fetch(path + '.b64');
      if (!b64res.ok) return;
      var text = (await b64res.text()).trim();
      img.src = 'data:image/jpeg;base64,' + text.replace(/\s+/g, '');
    } catch (e) { console.warn('jpeg hydrate failed', path, e); }
  }
  function run() {
    document.querySelectorAll('img[src*=".jpeg"], img[src*=".jpg"]').forEach(hydrate);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();

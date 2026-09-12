(function () {
  async function hydrate(img) {
    const path = img.getAttribute('src');
    if (!path || path.startsWith('data:')) return;
    try {
      const res = await fetch(path);
      const buf = new Uint8Array(await res.arrayBuffer());
      if (buf[0] === 0x89 && buf[1] === 0x50) return;
      const text = new TextDecoder().decode(buf).trim();
      if (/^[A-Za-z0-9+/=
]+$/.test(text) && text.length > 32) {
        img.src = 'data:image/png;base64,' + text.replace(/\s+/g, '');
      }
    } catch (e) { console.warn('asset hydrate failed', path, e); }
  }
  document.querySelectorAll("img[src$='.png']").forEach(hydrate);
})();

(function () {
  async function loadBase64Parts(basePath) {
    const chunks = [];
    for (let i = 0; ; i++) {
      const res = await fetch(basePath + '.b64.' + i);
      if (!res.ok) break;
      chunks.push((await res.text()).trim());
    }
    return chunks.length ? chunks.join('') : null;
  }
  async function hydrate(img) {
    const path = img.getAttribute('src');
    if (!path || path.startsWith('data:')) return;
    try {
      const res = await fetch(path);
      if (res.ok) {
        const buf = new Uint8Array(await res.arrayBuffer());
        if (buf[0] === 0x89 && buf[1] === 0x50) return;
        const text = new TextDecoder().decode(buf).trim();
        if (/^[A-Za-z0-9+/=\r\n]+$/.test(text) && text.length > 32) {
          img.src = 'data:image/png;base64,' + text.replace(/\s+/g, '');
          return;
        }
      }
      const joined = await loadBase64Parts(path);
      if (joined) img.src = 'data:image/png;base64,' + joined;
    } catch (e) { console.warn('asset hydrate failed', path, e); }
  }
  document.querySelectorAll("img[src$='.png']").forEach(hydrate);
})();

(function () {
  async function loadBase64Parts(basePath) {
    const chunks = [];
    for (let i = 0; ; i++) {
      const res = await fetch(basePath + ".b64." + i);
      if (!res.ok) break;
      chunks.push((await res.text()).trim());
    }
    return chunks.length ? chunks.join("") : null;
  }

  function isRealImage(buf) {
    if (buf.length < 3) return false;
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e) return true;
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
    if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return true;
    if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46) return true;
    return false;
  }

  async function hydrate(img) {
    const path = img.getAttribute("src");
    if (!path || path.startsWith("data:")) return;
    try {
      const res = await fetch(path);
      if (res.ok) {
        const buf = new Uint8Array(await res.arrayBuffer());
        if (isRealImage(buf)) return;
        const text = new TextDecoder().decode(buf).trim();
        if (/^[A-Za-z0-9+/=
]+$/.test(text) && text.length > 32) {
          const mime = /\.jpe?g$/i.test(path) ? "image/jpeg" : "image/png";
          img.src = "data:" + mime + ";base64," + text.replace(/\s+/g, "");
          return;
        }
      }
      const joined = await loadBase64Parts(path);
      if (joined) {
        const mime = /\.jpe?g$/i.test(path) ? "image/jpeg" : "image/png";
        img.src = "data:" + mime + ";base64," + joined;
      }
    } catch (e) {
      console.warn("asset hydrate failed", path, e);
    }
  }

  document.querySelectorAll("img[src]").forEach(hydrate);
})();

/**
 * Haskins House Records — spatial vinyl wall interactions
 * -----------------------------------------------
 * 1. THREE.JS vinyl wall: plane meshes with canvas color textures in a 3D grid.
 * 2. RAYCASTER hover pulls a sleeve forward on Z; click opens a 2D detail overlay.
 * 3. GRID TOGGLE switches to a flat 2D CSS grid (same catalog data).
 * 4. TEXT SEARCH filters BOTH 3D and 2D modes.
 * 5. Cart is always a normal 2D side panel — never inside WebGL.
 * 6. If Three.js fails to load (CDN / WebGL), we gracefully show ONLY the 2D grid.
 */

const CATALOG = [
  { id: 'v1', title: 'Void Cartography', artist: 'Aster Drift', price: 34, year: 2024, color: '#6d28d9', initials: 'VC' },
  { id: 'v2', title: 'Chrome Orchard', artist: 'Silk Relay', price: 29, year: 2023, color: '#0d9488', initials: 'CO' },
  { id: 'v3', title: 'Night Lattice', artist: 'Kite Formal', price: 31, year: 2025, color: '#2563eb', initials: 'NL' },
  { id: 'v4', title: 'Dust Hymnal', artist: 'Marrow Twin', price: 27, year: 2022, color: '#b45309', initials: 'DH' },
  { id: 'v5', title: 'Signal Bloom', artist: 'Glass Pilot', price: 33, year: 2024, color: '#db2777', initials: 'SB' },
  { id: 'v6', title: 'Echo Basin', artist: 'River Static', price: 28, year: 2021, color: '#059669', initials: 'EB' },
  { id: 'v7', title: 'Polar Archive', artist: 'North Coil', price: 36, year: 2025, color: '#4f46e5', initials: 'PA' },
  { id: 'v8', title: 'Soft Reactor', artist: 'Lumen Row', price: 30, year: 2023, color: '#ca8a04', initials: 'SR' },
  { id: 'v9', title: 'Hidden Meter', artist: 'Tape Formal', price: 25, year: 2020, color: '#7c3aed', initials: 'HM' },
  { id: 'v10', title: 'Drift Protocol', artist: 'Nova Quill', price: 32, year: 2024, color: '#0891b2', initials: 'DP' },
  { id: 'v11', title: 'Amber Loop', artist: 'Paper Choir', price: 26, year: 2022, color: '#ea580c', initials: 'AL' },
  { id: 'v12', title: 'Quiet Voltage', artist: 'Field Kind', price: 35, year: 2025, color: '#be185d', initials: 'QV' },
];

const cart = [];
let searchQuery = '';
let gridMode = false; // false = 3D preferred
let threeOk = false;
let selectedId = null;

// Three.js state (populated only if CDN + WebGL work)
let scene, camera, renderer, raycaster, pointer;
let sleeveMeshes = []; // { mesh, data, baseZ, targetZ }
let hoveredMesh = null;
let animFrame = 0;

const els = {
  wall3d: document.getElementById('wall-3d'),
  wall2d: document.getElementById('wall-2d'),
  grid2d: document.getElementById('grid-2d'),
  gridEmpty: document.getElementById('grid-empty'),
  gridToggle: document.getElementById('grid-toggle'),
  search: document.getElementById('search'),
  modeHint: document.getElementById('mode-hint'),
  threeStatus: document.getElementById('three-status'),
  overlay: document.getElementById('detail-overlay'),
  detailTitle: document.getElementById('detail-title'),
  detailArtist: document.getElementById('detail-artist'),
  detailMeta: document.getElementById('detail-meta'),
  detailPrice: document.getElementById('detail-price'),
  detailSwatch: document.getElementById('detail-swatch'),
  detailAdd: document.getElementById('detail-add'),
  detailClose: document.getElementById('detail-close'),
  cartBadge: document.getElementById('cart-badge'),
  cartCount: document.getElementById('cart-count'),
  cartPanel: document.getElementById('cart-panel'),
  cartList: document.getElementById('cart-list'),
  cartTotal: document.getElementById('cart-total'),
  cartClose: document.getElementById('cart-close'),
  cartBackdrop: document.getElementById('cart-backdrop'),
};

function matchesSearch(item) {
  if (!searchQuery) return true;
  const q = searchQuery.toLowerCase();
  return item.title.toLowerCase().includes(q) || item.artist.toLowerCase().includes(q);
}

function filteredCatalog() {
  return CATALOG.filter(matchesSearch);
}

/** Canvas texture for a sleeve face */
function makeSleeveTexture(item) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = item.color;
  ctx.fillRect(0, 0, 256, 256);
  // subtle spine edge
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, 0, 14, 256);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font = 'bold 72px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(item.initials, 128, 110);
  ctx.font = '22px sans-serif';
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  const title = item.title.length > 16 ? item.title.slice(0, 14) + '…' : item.title;
  ctx.fillText(title, 128, 180);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * RAYCASTER SETUP (commented for clarity)
 * - pointer NDC coords update on mousemove
 * - each frame: raycaster.setFromCamera → intersectObjects(sleeveMeshes)
 * - first hit → pull that mesh forward (targetZ); others ease back to baseZ
 * - click uses the same raycast to open the 2D overlay
 */
function initThree() {
  if (typeof THREE === 'undefined') {
    throw new Error('THREE global missing (CDN failed)');
  }

  const w = els.wall3d.clientWidth || window.innerWidth;
  const h = els.wall3d.clientHeight || 500;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050508);

  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  camera.position.set(0, 0, 9);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  els.wall3d.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffffff, 0.55);
  key.position.set(3, 4, 8);
  scene.add(key);

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2(-999, -999);

  buildSleeveWall(CATALOG);

  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('click', onPointerClick);
  window.addEventListener('resize', onResize);

  animate();
  threeOk = true;
}

function buildSleeveWall(items) {
  // clear old
  sleeveMeshes.forEach(({ mesh }) => {
    scene.remove(mesh);
    mesh.geometry.dispose();
    if (mesh.material.map) mesh.material.map.dispose();
    mesh.material.dispose();
  });
  sleeveMeshes = [];

  const cols = 4;
  const gap = 1.35;
  const startX = -((Math.min(cols, items.length) - 1) * gap) / 2;
  const rows = Math.ceil(items.length / cols);
  const startY = ((rows - 1) * gap) / 2;

  items.forEach((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const geo = new THREE.PlaneGeometry(1.15, 1.15);
    const mat = new THREE.MeshStandardMaterial({
      map: makeSleeveTexture(item),
      roughness: 0.65,
      metalness: 0.05,
    });
    const mesh = new THREE.Mesh(geo, mat);
    const baseZ = 0;
    mesh.position.set(startX + col * gap, startY - row * gap, baseZ);
    mesh.userData.catalogId = item.id;
    scene.add(mesh);
    sleeveMeshes.push({ mesh, data: item, baseZ, targetZ: baseZ });
  });
}

function onPointerMove(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

function onPointerClick() {
  if (gridMode || !threeOk) return;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(sleeveMeshes.map((s) => s.mesh));
  if (hits.length) {
    const id = hits[0].object.userData.catalogId;
    const item = CATALOG.find((c) => c.id === id);
    if (item && matchesSearch(item)) openDetail(item);
  }
}

function onResize() {
  if (!renderer || !camera) return;
  const w = els.wall3d.clientWidth;
  const h = els.wall3d.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

function animate() {
  animFrame = requestAnimationFrame(animate);
  if (!gridMode && threeOk) {
    // Raycast hover → pull sleeve forward on Z
    raycaster.setFromCamera(pointer, camera);
    const visibleMeshes = sleeveMeshes
      .filter((s) => matchesSearch(s.data))
      .map((s) => s.mesh);
    const hits = raycaster.intersectObjects(visibleMeshes);
    const hitMesh = hits.length ? hits[0].object : null;

    sleeveMeshes.forEach((s) => {
      const visible = matchesSearch(s.data);
      s.mesh.visible = visible;
      if (!visible) {
        s.targetZ = s.baseZ;
        return;
      }
      // Hover: bring forward; slight lift
      s.targetZ = hitMesh === s.mesh ? 1.15 : s.baseZ;
      s.mesh.position.z += (s.targetZ - s.mesh.position.z) * 0.18;
      const scale = hitMesh === s.mesh ? 1.08 : 1;
      s.mesh.scale.x += (scale - s.mesh.scale.x) * 0.15;
      s.mesh.scale.y = s.mesh.scale.x;
    });

    if (hitMesh !== hoveredMesh) {
      hoveredMesh = hitMesh;
      renderer.domElement.style.cursor = hitMesh ? 'pointer' : 'default';
    }

    renderer.render(scene, camera);
  }
}

/** Sync 3D mesh visibility when search changes (rebuild not required) */
function applySearchTo3D() {
  // visibility handled each frame in animate(); no-op placeholder for clarity
}

/** 2D CSS grid — same data, used as toggle mode AND as Three.js fallback */
function render2DGrid() {
  const items = filteredCatalog();
  els.grid2d.innerHTML = items.map((item) => `
    <button type="button" class="sleeve-2d" data-id="${item.id}"
      style="background:${item.color}" aria-label="${item.title} by ${item.artist}">
      <span class="s-title">${item.title}</span>
      <span class="s-artist">${item.artist}</span>
    </button>
  `).join('');
  els.gridEmpty.hidden = items.length > 0;

  els.grid2d.querySelectorAll('.sleeve-2d').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = CATALOG.find((c) => c.id === btn.getAttribute('data-id'));
      if (item) openDetail(item);
    });
  });
}

function setMode(useGrid) {
  gridMode = useGrid;
  els.gridToggle.setAttribute('aria-pressed', useGrid ? 'true' : 'false');
  els.gridToggle.textContent = useGrid ? '3D Wall' : 'Grid';

  if (useGrid || !threeOk) {
    els.wall3d.hidden = true;
    els.wall2d.hidden = false;
    render2DGrid();
    els.modeHint.textContent = threeOk
      ? '2D grid mode · search filters sleeves · click for details'
      : '2D grid only (3D unavailable) · search filters sleeves';
  } else {
    els.wall2d.hidden = true;
    els.wall3d.hidden = false;
    els.modeHint.textContent = '3D wall · hover to pull forward · click for details · toggle Grid for flat view';
    onResize();
  }
}

function openDetail(item) {
  selectedId = item.id;
  els.detailTitle.textContent = item.title;
  els.detailArtist.textContent = item.artist;
  els.detailMeta.textContent = `${item.year} · placeholder pressing`;
  els.detailPrice.textContent = `$${item.price}`;
  els.detailSwatch.style.background = item.color;
  els.detailSwatch.textContent = item.initials;
  els.overlay.hidden = false;
}

function closeDetail() {
  els.overlay.hidden = true;
  selectedId = null;
}

function addToCart(item) {
  const existing = cart.find((c) => c.id === item.id);
  if (existing) existing.qty += 1;
  else cart.push({ id: item.id, title: item.title, price: item.price, qty: 1 });
  updateCart();
}

function updateCart() {
  const count = cart.reduce((n, c) => n + c.qty, 0);
  els.cartCount.textContent = String(count);
  els.cartList.innerHTML = cart.length
    ? cart.map((c) => `<li><span>${c.title} × ${c.qty}</span><strong>$${c.price * c.qty}</strong></li>`).join('')
    : '<li style="color:#8b8799">Empty</li>';
  els.cartTotal.textContent = `$${cart.reduce((n, c) => n + c.price * c.qty, 0)}`;
}

function openCart() {
  els.cartPanel.classList.add('is-open');
  els.cartPanel.setAttribute('aria-hidden', 'false');
  els.cartBackdrop.hidden = false;
}
function closeCart() {
  els.cartPanel.classList.remove('is-open');
  els.cartPanel.setAttribute('aria-hidden', 'true');
  els.cartBackdrop.hidden = true;
}

function onSearchInput() {
  searchQuery = els.search.value.trim();
  // Filter BOTH modes
  if (gridMode || !threeOk) render2DGrid();
  applySearchTo3D();
}

function init() {
  els.search.addEventListener('input', onSearchInput);
  els.gridToggle.addEventListener('click', () => {
    if (!threeOk) {
      // stuck in 2D — still re-render
      setMode(true);
      return;
    }
    setMode(!gridMode);
  });

  els.detailClose.addEventListener('click', closeDetail);
  els.overlay.addEventListener('click', (e) => { if (e.target === els.overlay) closeDetail(); });
  els.detailAdd.addEventListener('click', () => {
    const item = CATALOG.find((c) => c.id === selectedId);
    if (item) addToCart(item);
    closeDetail();
  });

  els.cartBadge.addEventListener('click', openCart);
  els.cartClose.addEventListener('click', closeCart);
  els.cartBackdrop.addEventListener('click', closeCart);
  updateCart();

  // FALLBACK: if Three.js missing or WebGL init throws → 2D only
  try {
    initThree();
    setMode(false);
  } catch (err) {
    console.warn('[Haskins House] Three.js unavailable, using 2D grid fallback:', err);
    threeOk = false;
    els.threeStatus.hidden = false;
    els.threeStatus.textContent = 'Three.js / WebGL unavailable — showing 2D grid fallback.';
    els.gridToggle.disabled = true;
    els.gridToggle.title = '3D unavailable';
    setMode(true);
  }
}

init();

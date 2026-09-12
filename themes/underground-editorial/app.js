/**
 * Haskins House Records — genre rooms / editorial theme interactions
 * -------------------------------------------
 * 1. ROOMS data model: array of { slug, title, essay HTML, records[] }.
 * 2. Room NAV swaps chapter content without full reload (hash + data-room).
 * 3. IntersectionObserver / scroll-spy highlights the active room in nav
 *    while scrolling the long composite chapter view OR after a room switch.
 * 4. Sleeve GRID always visible; SORT (curated / price / year) re-renders
 *    the grid — Buy never depends on reading the essay.
 * 5. Sticky essay column on desktop (CSS); essay stacks above grid on narrow.
 */

const ROOMS = [
  {
    slug: 'no-wave',
    title: 'No Wave Cellar',
    essay: `
      <p class="pull">Angular guitars, spoken asides, and basement PA hiss — a fictional cellar under Canal.</p>
      <p>This room collects placeholder pressings that never existed: fractured tempos, xerox sleeves, and liner notes typed on a failing ribbon.</p>
      <p>Scroll the shelf independently of this essay. Sorting by year or price reorders the grid without touching the prose.</p>
      <p>Curators (imaginary) left the order intentionally restless — curated sort restores their sequence.</p>
    `,
    records: [
      { id: 'nw1', title: 'Glass Staircase', artist: 'Static Formal', price: 27, year: 1979, color: '#7f1d1d', order: 1 },
      { id: 'nw2', title: 'Wire Portrait', artist: 'Canal Trio', price: 31, year: 1981, color: '#44403c', order: 2 },
      { id: 'nw3', title: 'Broken Intercom', artist: 'Marrow Twin', price: 24, year: 1978, color: '#1e3a5f', order: 3 },
      { id: 'nw4', title: 'Xerox Hymn', artist: 'Tape Formal', price: 29, year: 1980, color: '#365314', order: 4 },
    ],
  },
  {
    slug: 'dub-basement',
    title: 'Dub Basement',
    essay: `
      <p class="pull">Spring reverb tanks and a single red bulb — fiction from a warehouse under the overpass.</p>
      <p>Records here favor low-end fiction: versions, dubplates, and sleeves stamped with invented catalog numbers.</p>
      <p>The buy button on each sleeve is wired only to cart state — the essay is optional reading.</p>
    `,
    records: [
      { id: 'db1', title: 'Version Under', artist: 'Echo Basin', price: 33, year: 1994, color: '#14532d', order: 1 },
      { id: 'db2', title: 'Red Bulb Dub', artist: 'River Static', price: 28, year: 1997, color: '#9f1239', order: 2 },
      { id: 'db3', title: 'Tank Plate 03', artist: 'Field Kind', price: 35, year: 2001, color: '#0f766e', order: 3 },
      { id: 'db4', title: 'Overpass Plate', artist: 'North Coil', price: 30, year: 1999, color: '#1e293b', order: 4 },
      { id: 'db5', title: 'Delay Garden', artist: 'Silk Relay', price: 26, year: 2003, color: '#854d0e', order: 5 },
    ],
  },
  {
    slug: 'leftfield',
    title: 'Leftfield Annex',
    essay: `
      <p class="pull">Odd meters, field recordings, and covers that refuse a center.</p>
      <p>The annex is a long chapter: each room remains a self-contained essay + shelf pair. Switching rooms updates the hash so you can deep-link without a reload.</p>
      <p>IntersectionObserver watches spy sections so the nav stays honest as you skim.</p>
    `,
    records: [
      { id: 'lf1', title: 'Metric Orchard', artist: 'Aster Drift', price: 32, year: 2018, color: '#5b21b6', order: 1 },
      { id: 'lf2', title: 'Soft Cartograph', artist: 'Glass Pilot', price: 29, year: 2020, color: '#0e7490', order: 2 },
      { id: 'lf3', title: 'Uncentered', artist: 'Paper Choir', price: 34, year: 2022, color: '#be123c', order: 3 },
      { id: 'lf4', title: 'Annex Sketch', artist: 'Nova Quill', price: 22, year: 2016, color: '#3f6212', order: 4 },
    ],
  },
  {
    slug: 'club-after',
    title: 'Club After Hours',
    essay: `
      <p class="pull">When the lights come up, the crates stay open — fictional 4am inventory.</p>
      <p>House-adjacent placeholders, worn corners, and prices that sort cleanly when you need them to.</p>
    `,
    records: [
      { id: 'ca1', title: 'Afterglow Plate', artist: 'Lumen Row', price: 25, year: 2012, color: '#9a3412', order: 1 },
      { id: 'ca2', title: 'Coat Check EP', artist: 'Kite Formal', price: 20, year: 2015, color: '#1d4ed8', order: 2 },
      { id: 'ca3', title: 'Sunrise Closed', artist: 'Void Cartography', price: 28, year: 2019, color: '#6b21a8', order: 3 },
    ],
  },
];

const cart = [];
let activeSlug = ROOMS[0].slug;
let sortMode = 'curated';
let observer = null;

const els = {
  roomList: document.getElementById('room-list'),
  roomKicker: document.getElementById('room-kicker'),
  roomTitle: document.getElementById('room-title'),
  roomEssay: document.getElementById('room-essay'),
  sleeveGrid: document.getElementById('sleeve-grid'),
  sortControl: document.getElementById('sort-control'),
  spyRoot: document.getElementById('spy-root'),
  cartBadge: document.getElementById('cart-badge'),
  cartCount: document.getElementById('cart-count'),
  cartPanel: document.getElementById('cart-panel'),
  cartList: document.getElementById('cart-list'),
  cartTotal: document.getElementById('cart-total'),
  cartClose: document.getElementById('cart-close'),
  cartBackdrop: document.getElementById('cart-backdrop'),
};

function getRoom(slug) {
  return ROOMS.find((r) => r.slug === slug) || ROOMS[0];
}

/** Build room nav buttons (data-room + hash) */
function renderNav() {
  els.roomList.innerHTML = ROOMS.map((r) => `
    <li>
      <button type="button" class="room-link" data-room="${r.slug}" aria-current="false">
        ${r.title}
      </button>
    </li>
  `).join('');

  els.roomList.querySelectorAll('.room-link').forEach((btn) => {
    btn.addEventListener('click', () => {
      const slug = btn.getAttribute('data-room');
      navigateToRoom(slug, { pushHash: true, scrollSpySection: true });
    });
  });
}

/**
 * Highlight active room in nav (used by room switch + IntersectionObserver).
 */
function setActiveNav(slug) {
  activeSlug = slug;
  els.roomList.querySelectorAll('.room-link').forEach((btn) => {
    const on = btn.getAttribute('data-room') === slug;
    btn.classList.toggle('is-active', on);
    btn.setAttribute('aria-current', on ? 'page' : 'false');
  });
}

/** Sort records without touching essay content */
function sortedRecords(records) {
  const list = records.slice();
  if (sortMode === 'price') list.sort((a, b) => a.price - b.price);
  else if (sortMode === 'year') list.sort((a, b) => a.year - b.year);
  else list.sort((a, b) => a.order - b.order); // curated
  return list;
}

/** Re-render sleeve grid for current room + sort — buy is independent of essay */
function renderGrid(room) {
  const records = sortedRecords(room.records);
  els.sleeveGrid.innerHTML = records.map((rec) => `
    <article class="sleeve-card" data-id="${rec.id}">
      <div class="sleeve-art" style="background:${rec.color}">${rec.title.slice(0, 2).toUpperCase()}</div>
      <div class="sleeve-body">
        <h3 class="sleeve-title">${rec.title}</h3>
        <p class="sleeve-artist">${rec.artist}</p>
        <p class="sleeve-meta">${rec.year}</p>
        <div class="sleeve-row">
          <span class="sleeve-price">$${rec.price}</span>
          <button type="button" class="buy-btn" data-buy="${rec.id}">Buy</button>
        </div>
      </div>
    </article>
  `).join('');

  els.sleeveGrid.querySelectorAll('[data-buy]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-buy');
      const rec = room.records.find((r) => r.id === id);
      if (rec) addToCart(rec);
    });
  });
}

function renderRoom(room) {
  els.roomKicker.textContent = `Room · ${room.slug.replace(/-/g, ' ')}`;
  els.roomTitle.textContent = room.title;
  els.roomEssay.innerHTML = room.essay;
  renderGrid(room);
  setActiveNav(room.slug);
}

/**
 * Swap room content without full page reload.
 * Uses location.hash (#room-slug) for deep links.
 */
function navigateToRoom(slug, { pushHash = true, scrollSpySection = false } = {}) {
  const room = getRoom(slug);
  renderRoom(room);
  if (pushHash) {
    const next = `#${room.slug}`;
    if (location.hash !== next) history.pushState({ room: room.slug }, '', next);
  }
  if (scrollSpySection) {
    const target = document.getElementById(`spy-${room.slug}`);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Long chapter page: stacked spy sections (one per room).
 * IntersectionObserver highlights nav as sections enter the viewport.
 * Also keeps nav in sync when user lands via hash.
 */
function buildSpySections() {
  // Enable spy root as a long scrollable chapter mirror below the main layout
  els.spyRoot.style.display = 'block';
  els.spyRoot.setAttribute('aria-hidden', 'false');
  els.spyRoot.innerHTML = ROOMS.map((r) => `
    <section id="spy-${r.slug}" class="spy-section" data-room="${r.slug}" style="
      min-height: 55vh;
      padding: 2rem 1.5rem;
      border-top: 1px solid #2c2c36;
      max-width: 720px;
      margin: 0 auto;
    ">
      <p style="font-family:system-ui;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.12em;color:#ef4444;margin:0 0 0.5rem">Chapter marker</p>
      <h2 style="margin:0 0 0.75rem;font-size:1.5rem">${r.title}</h2>
      <div style="color:#d4d0dc;font-size:0.95rem">${r.essay}</div>
      <p style="font-family:system-ui;font-size:0.8rem;color:#9a96a8;margin-top:1rem">
        ${r.records.length} records in this room · use nav above to open the shoppable shelf
      </p>
    </section>
  `).join('');

  // SCROLL SPY via IntersectionObserver
  if (observer) observer.disconnect();
  observer = new IntersectionObserver(
    (entries) => {
      // Pick the intersecting entry closest to the top
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (!visible.length) return;
      const slug = visible[0].target.getAttribute('data-room');
      if (slug && slug !== activeSlug) {
        // Sync nav highlight + main chapter when scrolling the long page
        setActiveNav(slug);
        renderRoom(getRoom(slug));
        history.replaceState({ room: slug }, '', `#${slug}`);
      }
    },
    { root: null, rootMargin: '-20% 0px -55% 0px', threshold: 0.05 }
  );

  els.spyRoot.querySelectorAll('.spy-section').forEach((sec) => observer.observe(sec));
}

function addToCart(rec) {
  const existing = cart.find((c) => c.id === rec.id);
  if (existing) existing.qty += 1;
  else cart.push({ id: rec.id, title: rec.title, price: rec.price, qty: 1 });
  updateCart();
}

function updateCart() {
  const count = cart.reduce((n, c) => n + c.qty, 0);
  els.cartCount.textContent = String(count);
  els.cartList.innerHTML = cart.length
    ? cart.map((c) => `<li><span>${c.title} × ${c.qty}</span><strong>$${c.price * c.qty}</strong></li>`).join('')
    : '<li style="color:#9a96a8">Empty</li>';
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

function slugFromHash() {
  const h = (location.hash || '').replace(/^#/, '');
  return ROOMS.some((r) => r.slug === h) ? h : ROOMS[0].slug;
}

function init() {
  renderNav();
  buildSpySections();

  const initial = slugFromHash();
  navigateToRoom(initial, { pushHash: !location.hash, scrollSpySection: false });

  els.sortControl.addEventListener('change', () => {
    sortMode = els.sortControl.value;
    renderGrid(getRoom(activeSlug));
  });

  window.addEventListener('hashchange', () => {
    navigateToRoom(slugFromHash(), { pushHash: false, scrollSpySection: true });
  });
  window.addEventListener('popstate', () => {
    navigateToRoom(slugFromHash(), { pushHash: false });
  });

  els.cartBadge.addEventListener('click', openCart);
  els.cartClose.addEventListener('click', closeCart);
  els.cartBackdrop.addEventListener('click', closeCart);
  updateCart();
}

init();

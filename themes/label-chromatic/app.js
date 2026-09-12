/**
 * Haskins House Records — magazine/chromatic theme interactions
 * --------------------------------------
 * 1. Featured release STORY CARDS expand + highlight on click (one open at a time).
 * 2. ADD-TO-BAG flies a color chip from the product sleeve into the sticky cart badge;
 *    the badge count increments with a CSS bounce class.
 * 3. Client-side FILTER by category (New / Vinyl / Merch) — no framework.
 * 4. Soft PAGE-TINT: hovering magazine color blocks tints the whole page.
 */

const PRODUCTS = [
  { id: 'p1', title: 'Glass Harbor', artist: 'Nova Quill', price: 28, category: 'vinyl', color: 'teal', badge: 'GH' },
  { id: 'p2', title: 'Coral Static EP', artist: 'Lumen Row', price: 22, category: 'new', color: 'coral', badge: 'CS' },
  { id: 'p3', title: 'Yellow Margin', artist: 'Paper Choir', price: 32, category: 'vinyl', color: 'yellow', badge: 'YM' },
  { id: 'p4', title: 'Block Tote', artist: 'Haskins House Records', price: 24, category: 'merch', color: 'yellow', badge: 'BT' },
  { id: 'p5', title: 'Teal Stamp Tee', artist: 'Haskins House Records', price: 36, category: 'merch', color: 'teal', badge: 'TS' },
  { id: 'p6', title: 'Parade / Rewind', artist: 'Midnight Parade', price: 30, category: 'new', color: 'coral', badge: 'MP' },
  { id: 'p7', title: 'Harbor Remixed', artist: 'Nova Quill', price: 26, category: 'vinyl', color: 'teal', badge: 'HR' },
  { id: 'p8', title: 'Pin Set · 3', artist: 'Haskins House Records', price: 14, category: 'merch', color: 'coral', badge: 'PS' },
];

const STORIES = [
  {
    id: 's1',
    color: 'teal',
    meta: 'Featured · Vinyl',
    title: 'Glass Harbor presses translucent',
    lede: 'Nova Quill returns with a sea-glass translucent LP and liner notes printed in teal.',
    body: '<p>Only 500 copies ship with a fold-out map of fictional docks. Each sleeve is stamped by hand in the warehouse.</p><p>Pre-order includes a digital booklet of studio polaroids — all placeholder fiction for this demo.</p>',
  },
  {
    id: 's2',
    color: 'coral',
    meta: 'New release',
    title: 'Coral Static hits the racks',
    lede: 'Lumen Row’s EP leans into shortwave hiss and coral ink on the label center.',
    body: '<p>Three tracks, one locked groove. The coral color block in our catalog filters straight to this drop.</p>',
  },
  {
    id: 's3',
    color: 'yellow',
    meta: 'Merch · Drop 04',
    title: 'Yellow margin tote',
    lede: 'Heavy cotton tote with a yellow block print — matches the magazine hero column.',
    body: '<p>Screen-printed in-house. Fictional stock: 120 units. Add-to-bag still flies a yellow chip into the cart badge.</p>',
  },
];

const cart = []; // { id, title, price, color, qty }
let activeFilter = 'all';

const els = {
  storyCards: document.getElementById('story-cards'),
  productGrid: document.getElementById('product-grid'),
  emptyState: document.getElementById('empty-state'),
  cartBadge: document.getElementById('cart-badge'),
  cartCount: document.getElementById('cart-count'),
  cartPanel: document.getElementById('cart-panel'),
  cartItems: document.getElementById('cart-items'),
  cartTotal: document.getElementById('cart-total'),
  cartClose: document.getElementById('cart-close'),
  cartBackdrop: document.getElementById('cart-backdrop'),
  flyLayer: document.getElementById('fly-layer'),
};

/** Render expandable featured story cards */
function renderStories() {
  els.storyCards.innerHTML = STORIES.map((s) => `
    <button type="button" class="story-card" data-story="${s.id}" aria-expanded="false">
      <div class="story-swatch ${s.color}"></div>
      <div class="story-inner">
        <p class="story-meta">${s.meta}</p>
        <h3 class="story-title">${s.title}</h3>
        <p class="story-lede">${s.lede}</p>
        <div class="story-body">${s.body}</div>
      </div>
    </button>
  `).join('');

  els.storyCards.querySelectorAll('.story-card').forEach((card) => {
    card.addEventListener('click', () => {
      const already = card.classList.contains('is-expanded');
      els.storyCards.querySelectorAll('.story-card').forEach((c) => {
        c.classList.remove('is-expanded', 'is-highlighted');
        c.setAttribute('aria-expanded', 'false');
      });
      if (!already) {
        card.classList.add('is-expanded', 'is-highlighted');
        card.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/** Render product cards; filter hides via class */
function renderProducts() {
  els.productGrid.innerHTML = PRODUCTS.map((p) => `
    <article class="product-card" data-category="${p.category}" data-id="${p.id}">
      <div class="product-sleeve ${p.color}" data-color="${p.color}">${p.badge}</div>
      <div class="product-info">
        <span class="product-cat">${p.category}</span>
        <h3 class="product-title">${p.title}</h3>
        <p class="product-artist">${p.artist}</p>
        <div class="product-row">
          <span class="product-price">$${p.price}</span>
          <button type="button" class="add-btn" data-add="${p.id}">Add</button>
        </div>
      </div>
    </article>
  `).join('');

  els.productGrid.querySelectorAll('[data-add]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-add');
      const product = PRODUCTS.find((p) => p.id === id);
      const sleeve = btn.closest('.product-card').querySelector('.product-sleeve');
      addToCart(product, sleeve);
    });
  });

  applyFilter(activeFilter);
}

/**
 * Fly a color chip from the sleeve into the sticky cart badge, then bounce the badge.
 */
function flyChipToCart(fromEl, color) {
  const from = fromEl.getBoundingClientRect();
  const to = els.cartBadge.getBoundingClientRect();
  const chip = document.createElement('div');
  chip.className = `fly-chip ${color}`;
  chip.style.left = `${from.left + from.width / 2 - 14}px`;
  chip.style.top = `${from.top + from.height / 2 - 14}px`;
  els.flyLayer.appendChild(chip);

  // Force layout, then animate toward badge center
  requestAnimationFrame(() => {
    const dx = to.left + to.width / 2 - 14 - (from.left + from.width / 2 - 14);
    const dy = to.top + to.height / 2 - 14 - (from.top + from.height / 2 - 14);
    chip.style.transform = `translate(${dx}px, ${dy}px) scale(0.45)`;
    chip.style.opacity = '0.35';
  });

  chip.addEventListener('transitionend', () => {
    chip.remove();
    // Bounce badge + update count after chip arrives
    els.cartBadge.classList.remove('is-bounce');
    void els.cartBadge.offsetWidth; // restart animation
    els.cartBadge.classList.add('is-bounce');
  }, { once: true });
}

function addToCart(product, sleeveEl) {
  const existing = cart.find((c) => c.id === product.id);
  if (existing) existing.qty += 1;
  else cart.push({ id: product.id, title: product.title, price: product.price, color: product.color, qty: 1 });

  flyChipToCart(sleeveEl, product.color);
  updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((n, c) => n + c.qty, 0);
  els.cartCount.textContent = String(count);
  els.cartBadge.setAttribute('aria-label', `Cart, ${count} items`);

  els.cartItems.innerHTML = cart.length
    ? cart.map((c) => `
        <li>
          <span class="cart-chip ${c.color}"></span>
          <span>${c.title} × ${c.qty}</span>
          <strong style="margin-left:auto">$${c.price * c.qty}</strong>
        </li>
      `).join('')
    : '<li style="color:#6b7280">Bag is empty</li>';

  const total = cart.reduce((n, c) => n + c.price * c.qty, 0);
  els.cartTotal.textContent = `$${total}`;
}

function applyFilter(filter) {
  activeFilter = filter;
  let visible = 0;
  els.productGrid.querySelectorAll('.product-card').forEach((card) => {
    const cat = card.getAttribute('data-category');
    const show = filter === 'all' || cat === filter;
    card.classList.toggle('is-hidden', !show);
    if (show) visible += 1;
  });
  els.emptyState.hidden = visible > 0;

  document.querySelectorAll('.filter-btn').forEach((btn) => {
    const on = btn.getAttribute('data-filter') === filter;
    btn.classList.toggle('is-active', on);
    btn.setAttribute('aria-selected', on ? 'true' : 'false');
  });
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

/** Soft page-tint when hovering magazine color blocks */
function bindPageTint() {
  document.querySelectorAll('[data-tint]').forEach((block) => {
    block.addEventListener('mouseenter', () => {
      document.body.classList.remove('tint-teal', 'tint-coral', 'tint-yellow');
      document.body.classList.add(`tint-${block.getAttribute('data-tint')}`);
    });
    block.addEventListener('mouseleave', () => {
      document.body.classList.remove('tint-teal', 'tint-coral', 'tint-yellow');
    });
  });
}

function init() {
  renderStories();
  renderProducts();
  updateCartUI();
  bindPageTint();

  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => applyFilter(btn.getAttribute('data-filter')));
  });

  els.cartBadge.addEventListener('click', openCart);
  els.cartClose.addEventListener('click', closeCart);
  els.cartBackdrop.addEventListener('click', closeCart);
}

init();

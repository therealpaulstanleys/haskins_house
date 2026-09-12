const COLORS = ['#98e8b0', '#b8f000', '#9b6bff', '#f0c48a', '#3b82f6', '#ff4fa3', '#fff', '#f5e000', '#ff6b5a'];

const PRODUCTS = [
  { id: 'w1', title: 'Static Parade', artist: 'Channel Nine', price: 28, color: COLORS[0] },
  { id: 'w2', title: 'Pink Noise LP', artist: 'Tape Deck', price: 32, color: COLORS[5] },
  { id: 'w3', title: 'Lime Groove', artist: 'House Band', price: 24, color: COLORS[1] },
  { id: 'w4', title: 'Purple Hour', artist: 'Night Shift', price: 30, color: COLORS[2] },
  { id: 'w5', title: 'Coral Reel', artist: 'Second Street', price: 26, color: COLORS[8] },
  { id: 'w6', title: 'Yellow Margin', artist: 'Print Shop', price: 22, color: COLORS[7] },
];

const VINTAGE = [
  { id: 'c1', title: 'Denim Work Jacket', price: 48, color: '#5b7c99' },
  { id: 'c2', title: 'Graphic Tee Block', price: 22, color: '#1a1a1a' },
  { id: 'c3', title: 'Leather Shell', price: 95, color: '#3d2a24' },
];

let cartCount = 0;

function renderCards(target, items, kind) {
  const el = document.getElementById(target);
  if (!el) return;
  el.innerHTML = items.map((p) => {
    if (kind === 'cloth') {
      return `<article class="cloth">
        <div class="swatch" style="background:${p.color}" aria-hidden="true"></div>
        <div class="card-body">
          <h3>${p.title}</h3>
          <p class="price">$${p.price}</p>
          <button type="button" class="add" data-id="${p.id}">Add to bag</button>
        </div>
      </article>`;
    }
    return `<article class="card">
      <div class="sleeve" style="background:${p.color}">${p.title.split(' ')[0]}</div>
      <div class="card-body">
        <h3>${p.title}</h3>
        <p class="meta">${p.artist}</p>
        <p class="price">$${p.price}</p>
        <button type="button" class="add" data-id="${p.id}">Add to bag</button>
      </div>
    </article>`;
  }).join('');
}

function bumpCart() {
  cartCount += 1;
  const count = document.getElementById('cart-count');
  const badge = document.getElementById('cart-badge');
  if (count) count.textContent = String(cartCount);
  if (badge) {
    badge.setAttribute('aria-label', `Bag, ${cartCount} items`);
    badge.classList.remove('bounce');
    void badge.offsetWidth;
    badge.classList.add('bounce');
  }
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.add');
  if (btn) bumpCart();
});

renderCards('product-grid', PRODUCTS.slice(0, 3));
renderCards('vinyl-grid', PRODUCTS);
renderCards('vintage-grid', VINTAGE, 'cloth');

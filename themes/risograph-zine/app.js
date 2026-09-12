const PRODUCTS = [
  { id: 'r1', title: 'Frogger EP', artist: 'The Toads', price: 25, cover: '#c6ff3d', label: 'SKULL' },
  { id: 'r2', title: 'Basement Tapes', artist: 'Cellar Dwellers', price: 30, cover: '#f6f1e4', label: 'HOUSE' },
  { id: 'r3', title: 'Zine Mixtape', artist: 'Various', price: 15, cover: '#c6ff3d', label: 'TAPE' },
  { id: 'r4', title: 'Second Street', artist: 'Portsmouth Press', price: 28, cover: '#ffe9a8', label: 'STREET' },
  { id: 'r5', title: 'Lime Static', artist: 'Basement Press', price: 22, cover: '#9dff57', label: 'STATIC' },
  { id: 'r6', title: 'Red Room LP', artist: 'Night Ink', price: 32, cover: '#ff6b5a', label: 'ROOM' },
];

let cartCount = 0;

function render() {
  const grid = document.getElementById('product-grid');
  grid.innerHTML = PRODUCTS.map((p) => `
    <article class="card">
      <div class="art">
        <div class="vinyl-peek" aria-hidden="true"></div>
        <div class="cover" style="background:${p.cover}">${p.label}</div>
      </div>
      <h3>${p.title}</h3>
      <p class="artist">${p.artist}</p>
      <div class="row">
        <span class="price">$${p.price}</span>
        <button type="button" class="add" data-id="${p.id}">Add to bag</button>
      </div>
    </article>
  `).join('');
}

function bump() {
  cartCount += 1;
  const c = document.getElementById('cart-count');
  const b = document.getElementById('cart-badge');
  c.textContent = String(cartCount);
  b.setAttribute('aria-label', `Bag, ${cartCount} items`);
  b.classList.remove('bounce');
  void b.offsetWidth;
  b.classList.add('bounce');
}

document.addEventListener('click', (e) => {
  if (e.target.closest('.add')) bump();
});

render();

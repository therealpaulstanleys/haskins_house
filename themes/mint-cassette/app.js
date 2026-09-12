const VINYL = [
  { id: 'm1', title: 'Psychedelic Afternoon', artist: 'Hall Monitor', price: 28, color: '#e8a0ff' },
  { id: 'm2', title: 'Punk Closet', artist: 'Ripped Hem', price: 24, color: '#f5e000' },
  { id: 'm3', title: 'Late Jazz', artist: 'Blue Room Trio', price: 32, color: '#5b8def' },
  { id: 'm4', title: 'Mint Condition', artist: 'House Band', price: 26, color: '#7fe09f' },
  { id: 'm5', title: 'Second Pressing', artist: 'Portsmouth', price: 30, color: '#ff8a65' },
  { id: 'm6', title: 'Crate Dig Vol. 2', artist: 'Various', price: 22, color: '#b0bec5' },
];

const CLOTHES = [
  { id: 'v1', title: 'Denim Work Jacket', price: 48, color: '#5b7c99', label: 'Denim' },
  { id: 'v2', title: 'Black Graphic Tee', price: 22, color: '#1c1c1c', label: 'Tee' },
  { id: 'v3', title: 'Leather Jacket Block', price: 95, color: '#3d2a24', label: 'Leather' },
];

let cartCount = 0;

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

function renderVinyl() {
  document.getElementById('vinyl-grid').innerHTML = VINYL.map((p) => `
    <article class="card">
      <div class="sleeve-wrap">
        <div class="disc" aria-hidden="true"></div>
        <div class="sleeve" style="background:${p.color}">${p.title.split(' ')[0]}</div>
      </div>
      <h3>${p.title}</h3>
      <p class="meta">${p.artist} · $${p.price}</p>
      <button type="button" class="add" data-id="${p.id}">Add to Cart</button>
    </article>
  `).join('');
}

function renderClothes() {
  document.getElementById('vintage-grid').innerHTML = CLOTHES.map((p) => `
    <article class="card">
      <div class="cloth-block" style="background:${p.color}">${p.label}</div>
      <h3>${p.title}</h3>
      <p class="meta">$${p.price}</p>
      <button type="button" class="add" data-id="${p.id}">Add to Cart</button>
    </article>
  `).join('');
}

document.addEventListener('click', (e) => {
  if (e.target.closest('.add')) bump();
});

renderVinyl();
renderClothes();

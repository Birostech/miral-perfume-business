/* ============================================================
   SCENTS BY MIRAL — Cart Logic (localStorage)
   ============================================================ */

const Cart = (() => {
  const STORAGE_KEY = 'sbm_cart';

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartUI();
  }

  function addItem(productId, qty = 1) {
    const product = getProducts(false).find(p => p.id === productId);
    if (!product) return;

    const cart = getCart();
    const existing = cart.find(item => item.id === productId);

    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        size: product.size,
        gradient: product.gradient,
        image: product.image || null,
        qty
      });
    }

    saveCart(cart);
    showToast(`${product.name} added to cart`);
  }

  function removeItem(productId) {
    const cart = getCart().filter(item => item.id !== productId);
    saveCart(cart);
  }

  function updateQty(productId, qty) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    if (qty <= 0) {
      removeItem(productId);
      return;
    }
    item.qty = qty;
    saveCart(cart);
  }

  function getCount() {
    return getCart().reduce((sum, item) => sum + item.qty, 0);
  }

  function getSubtotal() {
    return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function updateCartUI() {
    const count = getCount();
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  return { getCart, addItem, removeItem, updateQty, getCount, getSubtotal, updateCartUI };
})();

/* ── Toast Notification ──────────────────────────────────── */
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">✦</span><span class="toast-msg"></span>`;
    document.body.appendChild(toast);
  }
  toast.querySelector('.toast-msg').textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ── Render a Product Card (editorial style) ─────────────── */
function renderProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card-ed';
  card.dataset.category = product.category;
  card.dataset.id = product.id;

  card.innerHTML = `
    <div class="pc-ed-media">
      <div class="pc-ed-img" style="background:${productVisual(product)};width:100%;height:100%;"></div>
      ${product.badge ? `<span class="pc-ed-badge">${product.badge}</span>` : ''}
      <div class="pc-ed-add" data-id="${product.id}">+ Add to Cart</div>
    </div>
    <div class="pc-ed-info">
      <div class="pc-ed-cat">${product.category}</div>
      <div class="pc-ed-name">${product.name}</div>
      <div class="pc-ed-notes">${product.notes || ''}</div>
      <div class="pc-ed-price">$${product.price}</div>
    </div>`;

  card.querySelector('.pc-ed-add').addEventListener('click', (e) => {
    e.stopPropagation();
    Cart.addItem(product.id);
  });

  return card;
}

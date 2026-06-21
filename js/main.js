/* ============================================================
   SCENTS BY MIRAL — Main JS
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar scroll effect ──────────────────────────────── */
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 40);
  });

  /* ── Active nav link ───────────────────────────────────── */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-nav a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── Mobile menu toggle ────────────────────────────────── */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  hamburger?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!hamburger?.contains(e.target) && !mobileMenu?.contains(e.target)) {
      mobileMenu?.classList.remove('open');
    }
  });

  /* ── Cart count on load ────────────────────────────────── */
  Cart.updateCartUI();

  /* ── Home page: featured products (editorial grid) ─────── */
  const featuredGrid = document.getElementById('featured-grid');
  if (featuredGrid) {
    // Ensure editorial grid class is applied
    featuredGrid.className = 'products-grid-editorial';
    const featured = getFeaturedProducts();
    if (featured.length === 0) {
      featuredGrid.style.background = 'none';
      featuredGrid.innerHTML = `<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:3rem;">
        No products added yet. <a href="admin.html" style="color:var(--gold)">Add products in the admin panel.</a>
      </p>`;
    } else {
      featured.forEach(p => featuredGrid.appendChild(renderProductCard(p)));
    }
  }

  /* ── Shop page ─────────────────────────────────────────── */
  const shopGrid = document.getElementById('shop-grid');
  if (shopGrid) {
    let currentFilter = 'All';
    let currentSort   = 'default';

    function getFiltered() {
      let list = getProducts(true); // only active products
      if (currentFilter !== 'All') list = list.filter(p => p.category === currentFilter);
      if (currentSort === 'price-asc')  list.sort((a, b) => a.price - b.price);
      if (currentSort === 'price-desc') list.sort((a, b) => b.price - a.price);
      if (currentSort === 'name')       list.sort((a, b) => a.name.localeCompare(b.name));
      return list;
    }

    function renderShop() {
      shopGrid.innerHTML = '';
      const list = getFiltered();
      const countEl = document.getElementById('results-count');
      if (countEl) countEl.textContent = `${list.length} fragrance${list.length !== 1 ? 's' : ''}`;
      if (list.length === 0) {
        shopGrid.style.background = 'none';
        shopGrid.innerHTML = `<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:4rem;">
          No fragrances found in this category.
        </p>`;
      } else {
        shopGrid.style.background = '';
        list.forEach(p => shopGrid.appendChild(renderProductCard(p)));
      }
    }

    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentFilter = tab.dataset.filter;
        renderShop();
      });
    });

    const sortSelect = document.getElementById('sort-select');
    sortSelect?.addEventListener('change', () => {
      currentSort = sortSelect.value;
      renderShop();
    });

    renderShop();
  }

  /* ── Cart page ─────────────────────────────────────────── */
  const cartItemsEl = document.getElementById('cart-items');
  if (cartItemsEl) renderCartPage();

  /* ── Newsletter form ───────────────────────────────────── */
  document.getElementById('newsletter-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('newsletter-email');
    const val   = input?.value?.trim();
    if (!val || !val.includes('@')) {
      showToast('Please enter a valid email address.');
      return;
    }
    saveSubscriber(val);
    showToast('Thank you! You\'ve joined the inner circle.');
    input.value = '';
  });
});

/* ── Cart Page Renderer ──────────────────────────────────── */
function renderCartPage() {
  const cartItemsEl = document.getElementById('cart-items');
  const subtotalEl  = document.getElementById('summary-subtotal');
  const shippingEl  = document.getElementById('summary-shipping');
  const totalEl     = document.getElementById('summary-total');
  const emptyEl     = document.getElementById('cart-empty');
  const layoutEl    = document.getElementById('cart-layout');

  function refresh() {
    const cart = Cart.getCart();
    cartItemsEl.innerHTML = '';

    if (cart.length === 0) {
      if (emptyEl)  emptyEl.style.display  = 'block';
      if (layoutEl) layoutEl.style.display = 'none';
      return;
    }

    if (emptyEl)  emptyEl.style.display  = 'none';
    if (layoutEl) layoutEl.style.display = 'grid';

    cart.forEach(item => {
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div class="cart-item-img">
          <div style="width:100%;height:100%;background:${productVisual(item)}"></div>
        </div>
        <div class="cart-item-details">
          <div class="cart-item-cat">${item.category}</div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-size">${item.size}</div>
        </div>
        <div class="cart-item-controls">
          <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
          <div class="qty-control">
            <button class="qty-btn minus" data-id="${item.id}">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn plus" data-id="${item.id}">+</button>
          </div>
          <button class="remove-btn" data-id="${item.id}">Remove</button>
        </div>`;

      el.querySelector('.minus').addEventListener('click', () => {
        Cart.updateQty(item.id, item.qty - 1); refresh();
      });
      el.querySelector('.plus').addEventListener('click', () => {
        Cart.updateQty(item.id, item.qty + 1); refresh();
      });
      el.querySelector('.remove-btn').addEventListener('click', () => {
        Cart.removeItem(item.id); refresh();
      });

      cartItemsEl.appendChild(el);
    });

    const subtotal = Cart.getSubtotal();
    const shipping = subtotal >= 150 ? 0 : 12;
    const total    = subtotal + shipping;
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
    if (totalEl)    totalEl.textContent    = `$${total.toFixed(2)}`;
  }

  refresh();

  document.getElementById('checkout-btn')?.addEventListener('click', () => {
    const user = Auth.currentUser();
    if (!user) {
      showToast('Please sign in to continue to checkout.');
      setTimeout(() => { window.location.href = 'login.html?next=cart.html'; }, 1500);
      return;
    }
    showToast('Checkout coming soon — stay tuned!');
  });
}

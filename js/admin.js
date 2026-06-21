/* ============================================================
   SCENTS BY MIRAL — Admin Panel Logic
   Default password: miral2026  (change ADMIN_PASSWORD below)
   ============================================================ */

const ADMIN_PASSWORD = 'miral2026';
const ADMIN_SESSION  = 'sbm_admin_session';

/* ── Login ───────────────────────────────────────────────── */
function isAdminLoggedIn() {
  return sessionStorage.getItem(ADMIN_SESSION) === 'yes';
}

function showAdminApp() {
  document.getElementById('admin-login-screen').style.display = 'none';
  document.getElementById('admin-app').style.display = 'flex';
  refreshAllPanels();
}

document.getElementById('admin-login-btn').addEventListener('click', () => {
  const pw    = document.getElementById('admin-password-input').value;
  const errEl = document.getElementById('admin-login-error');
  if (pw === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_SESSION, 'yes');
    errEl.classList.remove('show');
    showAdminApp();
  } else {
    errEl.classList.add('show');
  }
});

document.getElementById('admin-password-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('admin-login-btn').click();
});

document.getElementById('admin-logout-btn').addEventListener('click', (e) => {
  e.preventDefault();
  sessionStorage.removeItem(ADMIN_SESSION);
  location.reload();
});

if (isAdminLoggedIn()) showAdminApp();

/* ── Panel Navigation ────────────────────────────────────── */
function switchPanel(panelName) {
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));

  const panel = document.getElementById(`panel-${panelName}`);
  if (panel) panel.classList.add('active');
  document.querySelectorAll(`[data-panel="${panelName}"]`).forEach(l => l.classList.add('active'));
  refreshPanel(panelName);
}

document.querySelectorAll('[data-panel]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    switchPanel(link.dataset.panel);
  });
});

/* ── Data helpers ────────────────────────────────────────── */
function getProducts_admin() {
  const stored = getAdminProducts();
  return stored.length > 0 ? stored : [];
}

function nextId() {
  const products = getAdminProducts();
  if (products.length === 0) return 1;
  return Math.max(...products.map(p => p.id || 0)) + 1;
}

/* ── Refresh helpers ─────────────────────────────────────── */
function refreshAllPanels() {
  refreshPanel('dashboard');
  buildGradientSwatches();
  document.getElementById('dash-date').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

function refreshPanel(name) {
  switch (name) {
    case 'dashboard':    renderDashboard();   break;
    case 'products':     renderProductsTable(); break;
    case 'featured':     renderFeatured();     break;
    case 'subscribers':  renderSubscribers();  break;
    case 'customers':    renderCustomers();    break;
  }
}

/* ── Dashboard ───────────────────────────────────────────── */
function renderDashboard() {
  const products    = getProducts(false); // all products (sample + admin)
  const adminProds  = getAdminProducts();
  const displayList = adminProds.length > 0 ? adminProds : SAMPLE_PRODUCTS;
  const active      = displayList.filter(p => p.active !== false);
  const totalStock  = displayList.reduce((s, p) => s + (p.stock || 0), 0);
  const catalogVal  = displayList.reduce((s, p) => s + (p.price * (p.stock || 0)), 0);
  const subs        = getSubscribers();
  const customers   = JSON.parse(localStorage.getItem('sbm_users') || '[]');

  document.getElementById('stat-total-products').textContent = displayList.length;
  document.getElementById('stat-active').textContent         = active.length;
  document.getElementById('stat-stock').textContent          = totalStock;
  document.getElementById('stat-subscribers').textContent    = subs.length;
  document.getElementById('stat-accounts').textContent       = customers.length;
  document.getElementById('stat-value').textContent          = `$${catalogVal.toLocaleString()}`;

  // Low stock (≤ 5)
  const lowStock = displayList.filter(p => (p.stock || 0) <= 5);
  const lowEl    = document.getElementById('low-stock-section');
  const lowBody  = document.getElementById('low-stock-body');
  lowEl.style.display = lowStock.length > 0 ? 'block' : 'none';
  lowBody.innerHTML = '';
  lowStock.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.name}</td>
      <td><span class="table-badge badge-cat">${p.category}</span></td>
      <td style="color:#e05a5a;font-weight:700;">${p.stock}</td>
      <td style="color:var(--gold)">$${p.price}</td>`;
    lowBody.appendChild(tr);
  });

  // Recent 5 products
  const recent = [...displayList].slice(-5).reverse();
  const tbody  = document.getElementById('dash-recent-products');
  tbody.innerHTML = '';
  if (recent.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-dim);padding:2rem;">
      No products yet. <a href="#" class="gold-text" data-panel="add-product">Add your first product →</a>
    </td></tr>`;
    tbody.querySelectorAll('[data-panel]').forEach(l => l.addEventListener('click', e => {
      e.preventDefault(); switchPanel(l.dataset.panel);
    }));
  } else {
    recent.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.name}</td>
        <td><span class="table-badge badge-cat">${p.category}</span></td>
        <td style="color:var(--gold)">$${p.price}</td>
        <td>${p.stock ?? '—'}</td>
        <td><span class="table-badge ${p.active !== false ? 'badge-active' : 'badge-inactive'}">
          ${p.active !== false ? 'Active' : 'Hidden'}
        </span></td>`;
      tbody.appendChild(tr);
    });
  }
}

/* ── Products Table ──────────────────────────────────────── */
function renderProductsTable() {
  const adminProds  = getAdminProducts();
  const displayList = adminProds.length > 0 ? adminProds : SAMPLE_PRODUCTS;
  const tbody       = document.getElementById('products-table-body');
  const countEl     = document.getElementById('product-count');
  if (countEl) countEl.textContent = `${displayList.length} product${displayList.length !== 1 ? 's' : ''}`;

  tbody.innerHTML = '';
  displayList.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div style="width:32px;height:40px;border-radius:3px;background:${productVisual(p)};border:1px solid rgba(200,169,110,0.2)"></div>
      </td>
      <td style="font-weight:700;">${p.name}${p.badge ? ` <span style="font-size:0.6rem;color:var(--gold);margin-left:4px;">[${p.badge}]</span>` : ''}</td>
      <td><span class="table-badge badge-cat">${p.category}</span></td>
      <td style="color:var(--gold)">$${p.price}</td>
      <td>${p.size || '—'}</td>
      <td style="${(p.stock || 0) <= 5 ? 'color:#e05a5a;font-weight:700;' : ''}">${p.stock ?? '—'}</td>
      <td><span class="table-badge ${p.active !== false ? 'badge-active' : 'badge-inactive'}">
        ${p.active !== false ? 'Active' : 'Hidden'}
      </span></td>
      <td>
        <div class="tbl-actions">
          <button class="tbl-btn tbl-btn-edit" data-id="${p.id}">Edit</button>
          <button class="tbl-btn tbl-btn-delete" data-id="${p.id}">Delete</button>
        </div>
      </td>`;

    tr.querySelector('.tbl-btn-edit').addEventListener('click', () => startEditProduct(p.id));
    tr.querySelector('.tbl-btn-delete').addEventListener('click', () => deleteProduct(p.id));
    tbody.appendChild(tr);
  });

  if (displayList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-dim);padding:2rem;">
      No products yet.
    </td></tr>`;
  }
}

/* ── Featured Fragrances ─────────────────────────────────── */
function renderFeatured() {
  const adminProds  = getAdminProducts();
  const displayList = adminProds.length > 0 ? adminProds : SAMPLE_PRODUCTS;
  const activeList  = displayList.filter(p => p.active !== false);
  const featuredIds = getFeaturedIds();

  const listEl  = document.getElementById('featured-list');
  const emptyEl = document.getElementById('featured-empty');
  const countEl = document.getElementById('featured-count');

  listEl.innerHTML = '';

  if (activeList.length === 0) {
    emptyEl.style.display = 'block';
    if (countEl) countEl.textContent = '';
    return;
  }
  emptyEl.style.display = 'none';

  const selectedCount = activeList.filter(p => featuredIds.includes(p.id)).length;
  if (countEl) countEl.textContent = `${selectedCount} selected`;

  activeList.forEach(p => {
    const checked = featuredIds.includes(p.id);
    const row = document.createElement('label');
    row.className = 'featured-pick' + (checked ? ' selected' : '');
    row.innerHTML = `
      <input type="checkbox" data-id="${p.id}" ${checked ? 'checked' : ''} />
      <span class="fp-swatch" style="background:${productVisual(p)}"></span>
      <span class="fp-info">
        <span class="fp-name">${p.name}</span>
        <span class="fp-meta">${p.category} · $${p.price}</span>
      </span>
      ${p.badge ? `<span class="fp-badge">${p.badge}</span>` : ''}`;

    const cb = row.querySelector('input');
    cb.addEventListener('change', () => {
      row.classList.toggle('selected', cb.checked);
      updateFeaturedCount();
    });
    listEl.appendChild(row);
  });
}

function updateFeaturedCount() {
  const countEl = document.getElementById('featured-count');
  if (!countEl) return;
  const n = document.querySelectorAll('#featured-list input[type="checkbox"]:checked').length;
  countEl.textContent = `${n} selected`;
}

document.getElementById('featured-save').addEventListener('click', () => {
  const ids = [...document.querySelectorAll('#featured-list input[type="checkbox"]:checked')]
    .map(cb => parseInt(cb.dataset.id, 10));
  saveFeaturedIds(ids);
  showToast(ids.length === 0
    ? 'Cleared — homepage will show the first 4 active products.'
    : `${ids.length} fragrance${ids.length !== 1 ? 's' : ''} set as featured.`);
});

document.getElementById('featured-clear').addEventListener('click', () => {
  document.querySelectorAll('#featured-list input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
    cb.closest('.featured-pick')?.classList.remove('selected');
  });
  saveFeaturedIds([]);
  updateFeaturedCount();
  showToast('Selection cleared.');
});

/* ── Gradient Swatches ───────────────────────────────────── */
let selectedGradient = GRADIENT_PRESETS[0].value;

function buildGradientSwatches() {
  const container = document.getElementById('gradient-swatches');
  if (!container || container.children.length > 0) return;
  GRADIENT_PRESETS.forEach((preset, i) => {
    const div = document.createElement('div');
    div.className = 'gradient-swatch' + (i === 0 ? ' selected' : '');
    div.style.background = preset.value;
    div.title = preset.name;
    div.addEventListener('click', () => {
      document.querySelectorAll('.gradient-swatch').forEach(s => s.classList.remove('selected'));
      div.classList.add('selected');
      selectedGradient = preset.value;
      document.getElementById('f-gradient').value = preset.value;
    });
    container.appendChild(div);
  });
  document.getElementById('f-gradient').value = GRADIENT_PRESETS[0].value;
}

/* ── Product Image Upload ────────────────────────────────── */
const imageUploadBtn = document.getElementById('image-upload-btn');
const imageFileInput = document.getElementById('f-image-file');
const imageRemoveBtn = document.getElementById('image-remove-btn');

imageUploadBtn?.addEventListener('click', () => imageFileInput.click());

imageFileInput?.addEventListener('change', () => {
  const file = imageFileInput.files && imageFileInput.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('Please choose an image file.');
    return;
  }
  downscaleImage(file, 600, 0.72, (dataUrl) => {
    setProductImage(dataUrl);
    showToast('Image added.');
  });
  imageFileInput.value = '';
});

imageRemoveBtn?.addEventListener('click', () => setProductImage(''));

/** Read a file, draw it scaled onto a canvas, return a compressed JPEG data URL. */
function downscaleImage(file, maxSize, quality, cb) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxSize) {
        height = Math.round(height * (maxSize / width));
        width = maxSize;
      } else if (height > maxSize) {
        width = Math.round(width * (maxSize / height));
        height = maxSize;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      cb(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function setProductImage(dataUrl) {
  const hidden      = document.getElementById('f-image');
  const preview     = document.getElementById('image-preview');
  const placeholder = document.getElementById('image-placeholder');
  hidden.value = dataUrl || '';
  if (dataUrl) {
    preview.style.backgroundImage = `url("${dataUrl}")`;
    preview.classList.add('has-image');
    if (placeholder) placeholder.style.display = 'none';
    imageRemoveBtn.style.display = '';
  } else {
    preview.style.backgroundImage = '';
    preview.classList.remove('has-image');
    if (placeholder) placeholder.style.display = '';
    imageRemoveBtn.style.display = 'none';
  }
}

/* ── Add / Edit Product Form ─────────────────────────────── */
document.getElementById('product-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const errEl = document.getElementById('product-form-error');
  errEl.classList.remove('show');

  const name     = document.getElementById('f-name').value.trim();
  const category = document.getElementById('f-category').value;
  const price    = parseFloat(document.getElementById('f-price').value);
  const stock    = parseInt(document.getElementById('f-stock').value, 10);
  const gradient = document.getElementById('f-gradient').value || selectedGradient;
  const editId   = document.getElementById('edit-product-id').value;

  if (!name) { showFormError('Product name is required.'); return; }
  if (!category) { showFormError('Please select a category.'); return; }
  if (!price || price <= 0) { showFormError('Please enter a valid price.'); return; }

  const product = {
    id:          editId ? parseInt(editId) : nextId(),
    name,
    category,
    notes:       document.getElementById('f-notes').value.trim(),
    description: document.getElementById('f-description').value.trim(),
    price,
    size:        document.getElementById('f-size').value.trim() || '50 ml',
    badge:       document.getElementById('f-badge').value || null,
    stock:       isNaN(stock) ? 0 : stock,
    active:      document.getElementById('f-active').value === 'true',
    gradient:    gradient || GRADIENT_PRESETS[0].value,
    image:       document.getElementById('f-image').value || null,
  };

  const products = getAdminProducts();
  if (editId) {
    const idx = products.findIndex(p => p.id === product.id);
    if (idx !== -1) products[idx] = product;
    else products.push(product);
  } else {
    products.push(product);
  }

  if (!saveAdminProducts(products)) {
    showFormError('Could not save — your browser storage is full. Try a smaller image, or remove some products with photos.');
    return;
  }

  showToast(editId ? `"${name}" updated.` : `"${name}" added to your catalog.`);
  resetProductForm();
  switchPanel('products');
});

function showFormError(msg) {
  const el = document.getElementById('product-form-error');
  el.textContent = msg;
  el.classList.add('show');
}

function resetProductForm() {
  document.getElementById('product-form').reset();
  document.getElementById('edit-product-id').value = '';
  document.getElementById('add-product-title').textContent = 'Add Product';
  document.getElementById('add-product-form-label').textContent = 'New Product Details';
  document.getElementById('product-form-submit').textContent = 'Save Product';
  document.getElementById('f-size').value = '50 ml';
  document.getElementById('f-stock').value = '10';
  document.getElementById('f-active').value = 'true';
  document.getElementById('product-form-error').classList.remove('show');
  // Reset gradient swatches
  document.querySelectorAll('.gradient-swatch').forEach((s, i) => {
    s.classList.toggle('selected', i === 0);
  });
  selectedGradient = GRADIENT_PRESETS[0].value;
  document.getElementById('f-gradient').value = GRADIENT_PRESETS[0].value;
  setProductImage('');
}

document.getElementById('product-form-cancel').addEventListener('click', () => {
  resetProductForm();
  switchPanel('products');
});

function startEditProduct(id) {
  // Find in admin products or sample products
  const adminProds = getAdminProducts();
  const list = adminProds.length > 0 ? adminProds : SAMPLE_PRODUCTS;
  const p = list.find(x => x.id === id);
  if (!p) return;

  // If editing a sample product, we need to copy it into admin storage first
  if (adminProds.length === 0) {
    // Copy all samples to admin storage, then edit
    saveAdminProducts(SAMPLE_PRODUCTS.map(s => ({...s})));
  }

  switchPanel('add-product');
  document.getElementById('add-product-title').textContent = 'Edit Product';
  document.getElementById('add-product-form-label').textContent = `Editing: ${p.name}`;
  document.getElementById('product-form-submit').textContent = 'Update Product';
  document.getElementById('edit-product-id').value = p.id;
  document.getElementById('f-name').value        = p.name || '';
  document.getElementById('f-category').value    = p.category || '';
  document.getElementById('f-notes').value       = p.notes || '';
  document.getElementById('f-description').value = p.description || '';
  document.getElementById('f-price').value       = p.price || '';
  document.getElementById('f-size').value        = p.size || '50 ml';
  document.getElementById('f-stock').value       = p.stock ?? 10;
  document.getElementById('f-badge').value       = p.badge || '';
  document.getElementById('f-active').value      = p.active !== false ? 'true' : 'false';

  // Set gradient (kept as fallback) + image preview
  const gVal = p.gradient || GRADIENT_PRESETS[0].value;
  selectedGradient = gVal;
  document.getElementById('f-gradient').value = gVal;
  document.querySelectorAll('.gradient-swatch').forEach((s, i) => {
    s.classList.toggle('selected', GRADIENT_PRESETS[i]?.value === gVal);
  });
  setProductImage(p.image || '');
}

function deleteProduct(id) {
  const adminProds = getAdminProducts();
  if (adminProds.length === 0) {
    // Deleting from sample products: copy samples first, then remove
    const copied = SAMPLE_PRODUCTS.filter(p => p.id !== id).map(p => ({...p}));
    saveAdminProducts(copied);
  } else {
    const updated = adminProds.filter(p => p.id !== id);
    saveAdminProducts(updated);
  }
  showToast('Product removed.');
  renderProductsTable();
  renderDashboard();
}

/* ── Subscribers ─────────────────────────────────────────── */
function renderSubscribers() {
  const subs  = getSubscribers();
  const tbody = document.getElementById('subscribers-body');
  const empty = document.getElementById('subscribers-empty');
  const count = document.getElementById('sub-count');

  if (count) count.textContent = `${subs.length} subscriber${subs.length !== 1 ? 's' : ''}`;
  tbody.innerHTML = '';

  if (subs.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  subs.forEach((s, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${s.email}</td>
      <td style="color:var(--text-muted)">${new Date(s.date).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })}</td>`;
    tbody.appendChild(tr);
  });
}

/* ── Customers ───────────────────────────────────────────── */
function renderCustomers() {
  const users = JSON.parse(localStorage.getItem('sbm_users') || '[]');
  const tbody = document.getElementById('customers-body');
  const empty = document.getElementById('customers-empty');
  const count = document.getElementById('customer-count');

  if (count) count.textContent = `${users.length} account${users.length !== 1 ? 's' : ''}`;
  tbody.innerHTML = '';

  if (users.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  users.forEach((u, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td style="color:var(--text-muted)">${new Date(u.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })}</td>`;
    tbody.appendChild(tr);
  });
}

/* ── Toast (reuse from cart.js pattern) ─────────────────── */
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

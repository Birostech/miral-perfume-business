/* ============================================================
   SCENTS BY MIRAL — Product Data
   Sample products shown only when no admin products exist.
   Add real products via admin.html and these disappear.
   ============================================================ */

const SAMPLE_PRODUCTS = [
  {
    id: 1,
    name: "Midnight Velvet",
    category: "Oriental",
    notes: "Oud · Amber · Dark Rose",
    description: "A deep, intoxicating oriental that opens with smoky oud and settles into warm amber resin, wrapped in the lingering embrace of dark rose petals.",
    price: 89,
    size: "50 ml",
    badge: "Bestseller",
    stock: 20,
    active: true,
    gradient: "linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 40%, #8a3060 80%, #c8a96e 100%)"
  },
  {
    id: 2,
    name: "Azure Dream",
    category: "Fresh",
    notes: "Sea Salt · Bergamot · White Musk",
    description: "An airy, coastal fragrance that captures the freshness of ocean spray and the warmth of sun-drenched skin.",
    price: 75,
    size: "50 ml",
    badge: null,
    stock: 15,
    active: true,
    gradient: "linear-gradient(135deg, #0a1a3e 0%, #1a3a6e 40%, #2a6a9e 80%, #8ab8d8 100%)"
  },
  {
    id: 3,
    name: "Golden Noir",
    category: "Woody",
    notes: "Sandalwood · Vetiver · Black Pepper",
    description: "A sophisticated woody accord anchored by creamy sandalwood and earthy vetiver, lifted by a sharp spice of black pepper.",
    price: 95,
    size: "50 ml",
    badge: "New",
    stock: 12,
    active: true,
    gradient: "linear-gradient(135deg, #1a1000 0%, #3a2800 40%, #7a5200 80%, #c8a96e 100%)"
  },
  {
    id: 4,
    name: "Rose Mystique",
    category: "Floral",
    notes: "Damask Rose · Patchouli · Vanilla",
    description: "An opulent floral built around the queen of flowers — rich Damask rose — deepened by earthy patchouli and a soft vanilla drydown.",
    price: 85,
    size: "50 ml",
    badge: null,
    stock: 18,
    active: true,
    gradient: "linear-gradient(135deg, #2e0a1a 0%, #5e1a35 40%, #a84060 80%, #d4a0b0 100%)"
  },
  {
    id: 5,
    name: "Ocean Whisper",
    category: "Fresh",
    notes: "Aquatic · Driftwood · Green Tea",
    description: "A serene aquatic that evokes misty mornings by the sea, with driftwood undertones and the quiet clarity of green tea.",
    price: 70,
    size: "50 ml",
    badge: null,
    stock: 25,
    active: true,
    gradient: "linear-gradient(135deg, #061820 0%, #0a3040 40%, #1a6070 80%, #60b8c0 100%)"
  },
  {
    id: 6,
    name: "Dark Amber",
    category: "Oriental",
    notes: "Amber · Myrrh · Benzoin",
    description: "A rich resinous composition where golden amber meets sacred myrrh and sweet benzoin for an irresistibly warm signature.",
    price: 110,
    size: "50 ml",
    badge: "Limited",
    stock: 8,
    active: true,
    gradient: "linear-gradient(135deg, #1e0800 0%, #4a1800 40%, #9a4000 80%, #d4882a 100%)"
  },
  {
    id: 7,
    name: "Silk & Oud",
    category: "Woody",
    notes: "Oud · Cedarwood · Silk Musk",
    description: "An exclusive woody-oriental pairing premium oud with the smooth texture of cedarwood and the whisper-soft finish of silk musk.",
    price: 125,
    size: "50 ml",
    badge: "Premium",
    stock: 10,
    active: true,
    gradient: "linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 40%, #2a2050 80%, #6a5080 100%)"
  },
  {
    id: 8,
    name: "Violet Dusk",
    category: "Floral",
    notes: "Violet · Iris · Heliotrope",
    description: "A powdery floral capturing the melancholy beauty of dusk — iris-cool violet blooms over a warm heliotrope heart.",
    price: 80,
    size: "50 ml",
    badge: null,
    stock: 14,
    active: true,
    gradient: "linear-gradient(135deg, #120820 0%, #2a1040 40%, #5a2880 80%, #a868c0 100%)"
  },
  {
    id: 9,
    name: "Sapphire Mist",
    category: "Fresh",
    notes: "Lemon Zest · Iris · White Cedar",
    description: "A luminous fresh fragrance that sparkles with lemon zest before settling into a cool iris and cedar accord.",
    price: 78,
    size: "50 ml",
    badge: null,
    stock: 20,
    active: true,
    gradient: "linear-gradient(135deg, #080a20 0%, #1a2860 40%, #2040a0 80%, #70a0e0 100%)"
  },
  {
    id: 10,
    name: "Black Pearl",
    category: "Oriental",
    notes: "Blackcurrant · Jasmine · Ambergris",
    description: "An enigmatic oriental where dark blackcurrant and jasmine are anchored by the oceanic warmth of ambergris.",
    price: 135,
    size: "50 ml",
    badge: "Exclusive",
    stock: 6,
    active: true,
    gradient: "linear-gradient(135deg, #050508 0%, #100818 40%, #201030 80%, #504870 100%)"
  },
  {
    id: 11,
    name: "Cedar Smoke",
    category: "Woody",
    notes: "Cedarwood · Frankincense · Leather",
    description: "A bold, smoky woody that conjures ancient forests and candlelit rituals — cedarwood meets sacred frankincense and whispered leather.",
    price: 92,
    size: "50 ml",
    badge: null,
    stock: 16,
    active: true,
    gradient: "linear-gradient(135deg, #100800 0%, #281800 40%, #502800 80%, #a06030 100%)"
  },
  {
    id: 12,
    name: "Ivory Bloom",
    category: "Floral",
    notes: "Gardenia · Tuberose · Sandalwood",
    description: "A lush white floral combining the heady richness of gardenia and tuberose, softened by a creamy sandalwood base.",
    price: 88,
    size: "50 ml",
    badge: "New",
    stock: 22,
    active: true,
    gradient: "linear-gradient(135deg, #1a1000 0%, #3a2818 40%, #7a6040 80%, #d4c0a0 100%)"
  }
];

const CATEGORIES = ['All', 'Floral', 'Oriental', 'Fresh', 'Woody'];

const GRADIENT_PRESETS = [
  { name: 'Purple Oriental', value: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 40%, #8a3060 80%, #c8a96e 100%)' },
  { name: 'Navy Fresh',      value: 'linear-gradient(135deg, #0a1a3e 0%, #1a3a6e 40%, #2a6a9e 80%, #8ab8d8 100%)' },
  { name: 'Gold Woody',      value: 'linear-gradient(135deg, #1a1000 0%, #3a2800 40%, #7a5200 80%, #c8a96e 100%)' },
  { name: 'Rose Floral',     value: 'linear-gradient(135deg, #2e0a1a 0%, #5e1a35 40%, #a84060 80%, #d4a0b0 100%)' },
  { name: 'Dark Amber',      value: 'linear-gradient(135deg, #1e0800 0%, #4a1800 40%, #9a4000 80%, #d4882a 100%)' },
  { name: 'Midnight Black',  value: 'linear-gradient(135deg, #050508 0%, #100818 40%, #201030 80%, #504870 100%)' },
  { name: 'Teal Ocean',      value: 'linear-gradient(135deg, #061820 0%, #0a3040 40%, #1a6070 80%, #60b8c0 100%)' },
  { name: 'Violet Bloom',    value: 'linear-gradient(135deg, #120820 0%, #2a1040 40%, #5a2880 80%, #a868c0 100%)' },
  { name: 'Sapphire Blue',   value: 'linear-gradient(135deg, #080a20 0%, #1a2860 40%, #2040a0 80%, #70a0e0 100%)' },
  { name: 'Cedar Smoke',     value: 'linear-gradient(135deg, #100800 0%, #281800 40%, #502800 80%, #a06030 100%)' },
];

/**
 * Returns the active product list.
 * If admin has saved products → show those (active only for shop).
 * Otherwise → show sample products.
 */
function getProducts(onlyActive = false) {
  const stored = getAdminProducts();
  const list = stored.length > 0 ? stored : SAMPLE_PRODUCTS;
  return onlyActive ? list.filter(p => p.active !== false) : list;
}

function getAdminProducts() {
  try {
    return JSON.parse(localStorage.getItem('sbm_products')) || [];
  } catch {
    return [];
  }
}

/**
 * Saves products to localStorage.
 * Returns true on success, false if the browser storage quota was exceeded
 * (usually caused by too many / too-large uploaded images).
 */
function saveAdminProducts(products) {
  try {
    localStorage.setItem('sbm_products', JSON.stringify(products));
    return true;
  } catch (err) {
    console.error('saveAdminProducts failed:', err);
    return false;
  }
}

/**
 * Returns a CSS background value for a product's "image".
 * Uses an uploaded photo if one exists, otherwise the color gradient.
 */
function productVisual(p) {
  if (p && p.image) return `url("${p.image}") center / cover no-repeat`;
  return (p && p.gradient) || 'linear-gradient(135deg,#1a0a2e,#8a3060,#c8a96e)';
}

/* ── Featured Fragrances (homepage selection) ─────────────── */
function getFeaturedIds() {
  try {
    return JSON.parse(localStorage.getItem('sbm_featured')) || [];
  } catch {
    return [];
  }
}

function saveFeaturedIds(ids) {
  localStorage.setItem('sbm_featured', JSON.stringify(ids));
}

/**
 * Products shown in the homepage "Featured Fragrances" grid.
 * If the admin has hand-picked products → show those (in chosen order).
 * Otherwise → fall back to the first 4 active products.
 */
function getFeaturedProducts() {
  const active = getProducts(true);
  const ids = getFeaturedIds();
  if (ids.length === 0) return active.slice(0, 4);

  const byId = {};
  active.forEach(p => { byId[p.id] = p; });
  const selected = ids.map(id => byId[id]).filter(Boolean);
  return selected.length > 0 ? selected : active.slice(0, 4);
}

// Keep a simple reference for cart.js to use
let PRODUCTS = getProducts();

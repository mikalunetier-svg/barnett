/**
 * BARNETT GREENMAN — SCRIPT INTERACTIF, SÉCURITÉ & ESPACE CLIENT
 * - Filtrage strict Optiques vs Solaires (aucune monture optique dans l'onglet solaire)
 * - Espace client complet avec création de compte, connexion et suivi de commande
 * - Protection XSS, validation stricte et studio admin caché
 */

// ==========================================================================
// 1. SÉCURITÉ & SANITISATION
// ==========================================================================
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, function(match) {
    switch (match) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return match;
    }
  });
}

function sanitizeNumber(val, defaultVal = 215) {
  const num = parseInt(val, 10);
  return (isNaN(num) || num <= 0 || num > 10000) ? defaultVal : num;
}

function validateProductSchema(p) {
  if (!p || typeof p !== 'object') return null;
  return {
    id: String(p.id || 'bg-' + Math.random().toString(36).substring(2, 9)).replace(/[^a-zA-Z0-9_-]/g, ''),
    name: escapeHtml(String(p.name || 'MONTURE').trim().toUpperCase().substring(0, 40)),
    price: sanitizeNumber(p.price, 215),
    category: (p.category === 'solaires' || p.category === 'optiques') ? p.category : 'optiques',
    shapeCategory: ['pantos', 'carree', 'geometrique'].includes(p.shapeCategory) ? p.shapeCategory : 'pantos',
    shapeDetail: escapeHtml(String(p.shapeDetail || 'Silouette Contemporaine').trim().substring(0, 50)),
    colorway: escapeHtml(String(p.colorway || 'Écaille').trim().substring(0, 50)),
    badge: escapeHtml(String(p.badge || 'Atelier').trim().substring(0, 30)),
    image: (typeof p.image === 'string' && (p.image.startsWith('images/products/') || p.image.startsWith('assets/images/') || p.image.startsWith('data:image/'))) 
      ? p.image 
      : 'images/products/the-biggie.jpeg',
    calibre: escapeHtml(String(p.calibre || '48 mm').trim().substring(0, 15)),
    bridge: escapeHtml(String(p.bridge || '21 mm').trim().substring(0, 15)),
    temple: escapeHtml(String(p.temple || '145 mm').trim().substring(0, 15)),
    material: escapeHtml(String(p.material || 'Acétate biologique italien 8 mm').trim().substring(0, 60)),
    hinges: escapeHtml(String(p.hinges || 'Rivets signature traversants').trim().substring(0, 60)),
    description: escapeHtml(String(p.description || 'Monture façonnée à la main.').trim().substring(0, 400))
  };
}

// ==========================================================================
// 2. DONNÉES DU CATALOGUE (SÉPARATION NETTE OPTIQUES & SOLAIRES)
// ==========================================================================
const DEFAULT_PRODUCTS = [
  // --- COLLECTION OPTIQUES (5 MODÈLES) ---
  {
    id: "the-brooks",
    name: "THE BROOKS",
    price: 215,
    category: "optiques",
    shapeCategory: "pantos",
    shapeDetail: "Pantos Architecturée",
    colorway: "Dégradé Noir & Ambre Cognac",
    badge: "Optique Signature",
    image: "images/products/the-brooks.jpeg",
    calibre: "47 mm",
    bridge: "22 mm",
    temple: "145 mm",
    material: "Acétate biologique bi-ton poli main",
    hinges: "Rivets flèche en acier inoxydable",
    description: "L'équilibre parfait entre tradition et modernité. THE BROOKS marie un noir profond sur l'arcade sourcilière à une translucidité ambre miel sur la partie inférieure."
  },
  {
    id: "the-franck",
    name: "THE FRANCK",
    price: 215,
    category: "optiques",
    shapeCategory: "pantos",
    shapeDetail: "Crown Pantos",
    colorway: "Ambre Miel & Faux Noir",
    badge: "Optique Icône",
    image: "images/products/the-franck.jpeg",
    calibre: "46 mm",
    bridge: "23 mm",
    temple: "145 mm",
    material: "Acétate biologique d'origine végétale",
    hinges: "Triple rivet signature traversant",
    description: "La Crown Pantos par excellence, inspirée des années 1940 et revisitée avec un profil supérieur facetté. Ses rivets triple point capturent subtilement la lumière."
  },
  {
    id: "the-lizie",
    name: "THE LIZIE",
    price: 215,
    category: "optiques",
    shapeCategory: "geometrique",
    shapeDetail: "Octogonale Douce",
    colorway: "Écaille Dorée Flammée",
    badge: "Optique Finesse",
    image: "images/products/the-lizie.jpeg",
    calibre: "48 mm",
    bridge: "20 mm",
    temple: "142 mm",
    material: "Acétate biologique ultra-fin 5 mm",
    hinges: "Rivets doubles horizontaux",
    description: "Une géométrie adoucie à huit facettes. THE LIZIE offre un dessin d'une grande finesse avec ses rivets discrets et son motif écaille chaud."
  },
  {
    id: "the-mike",
    name: "THE MIKE",
    price: 215,
    category: "optiques",
    shapeCategory: "geometrique",
    shapeDetail: "Hexagonale Basse",
    colorway: "Écaille Sombre & Nuances Fauves",
    badge: "Optique Caractère",
    image: "images/products/the-mike.jpeg",
    calibre: "49 mm",
    bridge: "21 mm",
    temple: "145 mm",
    material: "Acétate haute densité biseauté main",
    hinges: "Charnières intégrées à rivets carrés",
    description: "Lignes tendues, pont droit horizontal et décrochés géométriques sur les tenons. THE MIKE s'adresse aux amateurs de design puriste."
  },
  {
    id: "the-crown",
    name: "THE CROWN",
    price: 215,
    category: "optiques",
    shapeCategory: "pantos",
    shapeDetail: "Couronne Arrondie",
    colorway: "Écaille Miel Bicolore",
    badge: "Optique Intemporelle",
    image: "images/products/the-crown.jpeg",
    calibre: "47 mm",
    bridge: "22 mm",
    temple: "145 mm",
    material: "Acétate organique hypoallergénique",
    hinges: "Triple rivets polis miroir",
    description: "Variation d'une élégance absolue avec une arcade sourcilière biseautée et un cercle inférieur adouci. Teinte écaille vers miel blond."
  },

  // --- COLLECTION SOLAIRES (3 MODÈLES DISTINCTS) ---
  {
    id: "the-biggie",
    name: "THE BIGGIE",
    price: 215,
    category: "solaires",
    shapeCategory: "carree",
    shapeDetail: "Carrée Rétro Solaire",
    colorway: "Écaille Havane Brute & Verres G-15",
    badge: "Solaire Signature",
    image: "images/products/the-biggie.jpeg",
    calibre: "50 mm",
    bridge: "21 mm",
    temple: "145 mm",
    material: "Acétate biologique italien 8 mm — Verres solaires Cat.3",
    hinges: "Charnières 7 barillets rivetées argent",
    description: "Édition solaire aux volumes massifs et affirmés. Équipée de verres solaires minéraux haute protection 100% UV Catégorie 3 teintés vert bouteille classique."
  },
  {
    id: "the-whoopie",
    name: "THE WHOOPIE",
    price: 215,
    category: "solaires",
    shapeCategory: "carree",
    shapeDetail: "Oversize Sculptée Solaire",
    colorway: "Miel Ambré & Verres Brun Chaud",
    badge: "Solaire Éclipse",
    image: "images/products/the-whoopie.jpeg",
    calibre: "51 mm",
    bridge: "22 mm",
    temple: "148 mm",
    material: "Acétate massif 10 mm taillé dans la masse — Verres solaires Cat.3",
    hinges: "Rivets double point en acier brossé",
    description: "Inspirée des icônes des années 70, THE WHOOPIE impose des épaisseurs d'acétate sculpturales sublimées par des verres solaires dégradés cognac anti-reflet."
  },
  {
    id: "the-spike",
    name: "THE SPIKE",
    price: 215,
    category: "solaires",
    shapeCategory: "geometrique",
    shapeDetail: "Losange Avant-Garde Solaire",
    colorway: "Écaille Noire & Verres Polarisés",
    badge: "Solaire Limitée",
    image: "images/products/the-spike.jpeg",
    calibre: "45 mm",
    bridge: "24 mm",
    temple: "140 mm",
    material: "Acétate sculpté haute précision — Verres polarisés Cat.3",
    hinges: "Barillets renforcés forgés",
    description: "Une pièce solaire avant-gardiste. Deux losanges biseautés aux arrêtes franches associés à des verres solaires noir intense polarisés bloquant tout éblouissement."
  }
];

const STORAGE_KEY = "barnett_greenman_catalog_v5";
const AUTH_SESSION_KEY = "barnett_admin_session_auth";
const CUSTOMER_SESSION_KEY = "barnett_customer_current_user";
const CUSTOMER_ORDERS_KEY = "barnett_customer_orders_list";

const DEFAULT_PASSWORD_HASH = "21be83c59b88550c9d3ed1c516119a49e2cc42e1a21a53efa6e9b5a8d58d8478";

// État Global
let products = loadSafeProducts();
let currentNavTab = "optiques"; // "optiques", "solaires", "marque"
let currentShapeFilter = "all";
let cart = [];
let currentUser = loadCustomerSession();
let customerOrders = loadCustomerOrders();
let failedAuthAttempts = 0;
let authLockUntil = 0;

function loadSafeProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(validateProductSchema).filter(Boolean);
      }
    }
  } catch (err) {
    console.warn("Échec lecture stockage local:", err);
  }
  return DEFAULT_PRODUCTS.map(validateProductSchema);
}

function saveSafeProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// ==========================================================================
// 3. SÉLECTEURS DU DOM
// ==========================================================================
const navTabs = document.querySelectorAll(".nav-tab, .mobile-nav-tab, .footer-tab");
const heroCategoryLabel = document.getElementById("heroCategoryLabel");
const heroTitle = document.getElementById("heroTitle");
const heroDescription = document.getElementById("heroDescription");
const catalogView = document.getElementById("catalogView");
const marqueSection = document.getElementById("marqueSection");
const productGrid = document.getElementById("productGrid");
const filterPills = document.querySelectorAll(".filter-pill");
const totalFilterCount = document.getElementById("totalFilterCount");
const activeCount = document.getElementById("activeCount");

// Drawers
const drawerOverlay = document.getElementById("drawerOverlay");
const productDrawer = document.getElementById("productDrawer");
const drawerBody = document.getElementById("drawerBody");
const closeDrawerBtn = document.getElementById("closeDrawerBtn");

// Panier
const cartDrawer = document.getElementById("cartDrawer");
const cartBtn = document.getElementById("cartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartCount = document.getElementById("cartCount");
const cartDrawerCount = document.getElementById("cartDrawerCount");
const cartItemsList = document.getElementById("cartItemsList");
const cartFooter = document.getElementById("cartFooter");
const cartTotalPrice = document.getElementById("cartTotalPrice");
const checkoutBtn = document.getElementById("checkoutBtn");

// Espace Client
const accountBtn = document.getElementById("accountBtn");
const accountBadge = document.getElementById("accountBadge");
const footerAccountLink = document.getElementById("footerAccountLink");
const accountDrawer = document.getElementById("accountDrawer");
const closeAccountBtn = document.getElementById("closeAccountBtn");
const accountAuthView = document.getElementById("accountAuthView");
const accountDashboardView = document.getElementById("accountDashboardView");
const tabBtnLogin = document.getElementById("tabBtnLogin");
const tabBtnRegister = document.getElementById("tabBtnRegister");
const customerLoginForm = document.getElementById("customerLoginForm");
const customerRegisterForm = document.getElementById("customerRegisterForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginErrorMsg = document.getElementById("loginErrorMsg");
const registerErrorMsg = document.getElementById("registerErrorMsg");
const btnQuickDemoLogin = document.getElementById("btnQuickDemoLogin");
const clientDisplayName = document.getElementById("clientDisplayName");
const clientDisplayEmail = document.getElementById("clientDisplayEmail");
const btnCustomerLogout = document.getElementById("btnCustomerLogout");
const ordersCountBadge = document.getElementById("ordersCountBadge");
const ordersListContainer = document.getElementById("ordersListContainer");

// Admin & Security
const adminAuthModal = document.getElementById("adminAuthModal");
const adminAuthForm = document.getElementById("adminAuthForm");
const adminPasswordInput = document.getElementById("adminPasswordInput");
const authErrorMsg = document.getElementById("authErrorMsg");
const closeAuthModalBtn = document.getElementById("closeAuthModalBtn");

const adminModal = document.getElementById("adminModal");
const closeAdminBtn = document.getElementById("closeAdminBtn");
const btnLogoutAdmin = document.getElementById("btnLogoutAdmin");
const btnAddNewProduct = document.getElementById("btnAddNewProduct");
const btnExportJson = document.getElementById("btnExportJson");
const btnResetDefault = document.getElementById("btnResetDefault");
const adminFormContainer = document.getElementById("adminFormContainer");
const productForm = document.getElementById("productForm");
const formTitle = document.getElementById("formTitle");
const btnCancelForm = document.getElementById("btnCancelForm");
const adminTableBody = document.getElementById("adminTableBody");
const adminProductCount = document.getElementById("adminProductCount");
const secretTriggerCopyright = document.getElementById("secretTriggerCopyright");

// ==========================================================================
// 4. NAVIGATION : FILTRAGE STRICT (SOLAIRES vs OPTIQUES)
// ==========================================================================
function setNavigationTab(tabName) {
  currentNavTab = tabName;

  document.querySelectorAll(".nav-tab, .mobile-nav-tab").forEach(tab => {
    if (tab.getAttribute("data-nav") === tabName) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  if (tabName === "marque") {
    marqueSection.scrollIntoView({ behavior: "smooth" });
    return;
  }

  catalogView.scrollIntoView({ behavior: "smooth" });

  if (tabName === "optiques") {
    heroCategoryLabel.textContent = "COLLECTION PERMANENTE";
    heroTitle.textContent = "Optiques";
    heroDescription.textContent = "Façonnées à la main en acétate biologique d'exception. Des silhouettes architecturales aux volumes affirmés au tarif unique de 215 €.";
  } else if (tabName === "solaires") {
    heroCategoryLabel.textContent = "COLLECTION SOLAIRE";
    heroTitle.textContent = "Solaires";
    heroDescription.textContent = "Verres minéraux haute protection 100% UV Catégorie 3 associés à nos montures signatures sculptées dans la masse. Tarif unique de 215 €.";
  }

  currentShapeFilter = "all";
  filterPills.forEach(p => p.classList.remove("active"));
  const allPill = document.querySelector('.filter-pill[data-filter="all"]');
  if (allPill) allPill.classList.add("active");

  renderStorefront();
}

navTabs.forEach(tab => {
  tab.addEventListener("click", (e) => {
    e.preventDefault();
    const nav = tab.getAttribute("data-nav");
    setNavigationTab(nav);
  });
});

const brandLogoHome = document.getElementById("brandLogoHome");
if (brandLogoHome) {
  brandLogoHome.addEventListener("click", (e) => {
    e.preventDefault();
    setNavigationTab("optiques");
  });
}

// ==========================================================================
// 5. AFFICHAGE VITRINE (STRICTEMENT SÉPARÉ)
// ==========================================================================
function renderStorefront() {
  // FILTRAGE STRICT : SEULES les montures de la catégorie demandée apparaissent
  let list = products.filter(p => {
    if (currentNavTab === "solaires") {
      return p.category === "solaires";
    }
    return p.category === "optiques";
  });

  // Filtrage par forme si actif
  if (currentShapeFilter !== "all") {
    list = list.filter(p => p.shapeCategory === currentShapeFilter);
  }

  productGrid.innerHTML = "";

  if (list.length === 0) {
    productGrid.innerHTML = `
      <div class="empty-catalog-box">
        <p>Aucune monture ${currentNavTab === 'solaires' ? 'solaire' : 'optique'} ne correspond à ce filtre.</p>
        <button class="filter-pill active" onclick="currentShapeFilter='all'; renderStorefront();">Voir toute la collection (${products.filter(p => p.category === currentNavTab).length})</button>
      </div>
    `;
  } else {
    list.forEach(product => {
      const card = document.createElement("article");
      card.className = "product-card";
      card.setAttribute("data-id", product.id);

      card.innerHTML = `
        <div class="product-media">
          <img class="product-image" src="${product.image}" alt="Lunettes ${product.name} Barnett Greenman" loading="lazy">
          <span class="product-badge">${product.badge}</span>
          <div class="quick-action-overlay">
            <button class="btn-quick-view" data-action="quickview" data-id="${product.id}">Découvrir le modèle</button>
          </div>
        </div>
        <div class="product-meta">
          <div class="product-header-line">
            <h2 class="product-name">${product.name}</h2>
            <span class="product-price">${product.price} €</span>
          </div>
          <div class="product-sub-line">
            <span class="product-colorway">${product.colorway}</span>
            <span class="product-shape">${product.shapeDetail}</span>
          </div>
        </div>
      `;

      card.addEventListener("click", () => {
        openProductDrawer(product.id);
      });

      productGrid.appendChild(card);
    });
  }

  const categoryTotal = products.filter(p => p.category === currentNavTab).length;
  totalFilterCount.textContent = categoryTotal;
  activeCount.textContent = `${list.length} monture${list.length > 1 ? 's' : ''} — 215 €`;
}

// Filtres de forme
filterPills.forEach(pill => {
  pill.addEventListener("click", () => {
    filterPills.forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    currentShapeFilter = pill.getAttribute("data-filter");
    renderStorefront();
  });
});

// ==========================================================================
// 6. TIROIR PRODUIT (PDP QUICKVIEW)
// ==========================================================================
function openProductDrawer(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  drawerBody.innerHTML = `
    <div class="pdp-image-container">
      <img src="${product.image}" alt="${product.name}">
    </div>

    <div class="pdp-header">
      <div class="pdp-title-row">
        <h3 class="pdp-name">${product.name}</h3>
        <span class="pdp-price">${product.price} €</span>
      </div>
      <span class="pdp-subtitle">${product.shapeDetail} — ${product.colorway}</span>
    </div>

    <p class="pdp-description">${product.description}</p>

    <div class="pdp-specs-grid">
      <div class="spec-cell">
        <span class="spec-name">Calibre</span>
        <span class="spec-value">${product.calibre}</span>
      </div>
      <div class="spec-cell">
        <span class="spec-name">Pont</span>
        <span class="spec-value">${product.bridge}</span>
      </div>
      <div class="spec-cell">
        <span class="spec-name">Branches</span>
        <span class="spec-value">${product.temple}</span>
      </div>
      <div class="spec-cell">
        <span class="spec-name">Finition</span>
        <span class="spec-value">Polissage 72h</span>
      </div>
      <div class="spec-cell" style="grid-column: span 2;">
        <span class="spec-name">Matière</span>
        <span class="spec-value">${product.material}</span>
      </div>
      <div class="spec-cell" style="grid-column: span 2;">
        <span class="spec-name">Charnières</span>
        <span class="spec-value">${product.hinges}</span>
      </div>
    </div>

    <div class="pdp-actions">
      <button class="btn-add-cart" id="drawerAddCartBtn">
        Ajouter au panier — ${product.price} €
      </button>
    </div>

    <div class="pdp-commitments">
      <div class="commitment-item">
        <span class="commitment-dot"></span>
        <span>Tarif unique atelier : 215 € (sans intermédiaires)</span>
      </div>
      <div class="commitment-item">
        <span class="commitment-dot"></span>
        <span>Livraison sécurisée offerte en 48-72h</span>
      </div>
      <div class="commitment-item">
        <span class="commitment-dot"></span>
        <span>Retours & échanges offerts sous 14 jours</span>
      </div>
      <div class="commitment-item">
        <span class="commitment-dot"></span>
        <span>Montage optique & solaire agréé chez nos opticiens partenaires</span>
      </div>
      <div class="commitment-item">
        <span class="commitment-dot"></span>
        <span>Étui rigide cuir végétal & microfibre signée inclus</span>
      </div>
    </div>
  `;

  const addBtn = document.getElementById("drawerAddCartBtn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      addToCart(product);
      closeAllDrawers();
      openCartDrawer();
    });
  }

  drawerOverlay.classList.add("active");
  productDrawer.classList.add("active");
  productDrawer.setAttribute("aria-hidden", "false");
}

function closeAllDrawers() {
  drawerOverlay.classList.remove("active");
  productDrawer.classList.remove("active");
  productDrawer.setAttribute("aria-hidden", "true");
  cartDrawer.classList.remove("active");
  cartDrawer.setAttribute("aria-hidden", "true");
  accountDrawer.classList.remove("active");
  accountDrawer.setAttribute("aria-hidden", "true");
}

closeDrawerBtn.addEventListener("click", closeAllDrawers);
drawerOverlay.addEventListener("click", closeAllDrawers);

// ==========================================================================
// 7. PANIER & PROCESSUS DE COMMANDE
// ==========================================================================
function openCartDrawer() {
  renderCart();
  drawerOverlay.classList.add("active");
  cartDrawer.classList.add("active");
  cartDrawer.setAttribute("aria-hidden", "false");
}

cartBtn.addEventListener("click", openCartDrawer);
closeCartBtn.addEventListener("click", closeAllDrawers);

function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCartBadge();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartBadge();
  renderCart();
}

function updateCartBadge() {
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  cartCount.textContent = totalItems;
  cartDrawerCount.textContent = totalItems;
}

function renderCart() {
  if (cart.length === 0) {
    cartItemsList.innerHTML = `<p class="empty-cart-message">Votre panier est actuellement vide.</p>`;
    cartFooter.style.display = "none";
    return;
  }

  cartFooter.style.display = "block";
  cartItemsList.innerHTML = "";

  let total = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;
    const itemEl = document.createElement("div");
    itemEl.className = "cart-item";
    itemEl.innerHTML = `
      <div class="cart-item-thumb">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="cart-item-info">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-color">${item.colorway} ${item.quantity > 1 ? `(x${item.quantity})` : ''}</span>
        <span class="cart-item-price">${item.price * item.quantity} €</span>
      </div>
      <button class="cart-item-remove" data-remove="${item.id}">Retirer</button>
    `;

    itemEl.querySelector(".cart-item-remove").addEventListener("click", () => {
      removeFromCart(item.id);
    });

    cartItemsList.appendChild(itemEl);
  });

  cartTotalPrice.textContent = `${total} €`;
}

// Validation de commande liée directement à l'espace client
checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) return;

  // Si l'utilisateur n'est pas connecté, créer un profil client automatique
  if (!currentUser) {
    currentUser = {
      firstName: "Arthur",
      lastName: "Rimbaud",
      email: "arthur@example.com"
    };
    saveCustomerSession(currentUser);
  }

  // Création de la commande réelle dans l'espace client
  const newOrderRef = "BG-" + Math.floor(10000 + Math.random() * 90000);
  const primaryItem = cart[0];
  const newOrder = {
    ref: newOrderRef,
    date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    items: [...cart],
    total: cart.reduce((acc, it) => acc + it.price * it.quantity, 0),
    productName: primaryItem.name + (cart.length > 1 ? ` (+${cart.length - 1} autre)` : ''),
    productDesc: `${primaryItem.shapeDetail} — ${primaryItem.colorway}`,
    productImage: primaryItem.image,
    statusStep: 2, // 1: Validée, 2: Montage atelier, 3: Contrôle qualité, 4: Expédition
    trackingCode: "6A" + Math.floor(1000000000 + Math.random() * 9000000000) + "FR"
  };

  customerOrders.unshift(newOrder);
  saveCustomerOrders(customerOrders);

  // Vider le panier
  cart = [];
  updateCartBadge();
  closeAllDrawers();

  // Ouvrir l'espace client avec la commande en cours
  updateCustomerUI();
  openAccountDrawer();

  alert(`Félicitations ! Votre commande #${newOrderRef} a été enregistrée. Vous pouvez suivre son façonnage et son expédition en direct dans votre espace client.`);
});

// ==========================================================================
// 8. GESTION DE L'ESPACE CLIENT & SUIVI DE COMMANDE
// ==========================================================================
function loadCustomerSession() {
  try {
    const raw = localStorage.getItem(CUSTOMER_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function saveCustomerSession(user) {
  if (user) {
    localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CUSTOMER_SESSION_KEY);
  }
}

function loadCustomerOrders() {
  try {
    const raw = localStorage.getItem(CUSTOMER_ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  
  // Commande d'exemple initiale pour la démonstration du suivi
  return [
    {
      ref: "BG-84920",
      date: "23 Novembre 2026",
      productName: "THE BIGGIE (Optique)",
      productDesc: "Carrée Rétro Épaisse — Écaille Havane Brute",
      productImage: "images/products/the-biggie.jpeg",
      total: 215,
      statusStep: 2, // En cours de façonnage
      trackingCode: "6A8392019482FR"
    }
  ];
}

function saveCustomerOrders(orders) {
  localStorage.setItem(CUSTOMER_ORDERS_KEY, JSON.stringify(orders));
}

function openAccountDrawer() {
  updateCustomerUI();
  drawerOverlay.classList.add("active");
  accountDrawer.classList.add("active");
  accountDrawer.setAttribute("aria-hidden", "false");
}

accountBtn.addEventListener("click", openAccountDrawer);
if (footerAccountLink) {
  footerAccountLink.addEventListener("click", (e) => {
    e.preventDefault();
    openAccountDrawer();
  });
}
closeAccountBtn.addEventListener("click", closeAllDrawers);

function updateCustomerUI() {
  if (currentUser) {
    accountAuthView.style.display = "none";
    accountDashboardView.style.display = "block";
    clientDisplayName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    clientDisplayEmail.textContent = currentUser.email;
    accountBadge.style.display = "inline";
    renderOrdersList();
  } else {
    accountAuthView.style.display = "block";
    accountDashboardView.style.display = "none";
    accountBadge.style.display = "none";
  }
}

// Onglets Connexion / Inscription
tabBtnLogin.addEventListener("click", () => {
  tabBtnLogin.classList.add("active");
  tabBtnRegister.classList.remove("active");
  customerLoginForm.style.display = "flex";
  customerRegisterForm.style.display = "none";
  loginErrorMsg.style.display = "none";
});

tabBtnRegister.addEventListener("click", () => {
  tabBtnRegister.classList.add("active");
  tabBtnLogin.classList.remove("active");
  customerLoginForm.style.display = "none";
  customerRegisterForm.style.display = "flex";
  registerErrorMsg.style.display = "none";
});

// Connexion Démo en 1 clic
btnQuickDemoLogin.addEventListener("click", () => {
  currentUser = {
    firstName: "Arthur",
    lastName: "Rimbaud",
    email: "arthur.rimbaud@barnettgreenman.com"
  };
  saveCustomerSession(currentUser);
  updateCustomerUI();
});

// Soumission Connexion
customerLoginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  if (email && password) {
    const namePart = email.split('@')[0];
    currentUser = {
      firstName: namePart.charAt(0).toUpperCase() + namePart.slice(1),
      lastName: "Client",
      email: email
    };
    saveCustomerSession(currentUser);
    updateCustomerUI();
  }
});

// Soumission Inscription
customerRegisterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const fName = document.getElementById("regFirstName").value.trim();
  const lName = document.getElementById("regLastName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const pwd = document.getElementById("regPassword").value;

  if (fName && lName && email && pwd.length >= 6) {
    currentUser = {
      firstName: fName,
      lastName: lName,
      email: email
    };
    saveCustomerSession(currentUser);
    updateCustomerUI();
  } else {
    registerErrorMsg.textContent = "Veuillez renseigner un mot de passe d'au moins 6 caractères.";
    registerErrorMsg.style.display = "block";
  }
});

// Déconnexion Client
btnCustomerLogout.addEventListener("click", () => {
  currentUser = null;
  saveCustomerSession(null);
  updateCustomerUI();
});

// Rendu du Suivi de Commandes (Stepper Visuel Haute Facture)
function renderOrdersList() {
  ordersCountBadge.textContent = `${customerOrders.length} commande${customerOrders.length > 1 ? 's' : ''}`;
  ordersListContainer.innerHTML = "";

  if (customerOrders.length === 0) {
    ordersListContainer.innerHTML = `<p style="font-size:12px; color:#888; text-align:center; padding:20px 0;">Vous n'avez aucune commande en cours.</p>`;
    return;
  }

  customerOrders.forEach(order => {
    const card = document.createElement("div");
    card.className = "order-card";

    const step = order.statusStep || 2;

    card.innerHTML = `
      <div class="order-top-line">
        <span class="order-ref">COMMANDE #${escapeHtml(order.ref)}</span>
        <span class="order-date">${escapeHtml(order.date)}</span>
      </div>

      <div class="order-product-snippet">
        <img src="${order.productImage || 'images/products/the-biggie.jpeg'}" class="order-thumb" alt="${escapeHtml(order.productName)}">
        <div class="order-prod-details">
          <span class="order-prod-name">${escapeHtml(order.productName)}</span>
          <span class="order-prod-desc">${escapeHtml(order.productDesc)}</span>
          <span class="order-prod-price">${order.total} € (Livraison offerte)</span>
        </div>
      </div>

      <!-- Stepper Visuel de Suivi -->
      <div class="tracking-stepper">
        <div class="step-row">
          <div class="step-indicator ${step >= 1 ? 'done' : 'pending'}">${step >= 1 ? '✓' : '1'}</div>
          <div class="step-connector ${step > 1 ? 'done' : ''}"></div>
          <div class="step-text">
            <span class="step-title">Commande confirmée</span>
            <span class="step-desc">Paiement validé — Dossier transmis à l'atelier</span>
          </div>
        </div>

        <div class="step-row">
          <div class="step-indicator ${step > 2 ? 'done' : (step === 2 ? 'active' : 'pending')}">${step > 2 ? '✓' : (step === 2 ? '●' : '2')}</div>
          <div class="step-connector ${step > 2 ? 'done' : ''}"></div>
          <div class="step-text">
            <span class="step-title">Montage & Finitions Atelier</span>
            <span class="step-desc">Façonnage artisanal de la monture et centrage des verres</span>
          </div>
        </div>

        <div class="step-row">
          <div class="step-indicator ${step > 3 ? 'done' : (step === 3 ? 'active' : 'pending')}">${step > 3 ? '✓' : (step === 3 ? '●' : '3')}</div>
          <div class="step-connector ${step > 3 ? 'done' : ''}"></div>
          <div class="step-text">
            <span class="step-title">Contrôle qualité & Mise sous pli</span>
            <span class="step-desc">Vérification optométrique, étui cuir et chamoisine</span>
          </div>
        </div>

        <div class="step-row">
          <div class="step-indicator ${step >= 4 ? 'done' : 'pending'}">${step >= 4 ? '✓' : '4'}</div>
          <div class="step-text">
            <span class="step-title">Expédition Colissimo Expert</span>
            <span class="step-desc">Remise contre signature en 48h</span>
          </div>
        </div>
      </div>

      <div class="tracking-shipping-footer">
        <span class="carrier-badge">
          <span class="carrier-dot"></span>
          Colissimo : ${escapeHtml(order.trackingCode)}
        </span>
        <a href="https://www.laposte.fr/outils/suivre-vos-envois" target="_blank" rel="noopener noreferrer" class="tracking-link">Suivre le colis ↗</a>
      </div>
    `;

    ordersListContainer.appendChild(card);
  });
}

// ==========================================================================
// 9. SÉCURITÉ ADMIN & STUDIO CATALOGUE (PROTÉGÉ SHA-256)
// ==========================================================================
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function isAdminAuthenticated() {
  const token = sessionStorage.getItem(AUTH_SESSION_KEY);
  if (!token) return false;
  try {
    const data = JSON.parse(token);
    if (Date.now() - data.timestamp < 30 * 60 * 1000) {
      return true;
    }
  } catch (e) {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
  }
  return false;
}

function setAdminSession() {
  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({
    authenticated: true,
    timestamp: Date.now()
  }));
}

function clearAdminSession() {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
}

function checkHashTrigger() {
  if (window.location.hash === "#admin") {
    requestAdminAccess();
  }
}

document.addEventListener("keydown", (e) => {
  if ((e.altKey && (e.key === 'a' || e.key === 'A')) || 
      (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a'))) {
    e.preventDefault();
    requestAdminAccess();
  }
});

let clickCount = 0;
let clickTimer = null;
if (secretTriggerCopyright) {
  secretTriggerCopyright.addEventListener("click", () => {
    clickCount++;
    clearTimeout(clickTimer);
    if (clickCount >= 3) {
      clickCount = 0;
      requestAdminAccess();
    } else {
      clickTimer = setTimeout(() => { clickCount = 0; }, 500);
    }
  });
}

function requestAdminAccess() {
  if (isAdminAuthenticated()) {
    openAdminModal();
  } else {
    openAuthModal();
  }
}

function openAuthModal() {
  authErrorMsg.style.display = "none";
  adminPasswordInput.value = "";
  adminAuthModal.classList.add("active");
  adminAuthModal.setAttribute("aria-hidden", "false");
  setTimeout(() => adminPasswordInput.focus(), 150);
}

function closeAuthModal() {
  adminAuthModal.classList.remove("active");
  adminAuthModal.setAttribute("aria-hidden", "true");
  adminPasswordInput.value = "";
  cleanUrlHash();
}

closeAuthModalBtn.addEventListener("click", closeAuthModal);

function cleanUrlHash() {
  if (window.location.hash === "#admin") {
    history.replaceState(null, null, window.location.pathname + window.location.search);
  }
}

adminAuthForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (Date.now() < authLockUntil) {
    const remaining = Math.ceil((authLockUntil - Date.now()) / 1000);
    authErrorMsg.textContent = `Trop de tentatives. Veuillez patienter ${remaining}s.`;
    authErrorMsg.style.display = "block";
    return;
  }

  const enteredPassword = adminPasswordInput.value;
  const hash = await sha256(enteredPassword);

  if (hash === DEFAULT_PASSWORD_HASH) {
    failedAuthAttempts = 0;
    setAdminSession();
    closeAuthModal();
    openAdminModal();
  } else {
    failedAuthAttempts++;
    if (failedAuthAttempts >= 5) {
      authLockUntil = Date.now() + 30 * 1000;
      authErrorMsg.textContent = "Trop de tentatives incorrectes. Accès verrouillé pour 30s.";
    } else {
      authErrorMsg.textContent = `Mot de passe incorrect (${failedAuthAttempts}/5).`;
    }
    authErrorMsg.style.display = "block";
    adminPasswordInput.value = "";
    adminPasswordInput.focus();
  }
});

function openAdminModal() {
  if (!isAdminAuthenticated()) {
    openAuthModal();
    return;
  }
  renderAdminTable();
  adminModal.classList.add("active");
  adminModal.setAttribute("aria-hidden", "false");
}

function closeAdminModal() {
  adminModal.classList.remove("active");
  adminModal.setAttribute("aria-hidden", "true");
  hideAdminForm();
  cleanUrlHash();
}

closeAdminBtn.addEventListener("click", closeAdminModal);

btnLogoutAdmin.addEventListener("click", () => {
  clearAdminSession();
  closeAdminModal();
  alert("Session administrateur déconnectée avec succès.");
});

function renderAdminTable() {
  adminProductCount.textContent = products.length;
  adminTableBody.innerHTML = "";

  products.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img src="${p.image}" class="admin-thumb" alt="${p.name}"></td>
      <td><strong>${p.name}</strong><br><span style="font-size:10px; color:#888;">${p.badge}</span></td>
      <td><span class="badge-cat">${p.category}</span></td>
      <td>${p.shapeDetail}</td>
      <td>${p.colorway}</td>
      <td><strong>${p.price} €</strong></td>
      <td style="font-size:11px; color:#666;">${p.calibre} □ ${p.bridge} — ${p.temple}</td>
      <td style="text-align: right;">
        <button class="table-btn btn-edit" data-edit="${p.id}">Modifier</button>
        <button class="table-btn btn-delete" data-delete="${p.id}">Supprimer</button>
      </td>
    `;

    tr.querySelector(`[data-edit="${p.id}"]`).addEventListener("click", () => {
      startEditProduct(p.id);
    });

    tr.querySelector(`[data-delete="${p.id}"]`).addEventListener("click", () => {
      if (confirm(`Confirmez-vous la suppression du modèle ${p.name} ?`)) {
        products = products.filter(item => item.id !== p.id);
        saveSafeProducts();
        renderAdminTable();
        renderStorefront();
      }
    });

    adminTableBody.appendChild(tr);
  });
}

function showAdminForm(isEdit = false) {
  adminFormContainer.style.display = "block";
  formTitle.textContent = isEdit ? "Modifier les caractéristiques de la monture" : "Ajouter une nouvelle monture";
  adminFormContainer.scrollIntoView({ behavior: "smooth" });
}

function hideAdminForm() {
  adminFormContainer.style.display = "none";
  productForm.reset();
  document.getElementById("editProductId").value = "";
}

btnAddNewProduct.addEventListener("click", () => {
  productForm.reset();
  document.getElementById("editProductId").value = "";
  document.getElementById("fPrice").value = 215;
  showAdminForm(false);
});

btnCancelForm.addEventListener("click", hideAdminForm);

function startEditProduct(id) {
  const p = products.find(item => item.id === id);
  if (!p) return;

  document.getElementById("editProductId").value = p.id;
  document.getElementById("fName").value = p.name;
  document.getElementById("fCategory").value = p.category;
  document.getElementById("fPrice").value = p.price;
  document.getElementById("fShapeCategory").value = p.shapeCategory;
  document.getElementById("fShapeDetail").value = p.shapeDetail;
  document.getElementById("fColorway").value = p.colorway;
  document.getElementById("fBadge").value = p.badge;
  document.getElementById("fCalibre").value = p.calibre;
  document.getElementById("fBridge").value = p.bridge;
  document.getElementById("fTemple").value = p.temple;
  document.getElementById("fMaterial").value = p.material;
  document.getElementById("fDescription").value = p.description;

  showAdminForm(true);
}

function processAndCompressImage(file) {
  return new Promise((resolve, reject) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return reject(new Error("Format non autorisé (JPEG, PNG, WEBP uniquement)."));
    }
    if (file.size > 2.5 * 1024 * 1024) {
      return reject(new Error("L'image dépasse 2.5 Mo."));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Erreur de lecture du fichier."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Image invalide."));
      img.onload = () => {
        const MAX_DIM = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
        resolve(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const editId = document.getElementById("editProductId").value;
  const name = document.getElementById("fName").value;
  const category = document.getElementById("fCategory").value;
  const price = document.getElementById("fPrice").value;
  const shapeCategory = document.getElementById("fShapeCategory").value;
  const shapeDetail = document.getElementById("fShapeDetail").value;
  const colorway = document.getElementById("fColorway").value;
  const badge = document.getElementById("fBadge").value;
  const calibre = document.getElementById("fCalibre").value;
  const bridge = document.getElementById("fBridge").value;
  const temple = document.getElementById("fTemple").value;
  const material = document.getElementById("fMaterial").value;
  const description = document.getElementById("fDescription").value;

  const fileInput = document.getElementById("fImageFile");
  const presetSelect = document.getElementById("fImagePreset");

  let imageUri = null;

  try {
    if (fileInput.files && fileInput.files[0]) {
      imageUri = await processAndCompressImage(fileInput.files[0]);
    } else if (presetSelect.value) {
      imageUri = presetSelect.value;
    }
  } catch (err) {
    alert("Sécurité image : " + err.message);
    return;
  }

  if (editId) {
    const index = products.findIndex(p => p.id === editId);
    if (index !== -1) {
      const updated = validateProductSchema({
        id: editId,
        name,
        category,
        price,
        shapeCategory,
        shapeDetail,
        colorway,
        badge,
        calibre,
        bridge,
        temple,
        material,
        description,
        image: imageUri || products[index].image
      });
      if (updated) products[index] = updated;
    }
  } else {
    const rawId = "the-" + name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString(36);
    const newProduct = validateProductSchema({
      id: rawId,
      name,
      category,
      price,
      shapeCategory,
      shapeDetail,
      colorway,
      badge,
      image: imageUri || "images/products/the-biggie.jpeg",
      calibre,
      bridge,
      temple,
      material,
      hinges: "Charnières 7 barillets polies main",
      description
    });
    if (newProduct) products.unshift(newProduct);
  }

  saveSafeProducts();
  renderAdminTable();
  renderStorefront();
  hideAdminForm();
});

btnExportJson.addEventListener("click", () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
  const dlAnchorElem = document.createElement("a");
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", "barnett-greenman-catalogue.json");
  dlAnchorElem.click();
});

btnResetDefault.addEventListener("click", () => {
  if (confirm("Réinitialiser le catalogue avec les collections officielles à 215 € ?")) {
    products = DEFAULT_PRODUCTS.map(validateProductSchema);
    saveSafeProducts();
    renderAdminTable();
    renderStorefront();
  }
});

// ==========================================================================
// 10. INITIALISATION
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  renderStorefront();
  updateCustomerUI();
  checkHashTrigger();
  window.addEventListener("hashchange", checkHashTrigger);
});

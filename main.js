  // ==================== PRODUCTS ====================
const PRODUCTS = [
    {
        id: "sneakers-001", 
        name: "Sky Blue Sneakers",
        category: "fashion",
        price: 50000,
        image: "https://images.unsplash.com/photo-1660633777105-9521b3757393?w=800&auto=format&fit=crop&q=60",
        description: "Comfortable sneakers suitable for everyday wear."
    },
    {
        id: "handbag-001",
        name: "Ladies Handbag",
        category: "fashion",
        price: 30000,
        image: "https://images.unsplash.com/photo-1640901555383-7335ec5a6476?w=800&auto=format&fit=crop&q=60",
        description: "Comfortable ladies handbag suitable for everyday use."
    },
    {
        id: "baby-001",
        name: "Baby Clothes",
        category: "fashion",
        price: 10000,
        image: "https://plus.unsplash.com/premium_photo-1667480556784-a8f27e62104c?w=800&auto=format&fit=crop&q=60",
        description: "Comfortable baby clothes suitable for everyday wear."
    },
    {
        id: "earbuds-001",
        name: "Wireless Earbuds",
        category: "electronics",
        price: 25000,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=60",
        description: "Crystal-clear sound with noise cancellation."
    },
    {
        id: "watch-001",
        name: "Smart Watch",
        category: "electronics",
        price: 45000,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60",
        description: "Track fitness, calls and messages on the go."
    },
    {
        id: "vase-001",
        name: "Ceramic Vase",
        category: "home",
        price: 15000,
        image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800&auto=format&fit=crop&q=60",
        description: "Handcrafted ceramic vase for modern interiors."
    },
    {
        id: "skincare-001",
        name: "Skincare Set",
        category: "beauty",
        price: 20000,
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=60",
        description: "Natural skincare essentials for glowing skin."
    },
    {
        id: "perfume-001",
        name: "Perfume Bottle",
        category: "beauty",
        price: 35000,
        image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=60",
        description: "Long-lasting fragrance for daily confidence."
    }
];
// Load user-listed products from localStorage
const USER_PRODUCTS_KEY = "userProducts";
const userProducts = JSON.parse(localStorage.getItem(USER_PRODUCTS_KEY)) || [];
// ==================== STATE ====================
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let favourites = JSON.parse(localStorage.getItem("favourites")) || [];
let activeCategory = "all";
let searchQuery = "";
let sortBy = "default";       // default | price-asc | price-desc | name-asc
let visibleCount = 6;         // how many products are currently shown

// ==================== DOM ELEMENTS ====================
const menuButton = document.getElementById("menuButton");
const navMenu = document.getElementById("nav");
const cartButton = document.getElementById("cartButton");
const cartOverlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const checkoutButton = document.getElementById("checkoutButton");
const closeCart = document.getElementById("closeCart");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const productsGrid = document.getElementById("productsGrid");
const noResults = document.getElementById("noResults");
const toast = document.getElementById("toast");
const wishlistGrid = document.getElementById("wishlistGrid");
const wishlistEmpty = document.getElementById("wishlistEmpty");
const wishlistCount = document.getElementById("wishlistCount");
const sellForm = document.getElementById("sellForm");
const productNameInput = document.getElementById("productName");
const productCategoryInput = document.getElementById("productCategory");
const productPriceInput = document.getElementById("productPrice");
const productImageInput = document.getElementById("productImage");
const productDescriptionInput = document.getElementById("productDescription");

// ==================== HELPERS ====================
function formatPrice(value) {
    return "₦" + value.toLocaleString();
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
}

// ==================== RENDER PRODUCTS ====================
// Build a single product card element (reused by main grid + wishlist)
function createProductCard(product) {
    const isFav = favourites.includes(product.id);

    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}">
            <button class="favourite-button ${isFav ? 'liked' : ''}" data-id="${product.id}">
                ${isFav ? '💖' : '❤️'}
            </button>
        </div>
        <div class="product-info">
            <p class="product-category">${product.category}</p>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
        </div>
        <div class="product-bottom">
            <strong>${formatPrice(product.price)}</strong>
            <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
        </div>
    `;
    return card;
}

function renderProducts(list) {
    productsGrid.innerHTML = "";

    if (!list.length) {
        noResults.style.display = "block";
        return;
    }
    noResults.style.display = "none";

    list.forEach(product => {
        productsGrid.appendChild(createProductCard(product));
    });
}

// ==================== WISHLIST RENDER ====================
function renderWishlist() {
    if (!wishlistGrid) return;

    const allProducts = [...PRODUCTS, ...userProducts];
    const saved = allProducts.filter(p => favourites.includes(p.id));

    // Update count
    wishlistCount.textContent = saved.length === 1
        ? "1 item saved"
        : `${saved.length} items saved`;

    // Render grid
    wishlistGrid.innerHTML = "";

    if (saved.length === 0) {
        wishlistEmpty.style.display = "block";
        wishlistGrid.style.display = "none";
        return;
    }

    wishlistEmpty.style.display = "none";
    wishlistGrid.style.display = "grid";

    saved.forEach(product => {
        wishlistGrid.appendChild(createProductCard(product));
    });
}
// ==================== CART ====================
function addToCart(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showToast(product.name + " added to cart ✓");
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function changeQuantity(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartUI() {
    // Cart count
    const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    cartCount.textContent = totalItems;
    cartTotal.textContent = formatPrice(totalPrice);

    // Cart items
    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart-state">
                <div class="empty-cart-icon">🛒</div>
                <p class="empty-cart">Your cart is empty.</p>
                <p class="empty-cart-hint">Add products to get started.</p>
            </div>
        `;
        return;
    }

    cart.forEach(item => {
        const row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML = `
            <img class="cart-item-img" src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${formatPrice(item.price)}</p>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" data-id="${item.id}" data-action="decrease">−</button>
                <span class="qty">${item.quantity}</span>
                <button class="qty-btn" data-id="${item.id}" data-action="increase">+</button>
                <button class="remove-btn" data-id="${item.id}">🗑️</button>
            </div>
        `;
        cartItems.appendChild(row);
    });
}

// ==================== FILTERS ====================
function getFilteredProducts() {
    const q = searchQuery.toLowerCase().trim();
    const allProducts = [...PRODUCTS, ...userProducts];

    // 1) Filter by category + search
    let list = allProducts.filter(p => {
        const matchesCategory = activeCategory === "all" || p.category === activeCategory;
        const matchesSearch = !q ||
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q);
        return matchesCategory && matchesSearch;
    });

    // 2) Sort
    if (sortBy === "price-asc")  list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === "name-asc")   list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return list;
}

// Render only the first `visibleCount` products, and update Load More UI
function applyFilters(resetPage = true) {
    if (resetPage) visibleCount = 6;    // reset to first page whenever filters change

    const filtered = getFilteredProducts();
    const visible = filtered.slice(0, visibleCount);

    renderProducts(visible);
    updateLoadMoreUI(filtered.length, visible.length);
}

function updateLoadMoreUI(total, shown) {
    const countEl = document.getElementById("showCount");
    const btn = document.getElementById("loadMoreBtn");
    if (!countEl || !btn) return;

    if (total === 0) {
        countEl.textContent = "";
        btn.classList.add("hidden");
        return;
    }

    countEl.textContent = `Showing ${shown} of ${total} products`;

    if (shown >= total) {
        btn.classList.add("hidden");
    } else {
        btn.classList.remove("hidden");
    }
}
// ==================== EVENT LISTENERS ====================

// Products grid (event delegation)
productsGrid.addEventListener("click", function (e) {
    const addBtn = e.target.closest(".add-to-cart");
if (addBtn) {
    withLoading(addBtn, LOADING_MS, () => {
        addToCart(addBtn.dataset.id);
        cartOverlay.classList.add("show");
    });
    return;
}

    const favBtn = e.target.closest(".favourite-button");
    if (favBtn) {
        const id = favBtn.dataset.id;
        const index = favourites.indexOf(id);
        if (index === -1) {
            favourites.push(id);
            favBtn.classList.add("liked");
            favBtn.textContent = "💖";
        } else {
            favourites.splice(index, 1);
            favBtn.classList.remove("liked");
            favBtn.textContent = "❤️";
        }
        localStorage.setItem("favourites", JSON.stringify(favourites));
        renderWishlist();
        return;
    }

    // If we got here, the click was on the card itself (not a button)
    const card = e.target.closest(".product-card");
    if (card) {
        const productId = card.querySelector(".add-to-cart").dataset.id;
        const product = [...PRODUCTS, ...userProducts].find(p => p.id === productId);
        if (product) openModal(product);
    }
});

// Cart items (event delegation)
cartItems.addEventListener("click", function (e) {
    const qtyBtn = e.target.closest(".qty-btn");
    if (qtyBtn) {
        const delta = qtyBtn.dataset.action === "increase" ? 1 : -1;
        changeQuantity(qtyBtn.dataset.id, delta);
        return;
    }

    const removeBtn = e.target.closest(".remove-btn");
    if (removeBtn) {
        removeFromCart(removeBtn.dataset.id);
    }
});

// Cart open/close
cartButton.addEventListener("click", () => cartOverlay.classList.add("show"));
closeCart.addEventListener("click", () => cartOverlay.classList.remove("show"));
cartOverlay.addEventListener("click", (e) => {
    if (e.target === cartOverlay) cartOverlay.classList.remove("show");
});

// Checkout
checkoutButton.addEventListener("click", function () {
    if (cart.length === 0) {
        showToast("Your cart is empty");
        return;
    }
    cartOverlay.classList.remove("show");
    openCheckout();
});

// Search
searchButton.addEventListener("click", () => {
    searchQuery = searchInput.value;
    applyFilters();
});
searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value;
    applyFilters();
});

// Categories
document.querySelectorAll(".category-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeCategory = btn.dataset.category;
        applyFilters();
    });
});

// Mobile menu
menuButton.addEventListener("click", () => navMenu.classList.toggle("show"));

// ==================== INIT ====================
renderProducts([...PRODUCTS, ...userProducts]);
updateCartUI();
// ==================== SELL FORM ====================
if (sellForm) {
    sellForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const newProduct = {
            id: "user-" + Date.now(),
            name: productNameInput.value.trim(),
            category: productCategoryInput.value,
            price: Number(productPriceInput.value),
            image: productImageInput.value.trim(),
            description: productDescriptionInput.value.trim()
        };

        userProducts.push(newProduct);
        localStorage.setItem(USER_PRODUCTS_KEY, JSON.stringify(userProducts));

        sellForm.reset();
        renderProducts([...PRODUCTS, ...userProducts]);
        showToast("Product listed! 🎉");

        document.getElementById("products").scrollIntoView({ behavior: "smooth" });
    });
}
// ==================== PRODUCT DETAIL MODAL ====================
const modalOverlay = document.getElementById("modalOverlay");
const modalClose = document.getElementById("modalClose");
const modalImg = document.getElementById("modalImg");
const modalName = document.getElementById("modalName");
const modalCategory = document.getElementById("modalCategory");
const modalPrice = document.getElementById("modalPrice");
const modalDescription = document.getElementById("modalDescription");
const modalQty = document.getElementById("modalQty");
const modalQtyMinus = document.getElementById("modalQtyMinus");
const modalQtyPlus = document.getElementById("modalQtyPlus");
const modalAddBtn = document.getElementById("modalAddBtn");

let currentModalProduct = null;  // tracks which product is open
let currentModalQty = 1;         // tracks chosen quantity

// Open modal with a specific product
function openModal(product) {
    currentModalProduct = product;
    currentModalQty = 1;

    modalImg.src = product.image;
    modalImg.alt = product.name;
    modalName.textContent = product.name;
    modalCategory.textContent = product.category;
    modalPrice.textContent = formatPrice(product.price);
    modalDescription.textContent = product.description;
    modalQty.textContent = currentModalQty;

    modalOverlay.classList.add("show");
    document.body.style.overflow = "hidden"; // stop background scroll
}

// Close modal
function closeModal() {
    modalOverlay.classList.remove("show");
    document.body.style.overflow = "";
    currentModalProduct = null;
    currentModalQty = 1;
}

// Quantity buttons
modalQtyMinus.addEventListener("click", function () {
    if (currentModalQty > 1) {
        currentModalQty--;
        modalQty.textContent = currentModalQty;
    }
});

modalQtyPlus.addEventListener("click", function () {
    currentModalQty++;
    modalQty.textContent = currentModalQty;
});

// Add to cart from modal
modalAddBtn.addEventListener("click", function () {
    if (!currentModalProduct) return;
withLoading(modalAddBtn, LOADING_MS, () => {
    
    const existing = cart.find(item => item.id === currentModalProduct.id);
    if (existing) {
        existing.quantity += currentModalQty;
    } else {
        cart.push({
            id: currentModalProduct.id,
            name: currentModalProduct.name,
            price: currentModalProduct.price,
            image: currentModalProduct.image,
            quantity: currentModalQty
        });
    }

    saveCart();
    updateCartUI();
    showToast(`${currentModalProduct.name} × ${currentModalQty} added ✓`);
    closeModal();
    cartOverlay.classList.add("show");
});

// Close by X button or backdrop click
modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", function (e) {
    if (e.target === modalOverlay) closeModal();
});

// ESC closes modal (and cart, which we already have)
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modalOverlay.classList.contains("show")) {
        closeModal();
    }
});
// ==================== SORT + LOAD MORE ====================
const sortSelect = document.getElementById("sortSelect");
const loadMoreBtn = document.getElementById("loadMoreBtn");

sortSelect.addEventListener("change", function () {
    sortBy = sortSelect.value;
    applyFilters();   // resets to first page + applies new sort
});

loadMoreBtn.addEventListener("click", function () {
    visibleCount += 6;
    applyFilters(false);  // don't reset — just show more
});
// ==================== WISHLIST GRID CLICK ====================
if (wishlistGrid) {
    wishlistGrid.addEventListener("click", function (e) {
       const addBtn = e.target.closest(".add-to-cart");
if (addBtn) {
    withLoading(addBtn, LOADING_MS, () => {
        addToCart(addBtn.dataset.id);
        cartOverlay.classList.add("show");
    });
    return;
}

        const favBtn = e.target.closest(".favourite-button");
        if (favBtn) {
            const id = favBtn.dataset.id;
            const index = favourites.indexOf(id);
            if (index === -1) {
                favourites.push(id);
            } else {
                favourites.splice(index, 1);
            }
            localStorage.setItem("favourites", JSON.stringify(favourites));
            // Re-render both grids so favourites stay in sync
            applyFilters();
            renderWishlist();
            return;
        }

        const card = e.target.closest(".product-card");
        if (card) {
            const productId = card.querySelector(".add-to-cart").dataset.id;
            const product = [...PRODUCTS, ...userProducts].find(p => p.id === productId);
            if (product) openModal(product);
        }
    });
}
// applyFilters();
// updateCartUI();
// renderWishlist();
// ==================== CHECKOUT FLOW ====================
const checkoutOverlay = document.getElementById("checkoutOverlay");
const checkoutClose = document.getElementById("checkoutClose");
const checkoutTotal = document.getElementById("checkoutTotal");
const checkoutBack = document.getElementById("checkoutBack");
const checkoutNext = document.getElementById("checkoutNext");
const checkoutFooter = document.getElementById("checkoutFooter");
const continueShoppingBtn = document.getElementById("continueShoppingBtn");

let currentStep = 1;         // 1..4
const TOTAL_STEPS = 4;

// Open checkout
function openCheckout() {
    if (cart.length === 0) {
        showToast("Your cart is empty");
        return;
    }

    // Update total display
    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    checkoutTotal.textContent = formatPrice(total);

    // Reset to step 1
    currentStep = 1;
    goToStep(1);
    clearCheckoutInputs();

    checkoutOverlay.classList.add("show");
    document.body.style.overflow = "hidden";
}

// Close checkout
function closeCheckout() {
    checkoutOverlay.classList.remove("show");
    document.body.style.overflow = "";
}

// Reset all inputs
function clearCheckoutInputs() {
    [
        "coName", "coEmail", "coPhone",
        "coStreet", "coCity", "coState",
        "coCard", "coExpiry", "coCvv"
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.value = "";
            el.classList.remove("error");
        }
    });
}

// Change step
function goToStep(step) {
    currentStep = step;

    // Show only the current step
    document.querySelectorAll(".checkout-step").forEach(el => {
        el.classList.toggle("active", Number(el.dataset.step) === step);
    });

    // Progress dots
    document.querySelectorAll(".progress-step").forEach(el => {
        const s = Number(el.dataset.step);
        el.classList.toggle("active", s === step);
        el.classList.toggle("completed", s < step);
    });

    // Back button disabled on first step
    checkoutBack.disabled = step === 1;

    // Hide footer on success step
    checkoutFooter.style.display = step === TOTAL_STEPS ? "none" : "flex";

    // Change Next button label on last input step
    checkoutNext.textContent = step === 3 ? "Place Order" : "Continue";
}

// Simple validation per step
function validateStep(step) {
    const checks = {
        1: [
            { id: "coName",  test: v => v.trim().length >= 2 },
            { id: "coEmail", test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
            { id: "coPhone", test: v => v.trim().length >= 7 }
        ],
        2: [
            { id: "coStreet", test: v => v.trim().length >= 3 },
            { id: "coCity",   test: v => v.trim().length >= 2 },
            { id: "coState",  test: v => v.trim().length >= 2 }
        ],
        3: [
            { id: "coCard",   test: v => v.replace(/\s/g, "").length >= 12 },
            { id: "coExpiry", test: v => /^\d{2}\/\d{2}$/.test(v.trim()) },
            { id: "coCvv",    test: v => /^\d{3,4}$/.test(v.trim()) }
        ]
    };

    const rules = checks[step] || [];
    let valid = true;

    rules.forEach(rule => {
        const el = document.getElementById(rule.id);
        if (!el) return;
        const ok = rule.test(el.value);
        el.classList.toggle("error", !ok);
        if (!ok) valid = false;
    });

    return valid;
}

// Generate order number
function generateOrderNumber() {
    const n = Math.floor(1000 + Math.random() * 9000);
    return "#MH-" + n;
}

// Next button
checkoutNext.addEventListener("click", function () {
    if (currentStep < 3) {
        // Validate current input step before advancing
        if (!validateStep(currentStep)) {
            showToast("Please fill in all fields correctly");
            return;
        }
        goToStep(currentStep + 1);
    } else if (currentStep === 3) {
    // Final step — validate then submit
    if (!validateStep(3)) {
        showToast("Please check your payment details");
        return;
    }
    withLoading(checkoutNext, 900, () => {
        submitOrder();
    });
}

// Back button
checkoutBack.addEventListener("click", function () {
    if (currentStep > 1) goToStep(currentStep - 1);
});

// Submit order
function submitOrder() {
    // Capture details before clearing
    const name = document.getElementById("coName").value.trim();
    const email = document.getElementById("coEmail").value.trim();
    const orderNum = generateOrderNumber();

    // Fill success screen
    document.getElementById("successName").textContent = name || "friend";
    document.getElementById("successEmail").textContent = email || "your email";
    document.getElementById("orderNumber").textContent = orderNum;

    // Advance to success step
    goToStep(4);

    // Clear the cart
    cart = [];
    saveCart();
    updateCartUI();
}

// Close actions
checkoutClose.addEventListener("click", closeCheckout);
checkoutOverlay.addEventListener("click", function (e) {
    if (e.target === checkoutOverlay) closeCheckout();
});
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && checkoutOverlay.classList.contains("show")) {
        closeCheckout();
    }
});

// Continue shopping button on success screen
continueShoppingBtn.addEventListener("click", function () {
    closeCheckout();
    document.getElementById("products").scrollIntoView({ behavior: "smooth" });
});

// ==================== FORMATTING INPUTS (nice UX) ====================
// Auto-format card number: 4242 4242 4242 4242
document.getElementById("coCard").addEventListener("input", function (e) {
    let v = e.target.value.replace(/\D/g, "").slice(0, 16);
    e.target.value = v.replace(/(\d{4})(?=\d)/g, "$1 ");
});

// Auto-format expiry: MM/YY
document.getElementById("coExpiry").addEventListener("input", function (e) {
    let v = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
    e.target.value = v;
});

// Digits only for CVV and phone
document.getElementById("coCvv").addEventListener("input", function (e) {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
});
// ==================== BACK TO TOP ====================
const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", function () {
    if (window.scrollY > 500) {
        backToTop.classList.add("show");
    } else {
        backToTop.classList.remove("show");
    }
});

backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
});
// ==================== PWA SERVICE WORKER ====================
if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
        navigator.serviceWorker.register("./sw.js")
            .then(reg => {
                console.log("Service Worker registered ✓", reg.scope);
            })
            .catch(err => {
                console.warn("Service Worker registration failed:", err);
            });
    });
}
// ==================== THEME TOGGLE ====================
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

// Determine starting theme:
// 1) Saved preference, OR
// 2) OS preference if no saved preference
function getInitialTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;

    // Fall back to OS preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
    }
    return "light";
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
    localStorage.setItem("theme", theme);
}

// Init on page load
applyTheme(getInitialTheme());

// Toggle on click
themeToggle.addEventListener("click", function () {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
});

// Follow OS changes live (if user hasn't set a preference)
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
    // Only auto-switch if user hasn't chosen manually
    if (!localStorage.getItem("theme")) {
        applyTheme(e.matches ? "dark" : "light");
    }
});
// ==================== BUTTON LOADING HELPER ====================
// Shows a spinner on a button for `duration` ms, then restores it.
function withLoading(button, duration, callback) {
    if (!button || button.classList.contains("btn-loading")) return;

    const originalText = button.textContent;
    button.classList.add("btn-loading");
    button.disabled = true;

    setTimeout(() => {
        button.classList.remove("btn-loading");
        button.disabled = false;
        button.textContent = originalText;
        if (typeof callback === "function") callback();
    }, duration);
}

// Simulate a short "processing" delay for realism
const LOADING_MS = 600;

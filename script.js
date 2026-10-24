"use strict";

// Supabase-ის ინიციალიზაცია
const SUPABASE_URL = "https://yxcexveaqdwmqpmtqsxn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4Y2V4dmVhcWR3bXFwbXRxc3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NTU0NDgsImV4cCI6MjEwNDAzMTQ0OH0.3BOHDlfYwI6Bya7kERUB4wustxo0hzR-y7Vlu7x36b4";

const DEMO_PRODUCTS = [
    { id: "demo-ring-01", name: "Solstice Gold Ring", category: "Rings", price: 189, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85", badge: "Bestseller", description: "A sculptural gold-tone ring designed for everyday wear. Demo product; materials and specifications are illustrative." },
    { id: "demo-ring-02", name: "Luna Signet Ring", category: "Rings", price: 215, image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=900&q=85", badge: "", description: "A clean, modern signet silhouette with a softly polished finish. Demo product." },
    { id: "demo-necklace-01", name: "Celeste Pendant", category: "Necklaces", price: 249, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85", badge: "New", description: "A delicate pendant necklace with a minimal, timeless profile. Demo product." },
    { id: "demo-necklace-02", name: "Golden Hour Chain", category: "Necklaces", price: 175, image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85", badge: "", description: "A versatile chain intended to layer or wear on its own. Demo product." },
    { id: "demo-earrings-01", name: "Aura Hoops", category: "Earrings", price: 159, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85", badge: "Bestseller", description: "Light-catching hoops with a refined everyday shape. Demo product." },
    { id: "demo-earrings-02", name: "Pearl Drop Earrings", category: "Earrings", price: 229, image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=85", badge: "", description: "A graceful drop silhouette inspired by classic occasion jewelry. Demo product." },
    { id: "demo-bracelet-01", name: "Serene Bracelet", category: "Bracelets", price: 199, image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=85", badge: "", description: "A subtle bracelet designed to complement a daily jewelry stack. Demo product." },
    { id: "demo-bracelet-02", name: "Lumi Cuff", category: "Bracelets", price: 269, image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=85", badge: "Limited", description: "A minimal cuff with a bold but understated shape. Demo product." }
];

let PRODUCTS = []; // Live products from Supabase, or demo products if the API is unavailable.

const state = {
    cart: loadCart(),
    filter: "All",
    search: "",
    currentProductId: null,
    quantity: 1,
    selectedSize: "7",
    lastDemoOrderReference: null
};

const DOM = {
    productsGrid: document.getElementById("productsGrid"),
    emptyProducts: document.getElementById("emptyProducts"),
    filters: document.querySelectorAll(".collection-filter"),

    cartButton: document.getElementById("cartButton"),
    cartDrawer: document.getElementById("cartDrawer"),
    cartOverlay: document.getElementById("cartOverlay"),
    closeCart: document.getElementById("closeCart"),
    cartItems: document.getElementById("cartItems"),
    cartEmpty: document.getElementById("cartEmpty"),
    cartFooter: document.getElementById("cartFooter"),
    cartCount: document.getElementById("cartCount"),
    cartSubtotal: document.getElementById("cartSubtotal"),
    continueShopping: document.getElementById("continueShopping"),

    productModal: document.getElementById("productModal"),
    closeProductModal: document.getElementById("closeProductModal"),
    modalImage: document.getElementById("modalImage"),
    modalCategory: document.getElementById("modalCategory"),
    modalName: document.getElementById("modalName"),
    modalPrice: document.getElementById("modalPrice"),
    modalDescription: document.getElementById("modalDescription"),
    modalQuantity: document.getElementById("modalQuantity"),
    modalMinus: document.getElementById("modalMinus"),
    modalPlus: document.getElementById("modalPlus"),
    modalAddToCart: document.getElementById("modalAddToCart"),
    sizeSection: document.getElementById("sizeSection"),
    sizeOptions: document.querySelectorAll(".size-option"),

    searchButton: document.getElementById("searchButton"),
    searchPanel: document.getElementById("searchPanel"),
    searchInput: document.getElementById("searchInput"),
    closeSearch: document.getElementById("closeSearch"),

    mobileMenuButton: document.getElementById("mobileMenuButton"),
    mobileMenu: document.getElementById("mobileMenu"),

    checkoutModal: document.getElementById("checkoutModal"),
    checkoutButton: document.getElementById("checkoutButton"),
    closeCheckout: document.getElementById("closeCheckout"),
    checkoutTotal: document.getElementById("checkoutTotal"),
    checkoutForm: document.getElementById("checkoutForm"),

    successModal: document.getElementById("successModal"),
    closeSuccess: document.getElementById("closeSuccess")
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
    await fetchProductsFromSupabase();
    renderCart();
    setupEvents();
}

// 📌 პროდუქტების წამოღება Supabase ბაზიდან
async function fetchProductsFromSupabase() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=id.desc`, {
            headers: {
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                "Cache-Control": "no-cache"
            }
        });

        if (!response.ok) {
            throw new Error(`Supabase returned ${response.status}`);
        }

        const rows = await response.json();
        PRODUCTS = Array.isArray(rows) && rows.length
            ? rows.map(normalizeProduct)
            : DEMO_PRODUCTS;
    } catch (err) {
        console.warn("Using local demo products because the product API is unavailable:", err);
        PRODUCTS = DEMO_PRODUCTS;
    }

    renderProducts();
}

function normalizeProduct(product) {
    return {
        ...product,
        id: product.id,
        name: String(product.name || "Untitled product"),
        category: normalizeCategory(product.category),
        price: Number(product.price) || 0,
        image: String(product.image || ""),
        description: String(product.description || ""),
        badge: String(product.badge || "")
    };
}

function normalizeCategory(value) {
    const raw = String(value || "Jewelry").trim();
    const known = ["Rings", "Necklaces", "Earrings", "Bracelets"];
    const match = known.find(category => category.toLowerCase() === raw.toLowerCase());
    return match || (raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "Jewelry");
}

function setupEvents() {
    DOM.cartButton?.addEventListener("click", openCart);
    DOM.closeCart?.addEventListener("click", closeCart);
    DOM.cartOverlay?.addEventListener("click", closeCart);

    DOM.continueShopping?.addEventListener("click", () => {
        closeCart();
        document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
    });

    DOM.cartItems?.addEventListener("click", handleCartAction);
    DOM.closeProductModal?.addEventListener("click", closeProductModal);

    DOM.productModal?.addEventListener("click", event => {
        if (event.target === DOM.productModal) closeProductModal();
    });

    DOM.modalMinus?.addEventListener("click", decreaseQuantity);
    DOM.modalPlus?.addEventListener("click", increaseQuantity);
    DOM.modalAddToCart?.addEventListener("click", addCurrentProduct);

    DOM.sizeOptions.forEach(option => {
        option.addEventListener("click", () => {
            state.selectedSize = option.textContent.trim();
            updateSizeSelection();
        });
    });

    DOM.filters.forEach(filter => {
        filter.addEventListener("click", () => {
            state.filter = filter.dataset.filter || "All";
            updateFilters();
            renderProducts();
        });
    });

    DOM.searchButton?.addEventListener("click", () => {
        if (DOM.searchPanel?.classList.contains("open")) closeSearch();
        else openSearch();
    });
    DOM.closeSearch?.addEventListener("click", closeSearch);

    DOM.searchInput?.addEventListener("input", event => {
        state.search = event.target.value.trim().toLowerCase();
        renderProducts();
    });

    document.addEventListener("click", event => {
        const clickedInsideSearch = DOM.searchPanel?.contains(event.target) ||
            DOM.searchButton?.contains(event.target);
        if (!clickedInsideSearch && DOM.searchPanel?.classList.contains("open")) {
            closeSearch();
        }
    });

    DOM.mobileMenuButton?.addEventListener("click", () => {
        const isOpen = DOM.mobileMenu?.classList.toggle("open") || false;
        DOM.mobileMenuButton?.setAttribute("aria-expanded", String(isOpen));
    });

    DOM.mobileMenu?.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            DOM.mobileMenu?.classList.remove("open");
            DOM.mobileMenuButton?.setAttribute("aria-expanded", "false");
        });
    });

    DOM.checkoutButton?.addEventListener("click", openCheckout);
    DOM.closeCheckout?.addEventListener("click", closeCheckout);

    DOM.checkoutModal?.addEventListener("click", event => {
        if (event.target === DOM.checkoutModal) closeCheckout();
    });

    DOM.checkoutForm?.addEventListener("submit", submitOrder);
    DOM.closeSuccess?.addEventListener("click", closeSuccess);
    document.addEventListener("keydown", handleKeyboard);
}

function getFilteredProducts() {
    return PRODUCTS.filter(product => {
        const categoryMatch = state.filter === "All" ||
            String(product.category).toLowerCase() === String(state.filter).toLowerCase();
        if (!categoryMatch) return false;
        if (!state.search) return true;

        const searchableText = [product.name, product.category, product.description].join(" ").toLowerCase();
        return searchableText.includes(state.search);
    });
}

function renderProducts() {
    if (!DOM.productsGrid) return;
    const products = getFilteredProducts();
    DOM.productsGrid.innerHTML = "";

    if (products.length === 0) {
        DOM.emptyProducts?.classList.add("show");
        return;
    }

    DOM.emptyProducts?.classList.remove("show");
    products.forEach(product => {
        DOM.productsGrid.appendChild(createProductCard(product));
    });
}

function createProductCard(product) {
    const card = document.createElement("article");
    card.className = "product-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `View ${product.name}`);

    const openProduct = () => openProductModal(product.id);
    card.addEventListener("click", openProduct);
    card.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openProduct();
        }
    });

    const image = document.createElement("div");
    image.className = "product-image";

    const img = document.createElement("img");
    img.src = product.image;
    img.alt = product.name;
    img.loading = "lazy";
    img.onerror = () => {
        img.onerror = null;
        img.src = "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80";
    };

    image.appendChild(img);

    if (product.badge) {
        const badge = document.createElement("span");
        badge.className = "product-badge";
        badge.textContent = product.badge;
        image.appendChild(badge);
    }

    const info = document.createElement("div");
    info.className = "product-info";

    const category = document.createElement("div");
    category.className = "product-category";
    category.textContent = product.category;

    const name = document.createElement("div");
    name.className = "product-name";
    name.textContent = product.name;

    const price = document.createElement("div");
    price.className = "product-price";
    price.textContent = formatPrice(product.price);

    info.appendChild(category);
    info.appendChild(name);
    info.appendChild(price);

    card.appendChild(image);
    card.appendChild(info);

    return card;
}

function openProductModal(productId) {
    const product = PRODUCTS.find(item => String(item.id) === String(productId));
    if (!product) return;

    state.currentProductId = product.id;
    state.quantity = 1;
    state.selectedSize = "7";

    DOM.modalImage.style.backgroundImage = `url("${product.image}")`;
    DOM.modalImage.setAttribute("role", "img");
    DOM.modalImage.setAttribute("aria-label", product.name);
    DOM.modalCategory.textContent = product.category;
    DOM.modalName.textContent = product.name;
    DOM.modalPrice.textContent = formatPrice(product.price);
    DOM.modalDescription.textContent = product.description || '';

    if (product.category === "Rings") {
        DOM.sizeSection?.classList.remove("hidden");
    } else {
        DOM.sizeSection?.classList.add("hidden");
    }

    updateQuantity();
    updateSizeSelection();

    DOM.productModal?.classList.add("open");
    lockBody();
}

function closeProductModal() {
    DOM.productModal?.classList.remove("open");
    state.currentProductId = null;
    unlockBody();
}

function getCurrentProduct() {
    return PRODUCTS.find(product => String(product.id) === String(state.currentProductId)) || null;
}

function increaseQuantity() {
    state.quantity++;
    updateQuantity();
}

function decreaseQuantity() {
    if (state.quantity <= 1) return;
    state.quantity--;
    updateQuantity();
}

function updateQuantity() {
    if (!DOM.modalQuantity) return;
    DOM.modalQuantity.textContent = String(state.quantity);
}

function updateSizeSelection() {
    DOM.sizeOptions.forEach(option => {
        const size = option.textContent.trim();
        option.classList.toggle("selected", size === state.selectedSize);
    });
}

function addCurrentProduct() {
    const product = getCurrentProduct();
    if (!product) return;

    const size = product.category === "Rings" ? state.selectedSize : "Standard";

    const existing = state.cart.find(item => String(item.productId) === String(product.id) && item.size === size);

    if (existing) {
        existing.quantity += state.quantity;
    } else {
        state.cart.push({
            productId: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            image: product.image,
            size: size,
            quantity: state.quantity
        });
    }

    saveCart();
    renderCart();
    closeProductModal();
    openCart();
}

function renderCart() {
    if (!DOM.cartItems) return;
    DOM.cartItems.innerHTML = "";

    state.cart.forEach(item => {
        DOM.cartItems.appendChild(createCartItem(item));
    });

    const empty = state.cart.length === 0;
    DOM.cartEmpty?.classList.toggle("show", empty);
    DOM.cartFooter?.classList.toggle("hidden", empty);

    updateCartSummary();
}

function createCartItem(item) {
    const element = document.createElement("div");
    element.className = "cart-item";

    const image = document.createElement("div");
    image.className = "cart-item-image";
    image.style.backgroundImage = `url("${item.image}")`;

    const content = document.createElement("div");

    const name = document.createElement("div");
    name.className = "cart-item-name";
    name.textContent = item.name;

    const price = document.createElement("div");
    price.className = "cart-item-price";
    price.textContent = formatPrice(item.price);

    const size = document.createElement("div");
    size.className = "cart-item-price";
    size.textContent = item.size === "Standard" ? "Jewelry" : `Size: ${item.size}`;

    const actions = document.createElement("div");
    actions.className = "cart-item-actions";

    const decrease = createCartButton("−", "decrease", item);
    const quantity = document.createElement("span");
    quantity.textContent = String(item.quantity);
    const increase = createCartButton("+", "increase", item);

    actions.appendChild(decrease);
    actions.appendChild(quantity);
    actions.appendChild(increase);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "cart-item-remove";
    remove.textContent = "Remove";
    remove.dataset.action = "remove";
    remove.dataset.productId = String(item.productId);
    remove.dataset.size = item.size;

    content.appendChild(name);
    content.appendChild(price);
    content.appendChild(size);
    content.appendChild(actions);
    content.appendChild(remove);

    const total = document.createElement("strong");
    total.textContent = formatPrice(item.price * item.quantity);

    element.appendChild(image);
    element.appendChild(content);
    element.appendChild(total);

    return element;
}

function createCartButton(text, action, item) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.dataset.action = action;
    button.dataset.productId = String(item.productId);
    button.dataset.size = item.size;
    return button;
}

function handleCartAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    const productId = String(button.dataset.productId);
    const size = button.dataset.size;

    const index = state.cart.findIndex(item => String(item.productId) === productId && item.size === size);
    if (index === -1) return;

    if (action === "increase") state.cart[index].quantity++;
    if (action === "decrease") {
        state.cart[index].quantity--;
        if (state.cart[index].quantity <= 0) state.cart.splice(index, 1);
    }
    if (action === "remove") state.cart.splice(index, 1);

    saveCart();
    renderCart();
}

function getCartCount() {
    return state.cart.reduce((total, item) => total + item.quantity, 0);
}

function getCartSubtotal() {
    return state.cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function updateCartSummary() {
    const count = getCartCount();
    const subtotal = getCartSubtotal();

    if (DOM.cartCount) DOM.cartCount.textContent = String(count);
    if (DOM.cartSubtotal) DOM.cartSubtotal.textContent = formatPrice(subtotal);
    if (DOM.checkoutTotal) DOM.checkoutTotal.textContent = formatPrice(subtotal);
}

function openCart() {
    DOM.cartDrawer?.classList.add("open");
    DOM.cartOverlay?.classList.add("open");
    lockBody();
}

function closeCart() {
    DOM.cartDrawer?.classList.remove("open");
    DOM.cartOverlay?.classList.remove("open");
    unlockBody();
}

function updateFilters() {
    DOM.filters.forEach(filter => {
        filter.classList.toggle("active", filter.dataset.filter === state.filter);
    });
}

function openSearch() {
    DOM.searchPanel?.classList.add("open");
    DOM.searchButton?.setAttribute("aria-expanded", "true");
    setTimeout(() => DOM.searchInput?.focus(), 100);
}

function closeSearch() {
    DOM.searchPanel?.classList.remove("open");
    DOM.searchButton?.setAttribute("aria-expanded", "false");
}

function openCheckout() {
    if (state.cart.length === 0) return;
    updateCartSummary();
    DOM.checkoutModal?.classList.add("open");
    lockBody();
}

function closeCheckout() {
    DOM.checkoutModal?.classList.remove("open");
    unlockBody();
}

async function submitOrder(event) {
    event.preventDefault();
    if (!DOM.checkoutForm || state.cart.length === 0) return;

    if (!DOM.checkoutForm.reportValidity()) return;

    const submitBtn = DOM.checkoutForm.querySelector("button[type='submit']");
    const originalButtonText = submitBtn?.innerHTML;

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Preparing demo order…";
    }

    // This storefront is a portfolio demo: it deliberately does not charge a card
    // or send personal details to a payment endpoint.
    try {
        const formData = new FormData(DOM.checkoutForm);
        const demoOrder = {
            reference: `AUR-${Date.now().toString().slice(-8)}`,
            customer: {
                firstName: String(formData.get("firstName") || "").trim(),
                lastName: String(formData.get("lastName") || "").trim(),
                phone: String(formData.get("phone") || "").trim(),
                address: String(formData.get("address") || "").trim(),
                city: String(formData.get("city") || "").trim(),
                postalCode: String(formData.get("postalCode") || "").trim()
            },
            items: state.cart.map(item => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size
            })),
            total: getCartSubtotal(),
            demoOnly: true
        };

        console.info("AURELIA demo checkout (not a real order):", demoOrder);

        state.lastDemoOrderReference = demoOrder.reference;
        state.cart = [];
        saveCart();
        renderCart();
        DOM.checkoutForm.reset();
        closeCheckout();
        closeCart();
        openSuccess();
    } catch (err) {
        console.error("Demo checkout error:", err);
        alert("The demo checkout could not be completed. Please try again.");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalButtonText || 'Place order <span>→</span>';
        }
    }
}

function openSuccess() {
    const reference = DOM.successModal?.querySelector("[data-order-reference]");
    if (reference) reference.textContent = state.lastDemoOrderReference || "DEMO";
    DOM.successModal?.classList.add("open");
    lockBody();
}

function closeSuccess() {
    DOM.successModal?.classList.remove("open");
    unlockBody();
}

function handleKeyboard(event) {
    if (event.key !== "Escape") return;
    if (DOM.productModal?.classList.contains("open")) return closeProductModal();
    if (DOM.checkoutModal?.classList.contains("open")) return closeCheckout();
    if (DOM.successModal?.classList.contains("open")) return closeSuccess();
    if (DOM.cartDrawer?.classList.contains("open")) return closeCart();
    if (DOM.searchPanel?.classList.contains("open")) return closeSearch();
    DOM.mobileMenu?.classList.remove("open");
    DOM.mobileMenuButton?.setAttribute("aria-expanded", "false");
}

function lockBody() {
    document.body.style.overflow = "hidden";
}

function unlockBody() {
    const activeOverlay = document.querySelector(".modal-overlay.open");
    const activeCart = document.querySelector(".cart-drawer.open");
    if (activeOverlay || activeCart) return;
    document.body.style.overflow = "";
}

function loadCart() {
    try {
        const saved = localStorage.getItem("aureliaCart");
        if (!saved) return [];
        return JSON.parse(saved) || [];
    } catch (error) {
        return [];
    }
}

function saveCart() {
    try {
        localStorage.setItem("aureliaCart", JSON.stringify(state.cart));
    } catch (error) {
        console.error("Could not save cart:", error);
    }
}

function formatPrice(value) {
    return new Intl.NumberFormat("ka-GE", {
        style: "currency",
        currency: "GEL",
        maximumFractionDigits: 0
    }).format(Number(value) || 0);
}
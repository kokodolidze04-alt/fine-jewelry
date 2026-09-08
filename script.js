"use strict";

// Supabase-ის ინიციალიზაცია
const SUPABASE_URL = "https://yxcexveaqdwmqpmtqsxn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4Y2V4dmVhcWR3bXFwbXRxc3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NTU0NDgsImV4cCI6MjEwNDAzMTQ0OH0.3BOHDlfYwI6Bya7kERUB4wustxo0hzR-y7Vlu7x36b4";

let PRODUCTS = []; // ბაზიდან წამოღებული პროდუქტები აქ ჩაიწერება

const state = {
    cart: loadCart(),
    filter: "All",
    search: "",
    currentProductId: null,
    quantity: 1,
    selectedSize: "7"
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
        if (response.ok) {
            PRODUCTS = await response.json();
            renderProducts();
        } else {
            console.error("პროდუქტების ჩატვირთვა ვერ მოხერხდა");
        }
    } catch (err) {
        console.error("Supabase Error:", err);
    }
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

    DOM.searchButton?.addEventListener("click", openSearch);
    DOM.closeSearch?.addEventListener("click", closeSearch);

    DOM.searchInput?.addEventListener("input", event => {
        state.search = event.target.value.trim().toLowerCase();
        renderProducts();
    });

    DOM.mobileMenuButton?.addEventListener("click", () => {
        DOM.mobileMenu?.classList.toggle("open");
    });

    DOM.mobileMenu?.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            DOM.mobileMenu?.classList.remove("open");
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
        const categoryMatch = state.filter === "All" || product.category === state.filter;
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

    const image = document.createElement("div");
    image.className = "product-image";

    const img = document.createElement("img");
    img.src = product.image;
    img.alt = product.name;
    img.loading = "lazy";

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

    card.addEventListener("click", () => {
        openProductModal(product.id);
    });

    return card;
}

function openProductModal(productId) {
    const product = PRODUCTS.find(item => Number(item.id) === Number(productId));
    if (!product) return;

    state.currentProductId = product.id;
    state.quantity = 1;
    state.selectedSize = "7";

    DOM.modalImage.style.backgroundImage = `url("${product.image}")`;
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
    return PRODUCTS.find(product => Number(product.id) === Number(state.currentProductId)) || null;
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

    const existing = state.cart.find(item => Number(item.productId) === Number(product.id) && item.size === size);

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
    const productId = Number(button.dataset.productId);
    const size = button.dataset.size;

    const index = state.cart.findIndex(item => Number(item.productId) === productId && item.size === size);
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
    setTimeout(() => DOM.searchInput?.focus(), 100);
}

function closeSearch() {
    DOM.searchPanel?.classList.remove("open");
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
    if (state.cart.length === 0) return;

    const submitBtn = DOM.checkoutForm.querySelector("button[type='submit']");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "გადამისამართება BOG-ზე...";
    }

    const formData = new FormData(DOM.checkoutForm);

    const orderPayload = {
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
        total: getCartSubtotal()
    };

    try {
        // 1.5 წამიანი სატესტო დაყოვნება (Bank of Georgia-ს იმიტაცია)
        await new Promise(resolve => setTimeout(resolve, 1500));

        const response = await fetch('/api/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
        });

        const data = await response.json();

        if (data.success) {
            state.cart = [];
            saveCart();
            renderCart();
            DOM.checkoutForm.reset();
            closeCheckout();
            closeCart();
            openSuccess();
        } else {
            alert("გადახდის შეცდომა: " + (data.error || "შეკვეთა ვერ დამუშავდა"));
        }
    } catch (err) {
        console.error("API Error:", err);
        alert("სერვერთან კავშირი ვერ დამყარდა.");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Place order";
        }
    }
}

function openSuccess() {
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
/* ═══════════════════════════════════════════════════════════
   LITTLE DESK — CHECKOUT LOGIC
   Vanilla JavaScript · No dependencies
═══════════════════════════════════════════════════════════ */

'use strict';

// ──────────────────────────────────────────────────────────
// STATE
// ──────────────────────────────────────────────────────────

/**
 * cart: { [productId]: { name, price, qty } }
 */
let cart = {};

/**
 * isSubmitting — guards against duplicate rapid submissions.
 * Set to true the moment Place Order is first triggered; never
 * reset to false once a confirmed order is complete.
 */
let isSubmitting = false;

/**
 * orderPlaced — true once an order has been confirmed.
 * Prevents any further submissions in this session.
 */
let orderPlaced = false;

// ──────────────────────────────────────────────────────────
// DOM REFERENCES
// ──────────────────────────────────────────────────────────
const cartEmpty      = document.getElementById('cart-empty');
const cartList       = document.getElementById('cart-list');
const cartSummary    = document.getElementById('cart-summary');
const cartSubtotalEl = document.getElementById('cart-subtotal');
const orderTotalEl   = document.getElementById('order-total');
const validationMsg  = document.getElementById('validation-message');
const orderConfirm   = document.getElementById('order-confirmation');
const checkoutForm   = document.getElementById('checkout-form');
const customerInput  = document.getElementById('customer-name');
const phoneInput     = document.getElementById('customer-phone');
const addressInput   = document.getElementById('customer-address');
const cityInput      = document.getElementById('customer-city');
const pincodeInput   = document.getElementById('customer-pincode');
const placeOrderBtn  = document.getElementById('place-order-btn');
const confirmName    = document.getElementById('confirmation-name');
const confirmAddress = document.getElementById('confirmation-address');
const confirmTotal   = document.getElementById('confirmation-total');
const orderRefEl     = document.getElementById('order-ref');

// ──────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────

/**
 * Format an integer rupee amount as "₹1,598"
 */
function formatINR(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}

/**
 * Generate a unique order reference.
 * Format: LD-<timestamp5>-<random4>  e.g. LD-26A9F-K3M7
 */
function generateOrderRef() {
  const ts    = Date.now().toString(36).toUpperCase().slice(-5);
  const rand  = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `LD-${ts}-${rand}`;
}

// ──────────────────────────────────────────────────────────
// CART LOGIC
// ──────────────────────────────────────────────────────────

function addToCart(productId, name, price) {
  if (cart[productId]) {
    cart[productId].qty += 1;
  } else {
    cart[productId] = { name, price, qty: 1 };
  }
  renderCart();
}

function incrementQty(productId) {
  if (cart[productId]) {
    cart[productId].qty += 1;
    renderCart();
  }
}

function decrementQty(productId) {
  if (!cart[productId]) return;
  if (cart[productId].qty <= 1) {
    removeFromCart(productId);
  } else {
    cart[productId].qty -= 1;
    renderCart();
  }
}

function removeFromCart(productId) {
  delete cart[productId];
  renderCart();
}

function getOrderTotal() {
  return Object.values(cart).reduce((sum, item) => sum + item.price * item.qty, 0);
}

function isCartEmpty() {
  return Object.keys(cart).length === 0;
}

// ──────────────────────────────────────────────────────────
// RENDER CART
// ──────────────────────────────────────────────────────────

function renderCart() {
  const empty = isCartEmpty();

  // Toggle empty state vs. cart list
  cartEmpty.hidden   = !empty;
  cartList.hidden    = empty;
  cartSummary.hidden = empty;

  if (empty) {
    orderTotalEl.textContent = formatINR(0);
    return;
  }

  // Build cart items
  cartList.innerHTML = '';
  Object.entries(cart).forEach(([productId, item]) => {
    const lineTotal = item.price * item.qty;
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.dataset.testid = `cart-item-${productId}`;

    li.innerHTML = `
      <span class="cart-item-name">${escapeHTML(item.name)}</span>
      <div class="qty-controls" aria-label="Quantity for ${escapeHTML(item.name)}">
        <button
          class="btn btn-qty"
          data-action="decrement"
          data-product="${escapeHTML(productId)}"
          aria-label="Decrease quantity of ${escapeHTML(item.name)}"
          data-testid="decrement-${productId}"
        >−</button>
        <span class="qty-value" data-testid="qty-${productId}" aria-label="Quantity: ${item.qty}">${item.qty}</span>
        <button
          class="btn btn-qty"
          data-action="increment"
          data-product="${escapeHTML(productId)}"
          aria-label="Increase quantity of ${escapeHTML(item.name)}"
          data-testid="increment-${productId}"
        >+</button>
      </div>
      <span
        class="cart-item-line-total"
        data-testid="line-total-${productId}"
        aria-label="${escapeHTML(item.name)} line total: ${formatINR(lineTotal)}"
      >${formatINR(lineTotal)}</span>
      <div class="cart-item-remove-wrap">
        <button
          class="btn-remove"
          data-action="remove"
          data-product="${escapeHTML(productId)}"
          aria-label="Remove ${escapeHTML(item.name)} from cart"
          data-testid="remove-${productId}"
        >Remove</button>
      </div>
    `;

    cartList.appendChild(li);
  });

  // Update total & subtotal
  const total = getOrderTotal();
  if (cartSubtotalEl) {
    cartSubtotalEl.textContent = formatINR(total);
  }
  orderTotalEl.textContent = formatINR(total);
}

/** Minimal HTML escape to prevent XSS from data attributes */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ──────────────────────────────────────────────────────────
// CART EVENT DELEGATION
// ──────────────────────────────────────────────────────────

cartList.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const action    = btn.dataset.action;
  const productId = btn.dataset.product;

  if (action === 'increment') incrementQty(productId);
  if (action === 'decrement') decrementQty(productId);
  if (action === 'remove')    removeFromCart(productId);
});

// ──────────────────────────────────────────────────────────
// ADD-TO-CART BUTTONS
// ──────────────────────────────────────────────────────────

document.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (orderPlaced) {
      resetCheckoutForNewOrder();
    }
    const productId = btn.dataset.product;
    const name      = btn.dataset.name;
    const price     = parseInt(btn.dataset.price, 10);
    addToCart(productId, name, price);
    hideValidation();
  });
});

// ──────────────────────────────────────────────────────────
// VALIDATION DISPLAY
// ──────────────────────────────────────────────────────────

function showValidation(message) {
  validationMsg.textContent = message;
  validationMsg.hidden      = false;
  customerInput.classList.toggle(
    'input-error',
    message.toLowerCase().includes('name')
  );
}

function hideValidation() {
  validationMsg.hidden = true;
  validationMsg.textContent = '';
  customerInput.classList.remove('input-error');
}

// ──────────────────────────────────────────────────────────
// CHECKOUT FORM SUBMISSION
// ──────────────────────────────────────────────────────────

checkoutForm.addEventListener('submit', (e) => {
  e.preventDefault();
  handlePlaceOrder();
});

function handlePlaceOrder() {
  // ── GUARD 1: Already submitted or processing ──────────────
  // This is the primary JavaScript-level protection against
  // double submission — it runs BEFORE any async work.
  if (isSubmitting || orderPlaced) {
    return;
  }

  // ── Gather inputs ─────────────────────────────────────────
  const name = customerInput.value.trim();

  // ── VALIDATION ────────────────────────────────────────────
  if (isCartEmpty()) {
    showValidation('Your cart is empty. Please add at least one product before placing your order.');
    return;
  }

  if (!name) {
    showValidation('Please enter your full name to continue.');
    return;
  }

  // ── All validations passed — lock submission state ────────
  isSubmitting = true;
  placeOrderBtn.disabled = true;
  hideValidation();

  // ── Simulate minimal processing (synchronous but separated
  //    via a microtask so the UI can update the disabled
  //    button state before we proceed) ──────────────────────
  Promise.resolve().then(() => {
    confirmOrder(name, getOrderTotal());
  });
}

function confirmOrder(customerName, total) {
  orderPlaced = true;

  const ref = generateOrderRef();

  // Populate confirmation
  confirmName.textContent  = `Customer: ${customerName}`;
  
  // Format address if provided
  const parts = [];
  if (addressInput && addressInput.value.trim()) parts.push(addressInput.value.trim());
  if (cityInput && cityInput.value.trim()) parts.push(cityInput.value.trim());
  if (pincodeInput && pincodeInput.value.trim()) parts.push(pincodeInput.value.trim());

  if (confirmAddress) {
    if (parts.length > 0) {
      confirmAddress.textContent = `Delivery: ${parts.join(', ')}`;
      confirmAddress.hidden = false;
    } else {
      confirmAddress.hidden = true;
    }
  }

  confirmTotal.textContent = `Order Total: ${formatINR(total)}`;
  orderRefEl.textContent   = ref;

  // Hide form, show confirmation
  checkoutForm.hidden      = true;
  orderConfirm.hidden      = false;

  // Clear cart for a clean post-order state
  cart = {};
  renderCart();
}

function resetCheckoutForNewOrder() {
  orderPlaced = false;
  isSubmitting = false;
  placeOrderBtn.disabled = false;
  orderConfirm.hidden = true;
  checkoutForm.hidden = false;
  customerInput.value = '';
  if (phoneInput) phoneInput.value = '';
  if (addressInput) addressInput.value = '';
  if (cityInput) cityInput.value = '';
  if (pincodeInput) pincodeInput.value = '';
  hideValidation();
}

const orderAgainBtn = document.getElementById('order-again-btn');
if (orderAgainBtn) {
  orderAgainBtn.addEventListener('click', resetCheckoutForNewOrder);
}

// ──────────────────────────────────────────────────────────
// INITIAL RENDER
// ──────────────────────────────────────────────────────────
renderCart();

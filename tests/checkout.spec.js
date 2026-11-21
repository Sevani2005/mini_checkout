// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

// Resolve path to index.html — works on Windows and Unix
const INDEX_URL = 'file:///' + path.join(__dirname, '..', 'index.html').replace(/\\/g, '/');

// ══════════════════════════════════════════════════════════
// TEST 1 — SUCCESSFUL CHECKOUT
// ══════════════════════════════════════════════════════════

test('TC-01: Successful checkout produces one confirmation with an order reference', async ({ page }) => {
  // 1. Open a clean page
  await page.goto(INDEX_URL);

  // 2. Verify exactly two product cards are displayed
  const productCards = page.locator('[data-testid="product-card"]');
  await expect(productCards).toHaveCount(2);

  // 3. Add Minimal Desk Lamp to cart
  await page.getByTestId('add-lamp').click();

  // 4. Enter a valid customer name
  await page.getByTestId('customer-name').fill('Priya Mehta');

  // 5. Click Place Order
  await page.getByTestId('place-order-btn').click();

  // 6. Verify success confirmation is visible
  const confirmation = page.getByTestId('order-confirmation');
  await expect(confirmation).toBeVisible();

  // 7. Verify an order reference is visible and non-empty
  const orderRef = page.getByTestId('order-ref');
  await expect(orderRef).toBeVisible();
  const refText = await orderRef.textContent();
  expect(refText?.trim().length).toBeGreaterThan(0);
  // Reference must follow our LD-XXXXX-XXXX format
  expect(refText?.trim()).toMatch(/^LD-[A-Z0-9]+-[A-Z0-9]+$/);

  // 8. Verify the confirmation appears exactly once
  await expect(confirmation).toHaveCount(1);

  // 9. Verify the checkout form is hidden (no double-submit possible)
  await expect(page.getByTestId('checkout-form')).toBeHidden();
});

// ══════════════════════════════════════════════════════════
// TEST 2 — MISSING REQUIRED FIELD
// ══════════════════════════════════════════════════════════

test('TC-02: Missing customer name blocks checkout and preserves cart', async ({ page }) => {
  // 1. Start from a clean page
  await page.goto(INDEX_URL);

  // 2. Add Daily Planner to cart
  await page.getByTestId('add-planner').click();

  // 3. Leave customer name empty (do not type anything)
  // Confirm the input is indeed blank
  await expect(page.getByTestId('customer-name')).toHaveValue('');

  // 4. Click Place Order
  await page.getByTestId('place-order-btn').click();

  // 5. Verify validation message appears
  const validationMsg = page.getByTestId('validation-message');
  await expect(validationMsg).toBeVisible();
  await expect(validationMsg).not.toHaveText('');

  // 6. Verify success confirmation is NOT visible
  await expect(page.getByTestId('order-confirmation')).toBeHidden();

  // 7. Verify cart item is preserved — planner still in cart
  await expect(page.getByTestId('cart-item-planner')).toBeVisible();

  // 8. Verify the checkout form is still visible (name field not cleared)
  await expect(page.getByTestId('checkout-form')).toBeVisible();
  await expect(page.getByTestId('customer-name')).toHaveValue('');
});

// ══════════════════════════════════════════════════════════
// TEST 3 — QUANTITY CHANGE UPDATES EXACT TOTALS
// ══════════════════════════════════════════════════════════

test('TC-03: Quantity change produces exact line totals and order total', async ({ page }) => {
  // 1. Start from a clean page
  await page.goto(INDEX_URL);

  // 2. Add Minimal Desk Lamp (₹799 × 1)
  await page.getByTestId('add-lamp').click();

  // 3. Add Daily Planner (₹249 × 1)
  await page.getByTestId('add-planner').click();

  // 4. Increase Minimal Desk Lamp quantity to 2 (click + once)
  await page.getByTestId('increment-lamp').click();

  // 5. Assert lamp quantity is now 2
  await expect(page.getByTestId('qty-lamp')).toHaveText('2');

  // 6. Assert lamp line total: ₹799 × 2 = ₹1,598
  await expect(page.getByTestId('line-total-lamp')).toHaveText('₹1,598');

  // 7. Assert planner line total: ₹249 × 1 = ₹249
  await expect(page.getByTestId('line-total-planner')).toHaveText('₹249');

  // 8. Assert final order total: ₹1,598 + ₹249 = ₹1,847
  await expect(page.getByTestId('order-total')).toHaveText('₹1,847');
});

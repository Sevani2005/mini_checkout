// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const INDEX_URL = 'file:///' + path.join(__dirname, '..', 'index.html').replace(/\\/g, '/');

// ══════════════════════════════════════════════════════════
// MANUAL TEST A — EMPTY CART BLOCKS CHECKOUT
// ══════════════════════════════════════════════════════════

test('TC-04 Manual: Empty cart blocks checkout and shows validation message', async ({ page }) => {
  // 1. Open fresh page
  await page.goto(INDEX_URL);

  // 2. Do NOT add any products — cart is empty
  // Verify cart shows empty state
  await expect(page.getByTestId('cart-empty')).toBeVisible();

  // 3. Enter a customer name
  await page.getByTestId('customer-name').fill('Test User');

  // 4. Click Place Order
  await page.getByTestId('place-order-btn').click();

  // 5. Verify validation message appears with empty-cart text
  const validationMsg = page.getByTestId('validation-message');
  await expect(validationMsg).toBeVisible();
  const msgText = await validationMsg.textContent();
  console.log(`[TC-04] Validation message: "${msgText}"`);
  expect(msgText).toContain('cart is empty');

  // 6. Verify success confirmation is NOT visible
  await expect(page.getByTestId('order-confirmation')).toBeHidden();

  // 7. Verify customer name is preserved
  await expect(page.getByTestId('customer-name')).toHaveValue('Test User');

  // 8. Take screenshot as evidence
  await page.screenshot({ path: 'test-results/manual-test-a-empty-cart.png', fullPage: true });
  console.log('[TC-04] Screenshot saved: test-results/manual-test-a-empty-cart.png');
});

// ══════════════════════════════════════════════════════════
// MANUAL TEST B — RAPID DOUBLE CLICK PREVENTION
// ══════════════════════════════════════════════════════════

test('TC-05 Manual: Rapid double-click produces only one confirmation', async ({ page }) => {
  // 1. Open fresh page
  await page.goto(INDEX_URL);

  // 2. Add Daily Planner to cart
  await page.getByTestId('add-planner').click();

  // 3. Enter customer name
  await page.getByTestId('customer-name').fill('Quick Click');

  // 4. Rapidly click Place Order twice using JavaScript dispatch for true rapid-fire
  await page.getByTestId('place-order-btn').evaluate((btn) => {
    btn.click();
    btn.click();
  });

  // Allow microtask (Promise.resolve in confirmOrder) to settle
  await page.waitForFunction(() => {
    const conf = document.getElementById('order-confirmation');
    return conf && !conf.hidden;
  });

  // 5. Count confirmation elements visible on page
  const confirmations = page.getByTestId('order-confirmation');
  await expect(confirmations).toBeVisible();
  const confirmCount = await confirmations.count();
  console.log(`[TC-05] Confirmation elements visible: ${confirmCount}`);
  expect(confirmCount).toBe(1);

  // 6. Verify exactly one order reference
  const orderRef = page.getByTestId('order-ref');
  const refText = await orderRef.textContent();
  console.log(`[TC-05] Order reference: "${refText}"`);
  expect(refText?.trim().length).toBeGreaterThan(0);
  expect(refText?.trim()).toMatch(/^LD-[A-Z0-9]+-[A-Z0-9]+$/);

  // 7. Verify checkout form is hidden (no second submission possible)
  await expect(page.getByTestId('checkout-form')).toBeHidden();

  // 8. Take screenshot as evidence
  await page.screenshot({ path: 'test-results/manual-test-b-double-click.png', fullPage: true });
  console.log('[TC-05] Screenshot saved: test-results/manual-test-b-double-click.png');
});

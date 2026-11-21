# TEST PLAN — Little Desk Mini Checkout

**Project:** Little Desk – Mini Checkout and Browser Test Suite  
**Author:** SDET Intern Assignment  
**Date:** November 2026  
**Version:** 1.0  

---

## 1. Project Objective

Verify that the Little Desk checkout page correctly handles the full customer journey: browsing two products, managing a cart, entering required details, placing an order, and receiving a unique confirmation. Special focus is placed on preventing incorrect totals, duplicate orders, and silent failures on empty or invalid inputs.

---

## 2. Testing Scope

### In Scope
- Product display (exactly two products, correct prices)
- Cart: add, increment, decrement, remove
- Line total and order total calculations
- Form validation (empty cart, blank name)
- Successful order confirmation (name, total, reference)
- Duplicate-order prevention (rapid double-click)
- UI state preservation on validation failure

### Out of Scope
- Payment processing (no real payments)
- Backend or database (none exists)
- Authentication or user accounts
- Mobile-specific gesture testing
- Cross-browser testing beyond Chromium (automated)

---

## 3. Test Environment

| Item | Detail |
|---|---|
| Application | `index.html` opened as a local file |
| Browser (automated) | Chromium via Playwright |
| Browser (manual) | Chrome or Edge (desktop) |
| Test framework | Playwright v1.49+ |
| Node.js | v18+ |
| OS | Windows |
| External services | None |

---

## 4. Risk Priority

The following risks are ranked by impact on the customer and business:

| Priority | Risk | Why It Matters |
|---|---|---|
| P1 | **Incorrect order total** | Customer over- or under-charged — financial trust broken |
| P2 | **Duplicate order submission** | Two orders created on one click — fulfilment confusion |
| P3 | **Checkout with empty cart** | Meaningless order placed — data integrity issue |
| P4 | **Checkout with blank name** | Order cannot be identified or fulfilled |
| P5 | **Cart quantity and removal** | Wrong quantities lead to wrong totals and stock issues |
| P6 | **Missing or wrong confirmation** | Customer has no proof of order |

---

## 5. Test Cases

---

### TC-01 — Successful Checkout (Automated)

**Type:** Automated (Playwright)  
**Priority:** P6 / P2 (confirmation + duplicate)

**Precondition:** Clean page, no prior state.

| # | Step | Expected Result |
|---|---|---|
| 1 | Open `index.html` | Page loads, two product cards visible |
| 2 | Count product cards | Exactly 2 cards |
| 3 | Click "Add to Cart" on Minimal Desk Lamp | Lamp appears in cart |
| 4 | Enter name "Priya Mehta" | Name field populated |
| 5 | Click "Place Order" | Order processed |
| 6 | Check for confirmation | `#order-confirmation` is visible |
| 7 | Check order reference | Reference text matches `LD-XXXXX-XXXX` pattern, non-empty |
| 8 | Check confirmation count | Exactly one confirmation element visible |
| 9 | Check form state | Checkout form is hidden (prevents resubmission) |

**Expected:** Pass with one confirmation and one reference.

---

### TC-02 — Missing Customer Name Blocks Checkout (Automated)

**Type:** Automated (Playwright)  
**Priority:** P4

**Precondition:** Clean page.

| # | Step | Expected Result |
|---|---|---|
| 1 | Open `index.html` | Page loads |
| 2 | Add Daily Planner | Planner in cart |
| 3 | Leave name field empty | Input value is `""` |
| 4 | Click "Place Order" | Submission attempted |
| 5 | Check validation message | `#validation-message` visible and non-empty |
| 6 | Check confirmation | `#order-confirmation` NOT visible |
| 7 | Check cart preserved | Planner cart item still visible |
| 8 | Check form still visible | `#checkout-form` still rendered |

**Expected:** Checkout blocked, cart and form preserved.

---

### TC-03 — Quantity Change Updates Exact Totals (Automated)

**Type:** Automated (Playwright)  
**Priority:** P1 (highest — financial correctness)

**Precondition:** Clean page.

| # | Step | Expected Result |
|---|---|---|
| 1 | Open `index.html` | Page loads |
| 2 | Add Minimal Desk Lamp | Lamp in cart (qty 1) |
| 3 | Add Daily Planner | Planner in cart (qty 1) |
| 4 | Click increment (+) on lamp | Lamp qty shows 2 |
| 5 | Assert lamp line total | Exactly `₹1,598` |
| 6 | Assert planner line total | Exactly `₹249` |
| 7 | Assert order total | Exactly `₹1,847` |

**Calculations:**  
- Lamp: ₹799 × 2 = ₹1,598  
- Planner: ₹249 × 1 = ₹249  
- Total: ₹1,598 + ₹249 = ₹1,847

**Expected:** All three amounts match exactly.

---

### TC-04 — Empty Cart Blocks Checkout (Manual Test A)

**Type:** Manual  
**Priority:** P3

**Precondition:** Clean page, nothing added to cart.

| # | Step | Expected Result |
|---|---|---|
| 1 | Open `index.html` | Page loads, cart shows empty state |
| 2 | Enter name "Test User" | Name field filled |
| 3 | Click "Place Order" | Validation triggered |
| 4 | Observe result | Validation message visible, no confirmation |
| 5 | Check cart state | Still empty |

**Expected:** "Your cart is empty" or similar message. No order placed.

---

### TC-05 — Rapid Double Click Prevention (Manual Test B)

**Type:** Manual  
**Priority:** P2 (critical — duplicate order risk)

**Precondition:** Clean page.

| # | Step | Expected Result |
|---|---|---|
| 1 | Open `index.html` | Page loads |
| 2 | Add Daily Planner | Planner in cart |
| 3 | Enter name "Quick Click" | Name filled |
| 4 | Rapidly click "Place Order" twice | First click processes order |
| 5 | Observe result | Exactly ONE confirmation, ONE reference |
| 6 | Check for second confirmation | No second confirmation appears |

**Expected:** Only one order confirmed regardless of click speed.

---

### TC-06 — Decrement to Zero Removes Item (Edge Case)

**Type:** Manual / observation  
**Priority:** P5

| # | Step | Expected Result |
|---|---|---|
| 1 | Add Daily Planner (qty 1) | Planner in cart |
| 2 | Click decrement (−) | Item removed from cart |
| 3 | Observe cart | Cart shows empty state |

---

### TC-07 — Add Same Product Twice Increments Quantity

**Type:** Manual / observation  
**Priority:** P5

| # | Step | Expected Result |
|---|---|---|
| 1 | Add Minimal Desk Lamp | Qty = 1 |
| 2 | Add Minimal Desk Lamp again | Qty = 2 (not two rows) |
| 3 | Check line total | ₹799 × 2 = ₹1,598 |

---

## 6. Pass / Fail Criteria

| Test ID | Result |
|---|---|
| TC-01 | Recorded in TEST_RESULTS.md |
| TC-02 | Recorded in TEST_RESULTS.md |
| TC-03 | Recorded in TEST_RESULTS.md |
| TC-04 | Recorded in TEST_RESULTS.md |
| TC-05 | Recorded in TEST_RESULTS.md |
| TC-06 | Recorded in TEST_RESULTS.md |
| TC-07 | Recorded in TEST_RESULTS.md |

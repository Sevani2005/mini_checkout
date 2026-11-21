# Little Desk — Mini Checkout and Browser Test Suite

> **SDET Intern Assignment** | Vanilla JS · Playwright · No backend

---

## Project Overview

**Little Desk** is a small, realistic online stationery and workspace-essentials store built as a single HTML page. It demonstrates frontend checkout logic, cart calculations, form validation, duplicate-order prevention, and three automated browser tests written with Playwright.

No backend, database, payment gateway, or external API is used. Everything runs in the browser.

---

## Features

| Feature | Detail |
|---|---|
| **Two products** | Minimal Desk Lamp ₹799 · Daily Planner ₹249 |
| **Cart management** | Add, increase qty, decrease qty, remove |
| **Live totals** | Line total and order total update instantly |
| **Form validation** | Blocks checkout on empty cart or blank name |
| **Duplicate prevention** | JS state flag + disabled button — one order max |
| **Confirmation screen** | Shows name, total, and unique order reference |
| **Responsive** | Desktop and mobile layouts |
| **Accessible** | ARIA labels, roles, focus styles, live regions |
| **Playwright tests** | 3 automated checks in Chromium |

---

## Technology Stack

- **HTML5** — page structure and semantic markup  
- **CSS3** — custom design system (no frameworks)  
- **Vanilla JavaScript** — all logic, no libraries  
- **Playwright** — browser automation and assertions  
- **Node.js / npm** — test runner only (not used by the app itself)

---

## Folder Structure

```
mini_checkout/
│
├── index.html          ← Single-page checkout application
├── style.css           ← All styles (tokens, layout, components)
├── script.js           ← Cart logic, validation, checkout, duplicate guard
├── playwright.config.js← Playwright configuration
├── package.json        ← npm metadata and test scripts
│
├── README.md           ← This file
├── TEST_PLAN.md        ← Test plan with risk priorities
├── TEST_RESULTS.md     ← Automated + manual test results
│
└── tests/
    └── checkout.spec.js ← Three Playwright test cases
```

---

## Installation

### Prerequisites

- **Node.js** v18 or later — download from [nodejs.org](https://nodejs.org)
- **npm** (comes with Node.js)

Check your versions:
```
node --version
npm --version
```

### 1 — Install dependencies

Open a terminal, navigate to the project folder, and run:

```
npm install
```

This installs the `@playwright/test` package.

### 2 — Install Playwright browsers

```
npx playwright install chromium
```

This downloads the Chromium browser that Playwright controls.

---

## Running the Application

The app is a plain HTML file — **no server is needed**.

Open `index.html` directly in your browser:

- **Windows:** Double-click `index.html` in File Explorer, or drag it into Chrome/Edge/Firefox.
- **Command line:** `start index.html` (Windows) or `open index.html` (macOS)

---

## Running Automated Tests

Make sure you have completed the Installation steps first.

### Run all three tests (headless — no browser window)

```
npm test
```

### Run with a visible browser window

```
npm run test:headed
```

### View the HTML report

After running tests, open the report:

```
npm run test:report
```

This opens an interactive HTML report in your browser showing pass/fail, screenshots on failure, and step details.

---

## Manual Tests

Two scenarios require manual verification. See [TEST_PLAN.md](TEST_PLAN.md) for full steps.

### Manual Test A — Empty Cart

1. Open `index.html` in your browser.
2. Do **not** add any products.
3. Enter your name in the checkout form.
4. Click **Place Order**.
5. **Expected:** A red validation message appears. No confirmation shown.

### Manual Test B — Rapid Double Click

1. Open `index.html` in your browser.
2. Add any product.
3. Enter your name.
4. Click **Place Order** very quickly two or more times in a row.
5. **Expected:** Only **one** confirmation screen and **one** order reference appear.

---

## Test Scenarios and Expected Calculations

### Totals Verification (TC-03)

| Product | Unit Price | Qty | Line Total |
|---|---|---|---|
| Minimal Desk Lamp | ₹799 | 2 | ₹1,598 |
| Daily Planner | ₹249 | 1 | ₹249 |
| **Order Total** | | | **₹1,847** |

Formula:  
`Line Total = Unit Price × Quantity`  
`Order Total = Sum of all Line Totals`

---

## Playwright Configuration

- **Browser:** Chromium (desktop)
- **Mode:** Headless by default
- **Isolation:** Each test opens a fresh page via `page.goto()`
- **Report:** HTML report in `playwright-report/`
- **Waits:** Locator-based assertions only — no `waitForTimeout`

---

## Notes for Evaluators

- All prices are fixed integers in INR.
- Order references use the format `LD-XXXXX-XXXX` (timestamp + random).
- The duplicate-order guard uses two JavaScript flags (`isSubmitting`, `orderPlaced`) — not CSS alone.
- No console errors occur during normal operation.
- No external resources are loaded (fonts, CDNs, APIs).

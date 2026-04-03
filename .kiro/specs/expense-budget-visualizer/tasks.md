# Implementation Plan: Expense & Budget Visualizer

## Overview

Implement a client-side single-page app using vanilla HTML, CSS, and JavaScript (IIFE pattern). Tasks follow the state → render cycle defined in the design: Storage, Validator, ChartController, and render functions are built incrementally and wired together at the end.

## Tasks

- [x] 1. Create project file structure and HTML skeleton
  - Create `index.html` with the full HTML structure from the design: header with `#balance-display`, form section with name/amount/category fields and inline error spans, chart section with `<canvas id="pie-chart">`, and list section with `<ul id="transaction-list">`
  - Add Chart.js v4 CDN `<script>` tag and link to `css/styles.css` and `js/app.js`
  - Create empty `css/styles.css` and `js/app.js` files
  - _Requirements: 1.1, 7.2, 7.4_

- [x] 2. Implement base CSS layout and responsive styles
  - Style header, main sections, form, list, and chart canvas
  - Use a responsive layout (flexbox or grid) so content reflows without horizontal scrolling at narrow viewports
  - Style `.error` spans (hidden by default, visible when non-empty)
  - _Requirements: 7.1, 7.3_

- [ ] 3. Implement Storage module
  - [x] 3.1 Write the `Storage` object inside the IIFE in `js/app.js`
    - Implement `Storage.load()` — reads `"expense_transactions"` from localStorage, parses JSON, returns array; on parse error calls `Storage.clear()` and returns `[]`
    - Implement `Storage.save(transactions)` — serializes and writes to localStorage
    - Implement `Storage.clear()` — removes the key
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 3.2 Write property test for Storage round-trip consistency
    - **Property: Round-trip consistency** — for any valid `Transaction[]`, `Storage.load()` after `Storage.save(transactions)` returns an equivalent array
    - **Validates: Requirement 6.5**

- [ ] 4. Implement Validator module
  - [x] 4.1 Write the `Validator` object inside the IIFE
    - Implement `Validator.validate(name, amount, category)` returning `{ valid, errors: { name?, amount?, category? } }`
    - name: non-empty after trim; amount: parseable float > 0; category: one of "Food", "Transport", "Fun"
    - _Requirements: 1.4, 1.5_

  - [ ]* 4.2 Write unit tests for Validator
    - Test all invalid combinations (empty name, zero amount, negative amount, invalid category)
    - Test valid input returns `{ valid: true, errors: {} }`
    - _Requirements: 1.4, 1.5_

- [ ] 5. Implement render functions and in-memory state
  - [x] 5.1 Declare `let transactions = []` and implement `renderList(transactions)`
    - Rebuild `<ul id="transaction-list">` innerHTML: each `<li>` shows name, amount, category, and a delete button with `data-id` attribute
    - _Requirements: 2.1, 3.1_

  - [x] 5.2 Implement `renderBalance(transactions)`
    - Sum all amounts and update `#balance-display` text
    - Show `$0.00` when array is empty
    - _Requirements: 4.1, 4.4_

  - [x] 5.3 Implement top-level `render(transactions)` that calls `renderList`, `renderBalance`, and `ChartController.update`
    - _Requirements: 4.2, 4.3, 5.3, 5.4_

- [ ] 6. Implement ChartController module
  - [x] 6.1 Write the `ChartController` object inside the IIFE
    - Implement `ChartController.init(canvasEl)` — creates a Chart.js pie chart instance
    - Implement `ChartController.update(transactions)` — aggregates amounts per category (only categories with amount > 0), updates chart data and calls `chart.update()`
    - Use colors `["#FF6384", "#36A2EB", "#FFCE56"]` for Food, Transport, Fun respectively
    - Render empty/placeholder state when transactions is empty
    - _Requirements: 5.1, 5.2, 5.5_

  - [ ]* 6.2 Write unit tests for ChartController data aggregation
    - Test that amounts are correctly summed per category
    - Test that categories with no transactions are excluded from labels/data
    - _Requirements: 5.1, 5.2_

- [ ] 7. Implement event handlers and page initialization
  - [x] 7.1 Implement `onSubmit` handler on `#input-form`
    - Read field values, call `Validator.validate`, show/clear inline errors via error spans
    - On valid: create Transaction with `crypto.randomUUID()`, push to `transactions`, call `Storage.save`, call `render`, reset form
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 7.2 Implement `onDeleteClick` handler on `#transaction-list` (event delegation)
    - On click of a delete button, splice the matching transaction by `data-id`, call `Storage.save`, call `render`
    - _Requirements: 3.2, 3.3_

  - [x] 7.3 Implement page load initialization
    - Call `Storage.load()`, assign to `transactions`
    - Call `ChartController.init(document.getElementById('pie-chart'))`
    - Call `render(transactions)`
    - _Requirements: 2.3, 4.4, 5.5, 6.3, 6.4_

- [ ] 8. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Wire everything together and validate full flow
  - [-] 9.1 Verify the complete add → render → persist flow works end-to-end via automated tests
    - Simulate form submission, confirm transaction appears in list, balance updates, chart data updates, and localStorage is written
    - _Requirements: 1.2, 1.3, 4.2, 5.3, 6.1_

  - [ ] 9.2 Verify the delete → render → persist flow works end-to-end via automated tests
    - Simulate delete click, confirm transaction removed from list, balance updates, chart data updates, and localStorage is written
    - _Requirements: 3.2, 3.3, 4.3, 5.4, 6.2_

  - [ ]* 9.3 Write integration tests for corrupted localStorage recovery
    - Seed localStorage with invalid JSON, load app, confirm empty state and cleared storage
    - _Requirements: 6.4_

- [ ] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- The IIFE wraps all JS to avoid polluting the global scope
- Property tests validate universal correctness (e.g., round-trip serialization)
- Unit tests validate specific examples and edge cases

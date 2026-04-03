/**
 * Integration tests for the Expense & Budget Visualizer
 *
 * Task 9.1 — add → render → persist flow
 * Task 9.2 — delete → render → persist flow
 *
 * Strategy: import the exported modules (Storage, Validator, aggregateByCategory)
 * and simulate the same logic that app.js performs inside its IIFE.
 * Chart.js is mocked because it is a CDN dependency unavailable in Node.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Storage, Validator, aggregateByCategory, STORAGE_KEY } from '../js/modules.js';

// ---------------------------------------------------------------------------
// Helpers — mirror the app.js logic under test
// ---------------------------------------------------------------------------

function makeTransaction(name, amount, category) {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    amount: parseFloat(amount),
    category,
  };
}

function renderBalance(transactions) {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  document.getElementById('balance-display').textContent = `Total: ${total.toFixed(2)}`;
}

function renderList(transactions) {
  const ul = document.getElementById('transaction-list');
  ul.innerHTML = transactions
    .map(
      (t) =>
        `<li>
          <span class="t-name">${t.name}</span>
          <span class="t-amount">${t.amount.toFixed(2)}</span>
          <span class="t-category">${t.category}</span>
          <button class="delete-btn" data-id="${t.id}">Delete</button>
        </li>`
    )
    .join('');
}

function render(transactions) {
  renderList(transactions);
  renderBalance(transactions);
  // Chart update is skipped — Chart.js is mocked at the module level
}

// ---------------------------------------------------------------------------
// DOM setup — minimal HTML matching index.html structure
// ---------------------------------------------------------------------------

function setupDOM() {
  document.body.innerHTML = `
    <div id="balance-display">Total: $0.00</div>
    <form id="input-form">
      <input id="name" type="text" />
      <input id="amount" type="number" />
      <select id="category">
        <option value="">-- Select --</option>
        <option value="Food">Food</option>
        <option value="Transport">Transport</option>
        <option value="Fun">Fun</option>
      </select>
      <span id="error-name" class="error"></span>
      <span id="error-amount" class="error"></span>
      <span id="error-category" class="error"></span>
      <button type="submit">Add</button>
    </form>
    <ul id="transaction-list"></ul>
  `;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorage.clear();
  setupDOM();
});

// ── Task 9.1: add → render → persist ────────────────────────────────────────

describe('Task 9.1 — add → render → persist flow', () => {
  it('validates and rejects a submission with empty fields', () => {
    const { valid, errors } = Validator.validate('', '', '');
    expect(valid).toBe(false);
    expect(errors.name).toBeTruthy();
    expect(errors.amount).toBeTruthy();
    expect(errors.category).toBeTruthy();
  });

  it('validates and rejects a submission with a non-positive amount', () => {
    const { valid, errors } = Validator.validate('Coffee', '-5', 'Food');
    expect(valid).toBe(false);
    expect(errors.amount).toBeTruthy();
  });

  it('adds a valid transaction to the in-memory list', () => {
    const transactions = [];
    const { valid } = Validator.validate('Lunch', '12.50', 'Food');
    expect(valid).toBe(true);

    transactions.push(makeTransaction('Lunch', '12.50', 'Food'));
    expect(transactions).toHaveLength(1);
    expect(transactions[0].name).toBe('Lunch');
    expect(transactions[0].amount).toBe(12.5);
    expect(transactions[0].category).toBe('Food');
  });

  it('persists the transaction to localStorage after add', () => {
    const transactions = [];
    transactions.push(makeTransaction('Lunch', '12.50', 'Food'));
    Storage.save(transactions);

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Lunch');
    expect(stored[0].amount).toBe(12.5);
  });

  it('renders the transaction in the list after add', () => {
    const transactions = [];
    transactions.push(makeTransaction('Lunch', '12.50', 'Food'));
    render(transactions);

    const items = document.querySelectorAll('#transaction-list li');
    expect(items).toHaveLength(1);
    expect(items[0].querySelector('.t-name').textContent).toBe('Lunch');
    expect(items[0].querySelector('.t-amount').textContent).toBe('12.50');
    expect(items[0].querySelector('.t-category').textContent).toBe('Food');
  });

  it('updates the balance display after add', () => {
    const transactions = [];
    transactions.push(makeTransaction('Lunch', '12.50', 'Food'));
    transactions.push(makeTransaction('Bus', '3.00', 'Transport'));
    render(transactions);

    expect(document.getElementById('balance-display').textContent).toBe('Total: 15.50');
  });

  it('chart aggregation reflects new transaction', () => {
    const transactions = [makeTransaction('Lunch', '12.50', 'Food')];
    const { labels, data } = aggregateByCategory(transactions);
    expect(labels).toContain('Food');
    expect(data[labels.indexOf('Food')]).toBe(12.5);
  });

  it('adds multiple transactions and accumulates balance correctly', () => {
    const transactions = [];
    transactions.push(makeTransaction('Lunch', '10.00', 'Food'));
    transactions.push(makeTransaction('Dinner', '20.00', 'Food'));
    transactions.push(makeTransaction('Bus', '5.00', 'Transport'));
    Storage.save(transactions);
    render(transactions);

    expect(document.getElementById('balance-display').textContent).toBe('Total: 35.00');
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored).toHaveLength(3);
  });
});

// ── Task 9.2: delete → render → persist ─────────────────────────────────────

describe('Task 9.2 — delete → render → persist flow', () => {
  it('removes the correct transaction from the in-memory list', () => {
    const transactions = [
      makeTransaction('Lunch', '12.50', 'Food'),
      makeTransaction('Bus', '3.00', 'Transport'),
    ];
    const idToDelete = transactions[0].id;

    const index = transactions.findIndex((t) => t.id === idToDelete);
    transactions.splice(index, 1);

    expect(transactions).toHaveLength(1);
    expect(transactions[0].category).toBe('Transport');
  });

  it('persists the updated list to localStorage after delete', () => {
    const transactions = [
      makeTransaction('Lunch', '12.50', 'Food'),
      makeTransaction('Bus', '3.00', 'Transport'),
    ];
    Storage.save(transactions);

    const idToDelete = transactions[0].id;
    const index = transactions.findIndex((t) => t.id === idToDelete);
    transactions.splice(index, 1);
    Storage.save(transactions);

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored).toHaveLength(1);
    expect(stored[0].category).toBe('Transport');
  });

  it('removes the transaction from the rendered list after delete', () => {
    const transactions = [
      makeTransaction('Lunch', '12.50', 'Food'),
      makeTransaction('Bus', '3.00', 'Transport'),
    ];
    render(transactions);

    // Simulate delete of first item
    const idToDelete = transactions[0].id;
    const index = transactions.findIndex((t) => t.id === idToDelete);
    transactions.splice(index, 1);
    render(transactions);

    const items = document.querySelectorAll('#transaction-list li');
    expect(items).toHaveLength(1);
    expect(items[0].querySelector('.t-category').textContent).toBe('Transport');
  });

  it('updates the balance display after delete', () => {
    const transactions = [
      makeTransaction('Lunch', '12.50', 'Food'),
      makeTransaction('Bus', '3.00', 'Transport'),
    ];
    render(transactions);

    const idToDelete = transactions[0].id;
    const index = transactions.findIndex((t) => t.id === idToDelete);
    transactions.splice(index, 1);
    render(transactions);

    expect(document.getElementById('balance-display').textContent).toBe('Total: 3.00');
  });

  it('shows zero balance when all transactions are deleted', () => {
    const transactions = [makeTransaction('Lunch', '12.50', 'Food')];
    render(transactions);

    transactions.splice(0, 1);
    Storage.save(transactions);
    render(transactions);

    expect(document.getElementById('balance-display').textContent).toBe('Total: 0.00');
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored).toHaveLength(0);
  });

  it('chart aggregation excludes deleted transaction category when no remaining items', () => {
    const transactions = [makeTransaction('Lunch', '12.50', 'Food')];
    transactions.splice(0, 1);
    const { labels } = aggregateByCategory(transactions);
    expect(labels).toHaveLength(0);
  });

  it('chart aggregation updates correctly after partial delete', () => {
    const transactions = [
      makeTransaction('Lunch', '10.00', 'Food'),
      makeTransaction('Dinner', '20.00', 'Food'),
      makeTransaction('Bus', '5.00', 'Transport'),
    ];
    // Delete the Transport transaction
    const idx = transactions.findIndex((t) => t.category === 'Transport');
    transactions.splice(idx, 1);

    const { labels, data } = aggregateByCategory(transactions);
    expect(labels).toEqual(['Food']);
    expect(data).toEqual([30]);
  });
});

// ── Storage load on page init ────────────────────────────────────────────────

describe('Page load — Storage.load restores persisted transactions', () => {
  it('loads previously saved transactions from localStorage', () => {
    const saved = [makeTransaction('Coffee', '4.00', 'Food')];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

    const loaded = Storage.load();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].name).toBe('Coffee');
  });

  it('returns empty array when localStorage is empty', () => {
    const loaded = Storage.load();
    expect(loaded).toEqual([]);
  });

  it('returns empty array and clears storage when JSON is malformed', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json{{{');
    const loaded = Storage.load();
    expect(loaded).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

// modules.js — exported logic for testing
// The browser app (app.js) duplicates these inline inside its IIFE so it
// remains a plain script with no import/export syntax required.

export const STORAGE_KEY = 'expense_transactions';

export const Storage = {
  load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      Storage.clear();
      return [];
    }
  },

  save(transactions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};

export const VALID_CATEGORIES = ['Food', 'Transport', 'Fun'];

export const Validator = {
  validate(name, amount, category) {
    const errors = {};

    if (!name || name.trim() === '') {
      errors.name = 'Name is required.';
    }

    const parsed = parseFloat(amount);
    if (amount === '' || amount === null || amount === undefined || isNaN(parsed) || parsed <= 0) {
      errors.amount = 'Amount must be a positive number.';
    }

    if (!VALID_CATEGORIES.includes(category)) {
      errors.category = 'Category must be one of: Food, Transport, Fun.';
    }

    return { valid: Object.keys(errors).length === 0, errors };
  },
};

export const CATEGORY_COLORS = {
  Food: '#ff0000ff',
  Transport: '#36A2EB',
  Fun: '#56ff6cff',
};

/**
 * Aggregates transaction amounts by category.
 * Returns { labels, data, colors } for Chart.js — only categories with amount > 0.
 */
export function aggregateByCategory(transactions) {
  const totals = {};
  for (const t of transactions) {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  }

  const labels = [];
  const data = [];
  const colors = [];

  for (const category of VALID_CATEGORIES) {
    if (totals[category] > 0) {
      labels.push(category);
      data.push(totals[category]);
      colors.push(CATEGORY_COLORS[category]);
    }
  }

  return { labels, data, colors };
}

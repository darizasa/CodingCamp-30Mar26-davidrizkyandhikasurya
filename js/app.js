// app.js
(function () {
  'use strict';

  const STORAGE_KEY = 'expense_transactions';

  const Storage = {
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

  const VALID_CATEGORIES = ['Food', 'Transport', 'Fun'];

  const Validator = {
    validate(name, amount, category) {
      const errors = {};

      if (!name || name.trim() === '') {
        errors.name = 'Name is required.';
      }

      const parsed = parseFloat(amount);
      if (!amount || isNaN(parsed) || parsed <= 0) {
        errors.amount = 'Amount must be a positive number.';
      }

      if (!VALID_CATEGORIES.includes(category)) {
        errors.category = 'Category must be one of: Food, Transport, Fun.';
      }

      return { valid: Object.keys(errors).length === 0, errors };
    },
  };

  let transactions = [];
  let currentSort = 'none';
  const EXPENSE_LIMIT = 100;

  function sortTransactions(data) {
    if (currentSort === 'amount') {
      return [...data].sort((a, b) => b.amount - a.amount);
    }

    if (currentSort === 'category') {
      return [...data].sort((a, b) => a.category.localeCompare(b.category));
    }

    return data;
  }

  const CATEGORY_COLORS = {
    Food: '#ff0000ff',
    Transport: '#36A2EB',
    Fun: '#56ff6cff',
  };

  const ChartController = {
    chart: null,

    init(canvasEl) {
      this.chart = new Chart(canvasEl, {
        type: 'pie',
        data: {
          labels: [],
          datasets: [{ data: [], backgroundColor: [] }],
        },
        options: { responsive: true },
      });
    },

    update(transactions) {
      if (!this.chart) return;

      if (transactions.length === 0) {
        this.chart.data.labels = [];
        this.chart.data.datasets[0].data = [];
        this.chart.update();
        return;
      }

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

      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = data;
      this.chart.data.datasets[0].backgroundColor = colors;
      this.chart.update();
    },
  };

  function renderBalance(transactions) {
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    document.getElementById('balance-display').textContent = `Total: $${total.toFixed(2)}`;
  }

  function renderList(transactions) {
  const container = document.getElementById('transaction-list');

  container.innerHTML = `
    <table id="transaction-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Amount</th>
          <th>Category</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${transactions
          .map((t) => {
            const highlightClass = t.amount > EXPENSE_LIMIT ? 'highlight' : '';
            return `
              <tr class="${highlightClass}">
                <td>${t.name}</td>
                <td>$${t.amount.toFixed(2)}</td>
                <td>${t.category}</td>
                <td>
                  <button class="delete-btn" data-id="${t.id}">Delete</button>
                </td>
              </tr>
            `;
          })
          .join('')}
      </tbody>
    </table>
  `;
}

  function render(transactions) {
    const sorted = sortTransactions(transactions);
    renderList(sorted);
    renderBalance(transactions);
    ChartController.update(transactions);
  }

  function onSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;

    const { valid, errors } = Validator.validate(name, amount, category);

    document.getElementById('error-name').textContent = errors.name || '';
    document.getElementById('error-amount').textContent = errors.amount || '';
    document.getElementById('error-category').textContent = errors.category || '';

    if (!valid) return;

    const transaction = {
      id: crypto.randomUUID(),
      name: name.trim(),
      amount: parseFloat(amount),
      category,
    };

    transactions.push(transaction);
    Storage.save(transactions);
    render(transactions);
    e.target.reset();
  }

  function onDeleteClick(e) {
    if (!e.target.classList.contains('delete-btn')) return;

    const id = e.target.dataset.id;
    const index = transactions.findIndex((t) => t.id === id);

    if (index === -1) return;

    transactions.splice(index, 1);
    Storage.save(transactions);
    render(transactions);
  }

  function initSort() {
    const sortEl = document.getElementById('sort-by');
    if (!sortEl) return;

    sortEl.addEventListener('change', (e) => {
      currentSort = e.target.value;
      render(transactions);
    });
  }

  const themeToggle = document.getElementById('theme-toggle');

  if (themeToggle) {
    function setTheme(mode) {
      document.body.classList.toggle('dark', mode === 'dark');
      localStorage.setItem('theme', mode);
      themeToggle.textContent = mode === 'dark' ? '☀️' : '🌙';
    }

    themeToggle.addEventListener('click', () => {
      const isDark = document.body.classList.contains('dark');
      setTheme(isDark ? 'light' : 'dark');
    });

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }

  transactions = Storage.load();
  ChartController.init(document.getElementById('pie-chart'));
  render(transactions);

  initSort();

  document.getElementById('input-form').addEventListener('submit', onSubmit);
  document.getElementById('transaction-list').addEventListener('click', onDeleteClick);

})();
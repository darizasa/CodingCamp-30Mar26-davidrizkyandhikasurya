# Requirements Document

## Introduction

The Expense & Budget Visualizer is a client-side web application that allows users to track personal expenses by adding transactions with a name, amount, and category. It displays a running total balance and a pie chart that visualizes spending distribution by category. All data is persisted in the browser's Local Storage. The app requires no backend, no build tools, and no complex setup — just a single HTML file with one CSS file and one JavaScript file.

## Glossary

- **App**: The Expense & Budget Visualizer web application.
- **Transaction**: A single expense entry consisting of a name, amount, and category.
- **Transaction_List**: The scrollable UI component that displays all recorded transactions.
- **Input_Form**: The UI form used to enter a new transaction's name, amount, and category.
- **Category**: A classification label for a transaction. Valid values are: Food, Transport, Fun.
- **Balance_Display**: The UI component that shows the current total of all transaction amounts.
- **Chart**: The pie chart UI component that visualizes spending distribution by category.
- **Storage**: The browser's Local Storage API used to persist transaction data client-side.
- **Validator**: The client-side logic that checks Input_Form fields before submission.

---

## Requirements

### Requirement 1: Add a Transaction

**User Story:** As a user, I want to fill out a form with an item name, amount, and category, so that I can record a new expense.

#### Acceptance Criteria

1. THE Input_Form SHALL provide a text field for the transaction name, a numeric field for the amount, and a dropdown selector for the category (Food, Transport, Fun).
2. WHEN the user submits the Input_Form with all fields filled and a valid positive amount, THE App SHALL add the transaction to the Transaction_List.
3. WHEN the user submits the Input_Form with all fields filled and a valid positive amount, THE App SHALL persist the transaction to Storage.
4. IF the user submits the Input_Form with one or more empty fields, THEN THE Validator SHALL display an inline error message indicating which fields are missing.
5. IF the user submits the Input_Form with an amount that is not a positive number, THEN THE Validator SHALL display an inline error message indicating the amount is invalid.
6. WHEN a transaction is successfully added, THE Input_Form SHALL reset all fields to their default empty state.

---

### Requirement 2: View Transaction List

**User Story:** As a user, I want to see a scrollable list of all my recorded transactions, so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display each transaction's name, amount, and category.
2. WHILE the number of transactions exceeds the visible area, THE Transaction_List SHALL be scrollable.
3. WHEN the App loads, THE Transaction_List SHALL render all transactions previously persisted in Storage.

---

### Requirement 3: Delete a Transaction

**User Story:** As a user, I want to delete a transaction from the list, so that I can remove incorrect or unwanted entries.

#### Acceptance Criteria

1. THE Transaction_List SHALL display a delete control for each transaction entry.
2. WHEN the user activates the delete control for a transaction, THE App SHALL remove that transaction from the Transaction_List.
3. WHEN the user activates the delete control for a transaction, THE App SHALL remove that transaction from Storage.

---

### Requirement 4: Display Total Balance

**User Story:** As a user, I want to see my total spending balance at the top of the page, so that I always know how much I have spent in total.

#### Acceptance Criteria

1. THE Balance_Display SHALL show the sum of all transaction amounts.
2. WHEN a transaction is added, THE Balance_Display SHALL update to reflect the new total without requiring a page reload.
3. WHEN a transaction is deleted, THE Balance_Display SHALL update to reflect the new total without requiring a page reload.
4. WHEN the App loads with no transactions in Storage, THE Balance_Display SHALL show a total of 0.

---

### Requirement 5: Visualize Spending by Category

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand where my money is going.

#### Acceptance Criteria

1. THE Chart SHALL display a pie chart with one segment per category that has at least one transaction.
2. THE Chart SHALL calculate each segment's size proportionally to the total amount spent in that category relative to all transactions.
3. WHEN a transaction is added, THE Chart SHALL update automatically to reflect the new category distribution without requiring a page reload.
4. WHEN a transaction is deleted, THE Chart SHALL update automatically to reflect the new category distribution without requiring a page reload.
5. WHEN the App loads with no transactions in Storage, THE Chart SHALL render in an empty or placeholder state.

---

### Requirement 6: Persist Data Across Sessions

**User Story:** As a user, I want my transactions to be saved between browser sessions, so that I do not lose my data when I close or refresh the page.

#### Acceptance Criteria

1. WHEN a transaction is added, THE Storage SHALL save the complete updated transaction list as a serialized JSON string.
2. WHEN a transaction is deleted, THE Storage SHALL save the complete updated transaction list as a serialized JSON string.
3. WHEN the App loads, THE App SHALL read the transaction list from Storage and deserialize the JSON string into transaction objects.
4. IF Storage contains malformed or unparseable data, THEN THE App SHALL initialize with an empty transaction list and clear the corrupted Storage entry.
5. FOR ALL valid transaction lists, serializing then deserializing SHALL produce a transaction list equivalent to the original (round-trip property).

---

### Requirement 7: Responsive and Accessible UI

**User Story:** As a user, I want the app to be readable and usable across modern browsers and screen sizes, so that I can use it on any device.

#### Acceptance Criteria

1. THE App SHALL render correctly in Chrome, Firefox, Edge, and Safari without browser-specific polyfills.
2. THE App SHALL use a single CSS file located at `css/` and a single JavaScript file located at `js/`.
3. WHEN the viewport width changes, THE App SHALL reflow its layout so that all content remains readable and interactive without horizontal scrolling.
4. THE Input_Form SHALL associate each input field with a visible label to support screen reader accessibility.

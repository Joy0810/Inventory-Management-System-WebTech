# Project 7: Inventory Management System
**Difficulty:** Intermediate  
**Stack:** MongoDB · Express.js · React JS · Node.js · JSP (reports only)

---

## Project Context

A stock control application for small businesses to track product inventory, manage suppliers, and automate low-stock alerts.

**Core capabilities:**
- Add/edit/delete products with SKUs and reorder thresholds
- Record stock-in and stock-out transactions
- Email alerts when stock falls below reorder level (daily cron job)
- Stock valuation reports (printable / PDF export via JSP)
- Full transaction audit trail

---

## Folder Structure

```
inventory-app/
├── backend/
│   ├── models/
│   │   ├── Product.js
│   │   ├── Supplier.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── products.js
│   │   ├── suppliers.js
│   │   └── transactions.js
│   ├── jobs/
│   │   └── lowStockChecker.js      ← cron + nodemailer
│   ├── config/
│   │   └── db.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Suppliers.jsx
│   │   │   └── Transactions.jsx
│   │   ├── components/
│   │   │   ├── ProductCard.jsx
│   │   │   ├── TransactionTable.jsx
│   │   │   ├── AddProductModal.jsx
│   │   │   └── Navbar.jsx
│   │   ├── api/
│   │   │   └── axios.js
│   │   └── App.jsx
└── reports/                        ← JSP pages
    ├── stockReport.jsp
    └── WEB-INF/web.xml
```

---

## Data Models

### Product
```
{
  name: String (required),
  sku: String (required, unique),        ← uppercase alphanumeric only, max 20 chars
  category: String,
  quantity: Number (default 0),
  reorderLevel: Number (default 10),     ← 0 = no alerts for this product (opt-out)
  unitPrice: Number (required),
  supplierId: ObjectId → Supplier,
  createdAt: Date,
  updatedAt: Date                        ← auto-managed by timestamps: true
}
```

### Supplier
```
{
  name: String (required),
  contactEmail: String,
  phone: String,
  address: String
}
```

### Transaction
```
{
  productId: ObjectId → Product (required),
  type: "stock-in" | "stock-out" (required),
  quantity: Number (required, > 0),
  priceAtTransaction: Number (required), ← snapshot of product's unitPrice at time of transaction
  note: String,
  createdAt: Date (auto)
}
```

> **Why `priceAtTransaction`:** If a product's `unitPrice` is updated later, historical valuation in the JSP report would be wrong if we multiply current price × old quantities. Snapshotting the price at transaction time keeps history accurate.

---

## API Endpoints

### Products

> ⚠️ **Route ordering rule:** Define `GET /api/products/low-stock` **before** `GET /api/products/:id` in the router file. Otherwise Express treats the string `"low-stock"` as the `:id` param and the route will never match correctly.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products/low-stock | Products below reorder level ← **must be defined first in router** |
| GET | /api/products | List all products |
| GET | /api/products/:id | Single product |
| POST | /api/products | Add product |
| PUT | /api/products/:id | Edit product |
| DELETE | /api/products/:id | Delete product |

### Suppliers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/suppliers | List all suppliers |
| POST | /api/suppliers | Add supplier |
| PUT | /api/suppliers/:id | Edit supplier |
| DELETE | /api/suppliers/:id | Delete supplier |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/transactions | All transactions (supports `?productId=` and `?from=&to=`) |
| POST | /api/transactions | Record stock-in or stock-out |

#### Transaction Date Filter Spec
- Query params: `?from=2024-01-01&to=2024-01-31`
- Format: ISO 8601 date strings (`YYYY-MM-DD`)
- Both `from` and `to` are **inclusive**
- If only one is provided, the other is treated as unbounded
- Backend converts to: `createdAt: { $gte: startOfDay(from), $lte: endOfDay(to) }`

---

## Business Logic & Edge Cases

### Stock Transactions — Atomic Update (No Replica Set Required)

Do **not** use a check-then-save pattern (race condition risk). Instead, use a single atomic `findOneAndUpdate` with a built-in condition:

```js
// stock-out
const updated = await Product.findOneAndUpdate(
  { _id: productId, quantity: { $gte: requestedQty } },  // condition guard
  { $inc: { quantity: -requestedQty } },
  { new: true }
);
if (!updated) return res.status(400).json({ error: "Insufficient stock", available: product.quantity });

// stock-in (no condition needed)
await Product.findOneAndUpdate(
  { _id: productId },
  { $inc: { quantity: +requestedQty } }
);
```

This is atomic at the MongoDB document level and works on a standard standalone instance — no replica set required.

### Stock-Out Error Response

When a stock-out is rejected, return:
```json
{ "error": "Insufficient stock", "available": <current_quantity> }
```
The frontend must display: **"Only X units available"** near the quantity input field using the `available` value from the response.

### Stock Transactions — General Rules
- `quantity` must be a positive integer, never 0 or negative
- On every successful transaction, save `priceAtTransaction` by copying the product's current `unitPrice` at that moment

### Products
- SKU must be unique — return `400 { error: "SKU already exists" }` if duplicate
- SKU format: uppercase alphanumeric only (A–Z, 0–9), max 20 characters. Reject anything else with `400 { error: "Invalid SKU format" }`. Enforce on both backend (express-validator regex) and frontend (input hint text)
- Cannot delete a product that has existing transactions — return `400 { error: "Cannot delete product with existing transactions" }`
- `unitPrice` and `reorderLevel` must be positive numbers
- `reorderLevel: 0` means no alert for that product (opt-out) — the Add/Edit form must label this: *"Reorder Level (set to 0 to disable alerts)"*

### Suppliers
- Cannot delete a supplier if any product references their `supplierId` — return `400 { error: "Cannot delete supplier with linked products" }`
- Frontend must display this error message in the delete confirmation flow

### Low Stock Alerts
- Cron runs once daily (e.g., 8 AM)
- Only sends email if `quantity <= reorderLevel` AND `reorderLevel > 0`
- One email per run listing all low-stock items (not one per item)
- If no items are low, no email is sent
- **Restock/recovery notifications are intentionally out of scope** — the cron only checks for low stock, not replenishment. Conscious omission.

### Search / Filter
- Product search by name or SKU (case-insensitive, client-side filter is fine)
- Transaction history filterable by `productId` and by date range (see date filter spec above)

---

## Frontend Pages (Minimalistic UI)

### Standard UI States (apply to every page)
Every page that fetches data must handle all three of these:
- **Loading:** show `"Loading..."` text or a simple spinner while the API call is in progress
- **Empty:** show a contextual message when the list is empty (e.g., `"No products found"`, `"No transactions recorded yet"`)
- **API Error / Unreachable:** show `"Failed to load data. Please check your connection."` — add a Retry button where practical

### Dashboard (`/`)
- Summary cards: Total Products, Low Stock Count, Total Stock Value
- Total Stock Value = sum of `quantity × unitPrice` across all products (current price snapshot)
- Low stock alert list: product name, SKU, current qty, reorder level

### Products (`/products`)
- Table: Name, SKU, Category, Qty, Reorder Level, Unit Price, Supplier, Actions
- Add / Edit product via modal form
- SKU input: hint text below field — *"Uppercase letters and numbers only, max 20 characters"*
- Reorder Level input: label — *"Reorder Level (0 = no alerts)"*
- Delete with confirmation dialog
- Show API errors inline (e.g., "SKU already exists", "Cannot delete product with existing transactions")
- Search bar filters by name or SKU (client-side)

### Transactions (`/transactions`)
- Form: select product, type (Stock In / Stock Out), quantity, optional note
- On stock-out failure: show **"Only X units available"** next to the quantity field (use `available` from error response)
- Transaction table (newest first): Date, Product Name, SKU, Type, Qty, Note
- Date format in table: `DD/MM/YYYY HH:mm`
- Filter by product (dropdown) and by date range (`from` / `to` date inputs)

### Suppliers (`/suppliers`)
- Table: Name, Email, Phone, Address, Actions
- Add / Edit / Delete supplier
- Delete blocked if products are linked — show: *"Cannot delete supplier with linked products"*

---

## JSP Reports (Separate)

- `stockReport.jsp` calls `GET http://localhost:5000/api/products` directly using JavaScript `fetch()` on page load
- Do **not** use query params to pass data — query params cannot carry a full product list
- Renders a table: SKU, Product Name, Category, Qty in Stock, Unit Price (current), Total Value (`qty × unitPrice`)
- Grand total row at the bottom: Total Stock Value
- Print button (`window.print()`), hidden when printing via `@media print { .no-print { display: none } }`
- Basic print-friendly CSS: clean table borders, no background colours
- **Data accuracy note:** The JSP report reflects current `unitPrice × quantity` — a today's-valuation snapshot. For per-transaction historical valuation, `priceAtTransaction` exists in the Transaction model but is not used in this report
- **CORS:** The Express backend must have `cors()` middleware enabled so the JSP page (served by Tomcat on a different port) can fetch from it without being blocked
- `WEB-INF/web.xml` with minimal servlet config is required to run the JSP

---

## Environment Variables

### `.env` (never commit — add to `.gitignore`)
```
MONGO_URI=mongodb://localhost:27017/inventory
PORT=5000
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
ALERT_EMAIL=owner@business.com
```

### `.env.example` (commit this to the repo)
```
MONGO_URI=mongodb://localhost:27017/inventory
PORT=5000
EMAIL_USER=           # Gmail address used to send alerts
EMAIL_PASS=           # Gmail App Password (not your account password)
ALERT_EMAIL=          # Email address that receives low-stock alerts
```

---

## Implementation Notes

- Use `mongoose` for MongoDB, `express-validator` for input validation (including SKU format via regex `/^[A-Z0-9]{1,20}$/`)
- Use `timestamps: true` in all Mongoose schemas — auto-adds `createdAt` and `updatedAt`
- Cron job uses `node-cron`, email uses `nodemailer`
- React uses `axios` for all API calls, `react-router-dom` for routing
- No auth required for this project (out of scope)
- Error responses are always `{ error: "message" }` with the correct HTTP status. Stock-out failures additionally include `{ error: "...", available: N }`
- Frontend shows user-friendly error messages for all API validation failures

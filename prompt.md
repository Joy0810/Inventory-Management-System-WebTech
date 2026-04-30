# prompt.md — AI IDE Prompt Sequence
# Inventory Management System (Project 7)

> **How to use:**
> - Give ONE prompt at a time. Do not combine prompts.
> - The file `plan_webtech_v1.md` is pinned as context in this IDE — every prompt references it.
> - After each prompt, run the code and verify it works before moving to the next one.
> - If something breaks, fix it in the same session before proceeding. Do not carry bugs forward.

---

## PROMPT 1 — Project Setup & Backend Scaffold

```
We are building Project 7: Inventory Management System. The full plan is in plan_webtech_v1.md — read it before doing anything.

Do only what this prompt asks. Do not create models or routes yet.

--- TASK ---

Set up the Node.js + Express backend with the exact folder structure from the plan.

1. FOLDER STRUCTURE
   Create these folders and files (empty files are fine for now):
   backend/
     config/db.js
     models/         (empty folder)
     routes/         (empty folder)
     jobs/           (empty folder)
     server.js
   Also create these at the project root:
     .env
     .env.example
     .gitignore

2. INITIALIZE NODE PROJECT
   Run: npm init -y
   Then install these exact dependencies:
     npm install express mongoose dotenv cors node-cron nodemailer express-validator
   Then install this as a dev dependency:
     npm install --save-dev nodemon
   Add this to package.json scripts:
     "start": "node backend/server.js",
     "dev": "nodemon backend/server.js"

3. backend/config/db.js
   - Import mongoose
   - Export an async function called connectDB
   - Inside it, call mongoose.connect() using process.env.MONGO_URI
   - On success, log: "MongoDB connected"
   - On failure, log the error and call process.exit(1)

4. backend/server.js
   - At the very top, call require('dotenv').config()
   - Import express, cors, and connectDB
   - Call connectDB()
   - Set up app.use(cors()) — this is required so the JSP report page (on a different port) can call our API
   - Set up app.use(express.json())
   - Mount these three routers (the files don't exist yet, so just write the require/mount lines and comment them out for now):
       // app.use('/api/products', require('./routes/products'));
       // app.use('/api/suppliers', require('./routes/suppliers'));
       // app.use('/api/transactions', require('./routes/transactions'));
   - Add a root GET / route that returns: { message: "Inventory API running" }
   - Listen on process.env.PORT or 5000
   - Log: "Server running on port X"

5. .env file — use these exact placeholder values:
   MONGO_URI=mongodb://localhost:27017/inventory
   PORT=5000
   EMAIL_USER=your@gmail.com
   EMAIL_PASS=your_app_password
   ALERT_EMAIL=owner@business.com

6. .env.example file — same keys but empty values with comments:
   MONGO_URI=mongodb://localhost:27017/inventory
   PORT=5000
   EMAIL_USER=           # Gmail address used to send alerts
   EMAIL_PASS=           # Gmail App Password (not your login password)
   ALERT_EMAIL=          # Email address that receives low-stock alerts

7. .gitignore — must include:
   node_modules
   .env

--- VERIFY ---
After this prompt, run: npm run dev
Expected output: "MongoDB connected" and "Server running on port 5000"
GET http://localhost:5000/ should return { "message": "Inventory API running" }
```

---

## PROMPT 2 — MongoDB Models

```
Read plan_webtech_v1.md, specifically the "Data Models" section.

Create these three Mongoose model files exactly as specified. Do not create routes yet.

--- FILE 1: backend/models/Product.js ---

Schema fields:
- name: String, required, trim
- sku: String, required, unique, uppercase, trim, maxlength 20
  Add this validator: match: [/^[A-Z0-9]+$/, 'SKU must be uppercase alphanumeric only']
- category: String, trim
- quantity: Number, required, default 0, min 0
- reorderLevel: Number, required, default 10, min 0
  (0 is valid — it means "no alerts for this product")
- unitPrice: Number, required, min 0
- supplierId: mongoose.Schema.Types.ObjectId, ref: 'Supplier' (not required — a product can exist without a supplier)

Options: { timestamps: true }
(This auto-adds createdAt and updatedAt — do not add them manually)

Export as: module.exports = mongoose.model('Product', productSchema)

--- FILE 2: backend/models/Supplier.js ---

Schema fields:
- name: String, required, trim
- contactEmail: String, trim
- phone: String, trim
- address: String, trim

Options: { timestamps: true }

Export as: module.exports = mongoose.model('Supplier', supplierSchema)

--- FILE 3: backend/models/Transaction.js ---

Schema fields:
- productId: mongoose.Schema.Types.ObjectId, ref: 'Product', required
- type: String, required, enum: ['stock-in', 'stock-out']
- quantity: Number, required, min 1
  (must be at least 1 — zero and negative are not allowed)
- priceAtTransaction: Number, required
  (this is a snapshot of the product's unitPrice at the moment the transaction was recorded.
   It must be saved so historical reports remain accurate even if unitPrice is updated later.)
- note: String, trim

Options: { timestamps: true }
(createdAt will serve as the transaction timestamp)

Export as: module.exports = mongoose.model('Transaction', transactionSchema)

--- VERIFY ---
No server errors when models are imported. No route files needed yet.
```

---

## PROMPT 3 — Supplier Routes

```
Read plan_webtech_v1.md, specifically the "API Endpoints > Suppliers" section and the "Business Logic > Suppliers" section.

Create backend/routes/suppliers.js with full CRUD.
Then uncomment the suppliers router line in backend/server.js.

--- ENDPOINTS TO IMPLEMENT ---

GET /api/suppliers
- Return all suppliers as a JSON array
- If none exist, return an empty array [] — not an error
- Status 200

POST /api/suppliers
- Body fields: name (required), contactEmail, phone, address
- Validate: name must not be empty — if missing return 400 { error: "Supplier name is required" }
- Save and return the new supplier with status 201

PUT /api/suppliers/:id
- Accept any of these fields in the body: name, contactEmail, phone, address
- Use { new: true, runValidators: true } in findByIdAndUpdate
- If supplier not found, return 404 { error: "Supplier not found" }
- Return the updated supplier with status 200

DELETE /api/suppliers/:id
- Before deleting, check if any Product document has supplierId equal to this supplier's _id
- If yes: return 400 { error: "Cannot delete supplier with linked products" }
- If no linked products: delete and return 200 { message: "Supplier deleted" }
- If supplier not found: return 404 { error: "Supplier not found" }

--- RULES ---
- All error responses must follow this exact shape: { error: "message" }
- Wrap each route handler in try/catch. On unexpected errors return 500 { error: "Server error" }
- Do not put any business logic outside the route handlers

--- VERIFY ---
After uncommenting the router in server.js and restarting:
POST /api/suppliers with { "name": "Test Supplier" } should return 201
GET /api/suppliers should return an array with that supplier
DELETE that supplier should return 200
```

---

## PROMPT 4 — Product Routes

```
Read plan_webtech_v1.md, specifically the "API Endpoints > Products" section, "Business Logic > Products" section, and the route ordering warning.

Create backend/routes/products.js.
Then uncomment the products router line in backend/server.js.

--- CRITICAL: ROUTE ORDER ---
In this file, the route GET /low-stock MUST be defined BEFORE GET /:id.
If /:id is defined first, Express will match "low-stock" as an id param and the low-stock route will never work.
The correct order in the file is:
  1. GET /low-stock
  2. GET /
  3. GET /:id
  4. POST /
  5. PUT /:id
  6. DELETE /:id

--- ENDPOINTS TO IMPLEMENT ---

GET /low-stock
- Query: find all products where quantity <= reorderLevel AND reorderLevel > 0
- Populate supplierId with supplier name only (select: 'name')
- Return the array (can be empty), status 200

GET /
- Return all products
- Populate supplierId with supplier name only
- Return array, status 200

GET /:id
- Return single product by _id, populated with supplier name
- If not found: 404 { error: "Product not found" }

POST /
- Body fields: name (required), sku (required), category, unitPrice (required), reorderLevel, supplierId
- Validate:
    a. name must not be empty → 400 { error: "Product name is required" }
    b. sku must not be empty → 400 { error: "SKU is required" }
    c. sku must match /^[A-Z0-9]{1,20}$/ → 400 { error: "Invalid SKU format. Use uppercase letters and numbers only, max 20 characters" }
    d. unitPrice must be a number > 0 → 400 { error: "Unit price must be a positive number" }
    e. if reorderLevel is provided, it must be >= 0 → 400 { error: "Reorder level must be 0 or a positive number" }
- If SKU already exists in DB (duplicate key error code 11000): return 400 { error: "SKU already exists" }
- Save and return new product with status 201

PUT /:id
- Accept: name, category, unitPrice, reorderLevel, supplierId (sku should NOT be editable after creation)
- Validate unitPrice and reorderLevel the same way as POST if they are provided
- Use { new: true, runValidators: true }
- If not found: 404 { error: "Product not found" }
- Return updated product, status 200

DELETE /:id
- Before deleting, check if any Transaction document has productId equal to this product's _id
- If yes: return 400 { error: "Cannot delete product with existing transactions" }
- If no transactions: delete and return 200 { message: "Product deleted" }
- If product not found: 404 { error: "Product not found" }

--- RULES ---
- All error responses: { error: "message" }
- Wrap all handlers in try/catch → 500 { error: "Server error" } on unexpected errors
- Handle mongoose duplicate key error (code 11000) in the catch block of POST

--- VERIFY ---
POST /api/products with { "name": "Test", "sku": "ABC123", "unitPrice": 10 } → 201
POST again with same SKU → 400 "SKU already exists"
POST with sku "abc123" (lowercase) → 400 "Invalid SKU format"
GET /api/products/low-stock → should return array (not a cast error)
```

---

## PROMPT 5 — Transaction Routes

```
Read plan_webtech_v1.md, specifically the "API Endpoints > Transactions" section, "Business Logic > Stock Transactions" section, and the "Transaction Date Filter Spec".

Create backend/routes/transactions.js.
Then uncomment the transactions router line in backend/server.js.

--- ENDPOINTS TO IMPLEMENT ---

GET /
- Build a query object:
    a. If req.query.productId is provided, add { productId: req.query.productId } to the query
    b. If req.query.from OR req.query.to is provided, add a createdAt filter:
       - from: treat as start of that day → new Date(from + 'T00:00:00.000Z')
       - to:   treat as end of that day   → new Date(to   + 'T23:59:59.999Z')
       - Both are inclusive. If only one is provided, only that bound is applied.
       - Add to query: createdAt: { $gte: fromDate, $lte: toDate } (include only the ones provided)
- Find transactions matching the query
- Sort by createdAt: -1 (newest first)
- Populate productId with only these fields: name sku (use select: 'name sku')
- Return array, status 200

POST /
- Body fields: productId (required), type (required), quantity (required), note (optional)
- Step 1 — Validate inputs:
    a. productId must be provided → 400 { error: "productId is required" }
    b. type must be exactly 'stock-in' or 'stock-out' → 400 { error: "type must be stock-in or stock-out" }
    c. quantity must be a positive integer (> 0, whole number) → 400 { error: "Quantity must be a positive integer" }

- Step 2 — Check product exists:
    const product = await Product.findById(productId)
    if (!product) return 404 { error: "Product not found" }

- Step 3 — For stock-out ONLY, use this exact atomic update pattern (do NOT do a separate find + check first — that is a race condition):
    const updated = await Product.findOneAndUpdate(
      { _id: productId, quantity: { $gte: quantity } },
      { $inc: { quantity: -quantity } },
      { new: true }
    );
    if (!updated) {
      return res.status(400).json({ error: "Insufficient stock", available: product.quantity });
    }

- Step 4 — For stock-in ONLY:
    await Product.findByIdAndUpdate(productId, { $inc: { quantity: +quantity } });

- Step 5 — Save the transaction:
    Create and save a new Transaction with:
      productId,
      type,
      quantity,
      priceAtTransaction: product.unitPrice,   ← snapshot current price right now
      note: note || ''
    Return the saved transaction with status 201

- The error response for insufficient stock must be exactly:
    { "error": "Insufficient stock", "available": <number> }
  The frontend uses the "available" field to show "Only X units available"

--- RULES ---
- Wrap everything in try/catch → 500 { error: "Server error" }
- Do not use mongoose sessions or transactions — the atomic findOneAndUpdate pattern above is sufficient

--- VERIFY ---
POST /api/transactions with a valid stock-in → 201, product quantity increases
POST /api/transactions with stock-out for more than available → 400 with "available" field in response
GET /api/transactions?productId=<id> → filtered results
GET /api/transactions?from=2024-01-01&to=2024-01-31 → date-filtered results
```

---

## PROMPT 6 — Cron Job (Low Stock Email Alert)

```
Read plan_webtech_v1.md, specifically the "Business Logic > Low Stock Alerts" section.

Create backend/jobs/lowStockChecker.js and then import it in backend/server.js.

--- FILE: backend/jobs/lowStockChecker.js ---

1. Import node-cron, nodemailer, and the Product model

2. Create the nodemailer transporter using Gmail SMTP:
   - service: 'gmail'
   - auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }

3. Create an async function called checkLowStock that does the following:
   a. Query: Product.find({ reorderLevel: { $gt: 0 }, $expr: { $lte: ['$quantity', '$reorderLevel'] } })
      (This finds products where reorderLevel > 0 AND quantity <= reorderLevel)
   b. If the result array is empty: log "Low stock check: no low stock items" and return — do NOT send an email
   c. If items are found:
      - Build the email body as a plain text string. For each product, include a line like:
        "- [Product Name] | SKU: [SKU] | Current Qty: [quantity] | Reorder Level: [reorderLevel]"
      - Send ONE email using the transporter with:
          from: process.env.EMAIL_USER
          to: process.env.ALERT_EMAIL
          subject: `Low Stock Alert - ${items.length} item(s) need restocking`
          text: "The following products are at or below their reorder level:\n\n" + the list above
      - On success: log "Low stock alert email sent for X items"
      - On email error: log the error but do NOT crash the server

4. Schedule the job using node-cron:
   cron.schedule('0 8 * * *', checkLowStock);
   (This runs at 8:00 AM every day)

5. Also call checkLowStock() once immediately when the module is loaded, for easy testing during development:
   checkLowStock();

6. Export the cron job (or just the function if preferred)

--- IN backend/server.js ---
Add this line after the MongoDB connection:
   require('./jobs/lowStockChecker');

--- VERIFY ---
On server start, checkLowStock runs immediately.
If there are no low-stock products: check the server log for "no low stock items" — no email is sent.
If you manually set a product's quantity below its reorderLevel in MongoDB and restart: an email should be sent to ALERT_EMAIL.
```

---

## PROMPT 7 — React Frontend Setup

```
Read plan_webtech_v1.md, specifically the "Folder Structure" and "Frontend Pages" sections.

Set up the React frontend. Do not build any pages yet — only the app shell, routing, and axios config.

--- SETUP ---

1. Inside the project root, create the React app using Vite:
   npm create vite@latest frontend -- --template react
   cd frontend && npm install
   npm install axios react-router-dom

2. Delete the boilerplate files Vite generates: App.css, assets/react.svg
   Keep index.css but clear all its contents (we will write our own styles)

3. Create this exact folder structure inside frontend/src/:
   api/
     axios.js
   pages/
     Dashboard.jsx      (empty component for now)
     Products.jsx       (empty component for now)
     Transactions.jsx   (empty component for now)
     Suppliers.jsx      (empty component for now)
   components/
     Navbar.jsx

--- FILE: frontend/src/api/axios.js ---
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export default api;

--- FILE: frontend/src/components/Navbar.jsx ---
- Render a <nav> with a heading "Inventory Manager" on the left
- Render four links on the right using react-router-dom <Link>:
    Dashboard → /
    Products → /products
    Transactions → /transactions
    Suppliers → /suppliers
- Keep styling minimal: plain inline styles or a small CSS class block at the top of the file
- The active page link does not need special styling for now

--- FILE: frontend/src/App.jsx ---
- Import BrowserRouter, Routes, Route from react-router-dom
- Import Navbar and all four page components
- Render:
    <BrowserRouter>
      <Navbar />
      <main style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/suppliers" element={<Suppliers />} />
        </Routes>
      </main>
    </BrowserRouter>

--- FILE: frontend/src/main.jsx ---
- Keep as-is (Vite generates this correctly)
- Make sure it renders <App />

--- VERIFY ---
Run: npm run dev inside the frontend folder
The app loads in the browser with no errors.
Navbar links navigate between pages without a full page reload.
Each page shows its placeholder content.
```

---

## PROMPT 8 — Dashboard Page

```
Read plan_webtech_v1.md, specifically the "Frontend Pages > Dashboard" section and "Standard UI States".

Build frontend/src/pages/Dashboard.jsx.

--- WHAT THIS PAGE DOES ---
Fetches product data and shows:
1. Three summary cards at the top
2. A low-stock alert table below

--- DATA FETCHING ---
Make TWO axios calls on component mount using useEffect:
  a. GET /api/products           → used for summary cards
  b. GET /api/products/low-stock → used for the low-stock table

Use separate loading and error states for each call, OR a single combined loading/error state — your choice, but handle both.

--- SUMMARY CARDS ---
Calculate from the /api/products response:
  - "Total Products": products.length
  - "Low Stock Items": lowStockProducts.length (from the /low-stock response)
  - "Total Stock Value": sum of (product.quantity * product.unitPrice) for all products, formatted as a currency string (e.g. "₹1,23,456.00" or "$12,345.00" — use toLocaleString())

Render as three side-by-side cards. Each card has:
  - A label (e.g. "Total Products")
  - A large number/value below it
  Minimal styling: a border or background to visually separate each card.

--- LOW STOCK ALERT TABLE ---
Render a table with these exact columns:
  Product Name | SKU | Current Qty | Reorder Level

If the low-stock array is empty, show a paragraph: "All products are sufficiently stocked."

--- UI STATES (required on this page) ---
Loading: While either API call is in progress, show: <p>Loading dashboard...</p>
Error: If either API call fails, show:
  <p style={{ color: 'red' }}>Failed to load dashboard data. Please check your connection.</p>
  with a "Retry" button that re-runs the fetch
Empty (low stock table): "All products are sufficiently stocked." as shown above

--- DO NOT ---
- Do not use any external UI component library
- Do not hardcode any data

--- VERIFY ---
Page loads and shows real data from the backend.
Total Stock Value is calculated correctly.
If you set a product below its reorder level, it appears in the low-stock table.
```

---

## PROMPT 9 — Products Page

```
Read plan_webtech_v1.md, specifically the "Frontend Pages > Products" section and "Standard UI States".

Build frontend/src/pages/Products.jsx.
This is the most complex page. Read every instruction carefully.

--- WHAT THIS PAGE DOES ---
- Displays all products in a table
- Lets the user add, edit, and delete products
- Has a search bar to filter by name or SKU
- Shows API error messages to the user

--- STATE YOU NEED ---
- products: [] — full list from API
- suppliers: [] — for the supplier dropdown in the form
- searchTerm: '' — for client-side filtering
- showModal: false — controls add/edit modal visibility
- editingProduct: null — if null = add mode, if set = edit mode
- formError: '' — error message to show inside the modal
- pageError: '' — error message to show on the page (for delete failures etc.)
- loading: true

--- DATA FETCHING ---
On mount, fetch both:
  GET /api/products   → set products
  GET /api/suppliers  → set suppliers
Use Promise.all so both load together.

--- TABLE ---
Columns: Name | SKU | Category | Qty | Reorder Level | Unit Price | Supplier | Actions

For Supplier column: show supplier name if populated, else show "—"
For Actions column: show two buttons per row — "Edit" and "Delete"

Apply the search filter to what you render (not to the state):
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

--- SEARCH BAR ---
A text input above the table, placeholder "Search by name or SKU"
Controlled input tied to searchTerm state

--- ADD / EDIT MODAL ---
Trigger: "Add Product" button (top right of page) → sets showModal=true, editingProduct=null
Edit button in row → sets showModal=true, editingProduct=that product

Modal form fields:
  - Product Name (text, required)
  - SKU (text, required)
    - Hint text below the input: "Uppercase letters and numbers only, max 20 characters"
    - On the frontend, auto-uppercase what the user types: onChange convert to .toUpperCase()
    - When in edit mode: make this field disabled (SKU is not editable after creation)
  - Category (text, optional)
  - Unit Price (number, required, min 0)
  - Reorder Level (number, required, min 0)
    - Label must say: "Reorder Level (0 = no alerts)"
  - Supplier (dropdown, optional)
    - First option: "-- No Supplier --" with value ""
    - Then map suppliers to <option value={s._id}>{s.name}</option>

On submit:
  - If add mode: POST /api/products with form data
  - If edit mode: PUT /api/products/:id with form data (excluding sku)
  - On success: close modal, clear formError, re-fetch products
  - On API error (4xx): show the error message from response.data.error inside the modal in red text (formError state)
  - On network error: show "Something went wrong. Please try again."

--- DELETE ---
Each row's Delete button:
  - Show a window.confirm("Are you sure you want to delete [product name]?")
  - If confirmed: DELETE /api/products/:id
  - On success: re-fetch products
  - On API error (4xx): set pageError to response.data.error and show it on the page in red
    (example: "Cannot delete product with existing transactions")
  - Clear pageError when a new delete is attempted

--- UI STATES ---
Loading: <p>Loading products...</p>
Empty (no products at all): <p>No products found. Add your first product.</p>
Empty (search returns nothing): <p>No products match your search.</p>
API Error on page load: <p style={{ color: 'red' }}>Failed to load products.</p> with a Retry button

--- VERIFY ---
Add a product with a duplicate SKU → modal shows "SKU already exists"
Add a product with lowercase SKU → it auto-uppercases as you type
Edit a product → SKU field is disabled
Delete a product that has transactions → page shows the error message
Search filters the table correctly
```

---

## PROMPT 10 — Transactions Page

```
Read plan_webtech_v1.md, specifically the "Frontend Pages > Transactions" section, the "Stock-Out Error Response" section, and "Standard UI States".

Build frontend/src/pages/Transactions.jsx.

--- WHAT THIS PAGE DOES ---
- Form at the top to record a new stock-in or stock-out transaction
- Table below showing all transactions with filtering by product and date range

--- STATE YOU NEED ---
- transactions: []
- products: [] — for the product dropdown in the form
- loading: true
- formError: '' — error message shown near the form
- availableStock: null — set when API returns "Insufficient stock" error, used to show "Only X units available"
- filter.productId: '' — for table filter
- filter.from: '' — date string YYYY-MM-DD
- filter.to: ''   — date string YYYY-MM-DD
- form.productId: ''
- form.type: 'stock-in'
- form.quantity: ''
- form.note: ''

--- DATA FETCHING ---
On mount:
  GET /api/products → set products
  GET /api/transactions → set transactions
Use Promise.all.

--- TRANSACTION FORM ---
Fields:
  1. Product dropdown
     - First option: "-- Select Product --" with value "" (disabled)
     - Map products to options: value={p._id}, label={p.name}
  2. Type — two radio buttons or a <select>:
       "Stock In"  → value 'stock-in'
       "Stock Out" → value 'stock-out'
     Default to 'stock-in'
  3. Quantity — number input, min=1, step=1 (integers only)
  4. Note — text input, optional, placeholder "Optional note"
  5. Submit button labeled "Record Transaction"

On submit:
  - Validate client-side: productId must be selected, quantity must be >= 1
  - POST /api/transactions with { productId, type, quantity: parseInt(quantity), note }
  - On success (201): reset the form, clear formError and availableStock, re-fetch transactions
  - On API error with status 400:
      a. If error.response.data.error === "Insufficient stock":
           Set formError to: `Insufficient stock — Only ${error.response.data.available} units available`
           Set availableStock to error.response.data.available
      b. For any other 400 error: set formError to error.response.data.error
  - On network error: set formError to "Something went wrong. Please try again."

Display formError in a red <p> directly below the form submit button.
If availableStock is set, also show: <p style={{ color: 'orange' }}>Only {availableStock} units available</p>
Clear formError and availableStock whenever the user changes the product or quantity field.

--- FILTERS (above the table) ---
Three filter controls in a row:
  1. Product dropdown — "All Products" as first option (value ""), then map products
  2. From date — <input type="date" /> bound to filter.from
  3. To date   — <input type="date" /> bound to filter.to
  4. A "Filter" button and a "Clear" button

When Filter is clicked:
  Build query string and call GET /api/transactions with:
    ?productId=... (if selected)
    &from=...      (if set, format YYYY-MM-DD)
    &to=...        (if set, format YYYY-MM-DD)
  Replace the transactions state with the result.

When Clear is clicked: reset all filter fields and re-fetch GET /api/transactions with no params.

--- TRANSACTION TABLE ---
Columns: Date | Product Name | SKU | Type | Qty | Note

Date format: use this exact formatting:
  new Date(t.createdAt).toLocaleString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
  Result will look like: "30/04/2024, 14:35"

For Type column: show "Stock In" (green text) or "Stock Out" (red text) — use inline color style
Product Name and SKU come from the populated productId field: t.productId.name, t.productId.sku

--- UI STATES ---
Loading: <p>Loading transactions...</p>
Empty: <p>No transactions recorded yet.</p>
Error on load: <p style={{ color: 'red' }}>Failed to load transactions.</p> with Retry button

--- VERIFY ---
Record a stock-in → table updates, product quantity increases (visible on Products page)
Record a stock-out with more qty than available → form shows "Only X units available"
Date filter: set from/to and click Filter → table shows only matching transactions
Clear filter → all transactions return
```

---

## PROMPT 11 — Suppliers Page

```
Read plan_webtech_v1.md, specifically the "Frontend Pages > Suppliers" section and "Business Logic > Suppliers".

Build frontend/src/pages/Suppliers.jsx.
Follow the same patterns used in Products.jsx for consistency.

--- WHAT THIS PAGE DOES ---
- Displays all suppliers in a table
- Add, Edit, Delete with a modal form
- Shows API error messages

--- STATE YOU NEED ---
- suppliers: []
- loading: true
- showModal: false
- editingSupplier: null — null = add mode, set = edit mode
- formError: ''
- pageError: ''

--- TABLE ---
Columns: Name | Email | Phone | Address | Actions
Actions: "Edit" and "Delete" buttons per row

--- MODAL FORM ---
Fields:
  - Name (text, required)
  - Contact Email (email input type, optional)
  - Phone (text, optional)
  - Address (text, optional)

In add mode: all fields empty
In edit mode: pre-fill from editingSupplier

On submit:
  - Add mode: POST /api/suppliers
  - Edit mode: PUT /api/suppliers/:id
  - On success: close modal, clear formError, re-fetch suppliers
  - On 4xx error: show response.data.error as formError inside the modal

--- DELETE ---
- window.confirm("Are you sure you want to delete [supplier name]?")
- DELETE /api/suppliers/:id
- On success: re-fetch suppliers
- On 400 error: set pageError to response.data.error
  The message will be: "Cannot delete supplier with linked products"
  Show pageError on the page in red text, above the table
- Clear pageError on each new delete attempt

--- UI STATES ---
Loading: <p>Loading suppliers...</p>
Empty: <p>No suppliers found. Add your first supplier.</p>
Error on load: <p style={{ color: 'red' }}>Failed to load suppliers.</p> with Retry button

--- VERIFY ---
Add a supplier → appears in table
Edit → modal pre-fills correctly
Delete a supplier that has a linked product → page shows "Cannot delete supplier with linked products"
Delete a supplier with no linked products → removed from table
```

---

## PROMPT 12 — JSP Stock Report Page

```
Read plan_webtech_v1.md, specifically the "JSP Reports" section.

Create two files: reports/stockReport.jsp and reports/WEB-INF/web.xml

--- FILE: reports/stockReport.jsp ---

This is a plain HTML page with a <script> block that fetches data. Do NOT use JSP scriptlets (no <% %> Java code) — use JavaScript fetch() instead because our backend is in Node.js/Express, not Java. The .jsp extension is only required by the project spec.

Structure of the page:

1. DOCTYPE html, <html>, <head>, <body>

2. In <head>:
   - <title>Stock Valuation Report</title>
   - A <style> block with:
       body { font-family: Arial, sans-serif; padding: 20px; }
       table { width: 100%; border-collapse: collapse; }
       th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
       th { background-color: #f0f0f0; }
       .total-row { font-weight: bold; background-color: #f9f9f9; }
       .no-print { margin-bottom: 20px; }
       @media print { .no-print { display: none; } }

3. In <body>:
   - An <h2>Stock Valuation Report</h2>
   - A <div class="no-print"> containing:
       A "Print Report" button: <button onclick="window.print()">Print / Save as PDF</button>
   - A <div id="report-content"> — this is where the table will be injected by the script
   - A <p id="loading-msg">Loading report data...</p>

4. A <script> block at the bottom of body:

   fetch('http://localhost:5000/api/products')
     .then(res => res.json())
     .then(products => {
       document.getElementById('loading-msg').style.display = 'none';

       if (!products.length) {
         document.getElementById('report-content').innerHTML = '<p>No products found.</p>';
         return;
       }

       let totalValue = 0;
       let rows = '';
       products.forEach(p => {
         const lineTotal = p.quantity * p.unitPrice;
         totalValue += lineTotal;
         rows += `<tr>
           <td>${p.sku}</td>
           <td>${p.name}</td>
           <td>${p.category || '—'}</td>
           <td>${p.quantity}</td>
           <td>${p.unitPrice.toFixed(2)}</td>
           <td>${lineTotal.toFixed(2)}</td>
         </tr>`;
       });

       document.getElementById('report-content').innerHTML = `
         <p>Generated on: ${new Date().toLocaleString()}</p>
         <table>
           <thead>
             <tr>
               <th>SKU</th><th>Product Name</th><th>Category</th>
               <th>Qty in Stock</th><th>Unit Price</th><th>Total Value</th>
             </tr>
           </thead>
           <tbody>${rows}</tbody>
           <tfoot>
             <tr class="total-row">
               <td colspan="5">Total Stock Value</td>
               <td>${totalValue.toFixed(2)}</td>
             </tr>
           </tfoot>
         </table>`;
     })
     .catch(err => {
       document.getElementById('loading-msg').textContent = 'Failed to load report data. Make sure the backend server is running on port 5000.';
       console.error(err);
     });

--- FILE: reports/WEB-INF/web.xml ---
Minimal servlet config — just the XML header and an empty web-app element:

<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee
         http://xmlns.jcp.org/xml/ns/javaee/web-app_3_1.xsd"
         version="3.1">
  <display-name>Inventory Stock Report</display-name>
</web-app>

--- CORS NOTE ---
The fetch() call in stockReport.jsp will be blocked unless cors() is enabled on the Express backend.
Confirm that backend/server.js has app.use(cors()) BEFORE any route definitions.
This was set up in Prompt 1 — verify it is still there.

--- VERIFY ---
Open stockReport.jsp in a browser (via Tomcat or a local server, not file://)
Table loads with all products, unit prices, and calculated totals
Grand total row at the bottom is correct
Clicking "Print / Save as PDF" opens the browser print dialog with the button hidden
```

---

## PROMPT 13 — README and Final Edge Case Review

```
Read plan_webtech_v1.md in full.

Do two things:

--- PART 1: CREATE README.md ---

Create README.md at the project root with the following sections:

# Inventory Management System

## Project Structure
(copy the folder structure from plan_webtech_v1.md)

## Prerequisites
- Node.js v18+
- MongoDB running locally on port 27017
- Java + Apache Tomcat (for JSP report only)

## Setup & Run — Backend
1. cd into project root
2. Copy .env.example to .env and fill in your values
3. npm install
4. npm run dev
   → Server starts on http://localhost:5000

## Setup & Run — Frontend
1. cd frontend
2. npm install
3. npm run dev
   → App opens on http://localhost:5173

## Setup & Run — JSP Report
1. Deploy the reports/ folder to Apache Tomcat's webapps directory
2. Start Tomcat
3. Open http://localhost:8080/reports/stockReport.jsp
   Note: The Express backend must be running on port 5000 for the report to load data.

## Environment Variables
(list all .env variables with descriptions — copy from plan_webtech_v1.md)

## Features
- Product management with SKU validation
- Supplier management
- Stock-in and stock-out transactions with atomic updates
- Daily low-stock email alerts via cron job
- Stock valuation report via JSP

--- PART 2: FINAL EDGE CASE REVIEW ---

Go through every file and fix any of these issues if present:

BACKEND:
[ ] All error responses are { error: "message" } — no plain strings, no HTML error pages
[ ] Stock-out 400 response includes both "error" and "available" fields
[ ] GET /low-stock is defined BEFORE GET /:id in products.js router
[ ] Transaction POST uses atomic findOneAndUpdate with $gte condition — not a separate find + check
[ ] priceAtTransaction is saved from product.unitPrice in every Transaction POST
[ ] DELETE /api/products/:id checks for existing transactions before deleting
[ ] DELETE /api/suppliers/:id checks for linked products before deleting
[ ] cors() is called before route definitions in server.js
[ ] lowStockChecker is imported in server.js
[ ] .env is in .gitignore
[ ] .env.example is committed

FRONTEND:
[ ] Every page has loading, empty, and error states
[ ] Products page: SKU auto-uppercases as user types
[ ] Products page: SKU field disabled in edit mode
[ ] Transactions page: shows "Only X units available" using the "available" field from the error response
[ ] Transactions page: date filter sends ?from= and ?to= in YYYY-MM-DD format
[ ] Dashboard: Total Stock Value uses quantity × unitPrice (current price)
[ ] All pages: re-fetch data after any add / edit / delete operation

JSP:
[ ] Uses fetch() not JSP scriptlets
[ ] Print button is hidden in print view via @media print
[ ] Error message shown if backend is unreachable
```

---

> **Done!** All 13 prompts complete.
> Test manually: add a product, do a stock-in, do a stock-out with insufficient qty, check the dashboard, run the JSP report, and confirm the cron log output on server start.

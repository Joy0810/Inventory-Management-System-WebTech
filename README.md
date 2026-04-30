# Inventory Management System

A full-stack stock control web application for small businesses to track products, manage suppliers, record inventory movements, and receive automated low-stock alerts.

Built with the MERN stack (MongoDB, Express.js, React, Node.js) with JSP-based printable reports.

---

## Features

- **Dashboard** — summary cards (total products, low stock count, total stock value), stock health donut chart, live low-stock alert list
- **Products** — add, edit, delete products with SKUs, categories, reorder thresholds, and supplier links
- **Transactions** — record stock-in and stock-out movements with full audit trail, filter by product and date range
- **Suppliers** — manage supplier contacts, linked to products
- **Low Stock Alerts** — automated daily email (cron job) listing all products below reorder level
- **Stock Valuation Report** — printable JSP report with current stock value and PDF-friendly layout

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, Axios, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Cron / Email | node-cron, Nodemailer |
| Reports | JSP (Apache Tomcat) |

---

## Project Structure

```
inventory-app/
├── backend/
│   ├── config/db.js
│   ├── models/          # Product, Supplier, Transaction
│   ├── routes/          # products, suppliers, transactions
│   ├── jobs/            # lowStockChecker.js (cron + email)
│   └── server.js
├── frontend/
│   └── src/
│       ├── pages/       # Dashboard, Products, Transactions, Suppliers
│       ├── components/  # Sidebar, Navbar, modals
│       └── api/axios.js
└── reports/
    ├── stockReport.jsp
    └── WEB-INF/web.xml
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Apache Tomcat (for JSP reports only)

### 1. Clone the repo

```bash
git clone https://github.com/Joy0810/Inventory-Management-System-WebTech.git
cd Inventory-Management-System-WebTech
```

### 2. Set up environment variables

Copy `.env.example` to `.env` in the root folder and fill in your values:

```bash
cp .env.example .env
```

```env
MONGO_URI=mongodb://localhost:27017/inventory
PORT=5000
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_gmail_app_password
ALERT_EMAIL=recipient@email.com
```

> For `EMAIL_PASS`, generate a **Gmail App Password** from Google Account → Security → 2-Step Verification → App Passwords. Do NOT use your regular Gmail password.

### 3. Install dependencies

```bash
# Install root + backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

### 4. Run the app

Open two terminals:

**Terminal 1 — Backend**
```bash
cd backend
node server.js
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev
```

App runs at `http://localhost:5173`  
API runs at `http://localhost:5000`

---

## Seed Sample Data (Optional)

To populate the database with realistic demo data (12 products, 3 suppliers, 23 transactions covering all stock states):

```bash
cd backend
node seed.js
```

> ⚠️ This clears all existing data before seeding.

---

## JSP Stock Report

1. Deploy the `reports/` folder to Apache Tomcat's `webapps/` directory
2. Make sure the backend is running on port 5000
3. Open `http://localhost:8080/reports/stockReport.jsp`
4. Use the Print button to export as PDF

> CORS is enabled on the Express backend to allow Tomcat (different port) to fetch data.

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/products | List all products |
| GET | /api/products/low-stock | Products below reorder level |
| POST | /api/products | Add product |
| PUT | /api/products/:id | Edit product |
| DELETE | /api/products/:id | Delete product |
| GET | /api/suppliers | List all suppliers |
| POST | /api/suppliers | Add supplier |
| PUT | /api/suppliers/:id | Edit supplier |
| DELETE | /api/suppliers/:id | Delete supplier |
| GET | /api/transactions | All transactions (supports `?productId=` `?from=` `?to=`) |
| POST | /api/transactions | Record stock-in or stock-out |

---

## Team

| Name | Role |
|---|---|
| Joy | Backend Development & API Design |
| Tharun | Database Design & MongoDB Integration |
| Viadeesh | Full Stack, UI Redesign & Frontend Lead |
| Gatri | Frontend Development & React Components |
| Nishal | JSP Reports, Cron Job & Testing |

---

## License

This project was built as a Web Technologies academic assignment (Semester 6).

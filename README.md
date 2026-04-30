# Inventory Management System

## Project Structure
```text
backend/
  config/
    db.js
  models/
    Product.js
    Supplier.js
    Transaction.js
  routes/
    products.js
    suppliers.js
    transactions.js
  jobs/
    lowStockChecker.js
  server.js
frontend/
  src/
    api/
      axios.js
    pages/
      Dashboard.jsx
      Products.jsx
      Transactions.jsx
      Suppliers.jsx
    components/
      Navbar.jsx
    App.jsx
    main.jsx
reports/
  stockReport.jsp
  WEB-INF/
    web.xml
```

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
- `MONGO_URI`: The MongoDB connection string (e.g., `mongodb://localhost:27017/inventory_db`)
- `PORT`: The port the Express backend will run on (e.g., `5000`)
- `EMAIL_USER`: Your Gmail address for sending low-stock alerts
- `EMAIL_PASS`: Your 16-character Google App Password (NOT your regular password)
- `ALERT_EMAIL`: The destination email address to receive the low-stock alerts

## Features
- Product management with SKU validation
- Supplier management
- Stock-in and stock-out transactions with atomic updates
- Daily low-stock email alerts via cron job
- Stock valuation report via JSP
